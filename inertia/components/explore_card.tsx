import { KitTile } from '~/components/kit_tile'
import type { InferVariants } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

type KitExplore = InferVariants<KitTransformer>['forExplore']

interface ExploreCardProps {
  kit: KitExplore
  onSelect: (kit: KitExplore) => void
}

/** A finished build at its photo's own proportions, so the masonry keeps every pose whole. */
export function ExploreCard({ kit, onSelect }: ExploreCardProps) {
  return (
    <KitTile
      kit={{ ...kit, photoUrl: kit.photos[0]?.thumbUrl ?? null }}
      fit="natural"
      showBuilder
      showStatus={false}
      onSelect={() => onSelect(kit)}
    />
  )
}
