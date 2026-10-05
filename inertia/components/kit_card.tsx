import { Link } from '@adonisjs/inertia/react'
import { Pencil, Camera, ZoomIn, Images } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { StatusBadge } from '~/components/kit_preview'

export interface KitCardProps {
  name: string
  grade?: string | null
  scale?: string | null
  manufacturer?: string | null
  status: string
  photoUrl?: string | null
  fullPhotoUrl?: string | null
  photoCount?: number
  rkey?: string
  onPhotoClick?: () => void
}

export default function KitCard({
  name,
  grade,
  scale,
  manufacturer,
  status,
  photoUrl,
  photoCount,
  rkey,
  onPhotoClick,
}: KitCardProps) {
  const subtitle = [manufacturer, grade, scale].filter(Boolean).join(' · ')
  const displayName = name.trim() || 'Untitled Kit'
  const isClickable = Boolean(onPhotoClick && photoUrl)

  return (
    <div className="overflow-hidden border border-border bg-card text-card-foreground">
      <div
        className={`group relative aspect-[4/3] overflow-hidden bg-muted${isClickable ? ' cursor-pointer' : ''}`}
        onClick={isClickable ? onPhotoClick : undefined}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-label={isClickable ? `View photo of ${displayName}` : undefined}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onPhotoClick?.()
                }
              }
            : undefined
        }
      >
        {photoUrl ? (
          <>
            <img
              src={photoUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 size-full scale-110 object-cover opacity-50 blur-xl"
            />
            <img
              src={photoUrl}
              alt={displayName}
              className="relative size-full object-contain"
              loading="lazy"
            />
            {photoCount && photoCount > 1 && (
              <span className="absolute right-2 bottom-2 flex items-center gap-1 bg-black/50 px-1.5 py-0.5 font-mono text-[10px] text-white">
                <Images className="size-3" />
                {photoCount}
              </span>
            )}
            {isClickable && (
              <span className="absolute right-2 top-2 flex size-7 items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <ZoomIn className="size-4" />
              </span>
            )}
          </>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1.5 text-muted-foreground/60">
            <Camera className="size-7" strokeWidth={1.5} />
            <span className="text-xs">No photo</span>
          </div>
        )}
      </div>

      <div className="px-3 py-2.5">
        <h3 className={`truncate text-sm font-medium${!name.trim() ? ' opacity-60' : ''}`}>
          {displayName}
        </h3>
        {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center justify-between border-t border-border px-3 py-2">
        <StatusBadge status={status} />
        {rkey && (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Edit kit"
            render={<Link route="kits.edit" routeParams={[rkey]} title="Edit kit" />}
          >
            <Pencil />
          </Button>
        )}
      </div>
    </div>
  )
}
