import { Trash2 } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitCommentTransformer from '#kits/transformers/kit_comment_transformer'

export type KitComment = InferData<KitCommentTransformer>

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface KitCommentItemProps {
  comment: KitComment
  viewerDid?: string
  onDelete: (id: number) => void
}

export function KitCommentItem({ comment, viewerDid, onDelete }: KitCommentItemProps) {
  const { author } = comment
  const handle = author?.handle ?? comment.did
  const shortHandle = handle.split('.')[0]?.slice(0, 2).toUpperCase() ?? '??'
  const isOwner = viewerDid && comment.did === viewerDid

  return (
    <div className="group/comment flex gap-3 py-3">
      <Avatar className="shrink-0">
        {author?.avatarUrl && (
          <AvatarImage src={author.avatarUrl} alt={author.displayName ?? handle} />
        )}
        <AvatarFallback>{shortHandle}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-sm font-medium">{author?.displayName || `@${handle}`}</span>
          <span className="text-sm text-muted-foreground">
            {author?.displayName ? `@${handle.split('.')[0]} · ` : ''}
            {comment.createdAt ? formatRelative(comment.createdAt) : ''}
          </span>
        </div>
        <p className="mt-0.5 text-sm/5 wrap-break-word">{comment.text}</p>
      </div>

      {isOwner && (
        <button
          type="button"
          onClick={() => onDelete(comment.id)}
          aria-label="Delete your comment"
          className="-mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-faint opacity-0 transition-[opacity,color,background-color] group-hover/comment:opacity-100 hover:bg-hover hover:text-negative focus-visible:opacity-100 max-md:opacity-100"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
