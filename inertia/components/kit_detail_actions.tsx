import { useState } from 'react'
import { Heart, MessageCircle, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { useHttp } from '@adonisjs/inertia/react'
import { cn } from 'cn'

interface KitDetailActionsProps {
  handle: string | null
  rkey: string
  likeCount?: number
  viewerHasLiked?: boolean
  isGuest?: boolean
}

export function KitDetailActions({
  handle,
  rkey,
  likeCount = 0,
  viewerHasLiked = false,
  isGuest = false,
}: KitDetailActionsProps) {
  const [localHasLiked, setLocalHasLiked] = useState(viewerHasLiked)
  const [localLikeCount, setLocalLikeCount] = useState(likeCount)

  const likeHttp = useHttp({
    route: 'kits.like',
    routeParams: [handle ?? '', rkey],
  })

  const unlikeHttp = useHttp({
    route: 'kits.unlike',
    routeParams: [handle ?? '', rkey],
  })

  const isSubmitting = likeHttp.processing || unlikeHttp.processing

  function handleLikeClick() {
    if (isGuest) {
      toast('Sign in to like kits')
      return
    }

    if (isSubmitting || !handle) {
      return
    }

    if (localHasLiked) {
      setLocalHasLiked(false)
      setLocalLikeCount((prev) => Math.max(0, prev - 1))

      unlikeHttp.submit({
        onSuccess: (data: any) => {
          if (typeof data?.likeCount === 'number') {
            setLocalLikeCount(data.likeCount)
          }
          if (typeof data?.viewerHasLiked === 'boolean') {
            setLocalHasLiked(data.viewerHasLiked)
          }
        },
        onError: () => {
          setLocalHasLiked(true)
          setLocalLikeCount((prev) => prev + 1)
          toast.error("Couldn't remove your like. Please try again.")
        },
      })
    } else {
      setLocalHasLiked(true)
      setLocalLikeCount((prev) => prev + 1)

      likeHttp.submit({
        onSuccess: (data: any) => {
          if (typeof data?.likeCount === 'number') {
            setLocalLikeCount(data.likeCount)
          }
          if (typeof data?.viewerHasLiked === 'boolean') {
            setLocalHasLiked(data.viewerHasLiked)
          }
        },
        onError: () => {
          setLocalHasLiked(false)
          setLocalLikeCount((prev) => Math.max(0, prev - 1))
          toast.error("Couldn't save your like. Please try again.")
        },
      })
    }
  }

  function handleShare() {
    const url = window.location.origin + '/profile/' + handle + '/kit/' + rkey
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied')
    })
  }

  return (
    <div className="border-t-2 border-border px-5 py-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleLikeClick}
          disabled={isSubmitting}
          aria-label={localHasLiked ? 'Unlike' : 'Like'}
          className={cn(
            'flex items-center justify-center rounded border-2 border-border bg-card p-1.5 transition-all shadow-[2px_2px_0_0_hsl(var(--border))]',
            isSubmitting
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:translate-x-px hover:translate-y-px hover:shadow-none'
          )}
        >
          <Heart
            className={cn(
              'size-4 transition-colors',
              localHasLiked ? 'fill-red-500 text-red-500' : 'text-foreground'
            )}
          />
        </button>
        <button
          type="button"
          disabled
          aria-label="Comment"
          className="flex cursor-not-allowed items-center justify-center rounded border-2 border-border bg-card p-1.5 opacity-50"
        >
          <MessageCircle className="size-4" />
        </button>
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share"
          className="flex cursor-pointer items-center justify-center rounded border-2 border-border bg-card p-1.5 transition-all hover:translate-x-px hover:translate-y-px hover:shadow-none shadow-[2px_2px_0_0_hsl(var(--border))]"
        >
          <Link2 className="size-4" />
        </button>
      </div>

      <p className="mt-2 font-head text-xs font-semibold text-muted-foreground">
        {localLikeCount} {localLikeCount === 1 ? 'like' : 'likes'}
      </p>

      <div className="mt-3">
        <input
          type="text"
          disabled
          placeholder="No comments yet"
          className="w-full cursor-not-allowed rounded border-2 border-border bg-muted px-3 py-2 font-sans text-sm text-muted-foreground opacity-60"
        />
      </div>
    </div>
  )
}
