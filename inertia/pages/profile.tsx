import { useState, useMemo } from 'react'
import { cn } from 'cn'
import { Link } from '@adonisjs/inertia/react'
import { Head, usePage } from '@inertiajs/react'
import { Check, ExternalLink, LayoutGrid, List, Pencil, Plus, Search, X } from 'lucide-react'
import BaseLayout from '~/layouts/base'
import { KitTile } from '~/components/kit_tile'
import { KitPhoto } from '~/components/kit_photo'
import { GradeLadder } from '~/components/grade_ladder'
import { KitDetailPanel } from '~/components/kit_detail_panel'
import { focusClose } from '~/lib/focus'
import { StatusBadge } from '~/components/kit_preview'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Dialog, DialogContent } from '~/components/ui/dialog'
import { kitSpec, plural, statusLabel } from '~/lib/kits'
import { timeAgo } from '~/lib/time'
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
    <div className="column pt-8">
      <Head title={`${title}'s shelf`} />

      {/* The object header: who this is, and how far along their shelf is */}
      <header className="cut-lg bg-card">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar className="size-16 sm:size-[72px]">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
              <AvatarFallback className="text-lg">
                {(handle || displayName || 'G').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="truncate text-2xl leading-8 font-semibold tracking-[-0.01em]">
                {title}
              </h1>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {displayName ? `${displayHandle} · ` : ''}
                {plural(kits.length, 'kit')} on the shelf
              </p>
              {description && (
                <p className="mt-3 line-clamp-4 max-w-xl text-sm leading-6 whitespace-pre-line">
                  {description.replace(/\n{2,}/g, '\n').trim()}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {isOwner && (
              <Button render={<Link route="kits.create" />}>
                <Plus aria-hidden="true" />
                Log a kit
              </Button>
            )}
            <Button
              variant="outline"
              render={<a href={bskyUrl} target="_blank" rel="noopener noreferrer" />}
            >
              <ExternalLink aria-hidden="true" />
              Bluesky profile
            </Button>
          </div>
        </div>

        <BuildProgress counts={counts} photos={totalPhotos} likes={totalLikes} />
      </header>

      <GradeLadder kits={kits} className="mt-[14px]" />

      <div className="mt-12 grid gap-x-[14px] gap-y-10 lg:grid-cols-12">
        <section aria-labelledby="shelf-heading" className="lg:col-span-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="shelf-heading" className="text-base font-medium">
              Shelf
              <span className="ml-2 text-sm font-normal text-muted-foreground num">
                {filteredKits.length === kits.length
                  ? plural(kits.length, 'kit')
                  : `${filteredKits.length} of ${kits.length}`}
              </span>
            </h2>
          </div>

          {/* Status tabs on a full-width rule */}
          <div
            role="tablist"
            aria-label="Filter the shelf by status"
            className="mt-3 flex gap-5 overflow-x-auto border-b border-rule"
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
                    '-mb-px inline-flex h-10 shrink-0 items-center gap-1.5 border-b-2 text-sm transition-colors',
                    active
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                  <span className={cn('num', active ? 'text-muted-foreground' : 'text-faint')}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-4 mb-6 flex items-center justify-between gap-3">
            <div className="relative w-full max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint"
                aria-hidden="true"
              />
              <input
                type="search"
                aria-label="Search this shelf"
                placeholder="Search name, grade, scale…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="cut-sm h-9 w-full bg-surface pr-9 pl-9 text-sm outline-none placeholder:text-faint hover:bg-hover focus-visible:bg-hover [&::-webkit-search-cancel-button]:hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute top-1/2 right-1.5 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-[2px] text-muted-foreground hover:bg-raised hover:text-foreground"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
            <div
              className="flex shrink-0 rounded-[2px] bg-surface p-0.5"
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
                    'cut-xs inline-flex size-8 items-center justify-center transition-colors',
                    viewMode === key
                      ? 'bg-raised text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
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
            <div className="grid grid-cols-2 gap-x-[14px] gap-y-8 sm:grid-cols-3">
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

const GAUGE_PARTS = [
  { key: 'done', label: 'Built', className: 'bg-vfin' },
  { key: 'in-progress', label: 'Building', className: 'bg-fed-blue' },
  { key: 'backlog', label: 'Backlog', className: 'bg-chart-3' },
  { key: 'on-hold', label: 'On hold', className: 'bg-raised' },
  { key: 'dropped', label: 'Dropped', className: 'bg-negative' },
] as const

/** Up to this many kits the gauge draws one cell per kit; past it, one segment per status. */
const MAX_CELLS = 72

/**
 * The shelf as a gauge: one cell per kit, built first, coloured by status in the RX-78
 * tricolour. Each figure in the strip below doubles as the gauge's legend.
 */
function BuildProgress({
  counts,
  photos,
  likes,
}: {
  counts: Record<string, number>
  photos: number
  likes: number
}) {
  const parts = GAUGE_PARTS.map((p) => ({ ...p, value: counts[p.key] ?? 0 }))
  const total = parts.reduce((sum, p) => sum + p.value, 0)
  const perKit = total > 0 && total <= MAX_CELLS

  const cells = [
    ...parts.filter(
      (p) => p.key === 'done' || p.key === 'in-progress' || p.key === 'backlog' || p.value > 0
    ),
    { key: 'photos', label: 'Photos', value: photos, className: null },
    { key: 'likes', label: 'Likes received', value: likes, className: null },
  ]

  return (
    <div className="border-t border-rule px-5 pt-4 pb-5 sm:px-6">
      <div
        className="flex h-2.5 gap-[3px]"
        role="img"
        aria-label={
          total === 0
            ? 'No kits logged yet'
            : parts
                .filter((p) => p.value > 0)
                .map((p) => `${p.value} ${p.label.toLowerCase()}`)
                .join(', ')
        }
      >
        {total === 0 ? (
          <span className="h-full flex-1 bg-raised" />
        ) : perKit ? (
          parts.flatMap((p) =>
            Array.from({ length: p.value }, (_, i) => (
              <span key={`${p.key}-${i}`} className={cn('h-full min-w-0 flex-1', p.className)} />
            ))
          )
        ) : (
          parts
            .filter((p) => p.value > 0)
            .map((p) => (
              <span
                key={p.key}
                className={cn('h-full', p.className)}
                style={{ width: `${(p.value / total) * 100}%` }}
              />
            ))
        )}
      </div>
      <dl
        className={cn(
          'mt-4 grid grid-cols-6 gap-x-4 gap-y-4',
          cells.length === 5 ? 'sm:grid-cols-5' : 'sm:grid-cols-7'
        )}
      >
        {cells.map((c, i) => (
          <div
            key={c.key}
            className={cn('min-w-0 sm:col-span-1', i < 3 ? 'col-span-2' : 'col-span-3')}
          >
            <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {c.className && <span aria-hidden="true" className={cn('size-2', c.className)} />}
              {c.label}
            </dt>
            <dd className="mt-0.5 text-2xl leading-8 num">{c.value.toLocaleString('en')}</dd>
          </div>
        ))}
      </dl>
    </div>
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
    <ul className="divide-y divide-rule">
      {kits.map((kit) => (
        <li key={kit.uri} className="group relative flex items-center gap-4 py-3">
          <KitPhoto
            src={kit.photoUrl}
            alt=""
            grade={null}
            className="size-14 shrink-0 rounded-sm"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium">
              <button
                type="button"
                onClick={() => onSelect(kit)}
                className="text-left after:absolute after:inset-0 focus-visible:outline-none group-has-[button:focus-visible]:after:outline-2 group-has-[button:focus-visible]:after:outline-ring"
              >
                {kit.name}
              </button>
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {kitSpec(kit) || 'No grade or scale recorded'}
              {' · '}
              {plural(kit.photoCount, 'photo')}
            </p>
          </div>
          <StatusBadge status={kit.status} />
          <span className="hidden w-20 text-right text-xs text-muted-foreground sm:block num">
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
    <div className="flex flex-col items-start gap-4 cut-lg bg-card p-6">
      <div>
        <h3 className="text-base font-medium">{title}</h3>
        <p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground">{body}</p>
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
    <section
      aria-labelledby="achievements-heading"
      className="cut-lg bg-card p-5 lg:sticky lg:top-16"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="achievements-heading" className="text-base font-medium">
          Achievements
        </h2>
        <span className="text-sm text-muted-foreground num">
          {unlocked} of {achievements.length} unlocked
        </span>
      </div>
      <ul className="mt-3 divide-y divide-rule">
        {ordered.map((a) => {
          const ratio = a.unlocked ? 1 : a.progress ? a.progress.current / a.progress.total : 0
          return (
            <li key={a.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={cn('text-sm font-medium', !a.unlocked && 'text-muted-foreground')}>
                    {a.name}
                  </p>
                  <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
                    {a.description.replace('Collect all 6 Stones: ', '')}
                  </p>
                </div>
                {a.unlocked ? (
                  <span className="inline-flex h-5 flex-none items-center gap-1 rounded-[2px] bg-vfin-tint px-2 text-xs font-medium text-vfin-ink">
                    <Check className="size-3" aria-hidden="true" />
                    Unlocked
                  </span>
                ) : a.progress ? (
                  <span className="flex-none text-sm num">
                    {a.progress.current}
                    <span className="text-xs text-muted-foreground"> /{a.progress.total}</span>
                  </span>
                ) : (
                  <span className="flex-none text-sm text-faint">Locked</span>
                )}
              </div>
              {!a.unlocked && a.progress && a.progress.current > 0 && (
                <div className="mt-2 h-1 overflow-hidden rounded-[2px] bg-raised">
                  <div
                    className="h-full rounded-[2px] bg-chart-2"
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
