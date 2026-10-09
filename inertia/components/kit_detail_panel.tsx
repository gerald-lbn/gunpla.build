import { X } from 'lucide-react'
import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import { DialogClose } from '~/components/ui/dialog'
import { PhotoCarousel } from '~/components/photo_carousel'
import { StatusBadge } from '~/components/kit_preview'
import { KitDetailActions } from '~/components/kit_detail_actions'
import type { PhotoItem } from '#kits/transformers/kit_transformer'

interface KitForPanel {
  handle: string | null
  author?: {
    avatarUrl: string | null
    displayName: string | null
    handle: string | null
  } | null
  name: string
  grade: string | null
  scale: string | null
  manufacturer: string | null
  status: string
  acquiredAt: string | null
  photos: PhotoItem[]
  rkey: string
  likeCount?: number
  viewerHasLiked?: boolean
}

interface KitDetailPanelProps {
  kit: KitForPanel
  onClose: () => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function KitDetailPanel({ kit, onClose }: KitDetailPanelProps) {
  const page = usePage()
  const isGuest = !page.props.user

  const handle = kit.author?.handle ?? kit.handle
  const displayName = kit.author?.displayName
  const avatarUrl = kit.author?.avatarUrl
  const shortHandle = (handle ?? '').split('.')[0]

  return (
    <div className="flex max-h-[calc(100svh-2rem)] flex-col sm:h-[min(680px,calc(100svh-2rem))] sm:flex-row">
      {/* Left — carousel */}
      <div className="h-64 w-full shrink-0 sm:h-full sm:w-72 md:w-80">
        <PhotoCarousel photos={kit.photos} />
      </div>

      {/* Right — info panel */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Author row */}
        <div className="flex items-center gap-3 border-b-2 border-border px-5 py-3">
          <Link
            route="profile"
            routeParams={[handle ?? '']}
            className="flex min-w-0 flex-1 items-center gap-2.5 hover:opacity-80"
            onClick={onClose}
          >
            <Avatar size="default">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName ?? shortHandle} />}
              <AvatarFallback>{shortHandle.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              {displayName && (
                <p className="truncate font-head text-sm font-semibold leading-tight">
                  {displayName}
                </p>
              )}
              <p className="truncate font-mono text-xs text-muted-foreground">@{shortHandle}</p>
            </div>
          </Link>
        </div>

        {/* Kit header */}
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
            {kit.manufacturer && (
              <p className="mt-0.5 font-sans text-sm text-muted-foreground">{kit.manufacturer}</p>
            )}
          </div>
          <DialogClose asChild>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded border-2 border-border bg-card shadow-[2px_2px_0_0_hsl(var(--border))] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-none"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogClose>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={kit.status} />
            {kit.acquiredAt && (
              <span className="font-sans text-sm text-muted-foreground">
                Acquired {formatDate(kit.acquiredAt)}
              </span>
            )}
          </div>

          <p className="mt-4 font-sans text-sm text-muted-foreground">No comments yet</p>
        </div>

        {/* Actions — anchored to bottom */}
        <KitDetailActions
          key={kit.rkey}
          handle={handle}
          rkey={kit.rkey}
          likeCount={kit.likeCount}
          viewerHasLiked={kit.viewerHasLiked}
          isGuest={isGuest}
        />
      </div>
    </div>
  )
}
