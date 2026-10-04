import MarketingLayout from '~/layouts/marketing'
import type { InertiaProps } from '~/types'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#transformers/kit_transformer'

type KitRow = InferData<KitTransformer>

type PageProps = InertiaProps<{ handle: string; kits: KitRow[] }>

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

export default function Profile({ handle, kits }: PageProps) {
  return (
    <div className="home">
      <article className="prose-card">
        <div className="pc-lead">
          <span className="mono">@{handle}</span>
        </div>
        <p className="pc-para">
          {kits.length} kit{kits.length !== 1 ? 's' : ''} on shelf
        </p>
      </article>

      {kits.length === 0 ? (
        <p style={{ opacity: 0.5, marginTop: '2rem' }}>No kits indexed yet.</p>
      ) : (
        <ul className="links" style={{ marginTop: '2rem' }}>
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
    </div>
  )
}

Profile.layout = [MarketingLayout]
