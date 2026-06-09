const tiers = [
  {
    name: "Basic",
    price: "€39",
    period: "/mo",
    tagline: "Gym access for self-starters.",
    features: [
      "Full gym floor access",
      "Cardio & free weights",
      "Changing rooms & lockers",
      "IronPulse app included",
    ],
    cta: "Start free trial",
    highlight: false,
  },
  {
    name: "Performance",
    price: "€69",
    period: "/mo",
    tagline: "The most popular plan — classes + coaching.",
    features: [
      "Everything in Basic",
      "Unlimited group classes",
      "1 personal training session/mo",
      "Recovery suite access",
      "Nutrition check-in/mo",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Elite",
    price: "€129",
    period: "/mo",
    tagline: "For athletes who want the full stack.",
    features: [
      "Everything in Performance",
      "4 PT sessions per month",
      "Priority class booking",
      "Body composition scans",
      "Dedicated locker",
    ],
    cta: "Start free trial",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Membership
          </p>
          <h2 className="mt-3 text-4xl tracking-tight sm:text-5xl">
            Simple plans. No hidden fees.
          </h2>
          <p className="mt-4 text-lg text-muted">
            Every plan includes a 7-day free trial. Cancel anytime.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                t.highlight
                  ? "border-accent bg-surface ring-1 ring-accent"
                  : "border-border bg-surface"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-background">
                  Most popular
                </span>
              )}

              <h3 className="text-xl">{t.name}</h3>
              <p className="mt-2 text-sm text-muted">{t.tagline}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-serif text-5xl tracking-tight">
                  {t.price}
                </span>
                <span className="text-muted">{t.period}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 text-accent">✓</span>
                    <span className="text-muted">{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#trial"
                className={`mt-8 rounded-full px-5 py-3 text-center text-sm font-semibold transition ${
                  t.highlight
                    ? "bg-accent text-background hover:opacity-90"
                    : "border border-border text-foreground hover:border-accent hover:text-accent"
                }`}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          Corporate & student rates available. Walk in or chat with us for
          details.
        </p>
      </div>
    </section>
  );
}
