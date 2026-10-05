import BaseLayout from '~/layouts/base'
import { Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'

interface NotFoundProps {
  handle?: string
}

export default function NotFound({ handle }: NotFoundProps) {
  const displayHandle = handle ? (handle.startsWith('@') ? handle : `@${handle}`) : null

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-md border-2 border-black bg-card shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-2 border-black bg-primary px-6 py-4">
          <span className="font-mono text-sm font-bold">404</span>
        </div>
        <div className="px-6 py-8">
          <h1 className="font-head text-3xl font-bold">
            {displayHandle ? 'Nobody by that name' : 'Not found'}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {displayHandle
              ? `${displayHandle} does not resolve to an account. The handle may be mistyped, or its owner may have changed it.`
              : "The page you tried to reach doesn't exist. Check the URL or head back home."}
          </p>
          <div className="mt-6">
            <Button size="sm" render={<Link route="home" />}>
              Back to home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

NotFound.layout = [BaseLayout]
