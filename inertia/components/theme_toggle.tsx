import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { usePage } from '@inertiajs/react'
import { Button } from '~/components/ui/button'

const COOKIE = 'app_theme'
const ONE_YEAR = 60 * 60 * 24 * 365

export default function ThemeToggle({
  variant = 'ghost',
  size = 'icon-sm',
  className,
}: {
  variant?: React.ComponentProps<typeof Button>['variant']
  size?: React.ComponentProps<typeof Button>['size']
  className?: string
} = {}) {
  const page = usePage()
  const [theme, setTheme] = useState<'light' | 'dark'>(page.props.preferences?.theme ?? 'light')

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    document.cookie = `${COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`
  }

  const isDark = theme === 'dark'
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}
