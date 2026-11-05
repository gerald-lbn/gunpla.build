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
    <section aria-labelledby={`${id}-heading`} className="rounded-[28px] bg-surface p-5 sm:p-8">
      <h2 id={`${id}-heading`} className="text-lead font-bold">
        {title}
      </h2>
      <p className="mt-1 text-[17px]">{description}</p>
      <div className="mt-6 **:data-[slot=input]:bg-background **:data-[slot=select-trigger]:bg-background **:data-[slot=textarea]:bg-background">
        {children}
      </div>
    </section>
  )
}
