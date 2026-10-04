import AppLayout from '~/layouts/app'
import Page from '~/components/page'
import { Link } from '@adonisjs/inertia/react'
import { Plus } from 'lucide-react'
import type { InertiaProps } from '~/types'

type KitItem = {
  uri: string
  name: string
  grade: string | null
  scale: string | null
  status: string
}

type PageProps = InertiaProps<{ kits: KitItem[] }>

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  'in-progress': 'In progress',
  'on-hold': 'On hold',
  dropped: 'Dropped',
  done: 'Done',
}

function KitCard({ kit }: { kit: KitItem }) {
  const subtitle = [kit.grade, kit.scale].filter(Boolean).join(' · ')

  return (
    <div className="card">
      <div className="card__body">
        <p className="card__title">{kit.name}</p>
        {subtitle && <p className="card__sub">{subtitle}</p>}
      </div>
      <div className="card__footer">
        <span className={`badge badge--${kit.status}`}>
          {STATUS_LABELS[kit.status] ?? kit.status}
        </span>
      </div>
    </div>
  )
}

export default function Dashboard({ kits }: PageProps) {
  return (
    <Page title="My shelf" hideTitle>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 className="page__title">My shelf</h1>
        <Link route="kits.new" className="btn btn--primary btn--sm">
          <Plus size={14} /> Add kit
        </Link>
      </div>

      {kits.length === 0 ? (
        <div className="empty">
          <p>Your shelf is empty.</p>
        </div>
      ) : (
        <div className="shelf">
          {kits.map((kit) => (
            <KitCard key={kit.uri} kit={kit} />
          ))}
        </div>
      )}
    </Page>
  )
}

Dashboard.layout = [AppLayout]
