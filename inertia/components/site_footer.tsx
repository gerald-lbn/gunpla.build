import { Wordmark } from '~/components/logo'

const LINKS = [
  { label: 'Source on Tangled', href: 'https://tangled.org/grld.dev/gunpla.build' },
  { label: 'Mirror on GitHub', href: 'https://github.com/gerald-lbn/gunpla.build' },
  { label: 'About the AT Protocol', href: 'https://atproto.com' },
  { label: 'Bluesky', href: 'https://bsky.app' },
]

export function SiteFooter() {
  return (
    <footer aria-label="Site footer" className="mt-24 bg-background">
      <div className="column">
        <div className="flex flex-col gap-8 border-t border-rule py-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <Wordmark />
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Every kit on gunpla.build is a{' '}
              <span className="text-foreground">build.gunpla.kit</span> record in its builder&apos;s
              own AT Protocol repository, with its photos stored beside it. This site indexes them;
              it never holds the only copy.
            </p>
          </div>

          <nav aria-label="Project links">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm md:grid-cols-1 md:text-right">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
