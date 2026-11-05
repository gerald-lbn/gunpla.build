import { cn } from 'cn'
import { Images } from 'lucide-react'
import { KitPhoto } from '~/components/kit_photo'
import { STATUS_LABEL, kitSpec } from '~/lib/kits'
import { StatusBadge } from '~/components/stickers'

export const STATUS_CONFIG: Record<string, { label: string }> = Object.fromEntries(
  Object.entries(STATUS_LABEL).map(([key, label]) => [key, { label }])
)

export { StatusBadge, SpecStickers, STATUS_STICKER } from '~/components/stickers'

export interface KitPreviewProps {
  name: string
  grade?: string | null
  scale?: string | null
  manufacturer?: string | null
  status: string
  photoUrl?: string | null
  photoCount?: number
}

/** The shelf card exactly as it will appear, filled from the form as it is typed. */
export default function KitPreview({
  name,
  grade,
  scale,
  manufacturer,
  status,
  photoUrl,
  photoCount,
}: KitPreviewProps) {
  const spec = kitSpec({ grade, scale, manufacturer })

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <KitPhoto
          src={photoUrl}
          alt={name || 'Kit cover photo'}
          grade={grade}
          scale={scale}
          className="aspect-4/5"
        />
        {photoCount && photoCount > 1 ? (
          <span className="num absolute right-2.5 bottom-2.5 inline-flex h-6 items-center gap-1 rounded-full bg-black/75 px-2 text-xs font-medium text-white">
            <Images className="size-3.5" aria-hidden="true" />
            {photoCount}
          </span>
        ) : null}
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn('truncate text-sm font-medium', !name.trim() && 'text-faint')}>
            {name.trim() || 'Kit name'}
          </p>
          <p className={cn('mt-0.5 truncate text-xs text-muted-foreground', !spec && 'text-faint')}>
            {spec || 'Grade · scale · manufacturer'}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  )
}
