import AppLayout from '~/layouts/app'
import Page from '~/components/page'
import KitCard from '~/components/kit_card'
import { Link } from '@adonisjs/inertia/react'
import { Plus, Package } from 'lucide-react'
import { Button } from '~/components/ui/button'
import type { InertiaProps } from '~/types'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitRecordTransformer from '#kits/transformers/kit_record_transformer'

type KitItem = InferData<KitRecordTransformer>
type PageProps = InertiaProps<{ kits: KitItem[] }>

export default function Shelf({ kits }: PageProps) {
  return (
    <Page
      title="My shelf"
      actions={
        <Button size="sm" render={<Link route="kits.new" />}>
          <Plus />
          Add kit
        </Button>
      }
    >
      {kits.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Package className="size-10 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">Your shelf is empty.</p>
          <Button size="sm" render={<Link route="kits.new" />}>
            <Plus />
            Add your first kit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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

Shelf.layout = [AppLayout]
