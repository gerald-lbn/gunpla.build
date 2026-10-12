import { useState, useOptimistic, useTransition, useEffect } from 'react'
import { Heart, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { useHttp } from '@adonisjs/inertia/react'
import { cn } from 'cn'
import { transmit } from '~/services/transmit'

interface KitDetailActionsProps {
  uri?: string
  handle: string | null
  rkey: string
  kitName?: string
  likeCount?: number
  viewerHasLiked?: boolean
  isGuest?: boolean
}

export function KitDetailActions({
  uri,
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

  // Live real-time subscription for remote likes/unlikes
  useEffect(() => {
    const subscription = transmit.subscription('kits')
    subscription.create().catch(() => {})

    const stop = subscription.onMessage((msg: unknown) => {
      const payload = msg as { type?: string; uri?: string; likeCount?: number }
      if (payload?.type === 'like_update' && typeof payload.likeCount === 'number') {
        const matchesUri = uri && payload.uri === uri
        const matchesRkey = payload.uri?.endsWith(`/${rkey}`)
        if (matchesUri || matchesRkey) {
          setCommitted((prev) => ({
            ...prev,
            likeCount: payload.likeCount!,
          }))
        }
      }
    })

    return () => {
      stop()
      subscription.delete().catch(() => {})
    }
  }, [uri, rkey])

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

        try {
          const res = await unlikeHttp.submit()
          setCommitted({
            likeCount: res.likeCount,
            viewerHasLiked: res.viewerHasLiked,
          })
        } catch (error) {
          toast.error("Couldn't remove your like. Please try again.")
          throw error
        }
      } else {
        setOptimistic({
          viewerHasLiked: true,
          likeCount: optimistic.likeCount + 1,
        })

        try {
          const res = await likeHttp.submit()
          setCommitted({
            likeCount: res.likeCount,
            viewerHasLiked: res.viewerHasLiked,
          })
        } catch (error) {
          toast.error("Couldn't save your like. Please try again.")
          throw error
        }
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
    </div>
  )
}
