import { useState, useMemo, useEffect } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import MarketingLayout from '~/layouts/marketing'
import KitCard from '~/components/kit_card'
import { StatusBadge, STATUS_CONFIG } from '~/components/kit_preview'
import { Button } from '~/components/ui/button'
import { Progress } from '~/components/ui/progress'
import { Dialog, DialogPortal, DialogOverlay, DialogClose } from '~/components/ui/dialog'
import { Dialog as BaseUIDialog } from '@base-ui/react/dialog'
import { cn } from 'cn'
import {
  ExternalLink,
  Grid,
  List,
  Search,
  X,
  Camera,
  Pencil,
  Plus,
  Package,
  ChevronLeft,
  ChevronRight,
  Images,
} from 'lucide-react'
import type { InertiaProps } from '~/types'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'
import type BuildLogTransformer from '#kits/transformers/build_log_transformer'
import type { Achievement, ProfileStats } from '#profile/services/achievements_service'

type KitRow = InferData<KitTransformer>
type BuildLogRow = InferData<BuildLogTransformer>

type PageProps = InertiaProps<{
  handle: string
  did?: string
  kits: KitRow[]
  buildLogs: BuildLogRow[]
  stats: ProfileStats
  achievements: Achievement[]
}>

interface LightboxPhoto {
  cid: string
  thumbUrl: string
  fullUrl: string
}

interface LightboxState {
  photos: LightboxPhoto[]
  currentIndex: number
  name: string
  grade?: string | null
  scale?: string | null
  manufacturer?: string | null
  status: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Profile({ handle, did, kits, buildLogs, stats, achievements }: PageProps) {
  const page = usePage<PageProps>()
  const viewerDid = page.props.user?.did
  const isOwner = Boolean(viewerDid && did && viewerDid === did)

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activePhoto, setActivePhoto] = useState<LightboxState | null>(null)

  const unlockedCount = achievements ? achievements.filter((a) => a.unlocked).length : 0

