import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { router } from '@inertiajs/react'
import { Button } from '~/components/ui/button'
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
}

export function UserSearchDialog({
  open: controlledOpen,
  onOpenChange,
  onSelect,
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
    if (isControlled) return
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
  }, [isControlled, onOpenChange])

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

  return (
    <>
      {!isControlled && (
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setOpen(true)}
          aria-label="Search users"
        >
          <Search className="size-4" aria-hidden="true" />
        </Button>
      )}

      <CommandDialog
        open={isOpen}
        onOpenChange={setOpen}
        title="Search users"
        description="Search for a Bluesky user by handle"
      >
        <Command shouldFilter={false}>
          <div className="border-b-2 border-border">
            <CommandInput
              placeholder="Search by handle…"
              value={query}
              onValueChange={handleQueryChange}
            />
          </div>
          <CommandList>
            {!query && <CommandEmpty>Search for a Bluesky user</CommandEmpty>}
            {query && loading && <CommandEmpty>Searching…</CommandEmpty>}
            {query && !loading && results.length === 0 && (
              <CommandEmpty>No users found for &ldquo;{query}&rdquo;</CommandEmpty>
            )}
            {results.map((actor) =>
              onSelect ? (
                <CommandItem
                  key={actor.did}
                  value={actor.handle}
                  onSelect={() => {
                    onSelect(actor.handle)
                    setOpen(false)
                  }}
                  className="gap-3 rounded-none border-b border-border px-4 py-3 last:border-0"
                >
                  {actor.avatar ? (
                    <img
                      src={actor.avatar}
                      alt=""
                      aria-hidden="true"
                      className="size-9 shrink-0 rounded border border-border object-cover"
                    />
                  ) : (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded border border-border bg-primary font-head text-xs font-bold text-primary-foreground">
                      {actor.handle.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {actor.displayName && (
                      <p className="truncate font-head text-sm font-bold text-foreground">
                        {actor.displayName}
                      </p>
                    )}
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      @{actor.handle}
                    </p>
                  </div>
                </CommandItem>
              ) : (
                <CommandItem
                  key={actor.did}
                  value={actor.handle}
                  onSelect={() => {
                    setOpen(false)
                    router.visit(`/profile/${actor.handle}`)
                  }}
                  className="gap-3 rounded-none border-b border-border px-4 py-3 last:border-0"
                >
                  {actor.avatar ? (
                    <img
                      src={actor.avatar}
                      alt=""
                      aria-hidden="true"
                      className="size-9 shrink-0 rounded border border-border object-cover"
                    />
                  ) : (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded border border-border bg-primary font-head text-xs font-bold text-primary-foreground">
                      {actor.handle.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {actor.displayName && (
                      <p className="truncate font-head text-sm font-bold text-foreground">
                        {actor.displayName}
                      </p>
                    )}
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      @{actor.handle}
                    </p>
                  </div>
                </CommandItem>
              )
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
