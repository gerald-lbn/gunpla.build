import { useEffect, type CSSProperties } from 'react'

/**
 * The entrance for the parts of every section: anything marked `data-rise` starts low and
 * transparent (only once script has run, see `.js [data-rise]` in app.css) and rises into place
 * the first time it enters the screen. Pass the page URL so a visit re-scans the new page.
 */
export function useRise(key: string) {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const seen = new WeakSet<Element>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    )
    const scan = () => {
      document.querySelectorAll('[data-rise]:not(.is-in)').forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        io.observe(el)
      })
    }
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [key])
}

/** Props for one part of a section that rises in turn: `{...rise(1)}`. */
export function rise(i = 0) {
  return { 'data-rise': '', 'style': { '--rise-i': i } as CSSProperties }
}
