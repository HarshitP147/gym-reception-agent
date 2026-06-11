import type OpenAI from "openai";
import { supabase } from "@/lib/supabase";

// Tool definitions exposed to the model (OpenAI-compatible function-tool format,
// used by DeepSeek). Descriptions are prescriptive about WHEN to call each tool —
// this improves tool-selection accuracy.
export const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_class_availability",
      description:
        "Get the current number of spots remaining for gym classes. Call this when a user asks whether a specific class (or category of class) has space, or how many spots are left. Returns live availability.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "A class name (e.g. 'Powerlifting Foundations') or a category (e.g. 'Strength', 'HIIT', 'Yoga').",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_timetable",
      description:
        "Get the full weekly class schedule (all classes, their days, times, duration and difficulty). Call this when a user asks what classes run, the timetable, or what's on during the week.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_member_info",
      description:
        "Look up an existing member's membership details by their name or email. Call this when a returning member asks about their own plan, join date, or membership status. Requires a name or email to identify them.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The member's full name." },
          email: { type: "string", description: "The member's email address." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_booking",
      description:
        "Book a member into a class. Only call this AFTER you have collected the user's full name AND email AND the class they want. Confirms the booking and records it.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The member's full name." },
          email: { type: "string", description: "The member's email address." },
          class_name: { type: "string", description: "The class to book into." },
          date: {
            type: "string",
            description:
              "Optional preferred date in YYYY-MM-DD format. Defaults to today.",
          },
        },
        required: ["name", "email", "class_name"],
      },
    },
  },
];

function str(input: Record<string, unknown>, key: string): string | undefined {
  const v = input[key];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

// Resolve a member row (id + name) by email first, then by name. Returns null if
// no match. Kept internal so member ids never leave this module.
async function findMember(email?: string, name?: string) {
  if (email) {
    const { data } = await supabase
      .from("members")
      .select("id, name")
      .eq("email", email)
      .maybeSingle();
    if (data) return data as { id: string; name: string };
  }
  if (name) {
    const { data } = await supabase
      .from("members")
      .select("id, name")
      .ilike("name", name)
      .limit(1)
      .maybeSingle();
    if (data) return data as { id: string; name: string };
  }
  return null;
}

// Executes a tool call and returns a string result for the tool_result block.
// Never throws — failures are returned as a message so the agent loop continues
// and the model can respond gracefully. No raw ids are ever returned.
export async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  try {
    switch (name) {
      case "get_class_availability": {
        const query = str(input, "query");
        if (!query) return "Please provide a class name or category to check.";
        const { data, error } = await supabase
          .from("classes")
          .select("name, category, spots_total, spots_remaining, schedule_days, schedule_time, difficulty")
          .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
          .order("name");
        if (error) return `Could not look up availability right now.`;
        if (!data || data.length === 0)
          return `No classes matched "${query}".`;
        return JSON.stringify(data);
      }

      case "get_timetable": {
        const { data, error } = await supabase
          .from("classes")
          .select("name, category, schedule_days, schedule_time, duration_mins, difficulty")
          .order("name");
        if (error) return "Could not load the timetable right now.";
        return JSON.stringify(data ?? []);
      }

      case "get_member_info": {
        const email = str(input, "email");
        const name = str(input, "name");
        if (!email && !name)
          return "Please provide the member's name or email to look them up.";
        const { data, error } = await supabase
          .from("members")
          .select("name, join_date, status, membership_plans(name)")
          .or(
            [
              email ? `email.eq.${email}` : null,
              name ? `name.ilike.${name}` : null,
            ]
              .filter(Boolean)
              .join(",")
          )
          .limit(1)
          .maybeSingle();
        if (error) return "Could not look up that member right now.";
        if (!data)
          return "I couldn't find a member with those details. They may not be registered yet.";
        const plan = (data as { membership_plans?: { name?: string } | null })
          .membership_plans;
        return JSON.stringify({
          name: (data as { name: string }).name,
          plan: plan?.name ?? "No plan on file",
          join_date: (data as { join_date: string | null }).join_date,
          status: (data as { status: string }).status,
        });
      }

      case "create_booking": {
        const name = str(input, "name");
        const email = str(input, "email");
        const className = str(input, "class_name");
        if (!name || !email || !className)
          return "I still need the member's full name, email and the class name before I can book.";

        const member = await findMember(email, name);
        if (!member)
          return `I couldn't find a member named "${name}" (${email}). They'll need to register at the gym before booking — I can tell them about our membership plans instead.`;

        const { data: cls } = await supabase
          .from("classes")
          .select("id, name, spots_remaining")
          .ilike("name", `%${className}%`)
          .limit(1)
          .maybeSingle();
        if (!cls)
          return `I couldn't find a class called "${className}". Ask me for the timetable to see what's on.`;

        const klass = cls as { id: string; name: string; spots_remaining: number | null };
        if (typeof klass.spots_remaining === "number" && klass.spots_remaining <= 0)
          return `Unfortunately "${klass.name}" is fully booked right now.`;

        const bookingDate = str(input, "date") ?? new Date().toISOString().slice(0, 10);
        const { error: insertError } = await supabase.from("bookings").insert({
          member_id: member.id,
          class_id: klass.id,
          status: "confirmed",
          booking_date: bookingDate,
          notes: "Booked via FitAgent chat",
        });
        if (insertError)
          return "Something went wrong saving that booking — please try again in a moment.";

        return JSON.stringify({
          confirmed: true,
          member: member.name,
          class: klass.name,
          date: bookingDate,
          status: "confirmed",
        });
      }

      default:
        return `Unknown tool: ${name}`;
    }
  } catch {
    return "That action failed unexpectedly. Please try again.";
  }
}
