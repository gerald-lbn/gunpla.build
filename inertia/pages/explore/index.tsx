import { useState, useMemo } from 'react'
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
import { ExploreMasonryGrid } from '~/components/explore_masonry_grid'
import { FilterQueryBar } from '~/components/filter_query_bar'
import type { FilterChip, FilterType } from '~/components/filter_query_bar'

type KitExplore = InferVariants<KitTransformer>['forExplore']

type PageProps = InertiaProps<{
  kits: Scroll<KitExplore>
  q: string
  grade: string
  scale: string
  manufacturer: string
  builder: string
}>

const FILTER_TYPES: FilterType[] = [
  { key: 'grade', label: 'Grade' },
  { key: 'scale', label: 'Scale' },
  { key: 'manufacturer', label: 'Manufacturer' },
  { key: 'builder', label: 'Builder' },
]

async function valueFetcher(type: string, q?: string): Promise<string[]> {
  const url = new URL('/explore/filter-values', window.location.origin)
  url.searchParams.set('type', type)
  if (q) url.searchParams.set('q', q)
  const res = await fetch(url.toString())
  const data = (await res.json()) as { values?: string[] }
  return data.values ?? []
}

export default function Explore() {
  const { kits, q: serverQ, grade, scale, manufacturer, builder, user } = usePage<PageProps>().props

  const chips = useMemo((): FilterChip[] => {
    const result: FilterChip[] = []
    if (grade) result.push({ type: 'grade', value: grade })
    if (scale) result.push({ type: 'scale', value: scale })
    if (manufacturer) result.push({ type: 'manufacturer', value: manufacturer })
    if (builder) result.push({ type: 'builder', value: builder })
    if (serverQ) result.push({ type: null, value: serverQ })
    return result
  }, [grade, scale, manufacturer, builder, serverQ])

  const [selected, setSelected] = useState<KitExplore | null>(null)

  function handleChipsChange(newChips: FilterChip[]) {
    const params: Record<string, string> = {}
    for (const chip of newChips) {
      if (chip.type === null) {
        params.q = chip.value
      } else {
        params[chip.type] = chip.value
      }
    }
    router.get('/explore', params)
  }

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

          <div className="mb-8">
            <FilterQueryBar
              filterTypes={FILTER_TYPES}
              chips={chips}
              onChipsChange={handleChipsChange}
              onSubmit={() => router.reload()}
              valueFetcher={valueFetcher}
            />
          </div>

          {kits.data.length === 0 ? (
            chips.length > 0 ? (
              <Empty className="py-16">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search className="size-6" aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle>No builds match your filters</EmptyTitle>
                  <EmptyDescription>Try adjusting or clearing the active filters.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="outline" size="sm" onClick={() => handleChipsChange([])}>
                    Clear filters
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
              <ExploreMasonryGrid kits={kits.data} onSelect={setSelected} />
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
