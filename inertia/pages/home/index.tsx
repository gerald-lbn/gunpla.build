import { useMemo, useState, type CSSProperties } from 'react'
import { cn } from 'cn'
import { Head, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ArrowRight, Plus } from 'lucide-react'
import BaseLayout from '~/layouts/base'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent } from '~/components/ui/dialog'
import { KitPhoto } from '~/components/kit_photo'
import { StatusBadge } from '~/components/stickers'
import { KitDetailPanel } from '~/components/kit_detail_panel'
import { focusClose } from '~/lib/focus'
import { normalizeGrade, shortHandle } from '~/lib/kits'
import { timeAgo } from '~/lib/time'
import { rise } from '~/hooks/use_rise'
import { useLiveKits } from '~/hooks/use_live_kits'
import type { InertiaProps } from '~/types'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

type KitRow = InferData<KitTransformer>
type PageProps = InertiaProps<{ kits: KitRow[] }>

/*
 * The feed, which is also the first page a visitor sees. Loud and flat: a V-fin yellow poster with
 * the newest build stuck on it, and the feed as a wall of tiles.
 */
export default function Home({ kits }: PageProps) {
  const { props } = usePage<PageProps>()
  const isSignedIn = Boolean(props.user)
  const { isLive, isUpdating, freshUri } = useLiveKits(kits)
  const [selected, setSelected] = useState<KitRow | null>(null)
  const lead = kits[0] ?? null

  return (
    <>
      <Head title="Latest builds" />
      <Poster
        lead={lead}
        isSignedIn={isSignedIn}
        isLive={isLive}
        isUpdating={isUpdating}
        isFresh={!!lead && lead.uri === freshUri}
        onSelect={() => lead && setSelected(lead)}
      />
      {kits.length > 0 && <Wall kits={kits} onSelect={setSelected} />}

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

Home.layout = [BaseLayout]

/* ------------------------------------------------------------------------------------------ */

function PrimaryAction({ isSignedIn, className }: { isSignedIn: boolean; className?: string }) {
  return isSignedIn ? (
    <Button size="xl" className={className} render={<Link route="kits.create" />}>
      <Plus className="size-5" aria-hidden="true" />
      Log a kit
    </Button>
  ) : (
    <Button size="xl" className={className} render={<Link route="login" />}>
      Sign in with Bluesky
    </Button>
  )
}

const tilt = (deg: number, i = 0) => ({ '--tilt': `${deg}deg`, '--slap-i': i }) as CSSProperties

/**
 * The first screen: the line, what this is, the one action, and the newest build on the network
 * stuck on at a tilt with its stickers slapped on. When a kit is logged anywhere, the poster
 * changes to it while you watch.
 */
function Poster({
  lead,
  isSignedIn,
  isLive,
  isUpdating,
  isFresh,
  onSelect,
}: {
  lead: KitRow | null
  isSignedIn: boolean
  isLive: boolean
  isUpdating: boolean
  isFresh: boolean
  onSelect: () => void
}) {
  const handle = lead ? (lead.author?.handle ?? lead.handle) : null

  return (
    <section aria-labelledby="poster-title" className="overflow-hidden bg-vfin text-on-colour">
      <div className="column grid gap-x-4 gap-y-14 pt-10 pb-16 md:pt-14 lg:min-h-[calc(100svh-64px)] lg:grid-cols-12 lg:pb-14">
        <div className="flex flex-col justify-center gap-10 lg:col-span-7">
          <h1
            id="poster-title"
            className="display text-[23vw] md:text-[19vw] lg:text-[14.4vw] 2xl:text-[208px]"
          >
            <span className="mask-line">
              <span>Built it?</span>
            </span>
            <span className="mask-line">
              <span>Shelf it.</span>
            </span>
          </h1>
          <div className="after-mask">
            <p className="max-w-[34ch] text-lead leading-[1.3] font-medium">
              gunpla.build is a display shelf for Gunpla and plamo builds. Sign in with your Bluesky
              handle and put your kits up, photos and all.
            </p>
            <PrimaryAction isSignedIn={isSignedIn} className="mt-8 max-md:w-full" />
          </div>
        </div>

        <figure className="relative self-center lg:col-span-5 lg:pl-6">
          {lead ? (
            <div key={lead.uri} className="relative mx-auto w-[86%] max-w-[480px] lg:w-full">
              <button
                type="button"
                onClick={onSelect}
                aria-label={`Open ${lead.name}`}
                className="group block w-full rotate-[4deg] overflow-hidden rounded-[28px] transition-transform duration-300 hover:rotate-2 focus-visible:outline-4 focus-visible:outline-offset-4 motion-reduce:transition-none"
              >
                <KitPhoto
                  src={lead.fullPhotoUrl ?? lead.photoUrl}
                  alt={lead.name}
                  loading="eager"
                  plate={false}
                  className="aspect-4/5"
                  imgClassName="drift"
                />
              </button>
              {lead.grade && (
                <span
                  className="sticker slap absolute -top-3 -left-4 h-12 rotate-(--tilt) bg-[#0b0b0c] px-5 text-lead font-extrabold text-white"
                  style={tilt(-8, 0)}
                >
                  {lead.grade}
                </span>
              )}
              {lead.scale && (
                <span
                  className="sticker slap num absolute top-12 -left-6 h-10 rotate-(--tilt) bg-white px-4 text-[17px] text-on-colour"
                  style={tilt(5, 1)}
                >
                  {lead.scale}
                </span>
              )}
              <StatusBadge
                status={lead.status}
                className="slap absolute right-6 bottom-8 h-12 rotate-(--tilt) px-5 text-lead font-bold"
                style={tilt(-6, 2)}
              />
            </div>
          ) : (
            <div className="mx-auto w-[86%] max-w-[480px] rotate-[4deg] lg:w-full">
              <KitPhoto src={null} alt="No build yet" className="aspect-4/5" />
            </div>
          )}

          <figcaption className="mx-auto mt-10 w-[86%] max-w-[480px] lg:w-full" aria-live="polite">
            {lead ? (
              <>
                <p className="text-lead/tight font-bold">{lead.name}</p>
                <p className="mt-1 text-[17px]">
                  {handle && (
                    <Link
                      route="profile"
                      routeParams={[handle]}
                      className="font-semibold underline underline-offset-4 hover:no-underline"
                    >
                      @{shortHandle(handle)}
                    </Link>
                  )}
                  {handle && ' · '}
                  {isFresh ? 'just logged' : `logged ${timeAgo(lead.indexedAt)}`}
                </p>
              </>
            ) : (
              <p className="text-[17px]">The first kit logged on the network goes up here.</p>
            )}
            <p className="mt-3 inline-flex items-center gap-2 text-[15px] font-medium">
              <span
                aria-hidden="true"
                className={cn('size-2.5 rounded-full', isLive ? 'bg-[#0b0b0c]' : 'bg-[#0b0b0c]/30')}
              />
              {isUpdating
                ? 'A new build is going up…'
                : isLive
                  ? 'Live: the newest build on the network goes up here'
                  : 'The newest build on the network'}
            </p>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------------------------------ */

type Cell =
  | { kind: 'heading' }
  | { kind: 'kit'; kit: KitRow }
  | { kind: 'figure'; value: string; caption: string }
  | { kind: 'more' }

const FIGURE_TONES = ['bg-fed-blue', 'bg-shield', 'bg-runner', 'bg-vfin']

function feedFigures(kits: KitRow[]) {
  const handles = new Set(kits.map((k) => k.author?.handle ?? k.handle).filter(Boolean))
  const grades = new Map<string, number>()
  for (const k of kits) {
    const g = normalizeGrade(k.grade)
    if (g) grades.set(g, (grades.get(g) ?? 0) + 1)
  }
  const top = [...grades.entries()].sort((a, b) => b[1] - a[1])[0]
  const photos = kits.reduce((n, k) => n + (k.photoCount ?? 0), 0)
  const built = kits.filter((k) => k.status === 'done').length
  return [
    {
      value: String(kits.length),
      caption: kits.length === 1 ? 'build in the feed' : 'builds in the feed',
    },
    { value: String(photos), caption: photos === 1 ? 'photo' : 'photos' },
    top ? { value: top[0], caption: 'most logged grade' } : null,
    { value: String(handles.size), caption: handles.size === 1 ? 'builder' : 'builders' },
    { value: String(grades.size), caption: grades.size === 1 ? 'grade' : 'grades' },
    { value: String(built), caption: 'built and done' },
  ].filter(Boolean) as { value: string; caption: string }[]
}

/** Interleave the feed's photos with its own figures, so a uniform grid of squares looks varied. */
function wallCells(kits: KitRow[]): Cell[] {
  const shown = kits.slice(0, 9)
  const figures = feedFigures(kits)
  let k = (4 - ((2 + shown.length) % 4)) % 4
  if (k < 2 && figures.length >= k + 4) k += 4
  const picked = figures.slice(0, k)
  const cells: Cell[] = [{ kind: 'heading' }]
  const every = picked.length ? Math.max(1, Math.floor(shown.length / picked.length)) : Infinity
  let f = 0
  shown.forEach((kit, i) => {
    cells.push({ kind: 'kit', kit })
    if ((i + 1) % every === 0 && f < picked.length) cells.push({ kind: 'figure', ...picked[f++] })
  })
  while (f < picked.length) cells.push({ kind: 'figure', ...picked[f++] })
  cells.push({ kind: 'more' })
  return cells
}

function Wall({ kits, onSelect }: { kits: KitRow[]; onSelect: (kit: KitRow) => void }) {
  const cells = useMemo(() => wallCells(kits), [kits])
  let tone = 0

  return (
    <section aria-labelledby="wall-title" className="column mt-40 max-md:mt-24">
      <ul className="grid grid-cols-2 gap-1.5 md:grid-cols-4 md:gap-2">
        {cells.map((cell, i) => {
          const r = rise(i % 4)
          if (cell.kind === 'heading') {
            return (
              <li
                key="heading"
                {...r}
                className="relative aspect-square overflow-hidden rounded-[28px] bg-foreground text-background"
              >
                <h2
                  id="wall-title"
                  className="display absolute inset-x-5 bottom-5 text-head md:inset-x-6 md:bottom-6"
                >
                  Latest builds
                </h2>
              </li>
            )
          }
          if (cell.kind === 'kit') {
            const { kit } = cell
            return (
              <li key={kit.uri} {...r} className="group relative aspect-square">
                <KitPhoto
                  src={kit.photoUrl}
                  alt={kit.name}
                  grade={kit.grade}
                  className="size-full"
                  imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                />
                {kit.status !== 'done' && (
                  <StatusBadge
                    status={kit.status}
                    className="pointer-events-none absolute top-3 right-3"
                  />
                )}
                <button
                  type="button"
                  onClick={() => onSelect(kit)}
                  className="absolute inset-0 flex items-end rounded-[28px] p-3 text-left focus-visible:outline-4 focus-visible:outline-offset-2"
                >
                  <span className="sticker h-auto min-h-8 max-w-full bg-white py-1.5 text-[15px] leading-tight text-on-colour">
                    <span className="line-clamp-2">{kit.name}</span>
                  </span>
                </button>
              </li>
            )
          }
          if (cell.kind === 'figure') {
            const bg = FIGURE_TONES[tone++ % FIGURE_TONES.length]
            return (
              <li
                key={`f-${i}`}
                {...r}
                className={cn(
                  'relative flex aspect-square flex-col items-center justify-center rounded-[28px] text-on-colour',
                  bg
                )}
              >
                <p
                  className={cn(
                    'display num',
                    // two characters fill the tile at the poster size; longer values (MGSD, 120) step down
                    cell.value.length <= 2
                      ? 'text-[23vw] md:text-[14.4vw] 2xl:text-[208px]'
                      : 'text-[15vw] md:text-[8.4vw] 2xl:text-[121px]'
                  )}
                >
                  {cell.value}
                </p>
                <p className="absolute inset-x-3 bottom-[18px] text-center text-[15px] font-semibold">
                  {cell.caption}
                </p>
              </li>
            )
          }
          return (
            <li key="more" {...r} className="aspect-square">
              <Link
                route="explore"
                className="group flex size-full flex-col justify-between rounded-[28px] bg-fed-blue p-5 text-on-colour transition-colors hover:bg-primary-hover md:p-6"
              >
                <ArrowRight
                  className="size-10 transition-transform group-hover:translate-x-2 md:size-14"
                  aria-hidden="true"
                />
                <span className="display text-head">Explore all</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
