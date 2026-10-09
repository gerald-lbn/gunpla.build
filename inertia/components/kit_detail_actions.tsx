import { useState, useOptimistic, useTransition } from 'react'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { useHttp } from '@adonisjs/inertia/react'
import { cn } from 'cn'

interface KitDetailActionsProps {
  handle: string | null
  rkey: string
  kitName?: string
  likeCount?: number
  viewerHasLiked?: boolean
  isGuest?: boolean
}

export function KitDetailActions({
  handle,
  rkey,
  kitName,
  likeCount = 0,
  viewerHasLiked = false,
  isGuest = false,
}: KitDetailActionsProps) {
  const [committed, setCommitted] = useState({
    likeCount,
    viewerHasLiked,
  })

  const [optimistic, setOptimistic] = useOptimistic(
    committed,
    (_current, update: { likeCount: number; viewerHasLiked: boolean }) => update
  )

  const [isPending, startTransition] = useTransition()

  const likeHttp = useHttp({
    route: 'kits.like',
    routeParams: [handle ?? '', rkey],
  })

  const unlikeHttp = useHttp({
    route: 'kits.unlike',
    routeParams: [handle ?? '', rkey],
  })

  function handleLikeClick() {
    if (isGuest) {
      toast('Sign in to like kits')
      return
    }

    if (isPending || !handle) {
      return
    }

    startTransition(async () => {
      if (optimistic.viewerHasLiked) {
        setOptimistic({
          viewerHasLiked: false,
          likeCount: Math.max(0, optimistic.likeCount - 1),
        })

        const res = await unlikeHttp.submit()
        setCommitted({
          likeCount: res.likeCount,
          viewerHasLiked: res.viewerHasLiked,
        })
      } else {
        setOptimistic({
          viewerHasLiked: true,
          likeCount: optimistic.likeCount + 1,
        })

        const res = await likeHttp.submit()
        setCommitted({
          likeCount: res.likeCount,
          viewerHasLiked: res.viewerHasLiked,
        })
      }
    })
  }

  async function handleShare() {
    const url = window.location.origin + '/profile/' + handle + '/kit/' + rkey
    const title = kitName
      ? `${kitName} by @${handle} on Gunpla Build`
      : `Build by @${handle} on Gunpla Build`

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url })
        return
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied')
    } catch {
      toast.error("Couldn't copy link. Please try again.")
    }
  }

  return (
    <div className="border-t-2 border-border px-5 py-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleLikeClick}
          disabled={isPending}
          aria-label={optimistic.viewerHasLiked ? 'Unlike' : 'Like'}
          className={cn(
            'flex items-center justify-center rounded border-2 border-border bg-card p-1.5 transition-all shadow-[2px_2px_0_0_hsl(var(--border))]',
            isPending
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:translate-x-px hover:translate-y-px hover:shadow-none'
          )}
        >
          <Heart
            className={cn(
              'size-4 transition-colors',
              optimistic.viewerHasLiked ? 'fill-red-500 text-red-500' : 'text-foreground'
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
          <Share2 className="size-4" />
        </button>
      </div>

      <p className="mt-2 font-head text-xs font-semibold text-muted-foreground">
        {optimistic.likeCount} {optimistic.likeCount === 1 ? 'like' : 'likes'}
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
