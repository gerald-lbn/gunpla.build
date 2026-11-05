import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

/**
 * Controls are chamfered plates, cut on two corners like armour. The one primary
 * action per screen is made primary by inversion (white on gunmetal, near-black on
 * light); everything else is a raised plate a lightness step up, or plain text.
 */
const buttonVariants = cva(
  cn(
    'group/button cut-sm inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-none font-medium whitespace-nowrap select-none',
    'transition-[background-color,color,transform,opacity] duration-150 active:scale-[0.97]',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60',
    'aria-invalid:ring-1 aria-invalid:ring-destructive aria-invalid:ring-inset',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
  ),
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
        destructive: 'bg-negative-tint text-negative hover:bg-negative hover:text-white',
        outline: 'bg-secondary/70 text-foreground hover:bg-secondary-hover',
        ghost: 'bg-transparent text-muted-foreground hover:bg-hover hover:text-foreground',
        link: 'h-auto! bg-transparent p-0! text-foreground [clip-path:none]! underline-offset-4 hover:underline',
      },
      size: {
        'default': 'h-9 px-4 text-sm',
        'xs': 'h-7 px-2.5 text-xs',
        'sm': 'h-8 px-3 text-sm',
        'lg': 'h-11 px-5 text-[15px]',
        'icon': 'size-9',
        'icon-xs': 'size-7',
        'icon-sm': 'size-8',
        'icon-lg': 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  render,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    render?: React.ReactElement<{ className?: string; children?: React.ReactNode }>
  }) {
  if (render) {
    return React.cloneElement(
      render,
      {
        ...props,
        className: cn(buttonVariants({ variant, size, className }), render.props.className),
      },
      children ?? render.props.children
    )
  }

  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }
