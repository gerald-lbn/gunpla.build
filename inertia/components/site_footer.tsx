import type React from 'react'
import { cn } from 'cn'
import { usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'

const PROJECT = [
  { label: 'Source on Tangled', href: 'https://tangled.org/grld.dev/gunpla.build' },
  { label: 'Mirror on GitHub', href: 'https://github.com/gerald-lbn/gunpla.build' },
]
const NETWORK = [
  { label: 'About the AT Protocol', href: 'https://atproto.com' },
  { label: 'Bluesky', href: 'https://bsky.app' },
]

type Credit = {
  title: string
  by: string
  licence: string
  licenceUrl: string
  page: string
}

/** The open-collection pictures the site uses, with their credits (public/found/credits.json). */
const BY_SA_4 = 'https://creativecommons.org/licenses/by-sa/4.0/'
const CREDITS = {
  sprues: {
    title: 'Gunpla model sprues',
    by: 'Gravis',
    licence: 'CC BY-SA 4.0',
    licenceUrl: BY_SA_4,
    page: 'https://commons.wikimedia.org/wiki/File:Gunpla_model_sprues.jpg',
  },
  multiColourSprue: {
    title: 'Gunpla multi color sprue',
    by: 'Gravis',
    licence: 'CC BY-SA 4.0',
    licenceUrl: BY_SA_4,
    page: 'https://commons.wikimedia.org/wiki/File:Gunpla_multi_color_sprue.jpg',
  },
} satisfies Record<string, Credit>

/**
 * The credits for the pictures the current page actually shows, so each page credits only
 * what is on it. Keep in step with the `/found/` images in the page components.
 */
function creditsFor(component: string, props: Record<string, unknown>): Credit[] {
  switch (component) {
    case 'auth/login':
      // the sprues stand in for the random kit when no kit has a photo
      return props.kit ? [] : [CREDITS.sprues]
    case 'explore/index':
      return [CREDITS.multiColourSprue]
    case 'errors/not_found':
    case 'errors/server_error':
      return [CREDITS.sprues]
    default:
      return []
  }
}

/* each letter of the name on its own runner-coloured block, the blocks at different heights */
const BLOCKS: { ch: string; h: number; tone: string }[] = [
  { ch: 'g', h: 100, tone: 'bg-vfin text-on-colour' },
  { ch: 'u', h: 76, tone: 'bg-fed-blue text-on-colour' },
  { ch: 'n', h: 90, tone: 'bg-shield text-on-colour' },
  { ch: 'p', h: 66, tone: 'bg-runner text-on-colour' },
  { ch: 'l', h: 96, tone: 'bg-foreground text-background' },
  { ch: 'a', h: 80, tone: 'bg-vfin text-on-colour' },
  { ch: '.', h: 60, tone: 'bg-fed-blue text-on-colour' },
  { ch: 'b', h: 94, tone: 'bg-shield text-on-colour' },
  { ch: 'u', h: 72, tone: 'bg-runner text-on-colour' },
  { ch: 'i', h: 100, tone: 'bg-foreground text-background' },
  { ch: 'l', h: 84, tone: 'bg-vfin text-on-colour' },
  { ch: 'd', h: 92, tone: 'bg-fed-blue text-on-colour' },
]

export function SiteFooter() {
  const { props, component } = usePage()
  const isSignedIn = Boolean(props.user)
  const credits = creditsFor(component, props)

  return (
    <footer aria-label="Site footer" className="mt-40 bg-background pb-8">
      <div className="column">
        <h2 className="sr-only">gunpla.build</h2>
        <div
          aria-hidden="true"
          className="grid h-[30svh] max-h-[420px] min-h-[220px] grid-cols-6 grid-rows-2 gap-1 lg:h-[34svh] lg:min-h-[260px] lg:grid-cols-12 lg:grid-rows-1"
        >
          {BLOCKS.map((b, i) => (
            <div
              key={i}
              className="flex items-end"
              data-rise=""
              style={{ ['--rise-i' as string]: i % 6 }}
            >
              <span
                className={cn(
                  'flex w-full items-end justify-center overflow-hidden rounded-[14px] pb-[0.06em] leading-[0.8] font-extrabold',
                  'text-[clamp(64px,13vw,128px)] font-stretch-62% lg:text-[clamp(72px,8.4vw,150px)]',
                  b.tone
                )}
                style={{ height: `${b.h}%` }}
              >
                {b.ch}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-12 md:gap-4">
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-4 gap-y-8 md:col-span-8 md:grid-cols-4"
          >
            <FooterList title="Shelves">
              <FooterRoute route="home">Latest builds</FooterRoute>
              <FooterRoute route="explore">Explore</FooterRoute>
              <FooterRoute route="stats">Stats</FooterRoute>
            </FooterList>
            <FooterList title="Yours">
              {isSignedIn ? (
                <>
                  <FooterRoute route="shelf">My shelf</FooterRoute>
                  <FooterRoute route="kits.create">Log a kit</FooterRoute>
                </>
              ) : (
                <FooterRoute route="login">Sign in with Bluesky</FooterRoute>
              )}
            </FooterList>
            <FooterList title="Project">
              {PROJECT.map((l) => (
                <FooterHref key={l.href} href={l.href}>
                  {l.label}
                </FooterHref>
              ))}
            </FooterList>
            <FooterList title="Network">
              {NETWORK.map((l) => (
                <FooterHref key={l.href} href={l.href}>
                  {l.label}
                </FooterHref>
              ))}
            </FooterList>
          </nav>
          <p className="text-[15px]/6 md:col-span-4">
            Every kit on gunpla.build is a build.gunpla.kit record in its builder&apos;s own AT
            Protocol repository, with its photos stored beside it. This site reads them and shows
            them; it never holds the only copy.
          </p>
        </div>

        <div className="mt-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-4xl text-[15px]/6">
            {credits.length > 0 && (
              <>
                {credits.length === 1 ? 'Picture on this page: ' : 'Pictures on this page: '}
                {credits.map((c, i) => (
                  <span key={c.page}>
                    <a href={c.page} className="underline underline-offset-2 hover:no-underline">
                      “{c.title}”
                    </a>{' '}
                    by {c.by},{' '}
                    <a
                      href={c.licenceUrl}
                      className="underline underline-offset-2 hover:no-underline"
                    >
                      {c.licence}
                    </a>
                    {i < credits.length - 1 ? '; ' : ', via Wikimedia Commons. '}
                  </span>
                ))}
              </>
            )}
            Build photos belong to their builders. gunpla.build is open source under AGPL-3.0 and is
            a fan project, not affiliated with Bandai or Sunrise.
          </p>
          <Button
            size="sm"
            className="self-start md:self-auto"
            render={<Link route={isSignedIn ? 'kits.create' : 'login'} />}
          >
            {isSignedIn ? 'Log a kit' : 'Sign in'}
          </Button>
        </div>
      </div>
    </footer>
  )
}

function FooterList({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[15px] font-bold">{title}</h3>
      <ul className="mt-2 flex flex-col">{children}</ul>
    </div>
  )
}

function FooterRoute({
  route,
  children,
}: {
  route: 'home' | 'explore' | 'stats' | 'shelf' | 'kits.create' | 'login'
  children: React.ReactNode
}) {
  return (
    <li>
      <Link
        route={route}
        className="inline-flex h-9 items-center text-[15px] text-foreground underline-offset-4 hover:underline"
      >
        {children}
      </Link>
    </li>
  )
}

function FooterHref({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 items-center text-[15px] text-foreground underline-offset-4 hover:underline"
      >
        {children}
      </a>
    </li>
  )
}
