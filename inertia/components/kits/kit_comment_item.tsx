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
    <div className="flex gap-2.5 py-2.5">
      <Avatar size="sm" className="mt-0.5 shrink-0">
        {author?.avatarUrl && (
          <AvatarImage src={author.avatarUrl} alt={author.displayName ?? handle} />
        )}
        <AvatarFallback>{shortHandle}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
          {author?.displayName && (
            <span className="font-head text-xs font-semibold leading-tight">
              {author.displayName}
            </span>
          )}
          <span className="font-mono text-xs text-muted-foreground">@{handle.split('.')[0]}</span>
          {comment.createdAt && (
            <span className="font-sans text-xs text-muted-foreground">
              · {formatRelative(comment.createdAt)}
            </span>
          )}
        </div>
        <p className="mt-0.5 wrap-break-word font-sans text-xs leading-relaxed">{comment.text}</p>
      </div>

      {isOwner && (
        <button
          type="button"
          onClick={() => onDelete(comment.id)}
          aria-label="Delete comment"
          className="mt-0.5 shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 className="size-3" />
        </button>
      )}
    </div>
  )
}
