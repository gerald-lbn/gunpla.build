import BaseLayout from '~/layouts/base'
import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import { UserSearchDialog } from '~/components/user_search_dialog'

interface NotFoundProps {
  handle?: string
}

export default function NotFound({ handle }: NotFoundProps) {
  const displayHandle = handle ? (handle.startsWith('@') ? handle : `@${handle}`) : null

  return (
    <div className="column pt-8">
      <Head title={displayHandle ? `${displayHandle} not found` : 'Page not found'} />
      <div className="max-w-xl cut-lg bg-card p-6 sm:p-8">
        <p className="text-sm text-muted-foreground num">Error 404</p>
        <h1 className="mt-1 text-2xl leading-8 font-semibold tracking-[-0.01em]">
          {displayHandle ? `No shelf at ${displayHandle}` : 'This page is not on the shelf'}
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
          {displayHandle
            ? `${displayHandle} doesn't resolve to an AT Protocol account. The handle may be mistyped, or its owner may have changed it.`
            : 'The address may be mistyped, or the kit it pointed to was deleted from its builder’s repository.'}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button render={<Link route="home" />}>See the latest builds</Button>
          {displayHandle && <UserSearchDialog trigger="field" className="w-64" />}
        </div>
      </div>
    </div>
  )
}

NotFound.layout = [BaseLayout]
