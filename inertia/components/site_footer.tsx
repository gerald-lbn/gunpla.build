import Logo from '~/components/logo'

export function SiteFooter() {
  return (
    <footer aria-label="Site footer" className="border-t-2 border-border bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="mb-3 inline-flex items-center gap-3 rounded">
              <Logo size={28} />
              <span className="font-head text-3xl">GUNPLA.BUILD</span>
            </div>
            <p className="font-sans max-w-sm text-sm leading-relaxed text-muted-foreground">
              The internet&apos;s Gunpla shelf. Log your builds from runner clipping to final
              topcoat, and own your records forever on the AT Protocol.
            </p>
          </div>

          <nav aria-label="ATProto">
            <p className="mb-6 font-head text-xl tracking-wide uppercase">ATProto</p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://bsky.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded underline-offset-4 decoration-primary decoration-2 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Bluesky
                </a>
              </li>
              <li>
                <a
                  href="https://atproto.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded underline-offset-4 decoration-primary decoration-2 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  AT Protocol
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Project">
            <p className="mb-6 font-head text-xl tracking-wide uppercase">Project</p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://tangled.org/grld.dev/gunpla.build"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded underline-offset-4 decoration-primary decoration-2 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Tangled
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/gerald-lbn/gunpla.build"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded underline-offset-4 decoration-primary decoration-2 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t-2 border-border bg-primary text-primary-foreground">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-4 text-sm md:flex-row">
          <p className="font-medium">
            © {new Date().getFullYear()} gunpla.build · Gundam and Gunpla are trademarks of Bandai
            Namco.
          </p>
        </div>
      </div>
    </footer>
  )
}
