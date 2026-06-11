import { supabase } from "@/lib/supabase";

// Always fetch fresh from Supabase rather than serving a cached response.
export const dynamic = "force-dynamic";

export async function GET() {
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
    return Response.json(
      {
        error: "Failed to fetch gym data",
        details: failed.map((r) => r.error?.message),
      },
      { status: 500 }
    );
  }

  return Response.json({
    gym_info: gymInfo.data,
    coaches: coaches.data,
    classes: classes.data,
    membership_plans: plans.data,
    members: members.data,
    bookings: bookings.data,
  });
}
