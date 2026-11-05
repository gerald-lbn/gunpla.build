import * as React from 'react'
import { cn } from 'cn'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-16 w-full rounded-md border-2 border-transparent bg-surface px-4 py-3 text-[16px] transition-colors outline-none placeholder:text-faint hover:border-control focus-visible:border-foreground disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
