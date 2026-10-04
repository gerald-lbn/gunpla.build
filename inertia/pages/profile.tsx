import MarketingLayout from '~/layouts/marketing'
import type { InertiaProps } from '~/types'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'
import type BuildLogTransformer from '#kits/transformers/build_log_transformer'
import type { Achievement, ProfileStats } from '#profile/services/achievements_service'

type KitRow = InferData<KitTransformer>
type BuildLogRow = InferData<BuildLogTransformer>

type PageProps = InertiaProps<{
  handle: string
  kits: KitRow[]
  buildLogs: BuildLogRow[]
  stats: ProfileStats
  achievements: Achievement[]
}>

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const STATUS_LABELS: Record<string, string> = {
  'backlog': 'Backlog',
  'in-progress': 'In progress',
  'on-hold': 'On hold',
  'dropped': 'Dropped',
  'done': 'Done',
}

const STATUS_COLORS: Record<string, string> = {
  'backlog': 'var(--muted)',
  'in-progress': 'var(--ok)',
  'on-hold': 'var(--warn)',
  'dropped': 'var(--err)',
  'done': 'var(--accent)',
}

export default function Profile({ handle, kits, buildLogs, stats, achievements }: PageProps) {
  const unlockedCount = achievements ? achievements.filter((a) => a.unlocked).length : 0

  return (
    <div className="home">
      <article className="prose-card">
        <div className="pc-lead">
          <span className="mono">@{handle}</span>
        </div>
        <p className="pc-para">
          {kits.length} kit{kits.length !== 1 ? 's' : ''} &middot; {buildLogs.length} build log
          {buildLogs.length !== 1 ? 's' : ''}
        </p>

        {stats && (
          <div className="stats-row">
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
          </div>
        )}
      </article>

      {achievements && achievements.length > 0 && (
        <section style={{ marginTop: '2.5rem', width: '580px', maxWidth: '100%' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <h2 className="mono" style={{ fontSize: '0.875rem', opacity: 0.6, margin: 0 }}>
              Achievements
            </h2>
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
                        ? '✓ Done'
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

      <section style={{ marginTop: '2.5rem', width: '580px', maxWidth: '100%' }}>
        <h2 className="mono" style={{ marginBottom: '1rem', fontSize: '0.875rem', opacity: 0.6 }}>
          Shelf
        </h2>
        {kits.length === 0 ? (
          <p style={{ opacity: 0.5 }}>No kits indexed yet.</p>
        ) : (
          <ul className="links">
            {kits.map((kit) => (
              <li key={kit.uri}>
                <div className="lrow">
                  <span
                    className="lrow__bullet"
                    style={{ background: STATUS_COLORS[kit.status] ?? 'var(--muted)' }}
                  />
                  <span className="lrow__title">{kit.name}</span>
                  <span className="lrow__desc">
                    {[kit.grade, kit.scale].filter(Boolean).join(' · ')}
                  </span>
                  <span className="lrow__arrow mono" style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                    {STATUS_LABELS[kit.status] ?? kit.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: '2.5rem', width: '580px', maxWidth: '100%' }}>
        <h2 className="mono" style={{ marginBottom: '1rem', fontSize: '0.875rem', opacity: 0.6 }}>
          Build logs
        </h2>
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
