import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit flex-none shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[2px] px-2 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-foreground [a]:hover:bg-secondary-hover',
        secondary: 'bg-secondary text-muted-foreground [a]:hover:bg-secondary-hover',
        vfin: 'bg-vfin-tint text-vfin-ink',
        destructive: 'bg-negative-tint text-negative',
        outline: 'bg-transparent text-foreground ring-1 ring-control ring-inset [a]:hover:bg-hover',
        blue: 'bg-fed-blue-tint text-fed-blue-ink',
        ghost: 'bg-transparent hover:bg-hover hover:text-foreground',
        link: 'bg-transparent text-foreground underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
