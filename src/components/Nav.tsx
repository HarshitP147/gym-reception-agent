export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-base text-background font-bold">
            IP
          </span>
          <span className="font-serif text-2xl tracking-tight">IronPulse</span>
        </a>

        <div className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a href="#classes" className="text-muted transition-colors hover:text-accent">Classes</a>
          <a href="#facilities" className="text-muted transition-colors hover:text-accent">Facilities</a>
          <a href="#pricing" className="text-muted transition-colors hover:text-accent">Membership</a>
          <a href="#about" className="text-muted transition-colors hover:text-accent">About</a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#pricing"
            className="hidden rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent sm:inline-block"
          >
            See plans
          </a>
          <a
            href="#trial"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Free Trial
          </a>
        </div>
      </nav>
    </header>
  );
}
