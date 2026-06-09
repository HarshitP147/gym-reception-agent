const reasons = [
  {
    icon: "🏋️",
    title: "Expert coaching",
    body: "Every trainer at IronPulse is certified, experienced and obsessed with your progress. No guesswork — just a plan that works.",
  },
  {
    icon: "⚙️",
    title: "Premium equipment",
    body: "Hammer Strength rigs, Technogym cardio, dedicated free-weight zones and recovery suites — all maintained daily.",
  },
  {
    icon: "🔥",
    title: "Results-driven programmes",
    body: "Whether you want to lose fat, build muscle or train for a sport — we build a programme around your goal, not a template.",
  },
  {
    icon: "🤝",
    title: "A community that shows up",
    body: "Early mornings, lunch sessions, evening classes — IronPulse members push each other. You won't want to skip.",
  },
];

export default function Problem() {
  return (
    <section id="about" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Why IronPulse
          </p>
          <h2 className="mt-3 text-4xl tracking-tight sm:text-5xl">
            Not just a gym. A system for results.
          </h2>
          <p className="mt-4 text-lg text-muted">
            Most gyms sell you access. We sell you progress — backed by
            coaching, community and equipment that match your ambition.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <span className="text-3xl">{r.icon}</span>
              <h3 className="mt-4 text-xl">{r.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
