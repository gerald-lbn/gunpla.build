import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import BaseLayout from '~/layouts/base'
import { HeroCopy } from './hero_copy'
import { LiveFeed } from './live_feed'
import { ActivityTicker } from './activity_ticker'
import type { InertiaProps } from '~/types'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

type KitRow = InferData<KitTransformer>
type PageProps = InertiaProps<{ kits: KitRow[] }>

export default function Home({ kits }: PageProps) {
  const page = usePage<PageProps>()
  const isSignedIn = Boolean(page.props.user)

  return (
    <>
      <style>{`
        @keyframes hero-marquee {
          0% { transform: translate(0); }
          to { transform: translate(-50%); }
        }
        @keyframes hero-bob {
          0%, 100% { transform: translateY(-6px) rotate(-10deg); }
          50%      { transform: translateY(8px) rotate(2deg); }
        }
        @keyframes snap-insert {
          0%   { transform: translateY(-90%) scale(0.92); opacity: 0; }
          60%  { transform: translateY(10px) scale(1.02); opacity: 1; }
          85%  { transform: translateY(-3px) scale(0.99); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .hero-marquee {
          backface-visibility: hidden;
          animation: 45s linear infinite hero-marquee;
        }
        .hero-bob { animation: 7s ease-in-out infinite hero-bob; }
        .animate-snap-insert { animation: snap-insert 0.65s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      <div className="relative overflow-hidden bg-background">
        {/* Radial ambient glow backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(120%_75%_at_68%_6%,color-mix(in_oklab,var(--primary)_34%,transparent)_0%,transparent_52%),radial-gradient(90%_55%_at_8%_38%,color-mix(in_oklab,var(--primary)_14%,transparent)_0%,transparent_50%),radial-gradient(85%_50%_at_92%_62%,color-mix(in_oklab,var(--primary)_12%,transparent)_0%,transparent_48%),radial-gradient(70%_40%_at_20%_88%,color-mix(in_oklab,var(--primary)_10%,transparent)_0%,transparent_50%)] [mask-image:linear-gradient(to_bottom,black_92%,transparent)]"
        />

        <section className="relative overflow-x-clip overflow-y-visible border-b-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-linear-to-r from-background from-15% via-background/70 via-50% to-transparent [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
          />

          <div className="container relative z-10 mx-auto px-4 pt-8 pb-8 sm:pt-12 sm:pb-12 lg:pt-16 lg:pb-14">
            <div className="grid grid-cols-1 items-center gap-10 sm:gap-12 lg:min-h-[34rem] lg:grid-cols-[minmax(0,1fr)_32rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_38rem]">
              <HeroCopy isSignedIn={isSignedIn} />
              <LiveFeed kits={kits} isSignedIn={isSignedIn} />
            </div>
          </div>
        </section>

        {kits.length > 0 && <ActivityTicker kits={kits} />}
      </div>

      <footer className="border-t-2 border-border bg-card py-12 text-card-foreground">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <span className="font-head text-xl font-bold tracking-tight">gunpla.build</span>
              <p className="mt-2 max-w-sm font-mono text-xs text-muted-foreground">
                An open shelf and build tracker built on the AT Protocol. Log kits, share progress,
                and own your records forever.
              </p>
            </div>

            <div>
              <h4 className="font-head text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Explore
              </h4>
              <ul className="mt-3 space-y-2 font-mono text-xs">
                <li>
                  <a href="#live-feed" className="hover:underline">
                    Live Feed
                  </a>
                </li>
                <li>
                  <Link route={isSignedIn ? 'shelf' : 'login'} className="hover:underline">
                    {isSignedIn ? 'My Shelf' : 'Sign In'}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-head text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Ecosystem
              </h4>
              <ul className="mt-3 space-y-2 font-mono text-xs">
                <li>
                  <a
                    href="https://bsky.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Bluesky Network
                  </a>
                </li>
                <li>
                  <a
                    href="https://atproto.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    AT Protocol Docs
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t-2 border-border/40 pt-6 sm:flex-row font-mono text-[11px] text-muted-foreground">
            <p>© 2026 gunpla.build · Gundam and Gunpla are trademarks of Bandai Namco.</p>
            <p>Built with Neobrutalism on ATProto.</p>
          </div>
        </div>
      </footer>
    </>
  )
}

Home.layout = [BaseLayout]
