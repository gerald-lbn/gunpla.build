import { Link } from '@adonisjs/inertia/react'
import { Images, Camera } from 'lucide-react'
import { cn } from 'cn'
import { StatusBadge } from '~/components/kit_preview'
import { timeAgo } from '~/lib/time'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

type KitRow = InferData<KitTransformer>

interface KitFeedCardProps {
  kit: KitRow
  isNewlyInserted: boolean
}

export function KitFeedCard({ kit, isNewlyInserted }: KitFeedCardProps) {
  return (
    <article
      className={cn(
        'group flex h-full shrink-0 snap-start snap-always flex-col overflow-hidden border-2 border-border bg-card shadow-[3px_3px_0_0_var(--border)] transition-all hover:shadow-[5px_5px_0_0_var(--border)]',
        isNewlyInserted && 'animate-snap-insert ring-2 ring-primary shadow-[0_0_16px_rgba(255,200,0,0.5)]'
      )}
    >
      {/* Header: builder handle, time, status */}
      <div className="flex shrink-0 items-center justify-between border-b-2 border-border bg-muted/40 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          {kit.handle ? (
            <Link
              route="profile"
              routeParams={[kit.handle]}
              className="truncate font-mono text-xs font-bold text-foreground hover:underline"
            >
              @{kit.handle}
            </Link>
          ) : (
            <span className="font-mono text-xs text-muted-foreground">Builder</span>
          )}
          <span className="font-mono text-[10px] text-muted-foreground">·</span>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
            {timeAgo(kit.indexedAt)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isNewlyInserted && (
            <span className="border-2 border-black bg-primary px-1.5 py-0.5 font-head text-[9px] font-black text-primary-foreground uppercase shadow-[2px_2px_0_0_#000000] animate-pulse">
              JUST ADDED
            </span>
          )}
          {kit.status !== 'done' && <StatusBadge status={kit.status} />}
          {kit.grade && (
            <span className="border border-border bg-primary/20 px-1.5 py-0.5 font-head text-[10px] font-bold text-foreground uppercase">
              {kit.grade}
            </span>
          )}
        </div>
      </div>

      {/* Media */}
      <div className="relative min-h-0 flex-1 w-full overflow-hidden bg-neutral-950">
        {kit.photoUrl ? (
          <>
            <img
              src={kit.photoUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 size-full scale-105 object-cover opacity-30 blur-md"
            />
            <img
              src={kit.photoUrl}
              alt={kit.name}
              className="relative size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
            {kit.photoCount && kit.photoCount > 1 ? (
              <span className="absolute right-2.5 bottom-2.5 flex items-center gap-1 border-2 border-black bg-foreground px-2 py-0.5 font-mono text-[11px] font-bold text-background shadow-[2px_2px_0_0_#000000]">
                <Images className="size-3.5" />
                {kit.photoCount}
              </span>
            ) : null}
          </>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
            <Camera className="size-8" strokeWidth={1.5} />
            <span className="font-head text-xs font-bold uppercase tracking-wider">
              {kit.grade || 'Kit'} · No Photo
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="shrink-0 border-t-2 border-border/70 bg-card px-3.5 py-2.5">
        <h3 className="truncate font-head text-sm font-bold text-foreground sm:text-base">
          {kit.name || 'Untitled Kit'}
        </h3>
        {(kit.scale || kit.manufacturer) && (
          <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
            {[kit.manufacturer, kit.scale].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </article>
  )
}
