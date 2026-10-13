import { useState, useEffect, useRef, type CSSProperties } from 'react'
import BaseLayout from '~/layouts/base'
import { usePage, InfiniteScroll, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { Search, Package, Loader2, RefreshCw } from 'lucide-react'
import { Dialog, DialogContent } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '~/components/ui/empty'
import type { InertiaProps } from '~/types'
import type { Scroll } from '@adonisjs/inertia/types'
import type { InferVariants } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'
import { KitDetailPanel } from '~/components/kit_detail_panel'

type KitExplore = InferVariants<KitTransformer>['forExplore']

type PageProps = InertiaProps<{
  kits: Scroll<KitExplore>
  q: string
}>

const ASPECT = [
  'aspect-[3/4]',
  'aspect-square',
  'aspect-[4/5]',
  'aspect-[3/4]',
  'aspect-video',
  'aspect-square',
]

function bgStyle(src: string): CSSProperties {
  if (src.startsWith('http') || src.startsWith('/')) {
    return { backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return { background: src }
}

export default function Explore() {
  const { kits, q: initialQ, user } = usePage<PageProps>().props

  const [search, setSearch] = useState(initialQ)
  const [selected, setSelected] = useState<KitExplore | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      router.get(
        '/explore',
        { q: search },
        {
          preserveState: true,
          preserveScroll: false,
          only: ['kits', 'q'],
        }
      )
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <>
      <section aria-labelledby="explore-heading" className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <h1 className="font-head mb-3 text-3xl font-semibold lg:text-4xl" id="explore-heading">
              Explore builds
            </h1>
            <p className="font-sans text-lg text-muted-foreground">
              Community kits logged on gunpla.build, every grade and scale.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-8 max-w-sm">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search kits, builders, grades…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border-2 border-border bg-card py-2 pr-4 pl-9 font-head text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:shadow-md"
            />
          </div>

          {kits.data.length === 0 ? (
            search.trim().length > 0 ? (
              <Empty className="py-16">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search className="size-6" aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle>No kits found</EmptyTitle>
                  <EmptyDescription>
                    No builds match your search for &ldquo;{search}&rdquo;. Try another term or
                    clear the filter.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                    Clear search
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <Empty className="py-16">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Package className="size-6" aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle>No builds logged yet</EmptyTitle>
                  <EmptyDescription>
                    Community kits will appear here once builders mark their builds as completed.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button size="sm" render={<Link route={user ? 'kits.create' : 'login'} />}>
                    Log a build
                  </Button>
                </EmptyContent>
              </Empty>
            )
          ) : (
            <InfiniteScroll
              data="kits"
              onlyNext
              next={({ loading, fetch, hasMore }) => (
                <div className="mt-8 flex flex-col items-center justify-center py-6 text-center">
                  {loading && (
                    <div className="flex items-center gap-2 rounded border-2 border-border bg-card px-4 py-2 font-head text-sm font-semibold shadow-[3px_3px_0px_0px_hsl(var(--border))]">
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      <span>Loading more builds…</span>
                    </div>
                  )}
                  {!loading && hasMore && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetch()}
                      className="border-2 border-border shadow-[3px_3px_0px_0px_hsl(var(--border))]"
                    >
                      <RefreshCw className="mr-1.5 size-3.5" aria-hidden="true" />
                      Load more builds
                    </Button>
                  )}
                  {!hasMore && (
                    <p className="font-head text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      You&apos;ve reached the end of the builds
                    </p>
                  )}
                </div>
              )}
            >
              <div className="columns-1 gap-6 md:columns-2 lg:columns-3 xl:columns-4">
                {kits.data.map((kit, i) => (
                  <article key={kit.id} className="group relative mb-6 break-inside-avoid">
                    <button
                      type="button"
                      onClick={() => setSelected(kit)}
                      className="w-full text-left"
                      aria-label={`View details for ${kit.name}`}
                    >
                      <div
                        className={`mb-4 overflow-hidden rounded border-2 border-border ${ASPECT[i % ASPECT.length]}`}
                      >
                        <div
                          className="size-full transition-[scale] duration-500 group-hover:scale-105"
                          style={kit.photos[0] ? bgStyle(kit.photos[0].thumbUrl) : undefined}
                        />
                      </div>
                    </button>

                    <h2 className="font-head mb-1 text-base font-medium uppercase decoration-primary decoration-[3px] underline-offset-2 group-hover:underline">
                      <button
                        type="button"
                        onClick={() => setSelected(kit)}
                        className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {kit.name}
                      </button>
                    </h2>

                    <p className="mb-2 font-head text-sm font-medium text-muted-foreground">
                      @{(kit.handle ?? '').split('.')[0]}
                    </p>

                    <ul className="flex flex-wrap gap-2">
                      {[kit.grade, kit.scale].filter(Boolean).map((tag) => (
                        <li key={tag}>
                          <span className="inline-flex items-center rounded border-2 border-border px-2 py-0.5 font-head text-xs font-semibold uppercase">
                            {tag}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </InfiniteScroll>
          )}
        </div>
      </section>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <DialogContent
          className="max-h-[calc(100svh-2rem)] max-w-[calc(100%-2rem)] sm:max-w-4xl overflow-hidden border-2 border-border p-0 shadow-[6px_6px_0px_0px_hsl(var(--border))]"
          showCloseButton={false}
        >
          {selected && <KitDetailPanel kit={selected} onClose={() => setSelected(null)} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

Explore.layout = [BaseLayout]
