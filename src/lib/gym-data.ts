import { supabase } from "@/lib/supabase";

// Shape returned by getGymData(). Loose `unknown[]` rows are fine here — the
// data flows into JSON responses and the Claude system prompt, not typed UI.
export type GymData = {
  gym_info: Record<string, unknown> | null;
  coaches: Record<string, unknown>[];
  classes: Record<string, unknown>[];
  membership_plans: Record<string, unknown>[];
  members: Record<string, unknown>[];
  bookings: Record<string, unknown>[];
};

// Single source of truth for the full gym dataset. Used by /api/gym-data and by
// /api/chat (to build the agent's context). Throws if any query fails so callers
// can decide how to surface the error.
export async function getGymData(): Promise<GymData> {
  const [coaches, classes, plans, gymInfo, members, bookings] = await Promise.all([
    supabase.from("coaches").select("*").order("name"),
    supabase.from("classes").select("*").order("name"),
    supabase.from("membership_plans").select("*").order("price_monthly"),
    supabase.from("gym_info").select("*").single(),
    supabase.from("members").select("*").order("join_date"),
    supabase.from("bookings").select("*").order("booking_date", { ascending: false }),
  ]);

  const failed = [coaches, classes, plans, gymInfo, members, bookings].filter(
    (r) => r.error
  );
  if (failed.length) {
    throw new Error(
      `Failed to fetch gym data: ${failed.map((r) => r.error?.message).join("; ")}`
    );
  }

  return {
    gym_info: gymInfo.data as GymData["gym_info"],
    coaches: (coaches.data ?? []) as GymData["coaches"],
    classes: (classes.data ?? []) as GymData["classes"],
    membership_plans: (plans.data ?? []) as GymData["membership_plans"],
    members: (members.data ?? []) as GymData["members"],
    bookings: (bookings.data ?? []) as GymData["bookings"],
  };
}
