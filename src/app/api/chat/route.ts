import OpenAI from "openai";
import { getGymData, type GymData } from "@/lib/gym-data";
import { tools, executeTool } from "@/lib/chat-tools";

export const dynamic = "force-dynamic";

const MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";
const BASE_URL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
const MAX_TOKENS = 1024;
const MAX_TOOL_ROUNDS = 6; // safety cap on the tool-use loop

type ClientMessage = { role: "user" | "assistant"; content: string };

// System prompt: persona/rules + PUBLIC gym data only. Member and booking rows
// are deliberately excluded (PII) — reached on demand via the tools.
function buildSystemPrompt(data: GymData): string {
  const gym = data.gym_info ?? {};
  const name = (gym.name as string) ?? "IronPulse Fitness";
  const address =
    [gym.address, gym.city].filter(Boolean).join(", ") || "Dublin, Ireland";

  const publicContext = {
    gym_info: data.gym_info,
    coaches: data.coaches,
    classes: data.classes,
    membership_plans: data.membership_plans,
  };

  return `You are the AI receptionist for ${name}, located at ${address}. Your name is FitAgent.

Your job is to help gym members and prospective members with any questions about the gym — classes, pricing, coaches, availability, bookings, membership, facilities and opening hours. You have access to live data about classes, availability, coaches and membership plans, and tools to look up class availability, the timetable, member details, and to create bookings.

Rules:
- Always be warm, friendly, professional and concise — like a great front-desk receptionist, not a robot.
- Be decisive. When the user states a condition or preference, recommend ONE best option and give a one-sentence reason — don't list every plan/class as a menu unless they explicitly ask to see all options.
- Keep replies short: usually 1–3 sentences. No headers, no bullet dumps, no restating the question. Answer what's asked, nothing more.
- Don't over-explain or pad with caveats. Give the definitive answer; offer extra detail only if they ask.
- Only answer questions related to ${name}. If someone asks about anything unrelated, politely steer them back to gym topics.
- If someone wants to book a class, first collect their full name AND email, then use the create_booking tool. Never invent a booking.
- Use the tools to fetch live data (availability, timetable, member info) rather than guessing numbers.
- Never expose internal database IDs, table names, tool names, or any technical details to the user. Speak naturally.
- Use the member's name when you know it.

Here is the current gym data for reference:
${JSON.stringify(publicContext)}`;
}

// Drop any leading assistant turns (the UI seeds a greeting) so the conversation
// starts with a user message, then prepend the system prompt.
function buildMessages(
  system: string,
  messages: ClientMessage[]
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const firstUser = messages.findIndex((m) => m.role === "user");
  const convo: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: system },
  ];
  if (firstUser === -1) return convo;
  for (const m of messages.slice(firstUser)) {
    convo.push({ role: m.role, content: m.content });
  }
  return convo;
}

export async function POST(req: Request) {
  let body: { messages?: ClientMessage[]; sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  if (!incoming.some((m) => m.role === "user")) {
    return Response.json(
      { error: "messages must include at least one user message" },
      { status: 400 }
    );
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return Response.json(
      { error: "Chat is not configured (missing DEEPSEEK_API_KEY)." },
      { status: 500 }
    );
  }

  let system: string;
  try {
    const data = await getGymData();
    system = buildSystemPrompt(data);
  } catch {
    return Response.json({ error: "Could not load gym data." }, { status: 500 });
  }

  const convo = buildMessages(system, incoming);
  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: BASE_URL,
  });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const completion = await client.chat.completions.create({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            messages: convo,
            tools,
            stream: true,
          });

          let content = "";
          // tool_calls arrive split across deltas — accumulate by index.
          const accs: { id: string; name: string; args: string }[] = [];

          for await (const chunk of completion) {
            const choice = chunk.choices[0];
            if (!choice) continue;
            const delta = choice.delta;
            if (delta?.content) {
              content += delta.content;
              controller.enqueue(encoder.encode(delta.content));
            }
            for (const tc of delta?.tool_calls ?? []) {
              const i = tc.index;
              accs[i] ??= { id: "", name: "", args: "" };
              if (tc.id) accs[i].id = tc.id;
              if (tc.function?.name) accs[i].name += tc.function.name;
              if (tc.function?.arguments) accs[i].args += tc.function.arguments;
            }
          }

          const toolCalls = accs.filter((a) => a && a.id);
          if (toolCalls.length === 0) break; // model gave a final answer

          // Echo the assistant turn (with its tool calls) back into the convo.
          convo.push({
            role: "assistant",
            content: content || null,
            tool_calls: toolCalls.map((t) => ({
              id: t.id,
              type: "function",
              function: { name: t.name, arguments: t.args },
            })),
          });

          for (const t of toolCalls) {
            let input: Record<string, unknown> = {};
            try {
              input = t.args ? JSON.parse(t.args) : {};
            } catch {
              input = {};
            }
            const result = await executeTool(t.name, input);
            convo.push({ role: "tool", tool_call_id: t.id, content: result });
          }
        }
        controller.close();
      } catch {
        controller.enqueue(
          encoder.encode(
            "\n\nSorry — I hit a snag just then. Please try asking again."
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
