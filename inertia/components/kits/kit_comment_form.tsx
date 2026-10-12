import { useHttp } from '@adonisjs/inertia/react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { cn } from 'cn'
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

  if (isGuest) {
    return (
      <p className="py-2 font-sans text-xs text-muted-foreground">
        <a href="/auth/login" className="underline underline-offset-2 hover:text-foreground">
          Sign in
        </a>{' '}
        to leave a comment.
      </p>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.data.text.trim() || form.processing) return
    try {
      const comment = await form.submit()
      if (comment) onPosted(comment as unknown as KitComment)
      form.reset()
    } catch {
      toast.error("Couldn't post your comment. Please try again.")
    }
  }

  const remaining = MAX_LENGTH - form.data.text.length
  const isOverLimit = remaining < 0

  return (
    <form onSubmit={handleSubmit} className="pb-3 pt-1">
      <div className="relative">
        <textarea
          value={form.data.text}
          onChange={(e) => form.setData('text', e.target.value)}
          placeholder="Leave a comment…"
          rows={2}
          disabled={form.processing}
          className={cn(
            'w-full resize-none rounded border-2 border-border bg-card px-3 py-2 font-sans text-xs leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:opacity-60',
            isOverLimit && 'border-destructive'
          )}
        />
        <span
          className={cn(
            'absolute right-2 bottom-2 font-mono text-[10px] tabular-nums',
            remaining <= 20
              ? isOverLimit
                ? 'text-destructive'
                : 'text-amber-500'
              : 'text-muted-foreground/50'
          )}
        >
          {remaining}
        </span>
      </div>
      <div className="mt-1.5 flex justify-end">
        <Button
          type="submit"
          size="xs"
          disabled={form.processing || !form.data.text.trim() || isOverLimit}
        >
          Post
        </Button>
      </div>
    </form>
  )
}
