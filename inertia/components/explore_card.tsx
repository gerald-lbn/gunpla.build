import { Camera } from 'lucide-react'
import type { InferVariants } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

type KitExplore = InferVariants<KitTransformer>['forExplore']

interface ExploreCardProps {
  kit: KitExplore
  onSelect: (kit: KitExplore) => void
}

export function ExploreCard({ kit, onSelect }: ExploreCardProps) {
  return (
    <article className="group relative mb-6">
      <button
        type="button"
        onClick={() => onSelect(kit)}
        className="w-full text-left"
        aria-label={`View details for ${kit.name}`}
      >
        {kit.photos.length > 0 ? (
          <div className="mb-2 overflow-hidden rounded border-2 border-border">
            <img
              src={kit.photos[0].thumbUrl}
              alt={kit.name}
              loading="lazy"
              className="w-full transition-[scale] duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="mb-2 flex h-48 items-center justify-center rounded border-2 border-border bg-muted text-muted-foreground">
            <Camera className="size-8" strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}
      </button>

      <h2 className="font-head text-base font-medium leading-tight">
        <button
          type="button"
          onClick={() => onSelect(kit)}
          className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {kit.name}
        </button>
      </h2>
      <p className="font-head text-sm text-muted-foreground">@{(kit.handle ?? '').split('.')[0]}</p>
    </article>
  )
}
