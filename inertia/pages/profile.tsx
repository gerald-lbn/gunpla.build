import { useState, useMemo } from 'react'
import { cn } from 'cn'
import { Link } from '@adonisjs/inertia/react'
import { Head, usePage } from '@inertiajs/react'
import { Check, ExternalLink, LayoutGrid, List, Pencil, Plus, Search, X } from 'lucide-react'
import BaseLayout from '~/layouts/base'
import { KitTile } from '~/components/kit_tile'
import { KitPhoto } from '~/components/kit_photo'
import { KitDetailPanel } from '~/components/kit_detail_panel'
import { focusClose } from '~/lib/focus'
import { StatusBadge } from '~/components/kit_preview'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Dialog, DialogContent } from '~/components/ui/dialog'
import { kitSpec, plural, statusLabel } from '~/lib/kits'
import { timeAgo } from '~/lib/time'
import { rise } from '~/hooks/use_rise'
import type { InertiaProps } from '~/types'
import type { InferVariants } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'
import type { Achievement, ProfileStats } from '#types/profile'

type KitShelf = InferVariants<KitTransformer>['forProfileShelf']

type PageProps = InertiaProps<{
  handle: string | null
  did?: string
  avatarUrl?: string | null
  description?: string | null
  displayName?: string | null
  kits: KitShelf[]
  stats: ProfileStats
  achievements: Achievement[]
  selectedRkey?: string
}>

