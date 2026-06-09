const testimonials = [
  {
    name: "Sarah M.",
    duration: "Member since 2022",
    text: "Lost 14 kg in 6 months. The coaches actually care about your goals, not just showing up. Nothing like any gym I've been to before.",
  },
  {
    name: "Liam O.",
    duration: "Member since 2023",
    text: "Came for the equipment, stayed for the community. The MetCon Burn class at 7am is genuinely the highlight of my day.",
  },
  {
    name: "Emma K.",
    duration: "Member since 2021",
    text: "Three years in, still haven't wanted to leave. The recovery suite alone is worth the membership. Sauna after leg day is non-negotiable now.",
  },
];

const footerLinks = {
  Gym: ["Classes", "Facilities", "Coaches", "Timetable"],
  Membership: ["Plans & Pricing", "Corporate rates", "Student offer", "Free trial"],
  Help: ["Contact us", "FAQ", "Parking", "Location"],
  Legal: ["Privacy", "Terms", "Refund policy"],
};

export default function CtaFooter() {
  return (
    <>
      {/* Testimonials */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              Members
            </p>
            <h2 className="mt-3 text-4xl tracking-tight sm:text-5xl">
              Real people. Real results.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6"
              >
                <p className="text-sm leading-relaxed text-muted">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-auto">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted">{t.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="trial" className="border-t border-border">
        <div className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
          <h2 className="text-4xl tracking-tight sm:text-5xl">
            Your first week is{" "}
            <span className="text-accent">on us</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
            Walk in, book online or chat with our AI receptionist below. No
            commitment — just 7 days to see if IronPulse is the right fit.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="#"
              className="rounded-full bg-accent px-7 py-3 text-base font-semibold text-background transition-opacity hover:opacity-90"
            >
              Claim free trial
            </a>
            <a
              href="#pricing"
              className="rounded-full border border-border px-7 py-3 text-base font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              View membership plans
            </a>
          </div>

          <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-border bg-surface p-5 text-left text-sm">
            <p className="font-semibold">📍 IronPulse Fitness, Ranelagh</p>
            <p className="mt-2 text-muted">
              14 Ranelagh Road, Ranelagh, Dublin 6, D06 X214
            </p>
            <div className="mt-3 flex gap-4 text-xs text-muted">
              <span>🕐 Mon–Fri: 5am – 11pm</span>
              <span>Sat–Sun: 6am – 9pm</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-bold text-background">
                  IP
                </span>
                <span className="font-serif text-2xl tracking-tight">
                  IronPulse
                </span>
              </div>
              <p className="mt-4 text-sm text-muted">
                Dublin&apos;s most results-driven gym. Open 365 days a year.
              </p>
              <div className="mt-4 flex gap-3 text-xs text-muted">
                <a href="#" className="hover:text-accent">Instagram</a>
                <a href="#" className="hover:text-accent">WhatsApp</a>
                <a href="#" className="hover:text-accent">YouTube</a>
              </div>
            </div>

            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="text-sm font-semibold">{heading}</h4>
                <ul className="mt-4 space-y-3 text-sm">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-muted transition-colors hover:text-accent"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted sm:flex-row">
            <p>© {new Date().getFullYear()} IronPulse Fitness Ltd. All rights reserved.</p>
            <p>Powered by <span className="text-accent">FitAgent AI</span> ⚡</p>
          </div>
        </div>
      </footer>
    </>
  );
}
