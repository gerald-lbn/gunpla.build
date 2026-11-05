import { type ReactNode } from 'react'

/** One part of the kit form: what it covers in a heading and a sentence, then its fields. */
export function FormSection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description: ReactNode
  children: ReactNode
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="cut-lg bg-card p-5 sm:p-6">
      <h2 id={`${id}-heading`} className="text-base font-medium">
        {title}
      </h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  )
}