export default function Profile({
  handle,
  did,
  avatarUrl,
  description,
  displayName,
  kits,
  achievements,
  selectedRkey,
}: PageProps) {
  const page = usePage<PageProps>()
  const viewerDid = page.props.user?.did
  const isOwner = Boolean(viewerDid && did && viewerDid === did)

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selected, setSelected] = useState<KitShelf | null>(() =>
    selectedRkey ? (kits.find((k) => k.rkey === selectedRkey) ?? null) : null
  )

  const displayHandle = handle ? `@${handle}` : (did ?? 'unknown')
  const title = displayName || displayHandle
  const bskyUrl = `https://bsky.app/profile/${encodeURIComponent(handle ?? did ?? '')}`

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const kit of kits) c[kit.status] = (c[kit.status] ?? 0) + 1
    return c
  }, [kits])

  const tabs = useMemo(() => {
    const base = [
      { key: 'all', label: 'All', count: kits.length },
      { key: 'done', label: statusLabel('done'), count: counts['done'] ?? 0 },
      { key: 'in-progress', label: statusLabel('in-progress'), count: counts['in-progress'] ?? 0 },
      { key: 'backlog', label: statusLabel('backlog'), count: counts['backlog'] ?? 0 },
    ]
    for (const key of ['on-hold', 'dropped']) {
      if (counts[key]) base.push({ key, label: statusLabel(key), count: counts[key] })
    }
    return base
  }, [kits.length, counts])

  const filteredKits = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return kits.filter((kit) => {
      if (statusFilter !== 'all' && kit.status !== statusFilter) return false
      if (!query) return true
      return (
        kit.name.toLowerCase().includes(query) ||
        (kit.grade?.toLowerCase().includes(query) ?? false) ||
        (kit.scale?.toLowerCase().includes(query) ?? false) ||
        (kit.manufacturer?.toLowerCase().includes(query) ?? false)
      )
    })
  }, [kits, statusFilter, searchQuery])

  const cover = kits.find((k) => k.photoUrl) ?? null
  const totalPhotos = kits.reduce((sum, k) => sum + k.photoCount, 0)
  const totalLikes = kits.reduce((sum, k) => sum + (k.likeCount ?? 0), 0)

  return (
    <div className="column pt-10 md:pt-14">
      <Head title={`${title}'s shelf`} />

      {/* Who this is, set as the poster, and the shelf's own figures as colour blocks */}
      <header className="grid gap-x-4 gap-y-8 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col justify-center gap-8 lg:col-span-8">
          <h1 className="display text-[15vw] wrap-break-word md:text-[11vw] lg:text-[8.4vw] 2xl:text-[121px]">
            {title}&apos;s shelf
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="size-16 md:size-20">
                {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
                <AvatarFallback className="text-lead font-bold">
                  {(handle || displayName || 'G').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="min-w-0 text-[17px]">
                <span className="block truncate font-bold">{displayHandle}</span>
                <span className="block">{plural(kits.length, 'kit')} logged on gunpla.build</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isOwner && (
                <Button size="lg" render={<Link route="kits.create" />}>
                  <Plus aria-hidden="true" />
                  Log a kit
                </Button>
              )}
              <Button
                size="lg"
                variant="secondary"
                render={<a href={bskyUrl} target="_blank" rel="noopener noreferrer" />}
              >
                <ExternalLink aria-hidden="true" />
                Bluesky profile
              </Button>
            </div>
          </div>
          {description && (
            <p className="line-clamp-4 max-w-[48ch] text-lead/snug whitespace-pre-line">
              {description.replace(/\n{2,}/g, '\n').trim()}
            </p>
          )}
        </div>
        {cover && (
          <figure className="relative hidden self-center lg:col-span-4 lg:block lg:pl-8">
            <button
              type="button"
              onClick={() => setSelected(cover)}
              aria-label={`Open ${cover.name}`}
              className="group mx-auto block w-[78%] max-w-[360px] rotate-3 overflow-hidden rounded-[28px] transition-transform duration-300 hover:rotate-1 focus-visible:outline-4 focus-visible:outline-offset-4 motion-reduce:transition-none lg:w-full"
            >
              <KitPhoto
                src={cover.photoUrl}
                alt={cover.name}
                grade={cover.grade}
                scale={cover.scale}
                loading="eager"
                className="aspect-4/5"
                imgClassName="drift"
              />
            </button>
            <figcaption className="mx-auto mt-6 w-[78%] max-w-[360px] text-[17px] lg:w-full">
              <span className="block font-bold">{cover.name}</span>
              The newest kit on this shelf
            </figcaption>
          </figure>
        )}
      </header>

      <ShelfFigures counts={counts} photos={totalPhotos} likes={totalLikes} />

      <div className="mt-24 grid gap-x-4 gap-y-20 max-md:mt-16 lg:grid-cols-12">
        <section aria-labelledby="shelf-heading" className="min-w-0 lg:col-span-8">
          <div>
            <h2 id="shelf-heading" className="display text-head">
              Shelf
            </h2>
            <p className="num mt-3 text-[17px]">
              <span>
                {filteredKits.length === kits.length
                  ? plural(kits.length, 'kit')
                  : `${filteredKits.length} of ${kits.length}`}
              </span>
            </p>
          </div>

          {/* Status tabs on a full-width rule */}
          <div
            role="tablist"
            aria-label="Filter the shelf by status"
            className="mt-6 flex gap-1.5 overflow-x-auto"
          >
            {tabs.map((tab) => {
              const active = statusFilter === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    'inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-semibold transition-colors',
                    active ? 'bg-foreground text-background' : 'bg-surface hover:bg-hover'
                  )}
                >
                  {tab.label}
                  <span className="num opacity-70">{tab.count}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-4 mb-6 flex items-center justify-between gap-3">
            <div className="relative w-full max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-faint"
                aria-hidden="true"
              />
              <input
                type="search"
                aria-label="Search this shelf"
                placeholder="Search name, grade, scale…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-full bg-surface px-10 text-[15px] outline-none placeholder:text-faint hover:bg-hover focus-visible:bg-hover [&::-webkit-search-cancel-button]:hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute top-1/2 right-1.5 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-raised hover:text-foreground"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
            <div
              className="flex shrink-0 gap-1 rounded-full bg-surface p-1"
              role="group"
              aria-label="Layout"
            >
              {(
                [
                  { key: 'grid', label: 'Grid view', Icon: LayoutGrid },
                  { key: 'list', label: 'List view', Icon: List },
                ] as const
              ).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  aria-label={label}
                  aria-pressed={viewMode === key}
                  onClick={() => setViewMode(key)}
                  className={cn(
                    'inline-flex size-9 items-center justify-center rounded-full transition-colors',
                    viewMode === key
                      ? 'bg-foreground text-background'
                      : 'text-foreground hover:bg-hover'
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          {kits.length === 0 ? (
            <ShelfEmpty
              title="This shelf is empty"
              body={
                isOwner
                  ? 'Log the kits you have built, the one on your bench and the boxes still waiting. Each becomes a record in your repository.'
                  : `${displayHandle} hasn't logged a kit yet.`
              }
              action={
                isOwner && (
                  <Button render={<Link route="kits.create" />}>
                    <Plus aria-hidden="true" />
                    Log your first kit
                  </Button>
                )
              }
            />
          ) : filteredKits.length === 0 ? (
            <ShelfEmpty
              title={
                searchQuery
                  ? `No kit on this shelf matches “${searchQuery}”`
                  : `No kit is marked ${statusLabel(statusFilter).toLowerCase()}`
              }
              body="Try another status, or clear the search to see the whole shelf."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStatusFilter('all')
                    setSearchQuery('')
                  }}
                >
                  Show the whole shelf
                </Button>
              }
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-x-2 gap-y-8 sm:grid-cols-3 md:gap-x-4">
              {filteredKits.map((kit) => (
                <KitTile
                  key={kit.uri}
                  kit={kit}
                  editRkey={isOwner ? kit.rkey : null}
                  onSelect={() => setSelected(kit)}
                />
              ))}
            </div>
          ) : (
            <ShelfList kits={filteredKits} isOwner={isOwner} onSelect={(kit) => setSelected(kit)} />
          )}
        </section>

        <aside className="lg:col-span-4">
          <Achievements achievements={achievements} />
        </aside>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent
          className="max-h-[calc(100svh-2rem)] max-w-[calc(100%-2rem)] overflow-hidden p-0 sm:max-w-5xl"
          showCloseButton={false}
          onOpenAutoFocus={focusClose}
        >
          {selected && <KitDetailPanel kit={selected} onClose={() => setSelected(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

Profile.layout = [BaseLayout]

/**
 * The shelf's own figures, each on a block of its sticker colour: built in V-fin yellow, on the
 * bench in Federation blue, still boxed in grey runner, then photos and likes. Statuses with no
 * kit beyond the first three stay off.
 */
function ShelfFigures({
  counts,
  photos,
  likes,
}: {
  counts: Record<string, number>
  photos: number
  likes: number
}) {
  const blocks = [
    { key: 'done', label: 'built', value: counts['done'] ?? 0, tone: 'bg-vfin text-on-colour' },
    {
      key: 'in-progress',
      label: 'on the bench',
      value: counts['in-progress'] ?? 0,
      tone: 'bg-fed-blue text-on-colour',
    },
    {
      key: 'backlog',
      label: 'in the backlog',
      value: counts['backlog'] ?? 0,
      tone: 'bg-runner text-on-colour',
    },
    {
      key: 'on-hold',
      label: 'on hold',
      value: counts['on-hold'] ?? 0,
      tone: 'bg-runner text-on-colour',
    },
    {
      key: 'dropped',
      label: 'dropped',
      value: counts['dropped'] ?? 0,
      tone: 'bg-shield text-on-colour',
    },
    {
      key: 'photos',
      label: photos === 1 ? 'photo' : 'photos',
      value: photos,
      tone: 'bg-foreground text-background',
    },
    {
      key: 'likes',
      label: likes === 1 ? 'like received' : 'likes received',
      value: likes,
      tone: 'bg-shield text-on-colour',
    },
  ].filter(
    (b) => ['done', 'in-progress', 'backlog', 'photos', 'likes'].includes(b.key) || b.value > 0
  )

  return (
    <section aria-labelledby="figures-heading" className="mt-20 max-md:mt-14">
      <h2 id="figures-heading" className="sr-only">
        The shelf in figures
      </h2>
      <dl
        className="grid grid-cols-2 gap-2 md:grid-cols-(--cols)"
        style={{ ['--cols' as string]: `repeat(${blocks.length}, minmax(0, 1fr))` }}
      >
        {blocks.map((b, i) => (
          <div
            key={b.key}
            {...rise(i)}
            className={cn(
              'flex aspect-4/3 flex-col justify-between rounded-[28px] p-5 md:aspect-auto md:min-h-48 md:p-6',
              b.tone,
              blocks.length % 2 === 1 &&
                i === blocks.length - 1 &&
                'max-md:col-span-2 max-md:aspect-8/3'
            )}
          >
            <dd className="display num text-head">{b.value.toLocaleString('en')}</dd>
            <dt className="text-[17px] font-semibold">{b.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

function ShelfList({
  kits,
  isOwner,
  onSelect,
}: {
  kits: KitShelf[]
  isOwner: boolean
  onSelect: (kit: KitShelf) => void
}) {
  return (
    <ul className="flex flex-col gap-2">
      {kits.map((kit) => (
        <li
          key={kit.uri}
          className="group relative flex items-center gap-4 rounded-[28px] bg-surface p-2 pr-4 transition-colors hover:bg-hover"
        >
          <KitPhoto
            src={kit.photoUrl}
            alt=""
            grade={null}
            className="size-16 shrink-0 rounded-[20px]"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[17px] font-bold">
              <button
                type="button"
                onClick={() => onSelect(kit)}
                className="text-left after:absolute after:inset-0 group-has-[button:focus-visible]:after:outline-2 group-has-[button:focus-visible]:after:outline-ring focus-visible:outline-none"
              >
                {kit.name}
              </button>
            </h3>
            <p className="mt-0.5 truncate text-[15px]">
              {kitSpec(kit) || 'No grade or scale recorded'}
              {' · '}
              {plural(kit.photoCount, 'photo')}
            </p>
          </div>
          <StatusBadge status={kit.status} />
          <span className="num hidden w-20 text-right text-[15px] sm:block">
            {timeAgo(kit.indexedAt)}
          </span>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${kit.name}`}
              className="relative z-10"
              render={<Link route="kits.edit" routeParams={[kit.rkey]} />}
            >
              <Pencil className="size-3.5" aria-hidden="true" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}

function ShelfEmpty({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-start gap-5 rounded-[28px] bg-surface p-6 md:p-8">
      <div>
        <h3 className="text-lead font-bold">{title}</h3>
        <p className="mt-2 max-w-lg text-[17px]">{body}</p>
      </div>
      {action}
    </div>
  )
}

function Achievements({ achievements }: { achievements: Achievement[] }) {
  if (!achievements?.length) return null
  const unlocked = achievements.filter((a) => a.unlocked).length
  // unlocked first, then the closest to unlocking
  const ordered = [...achievements].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1
    const pa = a.progress ? a.progress.current / a.progress.total : 0
    const pb = b.progress ? b.progress.current / b.progress.total : 0
    return pb - pa
  })

  return (
    <section aria-labelledby="achievements-heading" className="lg:sticky lg:top-24">
      <h2 id="achievements-heading" className="display text-head">
        Badges
      </h2>
      <p className="num mt-3 text-[17px]">
        {unlocked} of {achievements.length} unlocked
      </p>
      <ul className="mt-4 flex flex-col">
        {ordered.map((a) => {
          const ratio = a.unlocked ? 1 : a.progress ? a.progress.current / a.progress.total : 0
          return (
            <li key={a.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[17px] font-bold">{a.name}</p>
                  <p className="mt-1 text-[17px] leading-snug">
                    {a.description.replace('Collect all 6 Stones: ', '')}
                  </p>
                </div>
                {a.unlocked ? (
                  <span className="sticker flex-none bg-vfin text-on-colour">
                    <Check className="size-4" aria-hidden="true" />
                    Unlocked
                  </span>
                ) : a.progress ? (
                  <span className="num flex-none text-[17px] font-bold">
                    {a.progress.current} of {a.progress.total}
                  </span>
                ) : (
                  <span className="sticker flex-none bg-surface">Locked</span>
                )}
              </div>
              {!a.unlocked && a.progress && a.progress.current > 0 && (
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-raised">
                  <div
                    className="h-full rounded-full bg-fed-blue"
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
