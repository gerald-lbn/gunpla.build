import { useEffect, useState, useRef } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { router } from '@inertiajs/react'
import { transmit } from '~/services/transmit'
import MarketingLayout from '~/layouts/marketing'
import type { InertiaProps } from '~/types'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

type KitRow = InferData<KitTransformer>

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
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
  const [isLive, setIsLive] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const subscription = transmit.subscription('kits')

    subscription
      .create()
      .then(() => setIsLive(true))
      .catch(() => setIsLive(false))

    const stop = subscription.onMessage(() => {
      // Debounce reloads so bursts of events on firehose don't spam requests
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setIsUpdating(true)
        router.reload({
          only: ['kits'],
          onFinish: () => {
            setTimeout(() => setIsUpdating(false), 800)
          },
        })
      }, 400)
    })

    return () => {
      stop()
      subscription.delete()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className="home">
      <article className="prose-card">
        <div className="pc-lead">gunpla.build</div>
        <p className="pc-para">
          Track your Gunpla collection and share your builds with the ATProto community.
        </p>
      </article>

      <section style={{ marginTop: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <h2 className="mono" style={{ fontSize: '0.875rem', opacity: 0.6, margin: 0 }}>
            Recent builds
          </h2>

          {isLive && (
            <span
              className="mono"
              style={{
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: isUpdating ? 'var(--warn)' : 'var(--ok)',
                transition: 'color 0.3s ease',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isUpdating ? 'var(--warn)' : 'var(--ok)',
                  boxShadow: isUpdating ? '0 0 6px var(--warn)' : '0 0 6px var(--ok)',
                }}
              />
              {isUpdating ? 'Updating...' : 'Live'}
            </span>
          )}
        </div>

        {kits.length === 0 ? (
          <p style={{ opacity: 0.5 }}>
            No builds indexed yet. Start a Jetstream listener to populate this feed.
          </p>
        ) : (
          <ul className="links">
            {kits.map((kit) => (
              <li key={kit.uri}>
                <div className="lrow">
                  {kit.photoUrl ? (
                    <img src={kit.photoUrl} alt="" className="lrow__thumb" loading="lazy" />
                  ) : (
                    <span
                      className="lrow__bullet"
                      style={{
                        background: STATUS_COLORS[kit.status] ?? 'var(--muted)',
                      }}
                    />
                  )}
                  <span className="lrow__title">{kit.name}</span>
                  <span className="lrow__desc">
                    {[kit.grade, kit.scale].filter(Boolean).join(' · ')}
                    {kit.handle ? (
                      <>
                        {' '}
                        &mdash;{' '}
                        <Link route="profile" routeParams={[kit.handle]} className="mono">
                          @{kit.handle}
                        </Link>
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
