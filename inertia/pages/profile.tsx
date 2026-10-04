import MarketingLayout from '~/layouts/marketing'
import type { InertiaProps } from '~/types'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#transformers/kit_transformer'
import type BuildLogTransformer from '#transformers/build_log_transformer'

type KitRow = InferData<KitTransformer>
type BuildLogRow = InferData<BuildLogTransformer>

type PageProps = InertiaProps<{ handle: string; kits: KitRow[]; buildLogs: BuildLogRow[] }>

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

export default function Profile({ handle, kits, buildLogs }: PageProps) {
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
      </article>

      <section style={{ marginTop: '2rem' }}>
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

      <section style={{ marginTop: '2rem' }}>
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
