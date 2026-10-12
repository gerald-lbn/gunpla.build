import { useState, useEffect, useCallback } from 'react'
import { usePage } from '@inertiajs/react'
import { Loader2 } from 'lucide-react'
import { transmit } from '~/services/transmit'
import { urlFor } from '~/client'
import { Button } from '~/components/ui/button'
import { KitCommentItem } from '~/components/kits/kit_comment_item'
import { KitCommentForm } from '~/components/kits/kit_comment_form'
import { DeleteCommentDialog } from '~/components/kits/delete_comment_dialog'
import type { KitComment } from '~/components/kits/kit_comment_item'

interface CommentPayload {
  type?: string
  kitUri?: string
  comment?: KitComment
  commentId?: number
}

interface PaginatedComments {
  data: KitComment[]
  metadata: { hasMorePages: boolean; currentPage: number }
}

interface KitCommentsListProps {
  handle: string
  rkey: string
  kitUri?: string
  isGuest: boolean
}

export function KitCommentsList({ handle, rkey, kitUri, isGuest }: KitCommentsListProps) {
  const viewerDid = usePage().props.user?.did

  const [comments, setComments] = useState<KitComment[]>([])
  const [hasMorePages, setHasMorePages] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadPage = useCallback(
    async (pageNum: number) => {
      try {
        const base = urlFor('kits.comments.index', { handle, rkey })
        const res = await fetch(`${base}?page=${pageNum}`)
        const data = (await res.json()) as PaginatedComments
        setComments((prev) => (pageNum === 1 ? data.data : [...prev, ...data.data]))
        setHasMorePages(data.metadata.hasMorePages)
        setPage(pageNum)
      } finally {
        setLoading(false)
      }
    },
    [handle, rkey]
  )

  useEffect(() => {
    loadPage(1).catch(() => {})
  }, [loadPage])

  useEffect(() => {
    const subscription = transmit.subscription('kits')
    subscription.create().catch(() => {})

    const stop = subscription.onMessage((msg: unknown) => {
      const payload = msg as CommentPayload
      if (!payload.kitUri || payload.kitUri !== kitUri) return

      if (payload.type === 'comment_created' && payload.comment) {
        const incoming = payload.comment
        setComments((prev) => (prev.some((c) => c.id === incoming.id) ? prev : [incoming, ...prev]))
      }
      if (payload.type === 'comment_deleted' && payload.commentId) {
        setComments((prev) => prev.filter((c) => c.id !== payload.commentId))
      }
    })

    return () => {
      stop()
      subscription.delete().catch(() => {})
    }
  }, [kitUri])

  function handlePosted(comment: KitComment) {
    setComments((prev) => (prev.some((c) => c.id === comment.id) ? prev : [comment, ...prev]))
  }

  function handleDeleted(id: number) {
    setComments((prev) => prev.filter((c) => c.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="mt-4">
      <KitCommentForm handle={handle} rkey={rkey} isGuest={isGuest} onPosted={handlePosted} />

      {loading && comments.length === 0 ? (
        <div className="flex justify-center py-4">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="py-2 font-sans text-xs text-muted-foreground">No comments yet.</p>
      ) : (
        <div className="divide-y divide-border">
          {comments.map((comment) => (
            <KitCommentItem
              key={comment.id}
              comment={comment}
              viewerDid={viewerDid}
              onDelete={setDeletingId}
            />
          ))}
        </div>
      )}

      {hasMorePages && (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => {
            setLoading(true)
            loadPage(page + 1).catch(() => {})
          }}
          disabled={loading}
          className="mt-2 w-full"
        >
          {loading ? <Loader2 className="size-3 animate-spin" /> : 'Load more'}
        </Button>
      )}

      {deletingId !== null && (
        <DeleteCommentDialog
          commentId={deletingId}
          handle={handle}
          rkey={rkey}
          onDeleted={handleDeleted}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  )
}
