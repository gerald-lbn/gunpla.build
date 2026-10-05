import { useState, useMemo, useEffect } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import MarketingLayout from '~/layouts/marketing'
import KitCard from '~/components/kit_card'
import { StatusBadge, STATUS_CONFIG } from '~/components/kit_preview'
import { Button } from '~/components/ui/button'
import { Progress } from '~/components/ui/progress'
import { Dialog, DialogClose, DialogContent } from '~/components/ui/dialog'
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
  Activity,
  Hammer,
  CheckCircle2,
  Check,
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

function buildLogIcon(stage?: string | null) {
  const s = (stage ?? '').toLowerCase()
  if (s.includes('done') || s.includes('complet') || s.includes('finish')) return CheckCircle2
  if (s.includes('start') || s.includes('begin') || s.includes('progress')) return Hammer
  return Activity
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
  const bskyUrl = `https://bsky.app/profile/${encodeURIComponent(handle)}`

  const heroStats = stats
    ? [
        { label: 'Done', value: stats.completed },
        { label: 'Active', value: stats.inProgress },
        { label: 'Backlog', value: stats.backlog },
        { label: 'Logs', value: stats.buildLogs },
      ]
    : []

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero Card */}
      <div className="mb-8 border-2 border-black bg-card p-8 shadow-md">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          {/* Avatar */}
          {/* TODO: fetch Bluesky profile picture and display here instead of the initial */}
          <div className="relative shrink-0">
            <div className="flex size-32 items-center justify-center border-2 border-black bg-primary font-head text-5xl font-bold text-primary-foreground">
              {avatarInitial}
            </div>
          </div>

          {/* Name & actions */}
          <div className="flex-1 text-center md:text-start">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <h1 className="font-head text-3xl font-bold lg:text-4xl">@{handle}</h1>
            </div>
            <p className="mb-4 mt-1 font-head font-medium text-muted-foreground">
              {kits.length} kit{kits.length !== 1 ? 's' : ''} in collection
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              {isOwner && (
                <Button size="sm" render={<Link route="kits.new" />}>
                  <Plus />
                  Add kit
                </Button>
              )}
              <Button size="sm" variant="outline" asChild>
                <a href={bskyUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  View on Bluesky
                </a>
              </Button>
            </div>
          </div>

          {/* Stats */}
          {heroStats.length > 0 && (
            <dl className="flex shrink-0 flex-wrap justify-center gap-x-6 gap-y-3 sm:gap-x-8">
              {heroStats.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col border-l-2 border-black pl-4 text-center first:border-l-0 first:pl-0 sm:pl-8"
                >
                  <dt className="order-2 font-head font-medium text-muted-foreground">{label}</dt>
                  <dd className="order-1 font-head text-3xl font-black leading-none">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {/* Main grid: 1/3 sidebar + 2/3 content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* About */}
          <div className="border-2 border-black bg-card shadow-md">
            <h2 className="border-b-2 border-black bg-primary p-4 font-head text-lg font-medium text-primary-foreground">
              About
            </h2>
            {/* TODO: fetch Bluesky user description and display it here */}
            <ul className="space-y-3 p-6">
              <li className="flex items-center gap-2">
                <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <a
                  href={bskyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm hover:underline"
                >
                  @{handle}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Package className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="text-sm">
                  {kits.length} kit{kits.length !== 1 ? 's' : ''} in collection
                </span>
              </li>
            </ul>
          </div>

          {/* Achievements */}
          {achievements && achievements.length > 0 && (
            <div className="border-2 border-black bg-card shadow-md">
              <h2 className="border-b-2 border-black bg-primary p-4 font-head text-lg font-medium text-primary-foreground">
                Achievements
                <span className="ml-2 font-mono text-sm font-normal">
                  {unlockedCount}/{achievements.length}
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-3 p-4">
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
                        'flex flex-col gap-2 border-2 border-black bg-card p-3 shadow-sm',
                        !ach.unlocked && 'opacity-60'
                      )}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xl leading-none">{ach.icon}</span>
                        {ach.unlocked ? (
                          <span className="flex size-5 shrink-0 items-center justify-center border-2 border-black bg-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Check className="size-3 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="border-2 border-black bg-muted px-1 py-0.5 font-mono text-[9px] font-bold text-muted-foreground">
                            {ach.progress ? `${ach.progress.current}/${ach.progress.total}` : '?'}
                          </span>
                        )}
                      </div>
                      <p className="font-head text-[11px] font-bold leading-tight">{ach.name}</p>
                      <Progress value={percent} className="h-1" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main content (2/3) */}
        <div className="space-y-6 md:col-span-2">
          {/* Shelf */}
          <div className="border-2 border-black bg-card shadow-md">
            {/* Shelf header bar */}
            <div className="border-b-2 border-black bg-primary p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-head text-lg font-medium text-primary-foreground">Shelf</h2>
                  <span className="font-mono text-sm text-primary-foreground/70">
                    {filteredKits.length}
                    {filteredKits.length !== kits.length ? ` of ${kits.length}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-foreground/50" />
                    <input
                      type="text"
                      placeholder="Search…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 w-32 border-2 border-black bg-background pl-7 pr-6 font-mono text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex border-2 border-black">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setViewMode('grid')}
                      aria-label="Grid view"
                      aria-pressed={viewMode === 'grid'}
                      className={cn(
                        'rounded-none border-0',
                        viewMode === 'grid'
                          ? 'bg-foreground text-background'
                          : 'bg-background hover:bg-muted'
                      )}
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
                      className={cn(
                        'rounded-none border-0',
                        viewMode === 'list'
                          ? 'bg-foreground text-background'
                          : 'bg-background hover:bg-muted'
                      )}
                    >
                      <List />
                    </Button>
                  </div>
                </div>
              </div>
              {/* Filter tabs */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusFilter(tab.key)}
                    className={cn(
                      'inline-flex items-center gap-1.5 border-2 border-black px-2.5 py-1 font-head text-xs font-bold transition-all',
                      statusFilter === tab.key
                        ? 'bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-background hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    )}
                  >
                    <span>{tab.label}</span>
                    <span className="font-mono">{tab.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shelf content */}
            <div className="p-4">
              {kits.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <Package className="size-10 text-muted-foreground/40" strokeWidth={1.5} />
                  <p className="font-head font-bold">Shelf is empty</p>
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
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <p className="font-head font-bold">No builds match this filter</p>
                  <p className="text-sm text-muted-foreground">
                    Try another status tab or clear the search.
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
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
                <div className="border-2 border-black">
                  {filteredKits.map((kit, i) => {
                    const hasPhoto = !!(kit.photoUrl || (kit.photos && kit.photos.length > 0))
                    return (
                      <div
                        key={kit.uri}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5',
                          i > 0 && 'border-t-2 border-black'
                        )}
                      >
                        <div
                          className={cn(
                            'relative size-14 shrink-0 overflow-hidden border-2 border-black bg-muted',
                            hasPhoto && 'cursor-pointer'
                          )}
                          onClick={hasPhoto ? () => openKitGallery(kit) : undefined}
                          role={hasPhoto ? 'button' : undefined}
                          tabIndex={hasPhoto ? 0 : undefined}
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
                                <span className="absolute right-0.5 bottom-0.5 flex items-center gap-0.5 bg-black/70 px-1 py-0.5 font-mono text-[9px] text-white">
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
                          <h3 className="truncate font-head text-sm font-bold">{kit.name}</h3>
                          <p className="font-mono text-xs text-muted-foreground">
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
            </div>
          </div>

          {/* Build Logs */}
          <div className="border-2 border-black bg-card shadow-md">
            <h2 className="border-b-2 border-black bg-primary p-4 font-head text-lg font-medium text-primary-foreground">
              Build logs
              <span className="ml-2 font-mono text-sm font-normal text-primary-foreground/70">
                {buildLogs.length}
              </span>
            </h2>
            {buildLogs.length === 0 ? (
              <p className="p-6 font-mono text-sm text-muted-foreground opacity-50">
                No build logs yet.
              </p>
            ) : (
              <ul className="space-y-0 p-6">
                {buildLogs.map((log, i) => {
                  const Icon = buildLogIcon(log.stage)
                  return (
                    <li
                      key={log.uri}
                      className={cn(
                        'flex items-start gap-4 pb-6',
                        i < buildLogs.length - 1 && 'border-b-2 border-black mb-6'
                      )}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center border-2 border-black bg-accent text-accent-foreground">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-head font-medium">{log.stage ?? 'Build update'}</p>
                        {log.text && (
                          <p className="mt-0.5 truncate font-mono text-sm text-muted-foreground">
                            {log.text}
                          </p>
                        )}
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {timeAgo(log.indexedAt)}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <Dialog
        open={!!activePhoto}
        onOpenChange={(open) => {
          if (!open) setActivePhoto(null)
        }}
      >
        <DialogContent
          className="max-h-[calc(100svh-2rem)] max-w-[calc(100%-2rem)] sm:max-w-3xl overflow-hidden border-2 border-black p-0 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          showCloseButton={false}
        >
          {activePhoto &&
            (() => {
              const current = activePhoto.photos[activePhoto.currentIndex]
              return (
                <div>
                  <div className="flex items-center justify-between gap-3 border-b-2 border-black px-4 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <StatusBadge status={activePhoto.status} />
                      <h3 className="truncate font-head text-sm font-bold">{activePhoto.name}</h3>
                      {[activePhoto.manufacturer, activePhoto.grade, activePhoto.scale].filter(
                        Boolean
                      ).length > 0 && (
                        <span className="truncate font-mono text-xs text-muted-foreground">
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

                  <div
                    className="relative overflow-hidden bg-black"
                    style={{ height: 'min(50vh, calc(100svh - 14rem))' }}
                  >
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
                          className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center border-2 border-black bg-background/90 transition-colors hover:bg-background"
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
                          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center border-2 border-black bg-background/90 transition-colors hover:bg-background"
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

                  {activePhoto.photos.length > 1 && (
                    <div className="flex gap-1.5 overflow-x-auto border-t-2 border-black p-2">
                      {activePhoto.photos.map((p, idx) => (
                        <button
                          key={p.cid || idx}
                          type="button"
                          className={cn(
                            'size-12 shrink-0 overflow-hidden border-2 transition-all',
                            idx === activePhoto.currentIndex
                              ? 'border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                              : 'border-transparent opacity-50 hover:opacity-80'
                          )}
                          onClick={() =>
                            setActivePhoto((prev) => (prev ? { ...prev, currentIndex: idx } : null))
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
        </DialogContent>
      </Dialog>
    </div>
  )
}

Profile.layout = [MarketingLayout]
