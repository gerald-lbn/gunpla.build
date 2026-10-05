import { usePage } from '@inertiajs/react'
import BaseLayout from '~/layouts/base'
import { HeroCopy } from './hero'
import { LiveFeed } from './live_feed'
import { ActivityTicker } from './activity_ticker'
import type { InertiaProps } from '~/types'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

type KitRow = InferData<KitTransformer>
type PageProps = InertiaProps<{ kits: KitRow[] }>

export default function Home({ kits }: PageProps) {
  const { props } = usePage<PageProps>()
  const isSignedIn = Boolean(props.user)

  return (
    <>
      <style>{`
        @keyframes hero-marquee {
          0% { transform: translate(0); }
          to { transform: translate(-50%); }
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
.animate-snap-insert { animation: snap-insert 0.65s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      <div className="relative overflow-hidden bg-background">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(120%_75%_at_68%_6%,color-mix(in_oklab,var(--primary)_34%,transparent)_0%,transparent_52%),radial-gradient(90%_55%_at_8%_38%,color-mix(in_oklab,var(--primary)_14%,transparent)_0%,transparent_50%),radial-gradient(85%_50%_at_92%_62%,color-mix(in_oklab,var(--primary)_12%,transparent)_0%,transparent_48%),radial-gradient(70%_40%_at_20%_88%,color-mix(in_oklab,var(--primary)_10%,transparent)_0%,transparent_50%)] [mask-image:linear-gradient(to_bottom,black_92%,transparent)]"
        />

        <section className="relative overflow-x-clip overflow-y-visible border-b-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-linear-to-r from-background from-15% via-background/70 via-50% to-transparent [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
          />

          <div className="container relative z-10 mx-auto max-w-6xl px-4 pt-6 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:pt-12 lg:pb-10">
            <div className="grid grid-cols-1 items-center gap-10 sm:gap-12 lg:min-h-[36rem] lg:grid-cols-[minmax(0,1fr)_30rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_36rem]">
              <HeroCopy isSignedIn={isSignedIn} />
              <LiveFeed kits={kits} isSignedIn={isSignedIn} />
            </div>
          </div>
        </section>

        {kits.length > 0 && <ActivityTicker kits={kits} />}
      </div>
    </>
  )
}

Home.layout = [BaseLayout]
