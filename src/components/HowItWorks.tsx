const classes = [
  {
    tag: "Strength",
    name: "Powerlifting Foundations",
    time: "Mon / Wed / Fri · 6:00 AM",
    coach: "Coach Sean",
    spots: "8 spots left",
  },
  {
    tag: "HIIT",
    name: "MetCon Burn",
    time: "Tue / Thu · 7:00 AM & 6:30 PM",
    coach: "Coach Claire",
    spots: "4 spots left",
  },
  {
    tag: "Yoga",
    name: "Power Yoga Flow",
    time: "Daily · 8:00 AM",
    coach: "Coach Aoife",
    spots: "12 spots left",
  },
  {
    tag: "Boxing",
    name: "Bag & Pad Boxing",
    time: "Mon / Wed / Sat · 7:30 PM",
    coach: "Coach Conor",
    spots: "6 spots left",
  },
  {
    tag: "Cardio",
    name: "Spin & Cycle",
    time: "Tue / Thu / Sat · 6:00 AM",
    coach: "Coach Niamh",
    spots: "10 spots left",
  },
  {
    tag: "Recovery",
    name: "Mobility & Stretch",
    time: "Sun · 9:00 AM",
    coach: "Coach Aoife",
    spots: "Open",
  },
];

const tagColor: Record<string, string> = {
  Strength: "bg-orange-500/15 text-orange-400",
  HIIT: "bg-red-500/15 text-red-400",
  Yoga: "bg-teal-500/15 text-teal-400",
  Boxing: "bg-purple-500/15 text-purple-400",
  Cardio: "bg-blue-500/15 text-blue-400",
  Recovery: "bg-accent/15 text-accent",
};

export default function HowItWorks() {
  return (
    <section id="classes" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              Classes
            </p>
            <h2 className="mt-3 text-4xl tracking-tight sm:text-5xl">
              40+ classes every week.
            </h2>
          </div>
          <a
            href="#trial"
            className="shrink-0 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            Book a class →
          </a>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <div
              key={c.name}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
            >
              <span
                className={`inline-block self-start rounded-full px-2.5 py-1 text-xs font-semibold ${tagColor[c.tag]}`}
              >
                {c.tag}
              </span>
              <h3 className="text-lg leading-snug">{c.name}</h3>
              <div className="mt-auto space-y-1 text-xs text-muted">
                <p>🕐 {c.time}</p>
                <p>👤 {c.coach}</p>
                <p
                  className={
                    c.spots === "Open" ? "text-accent" : "text-foreground/50"
                  }
                >
                  ● {c.spots}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
