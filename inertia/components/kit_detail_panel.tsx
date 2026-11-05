import { X } from 'lucide-react'
import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import { DialogClose, DialogDescription, DialogTitle } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { PhotoCarousel } from '~/components/photo_carousel'
import { StatusBadge } from '~/components/kit_preview'
import { KitDetailActions } from '~/components/kit_detail_actions'
import { KitCommentsList } from '~/components/kits/kit_comments_list'
import { cn } from 'cn'
import { formatDate, shortHandle } from '~/lib/kits'
import { timeAgo } from '~/lib/time'
import type { PhotoItem } from '#kits/transformers/kit_transformer'

interface KitForPanel {
  uri?: string
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
  indexedAt?: string
  photos: PhotoItem[]
  rkey: string
  likeCount?: number
  viewerHasLiked?: boolean
}

interface KitDetailPanelProps {
  kit: KitForPanel
  onClose: () => void
}

export function KitDetailPanel({ kit, onClose }: KitDetailPanelProps) {
  const page = usePage()
  const isGuest = !page.props.user

  const handle = kit.author?.handle ?? kit.handle
  const displayName = kit.author?.displayName
  const avatarUrl = kit.author?.avatarUrl
  const specRows = [
    { label: 'Grade', value: kit.grade || '—' },
    { label: 'Scale', value: kit.scale || '—' },
    { label: 'Manufacturer', value: kit.manufacturer || '—' },
    { label: 'Photos', value: String(kit.photos.length) },
    { label: 'Acquired', value: kit.acquiredAt ? formatDate(kit.acquiredAt, 'short') : '—' },
    { label: 'Logged', value: kit.indexedAt ? timeAgo(kit.indexedAt) : '—' },
  ]

  return (
    <div className="flex max-h-[calc(100svh-2rem)] w-full min-w-0 flex-col overflow-y-auto md:h-[min(720px,calc(100svh-2rem))] md:flex-row md:overflow-hidden">
      <div className="h-[min(56svh,420px)] w-full shrink-0 md:h-full md:w-auto md:flex-1">
        <PhotoCarousel photos={kit.photos} alt={kit.name} />
      </div>

      <div className="flex min-h-0 min-w-0 flex-col md:w-[380px] md:shrink-0">
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div className="min-w-0">
            <StatusBadge status={kit.status} />
            <DialogTitle className="mt-2 text-xl leading-7 font-semibold">{kit.name}</DialogTitle>
            <DialogDescription className="sr-only">
              {`${kit.name} by @${handle ?? 'unknown'}: photos, likes and comments`}
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              data-autofocus
              aria-label="Close"
              className="-mt-1 -mr-1.5"
            >
              <X className="size-[18px]" aria-hidden="true" />
            </Button>
          </DialogClose>
        </div>

        {/* The spec sheet, as on the side of the box */}
        <dl className="mx-5 mt-4 grid grid-cols-2 gap-px overflow-hidden bg-rule text-sm">
          {specRows.map((row) => (
            <div key={row.label} className="bg-surface px-3 py-2">
              <dt className="text-xs text-muted-foreground">{row.label}</dt>
              <dd className={cn('mt-0.5 truncate', row.value === '—' && 'text-faint')}>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        {handle && (
          <Link
            route="profile"
            routeParams={[handle]}
            onClick={onClose}
            className="mx-3 mt-4 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-hover"
          >
            <Avatar size="lg">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
              <AvatarFallback>{shortHandle(handle).slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{displayName || `@${handle}`}</p>
              <p className="truncate text-xs text-muted-foreground">
                {displayName ? `@${handle} · ` : ''}open shelf
              </p>
            </div>
          </Link>
        )}

        <KitDetailActions
          key={kit.rkey}
          uri={kit.uri}
          handle={handle}
          rkey={kit.rkey}
          kitName={kit.name}
          likeCount={kit.likeCount}
          viewerHasLiked={kit.viewerHasLiked}
          isGuest={isGuest}
        />

        <div className="min-h-0 flex-1 px-5 pb-5 md:overflow-y-auto">
          <KitCommentsList
            handle={handle ?? ''}
            rkey={kit.rkey}
            kitUri={kit.uri}
            isGuest={isGuest}
          />
        </div>
      </div>
    </div>
  )
}
