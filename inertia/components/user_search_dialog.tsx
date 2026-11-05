import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { router } from '@inertiajs/react'
import { cn } from 'cn'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from '~/components/ui/command'

interface BskyActor {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

interface UserSearchDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSelect?: (handle: string) => void
  /** `field` shows a 36px search field in the top bar, `icon` a round icon button */
  trigger?: 'field' | 'icon'
  className?: string
}

export function UserSearchDialog({
  open: controlledOpen,
  onOpenChange,
  onSelect,
  trigger = 'field',
  className,
}: UserSearchDialogProps = {}) {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = isControlled ? controlledOpen : internalOpen

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BskyActor[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const setOpen = (val: boolean) => {
    if (!isControlled) setInternalOpen(val)
    onOpenChange?.(val)
    if (!val) {
      setQuery('')
      setResults([])
      setLoading(false)
    }
  }

  const handleQueryChange = (val: string) => {
    setQuery(val)
    if (!val.trim()) {
      setResults([])
      setLoading(false)
    } else {
      setLoading(true)
    }
  }

  useEffect(() => {
    if (isControlled || trigger !== 'field') return
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setInternalOpen((prev) => {
          const next = !prev
          onOpenChange?.(next)
          return next
        })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isControlled, onOpenChange, trigger])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const q = query.trim()
    if (!q) return
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://public.api.bsky.app/xrpc/app.bsky.actor.searchActorsTypeahead?q=${encodeURIComponent(q)}&limit=8`
        )
        if (res.ok) {
          const data = (await res.json()) as { actors: BskyActor[] }
          setResults(data.actors ?? [])
        }
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  function choose(handle: string) {
    setOpen(false)
    if (onSelect) onSelect(handle)
    else router.visit(`/profile/${handle}`)
  }

  return (
    <>
      {!isControlled &&
        (trigger === 'field' ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              'flex h-10 w-60 items-center gap-2 rounded-full bg-surface pr-2 pl-4 text-[15px] text-muted-foreground transition-colors hover:bg-hover hover:text-foreground',
              className
            )}
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 truncate text-left">Find a builder</span>
            <kbd className="rounded-full bg-raised px-2 font-sans text-[13px]/6 text-muted-foreground">
              Ctrl K
            </kbd>
          </button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Find a builder"
            className={className}
          >
            <Search className="size-[18px]" aria-hidden="true" />
          </Button>
        ))}

      <CommandDialog
        open={isOpen}
        onOpenChange={setOpen}
        title="Find a builder"
        description="Search Bluesky and AT Protocol accounts by handle or name"
      >
        <Command shouldFilter={false}>
          <div className="pb-1">
            <CommandInput
              placeholder="Handle or name, e.g. grld.dev"
              value={query}
              onValueChange={handleQueryChange}
            />
          </div>
          <CommandList className="p-1.5">
            {!query && (
              <CommandEmpty>
                Type a handle or a display name to open that builder&apos;s shelf.
              </CommandEmpty>
            )}
            {query && loading && <CommandEmpty>Searching accounts…</CommandEmpty>}
            {query && !loading && results.length === 0 && (
              <CommandEmpty>No account matches &ldquo;{query}&rdquo;.</CommandEmpty>
            )}
            {results.map((actor) => (
              <CommandItem
                key={actor.did}
                value={actor.handle}
                onSelect={() => choose(actor.handle)}
                className="h-14 gap-3 px-2.5"
              >
                <Avatar size="lg">
                  {actor.avatar && <AvatarImage src={actor.avatar} alt="" />}
                  <AvatarFallback>{actor.handle.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {actor.displayName || actor.handle}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">@{actor.handle}</p>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
