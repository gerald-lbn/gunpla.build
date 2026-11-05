import * as React from 'react'
import { cn } from 'cn'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-16 w-full rounded-md border border-control bg-input px-3 py-2 text-sm transition-colors outline-none placeholder:text-faint hover:border-faint focus-visible:border-foreground disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
