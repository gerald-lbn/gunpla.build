import { cn } from 'cn'
import { Camera, Images } from 'lucide-react'

export const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  'backlog': {
    label: 'Backlog',
    className: 'bg-muted text-muted-foreground',
  },
  'in-progress': {
    label: 'In progress',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  'on-hold': {
    label: 'On hold',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  'dropped': {
    label: 'Dropped',
    className: 'bg-destructive/10 text-destructive',
  },
  'done': {
    label: 'Done',
    className: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: '' }
  return (
    <span className="inline-flex items-center bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
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
    <div className="overflow-hidden border border-border bg-card text-card-foreground">
      {/* Media */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
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
              <span className="absolute right-2 bottom-2 flex items-center gap-1 bg-black/50 px-1.5 py-0.5 font-mono text-[10px] text-white">
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
        <p className={cn('truncate text-sm font-medium', !name.trim() && 'opacity-40')}>
          {displayName}
        </p>
        <p
          className={cn('mt-0.5 truncate text-xs text-muted-foreground', !subtitle && 'opacity-40')}
        >
          {displaySub}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center border-t border-border px-3 py-2">
        <StatusBadge status={status} />
      </div>
    </div>
  )
}
