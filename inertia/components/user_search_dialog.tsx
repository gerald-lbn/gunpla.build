import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { Link } from '@adonisjs/inertia/react'
import { Dialog, DialogContent } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'

interface BskyActor {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

export function UserSearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BskyActor[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
    }
  }, [open])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://public.api.bsky.app/xrpc/app.bsky.actor.searchActorsTypeahead?q=${encodeURIComponent(query.trim())}&limit=8`
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
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label="Search users"
      >
        <Search className="size-4" aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-md" showCloseButton={false}>
          {/* Input row */}
          <div className="flex items-center gap-3 border-b-2 border-border px-4 py-3">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by handle…"
              className="min-w-0 flex-1 bg-transparent font-sans text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden font-mono text-[10px] text-muted-foreground sm:inline">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {!query && (
              <p className="px-4 py-8 text-center font-mono text-xs text-muted-foreground">
                Search for a Bluesky user
              </p>
            )}
            {query && loading && (
              <p className="px-4 py-8 text-center font-mono text-xs text-muted-foreground">
                Searching…
              </p>
            )}
            {query && !loading && results.length === 0 && (
              <p className="px-4 py-8 text-center font-mono text-xs text-muted-foreground">
                No users found for &ldquo;{query}&rdquo;
              </p>
            )}
            {results.length > 0 && (
              <ul>
                {results.map((actor) => (
                  <li key={actor.did} className="border-b border-border last:border-0">
                    <Link
                      route="profile"
                      routeParams={[actor.handle]}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted"
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
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
