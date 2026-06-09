import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-accent/8 blur-3xl"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Now open in Dublin — Ranelagh
          </span>

          <h1 className="mt-6 text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Build the body you&apos;ve always{" "}
            <span className="text-accent">trained for</span>.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            IronPulse is Dublin&apos;s most results-driven gym. Expert coaches,
            cutting-edge equipment and a community that pushes you — every
            single day.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#trial"
              className="rounded-full bg-accent px-7 py-3.5 text-center text-base font-semibold text-background transition-opacity hover:opacity-90"
            >
              Start free 7-day trial
            </a>
            <a
              href="#classes"
              className="rounded-full border border-border px-7 py-3.5 text-center text-base font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              Browse classes
            </a>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border">
            {[
              { v: "2,400+", l: "Active members" },
              { v: "40+", l: "Weekly classes" },
              { v: "4.9★", l: "Google rating" },
            ].map((s) => (
              <div key={s.l} className="bg-surface px-4 py-4 text-center">
                <p className="font-serif text-2xl">{s.v}</p>
                <p className="mt-1 text-xs text-muted">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* hero image */}
        <div className="relative overflow-hidden rounded-3xl border border-border">
          <Image
            src="/images/person-deadlifting.png"
            alt="Athlete deadlifting at IronPulse Fitness"
            width={720}
            height={480}
            className="h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-border/40 bg-background/60 px-4 py-3 backdrop-blur-md">
            <p className="text-sm font-semibold">
              Discipline. Focus. Consistency.
            </p>
            <p className="mt-0.5 text-xs text-muted">
              The IronPulse method — results you can measure.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
