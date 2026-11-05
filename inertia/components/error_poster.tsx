import type { ReactNode } from 'react'

/**
 * An error, set as a poster on shield red: what went wrong in the display face, the plain
 * explanation, the way out, and a runner with its parts still on the gates.
 */
export function ErrorPoster({
  title,
  body,
  actions,
}: {
  title: ReactNode
  body: ReactNode
  actions: ReactNode
}) {
  return (
    <div className="overflow-hidden bg-shield text-on-colour">
      <div className="column grid gap-x-4 gap-y-14 pt-12 pb-16 md:pt-16 lg:grid-cols-12 lg:pb-20">
        <div className="flex flex-col justify-center lg:col-span-7">
          <h1 className="display text-[16vw] wrap-break-word md:text-[11vw] lg:text-[7.2vw] 2xl:text-[104px]">
            {title}
          </h1>
          <p className="mt-8 max-w-[44ch] text-lead/snug wrap-break-word">{body}</p>
          <div className="mt-10 flex flex-wrap items-center gap-2">{actions}</div>
        </div>
        <img
          src="/found/gunpla-model-sprues.jpg"
          width={1600}
          height={1029}
          alt="Runners of a Real Grade Zaku II in two greens, every part still on its gate."
          className="mx-auto aspect-4/5 w-[86%] max-w-[440px] rotate-[4deg] rounded-[28px] object-cover lg:col-span-5 lg:w-full"
        />
      </div>
    </div>
  )
}
