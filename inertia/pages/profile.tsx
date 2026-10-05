import { useState, useMemo, useEffect } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import MarketingLayout from '~/layouts/marketing'
import KitCard, { STATUS_LABELS } from '~/components/kit_card'
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
      if (e.key === 'Escape') {
        setActivePhoto(null)
      } else if (e.key === 'ArrowLeft') {
        setActivePhoto((prev) => {
          if (!prev || prev.photos.length <= 1) return prev
          const nextIndex = (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length
          return { ...prev, currentIndex: nextIndex }
        })
      } else if (e.key === 'ArrowRight') {
        setActivePhoto((prev) => {
          if (!prev || prev.photos.length <= 1) return prev
          const nextIndex = (prev.currentIndex + 1) % prev.photos.length
          return { ...prev, currentIndex: nextIndex }
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
      if (count > 0) {
        tabs.push({ key, label: STATUS_LABELS[key] ?? key, count })
      }
    }

    return tabs
  }, [kits, stats])

  const filteredKits = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return kits.filter((kit) => {
      const matchesStatus = statusFilter === 'all' || kit.status === statusFilter
      if (!matchesStatus) return false
      if (!query) return true
      const nameMatch = kit.name.toLowerCase().includes(query)
      const gradeMatch = kit.grade ? kit.grade.toLowerCase().includes(query) : false
      const scaleMatch = kit.scale ? kit.scale.toLowerCase().includes(query) : false
      return nameMatch || gradeMatch || scaleMatch
    })
  }, [kits, statusFilter, searchQuery])

  const avatarInitial = (handle.charAt(0) || 'G').toUpperCase()

  return (
    <div className="profile-page">
      {/* Profile Hero */}
      <header className="profile-hero">
        <div className="profile-hero__top">
          <div className="profile-hero__identity">
            <div className="profile-hero__avatar mono">{avatarInitial}</div>
            <div className="profile-hero__meta">
              <div className="profile-hero__handle-group">
                <span className="profile-hero__handle mono">@{handle}</span>
                <a
                  href={`https://bsky.app/profile/${encodeURIComponent(handle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-hero__bsky-link mono"
                  title="View Bluesky profile"
                >
                  <span>bsky</span>
                  <ExternalLink size={11} />
                </a>
              </div>
              <p className="profile-hero__summary">
                {kits.length} kit{kits.length !== 1 ? 's' : ''} in collection &middot;{' '}
                {stats?.completed ?? 0} completed
              </p>
            </div>
          </div>

          <div className="profile-hero__actions">
            {isOwner && (
              <Link route="kits.new" className="btn btn--primary btn--sm">
                <Plus size={14} /> Add kit
              </Link>
            )}
          </div>
        </div>

        {stats && (
          <div className="profile-hero__stats">
            <div className="stat-pill">
              <span className="stat-pill__num">{stats.completed}</span>
              <span className="stat-pill__label">Done</span>
            </div>
            <div className="stat-pill">
              <span className="stat-pill__num">{stats.inProgress}</span>
              <span className="stat-pill__label">Active</span>
            </div>
            <div className="stat-pill">
              <span className="stat-pill__num">{stats.backlog}</span>
              <span className="stat-pill__label">Backlog</span>
            </div>
            <div className="stat-pill">
              <span className="stat-pill__num">{stats.buildLogs}</span>
              <span className="stat-pill__label">Logs</span>
            </div>
            {achievements && achievements.length > 0 && (
              <div className="stat-pill">
                <span className="stat-pill__num">
                  {unlockedCount}/{achievements.length}
                </span>
                <span className="stat-pill__label">Badges</span>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Profile Shelf Section */}
      <section className="profile-shelf">
        <div className="profile-shelf__toolbar">
          <div className="profile-shelf__title-group">
            <h2 className="profile-shelf__title">Shelf</h2>
            <span className="profile-shelf__count mono">
              {filteredKits.length}
              {filteredKits.length !== kits.length ? ` of ${kits.length}` : ''}
            </span>
          </div>

          <div className="profile-shelf__filters">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`profile-shelf__filter-btn ${
                  statusFilter === tab.key ? 'profile-shelf__filter-btn--active' : ''
                }`}
              >
                <span>{tab.label}</span>
                <span className="profile-shelf__filter-num mono">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="profile-shelf__controls">
            <div className="profile-shelf__search-wrap">
              <Search size={14} className="profile-shelf__search-icon" />
              <input
                type="text"
                placeholder="Search shelf..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="profile-shelf__search"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="profile-shelf__clear-btn"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="profile-shelf__view-toggle">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`profile-shelf__view-btn ${
                  viewMode === 'grid' ? 'profile-shelf__view-btn--active' : ''
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <Grid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`profile-shelf__view-btn ${
                  viewMode === 'list' ? 'profile-shelf__view-btn--active' : ''
                }`}
                title="List view"
                aria-label="List view"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Shelf Content */}
        {kits.length === 0 ? (
          <div className="profile-shelf__empty">
            <Package size={36} strokeWidth={1.5} color="var(--subtle)" />
            <div className="profile-shelf__empty-title">Shelf is empty</div>
            <p className="profile-shelf__empty-desc">
              No Gunpla builds have been cataloged yet for @{handle}.
            </p>
            {isOwner && (
              <Link route="kits.new" className="btn btn--primary btn--sm" style={{ marginTop: 8 }}>
                <Plus size={14} /> Add your first kit
              </Link>
            )}
          </div>
        ) : filteredKits.length === 0 ? (
          <div className="profile-shelf__empty">
            <div className="profile-shelf__empty-title">No builds match this filter</div>
            <p className="profile-shelf__empty-desc">
              Try selecting another status tab or clear the search query.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all')
                setSearchQuery('')
              }}
              className="btn btn--secondary btn--sm"
              style={{ marginTop: 8 }}
            >
              Reset filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="profile-shelf__grid">
            {filteredKits.map((kit) => (
              <KitCard
                key={kit.uri}
                name={kit.name}
                grade={kit.grade}
                scale={kit.scale}
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
          <div className="profile-shelf__list">
            {filteredKits.map((kit) => (
              <div key={kit.uri} className="profile-shelf-row">
                <div
                  className={`profile-shelf-row__thumb-wrap ${
                    kit.photoUrl ? 'profile-shelf-row__thumb-wrap--clickable' : ''
                  }`}
                  onClick={
                    kit.photoUrl || (kit.photos && kit.photos.length > 0)
                      ? () => openKitGallery(kit)
                      : undefined
                  }
                  role={
                    kit.photoUrl || (kit.photos && kit.photos.length > 0) ? 'button' : undefined
                  }
                  tabIndex={kit.photoUrl || (kit.photos && kit.photos.length > 0) ? 0 : undefined}
                  title={kit.photoUrl ? 'View photo gallery' : undefined}
                  onKeyDown={
                    kit.photoUrl || (kit.photos && kit.photos.length > 0)
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
                        className="profile-shelf-row__thumb-backdrop"
                        aria-hidden="true"
                      />
                      <img
                        src={kit.photoUrl}
                        alt={kit.name}
                        className="profile-shelf-row__thumb"
                        loading="lazy"
                      />
                      {kit.photoCount && kit.photoCount > 1 && (
                        <span
                          className="kit-card__photo-count mono"
                          style={{ top: 3, right: 3, padding: '2px 5px', fontSize: '10px' }}
                          title={`${kit.photoCount} photos`}
                        >
                          <Images size={10} />
                          <span>{kit.photoCount}</span>
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="profile-shelf-row__placeholder">
                      <Camera size={22} strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                <div className="profile-shelf-row__body">
                  <h3 className="profile-shelf-row__title">{kit.name}</h3>
                  <span className="profile-shelf-row__sub">
                    {[kit.grade, kit.scale].filter(Boolean).join(' \u00b7 ') || 'Gunpla'}
                  </span>
                </div>

                <div className="profile-shelf-row__side">
                  <span className={`badge badge--${kit.status}`}>
                    {STATUS_LABELS[kit.status] ?? kit.status}
                  </span>
                  {kit.indexedAt && (
                    <span className="profile-shelf-row__date">{timeAgo(kit.indexedAt)}</span>
                  )}
                  {isOwner && kit.rkey && (
                    <Link
                      route="kits.edit"
                      routeParams={[kit.rkey]}
                      className="iconbtn"
                      style={{ width: '28px', height: '28px' }}
                      title="Edit kit"
                    >
                      <Pencil size={13} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          className="lightbox-backdrop"
          onClick={() => setActivePhoto(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-modal__header">
              <div className="lightbox-modal__title-group">
                <span className={`badge badge--${activePhoto.status}`}>
                  {STATUS_LABELS[activePhoto.status] ?? activePhoto.status}
                </span>
                <h3 className="lightbox-modal__title">{activePhoto.name}</h3>
                {[activePhoto.grade, activePhoto.scale].filter(Boolean).length > 0 && (
                  <span className="lightbox-modal__sub">
                    {[activePhoto.grade, activePhoto.scale].filter(Boolean).join(' \u00b7 ')}
                  </span>
                )}
                {activePhoto.photos.length > 1 && (
                  <span className="lightbox-modal__counter mono">
                    {activePhoto.currentIndex + 1} / {activePhoto.photos.length}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="lightbox-modal__close"
                onClick={() => setActivePhoto(null)}
                aria-label="Close photo preview"
              >
                <X size={18} />
              </button>
            </div>

            <div className="lightbox-modal__view">
              {activePhoto.photos[activePhoto.currentIndex] && (
                <>
                  <img
                    src={
                      activePhoto.photos[activePhoto.currentIndex].fullUrl ||
                      activePhoto.photos[activePhoto.currentIndex].thumbUrl
                    }
                    alt=""
                    className="lightbox-modal__backdrop"
                    aria-hidden="true"
                  />
                  <img
                    src={
                      activePhoto.photos[activePhoto.currentIndex].fullUrl ||
                      activePhoto.photos[activePhoto.currentIndex].thumbUrl
                    }
                    alt={activePhoto.name}
                    className="lightbox-modal__img"
                  />
                </>
              )}

              {activePhoto.photos.length > 1 && (
                <>
                  <button
                    type="button"
                    className="lightbox-nav-btn lightbox-nav-btn--prev"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActivePhoto((prev) => {
                        if (!prev) return null
                        const nextIndex =
                          (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length
                        return { ...prev, currentIndex: nextIndex }
                      })
                    }}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    className="lightbox-nav-btn lightbox-nav-btn--next"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActivePhoto((prev) => {
                        if (!prev) return null
                        const nextIndex = (prev.currentIndex + 1) % prev.photos.length
                        return { ...prev, currentIndex: nextIndex }
                      })
                    }}
                    aria-label="Next photo"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {activePhoto.photos.length > 1 && (
              <div className="lightbox-thumbs">
                {activePhoto.photos.map((p, idx) => (
                  <button
                    key={p.cid || idx}
                    type="button"
                    className={`lightbox-thumb ${
                      idx === activePhoto.currentIndex ? 'lightbox-thumb--active' : ''
                    }`}
                    onClick={() =>
                      setActivePhoto((prev) => (prev ? { ...prev, currentIndex: idx } : null))
                    }
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img src={p.thumbUrl || p.fullUrl} alt="" className="lightbox-thumb__img" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Achievements Section */}
      {achievements && achievements.length > 0 && (
        <section className="profile-section">
          <div className="profile-section__header">
            <h2 className="profile-section__title">Achievements</h2>
            <span
              className="mono"
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'var(--paper)',
                border: '1px solid var(--line-2)',
                color: 'var(--muted)',
              }}
            >
              {unlockedCount} / {achievements.length}
            </span>
          </div>

          <div className="achievement-grid">
            {achievements.map((ach) => {
              const percent = ach.unlocked
                ? 100
                : ach.progress
                  ? Math.round((ach.progress.current / ach.progress.total) * 100)
                  : 0

              return (
                <div
                  key={ach.id}
                  className={`achievement-tile ${
                    ach.unlocked ? 'achievement-tile--unlocked' : 'achievement-tile--locked'
                  }`}
                >
                  <div className="achievement-tile__head">
                    <div className="achievement-tile__emoji">{ach.icon}</div>
                    <span
                      className={`achievement-tile__status mono ${
                        ach.unlocked ? 'achievement-tile__status--unlocked' : ''
                      }`}
                    >
                      {ach.unlocked
                        ? '\u2713 Done'
                        : ach.progress
                          ? `${ach.progress.current}/${ach.progress.total}`
                          : 'Locked'}
                    </span>
                  </div>

                  <div className="achievement-tile__name">{ach.name}</div>
                  <p className="achievement-tile__desc">{ach.description}</p>

                  <div className="achievement-tile__footer">
                    <div className="achievement-tile__track">
                      <div className="achievement-tile__fill" style={{ width: `${percent}%` }} />
                    </div>
                    {ach.progress && !ach.unlocked && (
                      <span className="achievement-tile__detail mono">
                        {ach.progress.current} of {ach.progress.total}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Build logs Section */}
      <section className="profile-section">
        <div className="profile-section__header">
          <h2 className="profile-section__title">Build logs</h2>
          <span
            className="mono"
            style={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'var(--paper)',
              border: '1px solid var(--line-2)',
              color: 'var(--muted)',
            }}
          >
            {buildLogs.length}
          </span>
        </div>

        {buildLogs.length === 0 ? (
          <p style={{ opacity: 0.5 }}>No build logs yet.</p>
        ) : (
          <ul className="links">
            {buildLogs.map((log) => (
              <li key={log.uri}>
                <div className="lrow">
                  <span className="lrow__bullet" />
                  <span className="lrow__title">{log.stage ?? 'Build update'}</span>
                  {log.text && <span className="lrow__desc">{log.text}</span>}
                  <span className="lrow__arrow mono" style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                    {timeAgo(log.indexedAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

Profile.layout = [MarketingLayout]
