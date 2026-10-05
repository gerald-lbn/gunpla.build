import { cn } from 'cn'
import { Camera, Images } from 'lucide-react'

export const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  'backlog': { label: 'Backlog', className: '' },
  'in-progress': { label: 'In progress', className: '' },
  'on-hold': { label: 'On hold', className: '' },
  'dropped': { label: 'Dropped', className: '' },
  'done': { label: 'Done', className: '' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: '' }
  return (
    <span
      className={cn(
        'inline-flex items-center border-2 border-black bg-primary px-1.5 py-0.5 font-head text-[11px] font-bold text-primary-foreground',
        cfg.className
      )}
    >
      {cfg.label}
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

export default function KitPreview({
  name,
  grade,
  scale,
  manufacturer,
  status,
  photoUrl,
  photoCount,
}: KitPreviewProps) {
  const subtitle = [manufacturer, grade, scale].filter(Boolean).join(' · ')
  const displayName = name.trim() || 'Kit Name'
  const displaySub = subtitle || 'Manufacturer · Grade · Scale'

  return (
    <div className="border-2 border-black bg-card text-card-foreground shadow-md">
      {/* Media */}
      <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-black bg-muted">
        {photoUrl ? (
          <>
            <img
              src={photoUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 size-full scale-110 object-cover opacity-50 blur-xl"
            />
            <img src={photoUrl} alt={displayName} className="relative size-full object-contain" />
            {photoCount && photoCount > 1 && (
              <span className="absolute right-2 bottom-2 flex items-center gap-1 border-2 border-black bg-foreground px-1.5 py-0.5 font-mono text-[10px] text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Images className="size-3" />
                {photoCount}
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

      {/* Body */}
      <div className="px-3 py-2.5">
        <p className={cn('truncate font-head text-sm font-bold', !name.trim() && 'opacity-40')}>
          {displayName}
        </p>
        <p
          className={cn(
            'mt-0.5 truncate font-mono text-xs text-muted-foreground',
            !subtitle && 'opacity-40'
          )}
        >
          {displaySub}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center border-t-2 border-black px-3 py-2">
        <StatusBadge status={status} />
      </div>
    </div>
  )
}
