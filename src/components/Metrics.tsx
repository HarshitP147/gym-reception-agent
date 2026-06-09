const stats = [
  { value: "2,400+", label: "active members" },
  { value: "8", label: "certified coaches" },
  { value: "40+", label: "classes per week" },
  { value: "4.9★", label: "Google reviews" },
];

export default function Metrics() {
  return (
    <section className="border-t border-border bg-accent text-background">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center sm:text-left">
              <p className="font-serif text-5xl tracking-tight">{s.value}</p>
              <p className="mt-2 text-sm font-medium text-background/70">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
