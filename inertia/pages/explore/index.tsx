import { useState, useMemo } from 'react'
import BaseLayout from '~/layouts/base'
import { ShelfItPanel } from '~/components/shelf_it_panel'
import { Head, usePage, InfiniteScroll, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { PageHeader } from '~/components/page'
import type { InertiaProps } from '~/types'
import type { Scroll } from '@adonisjs/inertia/types'
import type { InferVariants } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'
import { KitDetailPanel } from '~/components/kit_detail_panel'
import { focusClose } from '~/lib/focus'
import { ExploreMasonryGrid } from '~/components/explore_masonry_grid'
import { FilterQueryBar } from '~/components/filter_query_bar'
import type { FilterChip, FilterType } from '~/components/filter_query_bar'
import { plural } from '~/lib/kits'

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

  // The paginator's metadata travels with the scroll prop at runtime
  const total = (kits as unknown as { metadata?: { total?: number } }).metadata?.total
  const count = total ?? kits.data.length

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
      <Head title="Explore builds" />
      <section aria-labelledby="explore-heading">
        <div className="bg-fed-blue text-on-colour">
          <div className="column pt-12 pb-10 md:pt-16 md:pb-12">
            <PageHeader id="explore-heading" title="Explore builds" />

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="w-full md:max-w-2xl **:[[class*=bg-surface]]:bg-white">
                <FilterQueryBar
                  filterTypes={FILTER_TYPES}
                  chips={chips}
                  onChipsChange={handleChipsChange}
                  onSubmit={() => router.reload()}
                  valueFetcher={valueFetcher}
                />
              </div>
              <p className="num shrink-0 text-[17px] font-semibold" aria-live="polite">
                {chips.length > 0
                  ? `${plural(count, 'build')} match`
                  : `${plural(count, 'finished build')}`}
              </p>
            </div>
          </div>
        </div>

        <div className="column pt-10 md:pt-12">
          {kits.data.length === 0 ? (
            chips.length > 0 ? (
              <EmptyState
                title="No finished build matches these filters"
                body="Remove a filter to widen the search. Filters only match builds marked as built; kits still in a backlog stay on their builder's shelf."
                action={
                  <Button variant="secondary" onClick={() => handleChipsChange([])}>
                    Clear all filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="No finished build yet"
                body="Builds appear here once a builder marks a kit as built. Kits in a backlog or on the bench stay on their builder's shelf."
                action={
                  <Button render={<Link route={user ? 'kits.create' : 'login'} />}>
                    {user ? 'Log a kit' : 'Sign in to log a kit'}
                  </Button>
                }
              />
            )
          ) : (
            <InfiniteScroll
              data="kits"
              onlyNext
              next={({ loading, fetch, hasMore }) => (
                <div className="mt-16 flex justify-center text-[17px]">
                  {loading ? (
                    <p className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Loading more builds…
                    </p>
                  ) : hasMore ? (
                    <Button variant="secondary" onClick={() => fetch()}>
                      Load more builds
                    </Button>
                  ) : (
                    <p className="num">
                      That&apos;s all {plural(kits.data.length, 'build')}
                      {chips.length > 0 ? ' matching these filters' : ''}.
                    </p>
                  )}
                </div>
              )}
            >
              <ExploreMasonryGrid kits={kits.data} onSelect={setSelected} />
            </InfiniteScroll>
          )}
          <ShelfItPanel />
        </div>
      </section>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent
          className="max-h-[calc(100svh-2rem)] max-w-[calc(100%-2rem)] overflow-hidden p-0 sm:max-w-5xl"
          showCloseButton={false}
          onOpenAutoFocus={focusClose}
        >
          {selected && <KitDetailPanel kit={selected} onClose={() => setSelected(null)} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-start gap-5 rounded-[28px] bg-surface p-6 md:p-8">
      <div>
        <h2 className="text-lead font-bold">{title}</h2>
        <p className="mt-2 max-w-xl text-[17px]">{body}</p>
      </div>
      {action}
    </div>
  )
}

Explore.layout = [BaseLayout]
