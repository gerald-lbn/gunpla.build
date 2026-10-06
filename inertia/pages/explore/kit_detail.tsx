import { Link } from '@adonisjs/inertia/react'
import { X } from 'lucide-react'
import { DialogClose } from '~/components/ui/dialog'
import { PhotoCarousel } from './photo_carousel'
import type { InferVariants } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

export type KitExplore = InferVariants<KitTransformer>['forExplore']

export function KitDetail({ kit, onClose }: { kit: KitExplore; onClose: () => void }) {
  return (
    <div className="flex max-h-[calc(100svh-2rem)] flex-col sm:h-[min(640px,calc(100svh-2rem))] sm:flex-row">
      {/* Left — carousel */}
      <div className="h-64 w-full shrink-0 sm:h-full sm:w-72 md:w-80">
        <PhotoCarousel photos={kit.photos} />
      </div>

      {/* Right — info */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b-2 border-border px-5 py-4">
          <div className="min-w-0">
            {[kit.grade, kit.scale].filter(Boolean).join(' · ') && (
              <div className="mb-1.5 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded border-2 border-border bg-card px-2 py-0.5 font-head text-xs font-black">
                  {[kit.grade, kit.scale].filter(Boolean).join(' · ')}
                </span>
              </div>
            )}
            <h2 className="font-head text-xl font-black leading-tight">{kit.name}</h2>
            <p className="mt-0.5 font-sans text-sm text-muted-foreground">
              {kit.manufacturer}
              {kit.manufacturer && ' · '}
              <Link
                route="profile"
                routeParams={[kit.handle ?? '']}
                className="font-mono hover:underline"
                onClick={onClose}
              >
                @{(kit.handle ?? '').split('.')[0]}
              </Link>
            </p>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded border-2 border-border bg-card shadow-[2px_2px_0_0_hsl(var(--border))] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-none"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogClose>
        </div>

        {/* Scrollable body */}
        <div className="space-y-6 overflow-y-auto px-5 py-5">
          {kit.buildLogs && kit.buildLogs.length > 0 && (
            <div>
              <h3 className="font-head mb-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                Build log
              </h3>
              <ol className="space-y-0">
                {kit.buildLogs.map((entry, i) => (
                  <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < kit.buildLogs!.length - 1 && (
                      <div className="absolute top-3 left-[7px] h-full w-0.5 bg-border" />
                    )}
                    <div className="relative mt-1 size-3.5 shrink-0 rounded-sm border-2 border-border bg-primary" />
                    <div className="min-w-0 flex-1">
                      <span className="font-head text-xs font-bold text-muted-foreground">
                        {entry.formattedDate}
                      </span>
                      <p className="font-head text-sm font-semibold">{entry.stage}</p>
                      <p className="mt-0.5 font-sans text-sm text-muted-foreground">{entry.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {(!kit.buildLogs || kit.buildLogs.length === 0) && (
            <p className="py-4 text-center font-head text-sm text-muted-foreground">
              No details yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
