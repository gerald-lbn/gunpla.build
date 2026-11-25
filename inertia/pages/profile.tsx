import { useState, useMemo } from 'react'
import { cn } from 'cn'
import { Link } from '@adonisjs/inertia/react'
import { Head, usePage } from '@inertiajs/react'
import { Check, ExternalLink, LayoutGrid, List, Pencil, Plus, Search, X } from 'lucide-react'
import BaseLayout from '~/layouts/base'
import { KitTile } from '~/components/kit_tile'
import { KitPhoto } from '~/components/kit_photo'
import { KitDetailDialog } from '~/components/kit_detail_panel'
import { StatusBadge } from '~/components/kit_preview'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
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

  const totalPhotos = kits.reduce((sum, k) => sum + k.photoCount, 0)
  const totalLikes = kits.reduce((sum, k) => sum + (k.likeCount ?? 0), 0)

  return (
    <div className="column pt-8 md:pt-10">
      <Head title={`${title}'s shelf`} />

      {/* Who this is, kept to one compact bar so the shelf starts on the first screen */}
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar className="size-12 md:size-14">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
            <AvatarFallback className="font-bold">
              {(handle || displayName || 'G').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="display text-[clamp(1.75rem,1.3rem+1.8vw,3rem)] wrap-break-word">
              {title}&apos;s shelf
            </h1>
            <p className="mt-1 truncate text-[15px]">
              <span className="font-bold">{displayHandle}</span>
              {' · '}
              <span className="num">{plural(kits.length, 'kit')}</span> logged on gunpla.build
            </p>
            {description && (
              <p className="mt-2 line-clamp-2 max-w-[64ch] text-[15px] leading-snug whitespace-pre-line">
                {description.replace(/\n{2,}/g, '\n').trim()}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isOwner && (
            <Button render={<Link route="kits.create" />}>
              <Plus aria-hidden="true" />
              Log a kit
            </Button>
          )}
          <Button
            variant="secondary"
            render={<a href={bskyUrl} target="_blank" rel="noopener noreferrer" />}
          >
            <ExternalLink aria-hidden="true" />
            Bluesky profile
          </Button>
        </div>
      </header>

      <div className="mt-10 grid gap-x-8 gap-y-16 max-md:mt-8 lg:grid-cols-12">
        <section aria-labelledby="shelf-heading" className="min-w-0 lg:col-span-9">
          <h2 id="shelf-heading" className="sr-only">
            Kits
          </h2>

          {/* Status tabs, then search, count and layout on one row */}
          <div
            role="tablist"
            aria-label="Filter the shelf by status"
            className="flex gap-1.5 overflow-x-auto"
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

          <div className="mt-3 mb-6 flex items-center gap-3">
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
            <p className="num ml-auto hidden shrink-0 text-[15px] sm:block" aria-live="polite">
              {filteredKits.length === kits.length
                ? plural(kits.length, 'kit')
                : `${filteredKits.length} of ${kits.length}`}
            </p>
            <div
              className="flex shrink-0 gap-1 rounded-full bg-surface p-1 max-sm:ml-auto"
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
            <div className="grid grid-cols-1 gap-x-2 gap-y-10 sm:grid-cols-3 sm:gap-y-8 md:gap-x-4 xl:grid-cols-4">
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

        {/* The figures and badges sit beside the shelf, below it on a phone */}
        <aside className="flex flex-col gap-12 lg:col-span-3">
          <ShelfFigures counts={counts} photos={totalPhotos} likes={totalLikes} />
          <Achievements achievements={achievements} />
        </aside>
      </div>

      <KitDetailDialog kit={selected} onClose={() => setSelected(null)} />
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
    <section aria-labelledby="figures-heading">
      <h2 id="figures-heading" className="display text-lead">
        Figures
      </h2>
      <dl
        className="mt-4 grid grid-cols-2 gap-2 max-lg:sm:grid-cols-(--cols)"
        style={{ ['--cols' as string]: `repeat(${blocks.length}, minmax(0, 1fr))` }}
      >
        {blocks.map((b, i) => (
          <div
            key={b.key}
            {...rise(i)}
            className={cn(
              'flex min-h-24 flex-col justify-between gap-2 rounded-[20px] p-4',
              b.tone,
              blocks.length % 2 === 1 &&
                i === blocks.length - 1 &&
                'col-span-2 max-lg:sm:col-span-1'
            )}
          >
            <dd className="display num text-[2rem] leading-none">{b.value.toLocaleString('en')}</dd>
            <dt className="text-[15px] font-semibold">{b.label}</dt>
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
            <h3 className="truncate text-body font-bold">
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
        <p className="mt-2 max-w-lg text-body">{body}</p>
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
    <section aria-labelledby="achievements-heading">
      <h2 id="achievements-heading" className="display text-lead">
        Badges
      </h2>
      <p className="num mt-1 text-[15px]">
        {unlocked} of {achievements.length} unlocked
      </p>
      <ul className="mt-3 flex flex-col">
        {ordered.map((a) => {
          const ratio = a.unlocked ? 1 : a.progress ? a.progress.current / a.progress.total : 0
          return (
            <li key={a.id} className="py-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-bold">{a.name}</p>
                  <p className="mt-0.5 text-[15px] leading-snug">
                    {a.description.replace('Collect all 6 Stones: ', '')}
                  </p>
                </div>
                {a.unlocked ? (
                  <span className="sticker flex-none bg-vfin text-on-colour">
                    <Check className="size-4" aria-hidden="true" />
                    Unlocked
                  </span>
                ) : a.progress ? (
                  <span className="num flex-none text-[15px] font-bold">
                    {a.progress.current} of {a.progress.total}
                  </span>
                ) : (
                  <span className="sticker flex-none bg-surface">Locked</span>
                )}
              </div>
              {!a.unlocked && a.progress && a.progress.current > 0 && (
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-raised">
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
