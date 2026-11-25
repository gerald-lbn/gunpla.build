import { X } from 'lucide-react'
import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '~/components/ui/dialog'
import { focusClose } from '~/lib/focus'
import { Button } from '~/components/ui/button'
import { PhotoCarousel } from '~/components/photo_carousel'
import { KitDetailActions } from '~/components/kit_detail_actions'
import { KitCommentsList } from '~/components/kits/kit_comments_list'
import { cn } from 'cn'
import { shortHandle } from '~/lib/kits'
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
  ]

  return (
    <div className="relative h-dvh md:h-auto">
      <DialogClose asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          data-autofocus
          aria-label="Close"
          className="absolute top-3 right-3 z-20 size-11 rounded-full bg-[#0b0b0c] text-white hover:bg-black/85 hover:text-white md:top-4 md:right-3.5 md:size-9 md:bg-transparent md:text-muted-foreground md:hover:bg-hover md:hover:text-foreground"
        >
          <X className="size-5 md:size-4.5" aria-hidden="true" />
        </Button>
      </DialogClose>

      <div className="flex size-full min-w-0 flex-col overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)] md:h-[min(720px,calc(100svh-2rem))] md:flex-row md:overflow-hidden md:pb-0">
        <div className="h-[58svh] w-full shrink-0 md:h-full md:w-auto md:flex-1">
          <PhotoCarousel photos={kit.photos} alt={kit.name} />
        </div>

        <div className="flex min-h-0 min-w-0 flex-col md:w-[380px] md:shrink-0">
          <div className="px-5 pt-5 md:pr-14">
            <DialogTitle className="display text-[32px] wrap-break-word md:text-[40px]">
              {kit.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {`${kit.name} by @${handle ?? 'unknown'}: photos, likes and comments`}
            </DialogDescription>
          </div>

          <dl className="mx-5 mt-5 grid grid-cols-3 gap-x-4 gap-y-3 rounded-[20px] bg-surface p-4 text-[15px]">
            {specRows.map((row) => (
              <div key={row.label}>
                <dt className="text-sm text-muted-foreground">{row.label}</dt>
                <dd className={cn('truncate font-semibold', row.value === '—' && 'text-faint')}>
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
              className="mx-3 mt-3 flex items-center gap-3 rounded-full p-2 transition-colors hover:bg-hover"
            >
              <Avatar size="lg">
                {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
                <AvatarFallback>{shortHandle(handle).slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold">{displayName || `@${handle}`}</p>
                <p className="truncate text-sm text-muted-foreground">
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
    </div>
  )
}

export function KitDetailDialog({
  kit,
  onClose,
}: {
  kit: KitForPanel | null
  onClose: () => void
}) {
  return (
    <Dialog open={!!kit} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[calc(100svh-2rem)] max-w-[calc(100%-2rem)] overflow-hidden p-0 max-md:inset-0 max-md:h-dvh max-md:max-h-none max-md:w-full max-md:max-w-none max-md:translate-none max-md:rounded-none max-md:ring-0 sm:max-w-5xl"
        showCloseButton={false}
        onOpenAutoFocus={focusClose}
      >
        {kit && <KitDetailPanel kit={kit} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}