  useEffect(() => {
    if (!activePhoto) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActivePhoto((prev) => {
          if (!prev || prev.photos.length <= 1) return prev
          return {
            ...prev,
            currentIndex: (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length,
          }
        })
      } else if (e.key === 'ArrowRight') {
        setActivePhoto((prev) => {
          if (!prev || prev.photos.length <= 1) return prev
          return { ...prev, currentIndex: (prev.currentIndex + 1) % prev.photos.length }
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activePhoto])

  const openKitGallery = (kit: KitRow) => {
    const photos: LightboxPhoto[] =
      kit.photos && kit.photos.length > 0
        ? kit.photos
        : kit.photoUrl
          ? [
              {
                cid: kit.photoCid ?? '',
                thumbUrl: kit.photoUrl,
                fullUrl: kit.fullPhotoUrl || kit.photoUrl,
              },
            ]
          : []
    if (photos.length === 0) return
    setActivePhoto({
      photos,
      currentIndex: 0,
      name: kit.name,
      grade: kit.grade,
      scale: kit.scale,
      manufacturer: kit.manufacturer,
      status: kit.status,
    })
  }

  const filterTabs = useMemo(() => {
    const counts: Record<string, number> = {
      'all': kits.length,
      'done': stats?.completed ?? 0,
      'in-progress': stats?.inProgress ?? 0,
      'backlog': stats?.backlog ?? 0,
    }
    for (const kit of kits) {
      if (!['done', 'in-progress', 'backlog'].includes(kit.status)) {
        counts[kit.status] = (counts[kit.status] ?? 0) + 1
      }
    }
    const tabs = [
      { key: 'all', label: 'All', count: counts['all'] ?? kits.length },
      { key: 'done', label: 'Done', count: counts['done'] ?? 0 },
      { key: 'in-progress', label: 'In progress', count: counts['in-progress'] ?? 0 },
      { key: 'backlog', label: 'Backlog', count: counts['backlog'] ?? 0 },
    ]
    for (const [key, count] of Object.entries(counts)) {
      if (['all', 'done', 'in-progress', 'backlog'].includes(key)) continue
      if (count > 0) tabs.push({ key, label: STATUS_CONFIG[key]?.label ?? key, count })
    }
    return tabs
  }, [kits, stats])

  const filteredKits = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return kits.filter((kit) => {
      const matchesStatus = statusFilter === 'all' || kit.status === statusFilter
      if (!matchesStatus) return false
      if (!query) return true
      return (
        kit.name.toLowerCase().includes(query) ||
        (kit.grade?.toLowerCase().includes(query) ?? false) ||
        (kit.scale?.toLowerCase().includes(query) ?? false)
      )
    })
  }, [kits, statusFilter, searchQuery])

  const avatarInitial = (handle.charAt(0) || 'G').toUpperCase()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Profile Hero */}
      <header className="mb-10 border-b border-border pb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center bg-muted font-mono text-lg font-semibold">
              {avatarInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">@{handle}</span>
                <a
                  href={`https://bsky.app/profile/${encodeURIComponent(handle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground"
                  title="View Bluesky profile"
                >
                  <span>bsky</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {kits.length} kit{kits.length !== 1 ? 's' : ''} in collection &middot;{' '}
                {stats?.completed ?? 0} completed
              </p>
            </div>
          </div>
          {isOwner && (
            <Button size="sm" render={<Link route="kits.new" />}>
              <Plus />
              Add kit
            </Button>
          )}
        </div>

        {stats && (
          <div className="mt-6 flex flex-wrap gap-8">
            {[
              { label: 'Done', value: stats.completed },
              { label: 'Active', value: stats.inProgress },
              { label: 'Backlog', value: stats.backlog },
              { label: 'Logs', value: stats.buildLogs },
              ...(achievements && achievements.length > 0
                ? [{ label: 'Badges', value: `${unlockedCount}/${achievements.length}` }]
                : []),
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="font-mono text-lg font-semibold leading-none">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Shelf Section */}
      <section className="mb-12">
        {/* Toolbar */}
        <div className="mb-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">Shelf</h2>
              <span className="font-mono text-xs text-muted-foreground">
                {filteredKits.length}
                {filteredKits.length !== kits.length ? ` of ${kits.length}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search shelf…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-7 w-36 border border-input bg-transparent pl-7 pr-7 text-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
              <div className="flex border border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  className={viewMode === 'grid' ? 'bg-muted' : ''}
                >
                  <Grid />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                  className={viewMode === 'list' ? 'bg-muted' : ''}
                >
                  <List />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs transition-colors',
                  statusFilter === tab.key
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span>{tab.label}</span>
                <span className="font-mono">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Shelf Content */}
        {kits.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Package className="size-10 text-muted-foreground/40" strokeWidth={1.5} />
            <p className="font-medium">Shelf is empty</p>
            <p className="text-sm text-muted-foreground">
              No Gunpla builds have been cataloged yet for @{handle}.
            </p>
            {isOwner && (
              <Button size="sm" render={<Link route="kits.new" />}>
                <Plus />
                Add your first kit
              </Button>
            )}
          </div>
        ) : filteredKits.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="font-medium">No builds match this filter</p>
            <p className="text-sm text-muted-foreground">
              Try selecting another status tab or clear the search.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter('all')
                setSearchQuery('')
              }}
            >
              Reset filters
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {filteredKits.map((kit) => (
              <KitCard
                key={kit.uri}
                name={kit.name}
                grade={kit.grade}
                scale={kit.scale}
                manufacturer={kit.manufacturer}
                status={kit.status}
                photoUrl={kit.photoUrl}
                fullPhotoUrl={kit.fullPhotoUrl}
                photoCount={kit.photoCount}
                rkey={isOwner ? (kit.rkey ?? undefined) : undefined}
                onPhotoClick={
                  kit.photoUrl || (kit.photos && kit.photos.length > 0)
                    ? () => openKitGallery(kit)
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredKits.map((kit) => {
              const hasPhoto = !!(kit.photoUrl || (kit.photos && kit.photos.length > 0))
              return (
                <div key={kit.uri} className="flex items-center gap-3 py-3">
                  <div
                    className={cn(
                      'relative size-14 shrink-0 overflow-hidden bg-muted',
                      hasPhoto && 'cursor-pointer'
                    )}
                    onClick={hasPhoto ? () => openKitGallery(kit) : undefined}
                    role={hasPhoto ? 'button' : undefined}
                    tabIndex={hasPhoto ? 0 : undefined}
                    title={hasPhoto ? 'View photo gallery' : undefined}
                    onKeyDown={
                      hasPhoto
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              openKitGallery(kit)
                            }
                          }
                        : undefined
                    }
                  >
                    {kit.photoUrl ? (
                      <>
                        <img
                          src={kit.photoUrl}
                          alt=""
                          aria-hidden
                          className="absolute inset-0 size-full scale-110 object-cover opacity-50 blur-xl"
                        />
                        <img
                          src={kit.photoUrl}
                          alt={kit.name}
                          className="relative size-full object-contain"
                          loading="lazy"
                        />
                        {kit.photoCount && kit.photoCount > 1 && (
                          <span className="absolute right-1 bottom-1 flex items-center gap-0.5 bg-black/50 px-1 py-0.5 font-mono text-[9px] text-white">
                            <Images className="size-2.5" />
                            {kit.photoCount}
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground/60">
                        <Camera className="size-5" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium">{kit.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {[kit.grade, kit.scale].filter(Boolean).join(' · ') || 'Gunpla'}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={kit.status} />
                    {kit.indexedAt && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {timeAgo(kit.indexedAt)}
                      </span>
                    )}
                    {isOwner && kit.rkey && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Edit kit"
                        render={<Link route="kits.edit" routeParams={[kit.rkey]} />}
                      >
                        <Pencil />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Achievements Section */}
      {achievements && achievements.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-base font-semibold">Achievements</h2>
            <span className="font-mono text-xs text-muted-foreground">
              {unlockedCount} / {achievements.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {achievements.map((ach) => {
              const percent = ach.unlocked
                ? 100
                : ach.progress
                  ? Math.round((ach.progress.current / ach.progress.total) * 100)
                  : 0
              return (
                <div
                  key={ach.id}
                  className={cn(
                    'flex flex-col gap-2.5 border border-border p-3',
                    !ach.unlocked && 'opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl leading-none">{ach.icon}</span>
                    <span
                      className={cn(
                        'px-1.5 py-0.5 font-mono text-[10px]',
                        ach.unlocked
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {ach.unlocked
                        ? '✓ Done'
                        : ach.progress
                          ? `${ach.progress.current}/${ach.progress.total}`
                          : 'Locked'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium">{ach.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{ach.description}</p>
                  </div>
                  <Progress value={percent} />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Build Logs Section */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-base font-semibold">Build logs</h2>
          <span className="font-mono text-xs text-muted-foreground">{buildLogs.length}</span>
        </div>
        {buildLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground opacity-50">No build logs yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {buildLogs.map((log) => (
              <li key={log.uri} className="flex items-baseline gap-3 py-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                <span className="text-xs font-medium">{log.stage ?? 'Build update'}</span>
                {log.text && (
                  <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                    {log.text}
                  </span>
                )}
                <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
                  {timeAgo(log.indexedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Lightbox */}
      <Dialog
        open={!!activePhoto}
        onOpenChange={(open) => {
          if (!open) setActivePhoto(null)
        }}
      >
        <DialogPortal>
          <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
          <BaseUIDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-[min(48rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 border border-border bg-background outline-none">
            {activePhoto &&
              (() => {
                const current = activePhoto.photos[activePhoto.currentIndex]
                return (
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <StatusBadge status={activePhoto.status} />
                        <h3 className="truncate text-sm font-medium">{activePhoto.name}</h3>
                        {[activePhoto.manufacturer, activePhoto.grade, activePhoto.scale].filter(
                          Boolean
                        ).length > 0 && (
                          <span className="truncate text-xs text-muted-foreground">
                            {[activePhoto.manufacturer, activePhoto.grade, activePhoto.scale]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        )}
                      </div>
                      <DialogClose
                        render={
                          <Button variant="ghost" size="icon-sm" aria-label="Close photo preview" />
                        }
                      >
                        <X />
                      </DialogClose>
                    </div>

                    {/* Image area */}
                    <div className="relative h-[50vh] overflow-hidden bg-black">
                      {current && (
                        <>
                          <img
                            src={current.fullUrl || current.thumbUrl}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 size-full scale-110 object-cover opacity-20 blur-2xl"
                          />
                          <img
                            src={current.fullUrl || current.thumbUrl}
                            alt={activePhoto.name}
                            className="absolute inset-0 size-full object-contain"
                          />
                        </>
                      )}
                      {activePhoto.photos.length > 1 && (
                        <>
                          <button
                            type="button"
                            className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center bg-black/50 text-white transition-colors hover:bg-black/70"
                            onClick={() =>
                              setActivePhoto(
                                (prev) =>
                                  prev && {
                                    ...prev,
                                    currentIndex:
                                      (prev.currentIndex - 1 + prev.photos.length) %
                                      prev.photos.length,
                                  }
                              )
                            }
                            aria-label="Previous photo"
                          >
                            <ChevronLeft className="size-5" />
                          </button>
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center bg-black/50 text-white transition-colors hover:bg-black/70"
                            onClick={() =>
                              setActivePhoto(
                                (prev) =>
                                  prev && {
                                    ...prev,
                                    currentIndex: (prev.currentIndex + 1) % prev.photos.length,
                                  }
                              )
                            }
                            aria-label="Next photo"
                          >
                            <ChevronRight className="size-5" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail strip */}
                    {activePhoto.photos.length > 1 && (
                      <div className="flex gap-1.5 overflow-x-auto border-t border-border p-2">
                        {activePhoto.photos.map((p, idx) => (
                          <button
                            key={p.cid || idx}
                            type="button"
                            className={cn(
                              'size-12 shrink-0 overflow-hidden border-2 transition-opacity',
                              idx === activePhoto.currentIndex
                                ? 'border-ring opacity-100'
                                : 'border-transparent opacity-50 hover:opacity-80'
                            )}
                            onClick={() =>
                              setActivePhoto((prev) =>
                                prev ? { ...prev, currentIndex: idx } : null
                              )
                            }
                            aria-label={`View photo ${idx + 1}`}
                          >
                            <img
                              src={p.thumbUrl || p.fullUrl}
                              alt=""
                              className="size-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}
          </BaseUIDialog.Popup>
        </DialogPortal>
      </Dialog>
    </div>
  )
}

Profile.layout = [MarketingLayout]
