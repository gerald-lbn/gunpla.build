import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-10 w-full min-w-0 rounded-md border border-control bg-input px-3 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-faint hover:border-faint focus-visible:border-foreground focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  )
}

export { Input }
