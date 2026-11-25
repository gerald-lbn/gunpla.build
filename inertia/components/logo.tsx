import { Link } from '@adonisjs/inertia/react'

/** The gunpla.build wordmark, in ink. */
export function Wordmark() {
  return (
    <Link
      route="home"
      aria-label="gunpla.build, latest builds"
      className="inline-flex h-10 items-center rounded-full text-foreground"
    >
      <span className="text-[24px] leading-none font-extrabold tracking-[-0.02em]">
        gunpla.build
      </span>
    </Link>
  )
}
