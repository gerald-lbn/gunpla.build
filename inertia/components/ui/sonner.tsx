import { useState, useEffect } from 'react'
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

function useAppTheme(): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document === 'undefined') return 'light'
    return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') ?? 'light'
  })

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute('data-theme') as 'light' | 'dark'
      setTheme(t ?? 'light')
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  return theme
}

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useAppTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'group/toast relative flex w-(--width) items-center gap-3 rounded border-2 border-border bg-popover p-4 font-sans text-popover-foreground shadow-md',
          content: 'flex min-w-0 flex-col gap-0.5',
          title: 'font-head text-sm font-medium',
          description: 'text-sm text-muted-foreground',
          icon: 'shrink-0',
          actionButton:
            'ms-auto h-fit min-w-fit shrink-0 rounded border-2 border-border bg-primary px-2 py-1 text-xs font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none',
          cancelButton:
            'ms-auto h-fit min-w-fit shrink-0 rounded border-2 border-border bg-muted px-2 py-1 text-xs font-medium text-foreground shadow-sm transition-all duration-200 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none',
          closeButton:
            'absolute -top-2 -start-2 rounded-full border-2 border-border bg-background p-0.5 transition-colors hover:bg-muted',
          success: '[&_[data-icon]]:text-chart-3',
          warning: '[&_[data-icon]]:text-chart-1',
          error: '[&_[data-icon]]:text-destructive',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
