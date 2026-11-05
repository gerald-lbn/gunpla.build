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
          <DialogTitle>Delete your comment?</DialogTitle>
          <DialogDescription>
            It is removed from this build for everyone. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel} disabled={request.processing}>
            Keep comment
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={request.processing}>
            {request.processing ? 'Deleting…' : 'Delete comment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
