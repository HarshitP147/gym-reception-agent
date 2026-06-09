import Image from "next/image";

const coaches = [
  {
    name: "Coach Sean",
    role: "Strength & Powerlifting",
    bio: "10 years competitive powerlifting, IPF certified coach. Sean has coached over 200 members to personal bests.",
    img: "/images/portraits/178102586208c0.png",
  },
  {
    name: "Coach Claire",
    role: "HIIT & MetCon",
    bio: "Former national-level sprinter. Claire's MetCon Burn class has a 3-month waiting list for a reason.",
    img: "/images/portraits/17810259072777.png",
  },
  {
    name: "Coach Conor",
    role: "Boxing & Conditioning",
    bio: "Amateur boxing champion turned S&C coach. Pad work, technique, fitness — Conor covers all three.",
    img: "/images/portraits/1781025927f526.png",
  },
  {
    name: "Coach Niamh",
    role: "Cardio & Cycling",
    bio: "Triathlete and endurance specialist. Niamh designs every Spin session around output, not just effort.",
    img: "/images/portraits/17810259556dcc.png",
  },
];

export default function Coaches() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Coaches
          </p>
          <h2 className="mt-3 text-4xl tracking-tight sm:text-5xl">
            Coached by the best.
          </h2>
          <p className="mt-4 text-lg text-muted">
            Every IronPulse coach is certified, experienced and fully focused on
            your results — not just counting your reps.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coaches.map((c) => (
            <div
              key={c.name}
              className="group overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <div className="relative h-72 overflow-hidden">
                <Image
                  src={c.img}
                  alt={c.name}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
              </div>
              <div className="p-5">
                <p className="font-semibold">{c.name}</p>
                <p className="mt-0.5 text-xs font-medium text-accent">
                  {c.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {c.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
