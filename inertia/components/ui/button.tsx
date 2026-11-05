import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

/**
 * Buttons are fully round and flat, the shape of a sticker. The one primary action per screen
 * is Federation blue with black text; everything else is a grey runner step, or plain text.
 * A press squashes the button a little, the way a sticker is pressed on.
 */
const buttonVariants = cva(
  cn(
    'group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none',
    'transition-[background-color,color,transform,opacity] duration-150 hover:-translate-y-px active:translate-y-0 active:scale-[0.96]',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60',
    'aria-invalid:ring-2 aria-invalid:ring-destructive aria-invalid:ring-inset',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
  ),
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
        destructive: 'bg-shield text-on-colour hover:bg-negative hover:text-white',
        outline: 'bg-secondary text-foreground hover:bg-secondary-hover',
        ghost: 'bg-transparent text-muted-foreground hover:bg-hover hover:text-foreground',
        ink: 'bg-foreground text-background hover:opacity-85',
        link: 'h-auto! rounded-none bg-transparent p-0! text-foreground underline-offset-4 hover:translate-y-0 hover:underline',
      },
      size: {
        'default': 'h-10 px-5 text-[15px]',
        'xs': 'h-7 px-3 text-sm',
        'sm': 'h-9 px-4 text-sm',
        'lg': 'h-12 px-6 text-[17px]',
        'xl': 'h-14 px-8 text-[17px]',
        'icon': 'size-10',
        'icon-xs': 'size-7',
        'icon-sm': 'size-9',
        'icon-lg': 'size-12',
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
