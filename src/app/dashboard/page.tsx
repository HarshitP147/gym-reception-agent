import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import SignOutButton from "@/components/SignOutButton";
import MemberChatPanel from "@/components/MemberChatPanel";

type Member = {
  id: string;
  name: string;
  email: string;
  status: string;
  join_date: string | null;
  membership_plans: { name: string; price_monthly: number } | null;
};

type Booking = {
  id: string;
  booking_date: string | null;
  status: string;
  classes: { name: string; schedule_time: string | null } | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: memberData } = await supabase
    .from("members")
    .select("id, name, email, status, join_date, membership_plans(name, price_monthly)")
    .eq("user_id", user.id)
    .maybeSingle();
  const member = memberData as unknown as Member | null;

  const bookings = member
    ? (((
        await supabase
          .from("bookings")
          .select("id, booking_date, status, classes(name, schedule_time)")
          .eq("member_id", member.id)
          .order("booking_date", { ascending: false })
      ).data ?? []) as unknown as Booking[])
    : [];

  return (
    <main className="mx-auto flex h-screen max-w-6xl flex-col px-5 py-8 sm:px-8">
      <div className="flex shrink-0 items-center justify-between">
        <h1 className="font-serif text-4xl tracking-tight">
          Welcome, {member?.name ?? user.email}
        </h1>
        <SignOutButton />
      </div>

      <div className="mt-8 grid flex-1 gap-6 overflow-hidden lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6 overflow-y-auto pr-1">
          <Card>
            <CardHeader>
              <CardTitle>Membership</CardTitle>
              <CardDescription>
                {member
                  ? `${member.membership_plans?.name ?? "No plan"} · ${member.status}`
                  : "No linked member record yet."}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{member?.email ?? user.email}</p>
              {member?.join_date && <p>Member since {member.join_date}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>Your class bookings.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              {bookings.length === 0 && (
                <p className="text-muted-foreground">No bookings yet.</p>
              )}
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{b.classes?.name}</p>
                    <p className="text-muted-foreground">
                      {b.booking_date} · {b.classes?.schedule_time}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {b.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <MemberChatPanel
          member={
            member
              ? {
                  id: member.id,
                  name: member.name,
                  email: member.email,
                  status: member.status,
                }
              : null
          }
        />
      </div>
    </main>
  );
}
