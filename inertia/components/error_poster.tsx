import type { ReactNode } from 'react'
import { cn } from 'cn'

/**
 * One block of the error code, in the runner colours of the footer wordmark. A `missing`
 * block is the empty slot a part leaves on the runner once it has been nipped off.
 */
export type CodeBlock = {
  digit: string
  height: number
  tone: 'vfin' | 'fed-blue' | 'shield' | 'runner' | 'ink' | 'missing'
}

const TONES: Record<CodeBlock['tone'], string> = {
  'vfin': 'bg-vfin text-on-colour',
  'fed-blue': 'bg-fed-blue text-on-colour',
  'shield': 'bg-shield text-on-colour',
  'runner': 'bg-runner text-on-colour',
  'ink': 'bg-foreground text-background',
  'missing':
    'border-[3px] border-dashed border-foreground/25 text-transparent [-webkit-text-stroke:2px_color-mix(in_oklab,var(--color-foreground)_25%,transparent)]',
}

/**
 * An error page on the plain ground: what went wrong in the display face, one plain
 * sentence on why, the way out, and the error code set as blocks on a runner.
 */
export function ErrorPoster({
  code,
  title,
  body,
  actions,
}: {
  code: CodeBlock[]
  title: string[]
  body: ReactNode
  actions: ReactNode
}) {
  return (
    <section className="column grid min-h-[calc(100svh-4rem)] content-center gap-x-4 gap-y-12 py-12 md:py-16 lg:grid-cols-12 lg:py-20">
      <div className="flex flex-col justify-center lg:col-span-6">
        <h1 className="display text-[clamp(3.5rem,2rem+7vw,7.5rem)] wrap-break-word">
          {title.map((line) => (
            <span key={line} className="mask-line">
              <span>{line}</span>
            </span>
          ))}
        </h1>
        <div className="after-mask">
          <p className="mt-8 max-w-[44ch] text-lead/snug wrap-break-word">{body}</p>
          <div className="mt-10 flex flex-wrap items-center gap-2">{actions}</div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="grid h-[clamp(200px,34svh,280px)] grid-cols-3 gap-2 lg:col-span-6 lg:h-[min(62svh,560px)] lg:gap-3"
      >
        {code.map((block, i) => (
          <div key={i} className="mask-line h-full">
            <span
              className="flex h-full items-end"
              style={{ animationDelay: `${120 + i * 110}ms` }}
            >
              <span
                className={cn(
                  'flex w-full items-end justify-center rounded-[20px] pb-[0.04em] leading-[0.8] font-extrabold font-stretch-62%',
                  'text-[clamp(120px,30vw,200px)] transition-transform duration-200 ease-out hover:-translate-y-1 lg:text-[clamp(160px,15vw,300px)]',
                  TONES[block.tone]
                )}
                style={{ height: `${block.height}%` }}
              >
                {block.digit}
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
