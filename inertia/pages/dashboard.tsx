import AppLayout from '~/layouts/app'
import Page from '~/components/page'
import KitCard from '~/components/kit_card'
import { Link } from '@adonisjs/inertia/react'
import { Plus } from 'lucide-react'
import type { InertiaProps } from '~/types'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitRecordTransformer from '#kits/transformers/kit_record_transformer'

type KitItem = InferData<KitRecordTransformer>

type PageProps = InertiaProps<{ kits: KitItem[] }>

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
            <KitCard
              key={kit.uri}
              name={kit.name}
              grade={kit.grade}
              scale={kit.scale}
              status={kit.status}
              photoUrl={kit.photoUrl}
              rkey={kit.rkey}
            />
          ))}
        </div>
      )}
    </Page>
  )
}

Dashboard.layout = [AppLayout]
