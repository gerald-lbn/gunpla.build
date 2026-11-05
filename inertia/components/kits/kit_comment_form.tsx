import { useHttp } from '@adonisjs/inertia/react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { cn } from 'cn'
import { Link } from '@adonisjs/inertia/react'
import type { KitComment } from '~/components/kits/kit_comment_item'

const MAX_LENGTH = 300

interface KitCommentFormProps {
  handle: string
  rkey: string
  isGuest: boolean
  onPosted: (comment: KitComment) => void
}

export function KitCommentForm({ handle, rkey, isGuest, onPosted }: KitCommentFormProps) {
  const form = useHttp({ route: 'kits.comments.store', routeParams: [handle, rkey] }, { text: '' })
  // Tuyau unions kitCommentParamsValidator (used for route-param validation) into the body type,
  // producing {handle,rkey}|{text}. Cast to the actual body fields we populate.
  const formData = form.data as unknown as { text: string }

  if (isGuest) {
    return (
      <p className="rounded-lg bg-surface p-3 text-sm text-muted-foreground">
        <Link route="login" className="text-foreground underline underline-offset-4">
          Sign in with your Bluesky handle
        </Link>{' '}
        to comment on this build.
      </p>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.text.trim() || form.processing) return
    try {
      const comment = await form.submit()
      if (comment) onPosted(comment as unknown as KitComment)
      form.reset()
    } catch {
      toast.error("Couldn't post your comment. Please try again.")
    }
  }

  const remaining = MAX_LENGTH - formData.text.length
  const isOverLimit = remaining < 0

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor={`comment-${rkey}`} className="sr-only">
        Comment on this build
      </label>
      <div className="relative">
        <textarea
          id={`comment-${rkey}`}
          value={formData.text}
          onChange={(e) => (form.setData as (k: string, v: string) => void)('text', e.target.value)}
          placeholder="Ask about the paint, the panel lining, the pose…"
          rows={2}
          disabled={form.processing}
          className={cn(
            'w-full resize-none rounded-lg border-2 border-transparent bg-surface px-3 pt-2.5 pb-6 text-sm/5 placeholder:text-faint hover:border-control focus:border-foreground focus:outline-none disabled:opacity-60',
            isOverLimit && 'border-destructive'
          )}
        />
        <span
          className={cn(
            'num absolute right-3 bottom-2 text-xs',
            isOverLimit ? 'text-negative' : remaining <= 20 ? 'text-muted-foreground' : 'text-faint'
          )}
        >
          {remaining}
        </span>
      </div>
      <div className="mt-2 flex justify-end">
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          disabled={form.processing || !formData.text.trim() || isOverLimit}
        >
          {form.processing ? 'Posting…' : 'Post comment'}
        </Button>
      </div>
    </form>
  )
}
