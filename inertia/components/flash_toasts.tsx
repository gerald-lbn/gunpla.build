import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { router, usePage } from '@inertiajs/react'
import { CircleAlert, CircleCheck } from 'lucide-react'

export default function FlashToasts() {
  const { flash } = usePage()

  useEffect(() => {
    return router.on('start', () => toast.dismiss('flash'))
  }, [])

  useEffect(() => {
    if (flash.error) toast.error(flash.error, { id: 'flash' })
    if (flash.success) toast.success(flash.success, { id: 'flash' })
  }, [flash])

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-[360px] items-center gap-3 border border-border bg-popover px-4 py-3 text-xs text-popover-foreground',
          icon: 'shrink-0',
          error: '[&_svg]:text-destructive',
        },
      }}
      icons={{
        success: <CircleCheck className="size-4" />,
        error: <CircleAlert className="size-4" />,
      }}
    />
  )
}
