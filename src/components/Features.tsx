import Image from "next/image";

const facilities = [
  {
    icon: "🏗️",
    title: "Free weights zone",
    body: "Dumbbells up to 60 kg, Olympic barbells, bumper plates and dedicated squat racks — all with proper spacing.",
  },
  {
    icon: "🚴",
    title: "Cardio floor",
    body: "30 Technogym treadmills, rowers, bikes and stair climbers. All connected to your IronPulse training app.",
  },
  {
    icon: "🥊",
    title: "Boxing bay",
    body: "Heavy bags, speed bags, slip balls and a full-size ring for sparring sessions. Coach on-site for pad work.",
  },
  {
    icon: "🧘",
    title: "Yoga & stretch studio",
    body: "Dedicated room with sprung floor, mirrors and props. Separate from the main floor for focus and quiet.",
  },
  {
    icon: "❄️",
    title: "Recovery suite",
    body: "Ice bath, sauna and massage guns available post-workout. Recovery is part of training — not optional.",
  },
  {
    icon: "🚿",
    title: "Premium changing rooms",
    body: "Spacious lockers, hot showers, hair dryers and towel service. Feel human after every session.",
  },
];

export default function Features() {
  return (
    <section id="facilities" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
        {/* gym interior image */}
        <div className="relative mb-12 overflow-hidden rounded-3xl border border-border">
          <Image
            src="/images/gym.png"
            alt="IronPulse Fitness gym floor, Ranelagh Dublin"
            width={1200}
            height={500}
            className="h-64 w-full object-cover sm:h-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
          <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              Facilities
            </p>
            <h2 className="mt-2 text-3xl tracking-tight sm:text-4xl">
              Everything you need under one roof.
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted">
              12,000 sq ft across two floors in Ranelagh, Dublin — designed
              around how serious athletes actually train.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/40"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-2xl">
                {f.icon}
              </span>
              <h3 className="mt-5 text-xl">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
