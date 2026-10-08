import { Heart, MessageCircle, Link2 } from 'lucide-react'
import { toast } from 'sonner'

interface KitDetailActionsProps {
  handle: string | null
  rkey: string
}

export function KitDetailActions({ handle, rkey }: KitDetailActionsProps) {
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
          disabled
          aria-label="Like"
          className="flex cursor-not-allowed items-center justify-center rounded border-2 border-border bg-card p-1.5 opacity-50"
        >
          <Heart className="size-4" />
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

      <p className="mt-2 font-head text-xs font-semibold text-muted-foreground">0 likes</p>

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
