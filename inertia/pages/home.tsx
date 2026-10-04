import MarketingLayout from '~/layouts/marketing'
import type { InertiaProps } from '~/types'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

type KitRow = {
  id: number
  uri: string
  did: string
  handle: string | null
  name: string
  grade: string | null
  scale: string | null
  status: string
  indexedAt: string
}

const STATUS_COLORS: Record<string, string> = {
  'backlog': 'var(--muted)',
  'in-progress': 'var(--ok)',
  'on-hold': 'var(--warn)',
  'dropped': 'var(--err)',
  'done': 'var(--accent)',
}

type PageProps = InertiaProps<{ kits: KitRow[] }>

export default function Home({ kits }: PageProps) {
  return (
    <div className="home">
      <article className="prose-card">
        <div className="pc-lead">gunpla.build</div>
        <p className="pc-para">
          Track your Gunpla collection and share your builds with the ATProto community.
        </p>
      </article>

      <section style={{ marginTop: '2rem' }}>
        <h2 className="mono" style={{ marginBottom: '1rem', fontSize: '0.875rem', opacity: 0.6 }}>
          Recent builds
        </h2>

        {kits.length === 0 ? (
          <p style={{ opacity: 0.5 }}>
            No builds indexed yet. Start a Jetstream listener to populate this feed.
          </p>
        ) : (
          <ul className="links">
            {kits.map((kit) => (
              <li key={kit.uri}>
                <div className="lrow">
                  <span
                    className="lrow__bullet"
                    style={{
                      background: STATUS_COLORS[kit.status] ?? 'var(--muted)',
                    }}
                  />
                  <span className="lrow__title">{kit.name}</span>
                  <span className="lrow__desc">
                    {[kit.grade, kit.scale].filter(Boolean).join(' · ')}
                    {kit.handle ? (
                      <>
                        {' '}
                        &mdash; <span className="mono">@{kit.handle}</span>
                      </>
                    ) : null}
                  </span>
                  <span className="lrow__arrow mono" style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                    {kit.indexedAt ? timeAgo(kit.indexedAt) : ''}
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

Home.layout = [MarketingLayout]
