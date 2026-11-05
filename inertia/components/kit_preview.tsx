import { cn } from 'cn'
import { Images } from 'lucide-react'
import { KitPhoto } from '~/components/kit_photo'
import { STATUS_LABEL, kitSpec, statusLabel } from '~/lib/kits'

export const STATUS_CONFIG: Record<string, { label: string }> = Object.fromEntries(
  Object.entries(STATUS_LABEL).map(([key, label]) => [key, { label }])
)

/**
 * One status mark per kit, in the RX-78 tricolour: a finished build carries the
 * V-fin yellow, a kit on the bench Federation blue, a dropped kit the red; a boxed
 * or paused kit stays grey.
 */
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 flex-none items-center gap-1.5 rounded-[2px] px-2 text-xs font-medium whitespace-nowrap',
        status === 'done' && 'bg-vfin-tint text-vfin-ink',
        status === 'in-progress' && 'bg-fed-blue-tint text-fed-blue-ink',
        (status === 'backlog' || status === 'on-hold') && 'bg-secondary text-muted-foreground',
        status === 'dropped' && 'bg-negative-tint text-negative',
        className
      )}
    >
      {statusLabel(status)}
    </span>
  )
}

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
          className="aspect-[4/5]"
        />
        {photoCount && photoCount > 1 ? (
          <span className="absolute right-2.5 bottom-2.5 inline-flex h-6 items-center gap-1 rounded-[2px] bg-black/75 px-2 text-xs font-medium text-white num">
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
