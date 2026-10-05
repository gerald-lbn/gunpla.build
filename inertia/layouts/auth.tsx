import { type ReactNode } from 'react'
import BaseLayout from '~/layouts/base'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <BaseLayout>
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">{children}</main>
    </BaseLayout>
  )
}
