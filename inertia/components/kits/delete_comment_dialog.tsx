import { useHttp } from '@adonisjs/inertia/react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'

interface DeleteCommentDialogProps {
  commentId: number
  handle: string
  rkey: string
  onDeleted: (id: number) => void
  onCancel: () => void
}

export function DeleteCommentDialog({
  commentId,
  handle,
  rkey,
  onDeleted,
  onCancel,
}: DeleteCommentDialogProps) {
  const request = useHttp({
    route: 'kits.comments.destroy',
    routeParams: [handle, rkey, commentId],
  })

  async function handleConfirm() {
    try {
      await request.submit()
      onDeleted(commentId)
    } catch {
      toast.error("Couldn't delete comment. Please try again.")
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete comment?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onCancel} disabled={request.processing}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={request.processing}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
