import { Link } from '@adonisjs/inertia/react'
import { Pencil, Camera } from 'lucide-react'

export const STATUS_LABELS: Record<string, string> = {
  'backlog': 'Backlog',
  'in-progress': 'In progress',
  'on-hold': 'On hold',
  'dropped': 'Dropped',
  'done': 'Done',
}

export interface KitCardProps {
  name: string
  grade?: string | null
  scale?: string | null
  status: string
  photoUrl?: string | null
  rkey?: string
  isPreview?: boolean
}

export default function KitCard({
  name,
  grade,
  scale,
  status,
  photoUrl,
  rkey,
  isPreview = false,
}: KitCardProps) {
  const subtitle = [grade, scale].filter(Boolean).join(' · ')
  const displayName = name.trim() || (isPreview ? 'Kit Name' : 'Untitled Kit')
  const displaySub = subtitle || (isPreview ? 'Grade · Scale' : '')

  return (
    <div className={`kit-card ${isPreview ? 'kit-card--preview' : ''}`}>
      <div className="kit-card__media">
        {photoUrl ? (
          <>
            <img src={photoUrl} alt="" className="kit-card__backdrop" aria-hidden="true" />
            <img src={photoUrl} alt={displayName} className="kit-card__img" loading="lazy" />
          </>
        ) : (
          <div className="kit-card__placeholder">
            <Camera size={26} strokeWidth={1.5} />
            <span className="kit-card__placeholder-text">
              {isPreview ? 'Cover photo preview' : 'No photo'}
            </span>
          </div>
        )}
      </div>

      <div className="kit-card__body">
        <div className="kit-card__header">
          <div>
            <h3 className="kit-card__title" style={{ opacity: name.trim() ? 1 : 0.6 }}>
              {displayName}
            </h3>
            {displaySub && (
              <p className="kit-card__sub" style={{ opacity: subtitle ? 1 : 0.5 }}>
                {displaySub}
              </p>
            )}
          </div>
          {rkey && !isPreview && (
            <Link
              route="kits.edit"
              routeParams={[rkey]}
              className="iconbtn"
              style={{ width: '28px', height: '28px', flexShrink: 0 }}
              title="Edit kit"
            >
              <Pencil size={13} />
            </Link>
          )}
        </div>
      </div>

      <div className="kit-card__footer">
        <span className={`badge badge--${status}`}>{STATUS_LABELS[status] ?? status}</span>
        {isPreview && (
          <span className="mono" style={{ fontSize: '11px', color: 'var(--subtle)' }}>
            Shelf preview
          </span>
        )}
      </div>
    </div>
  )
}
