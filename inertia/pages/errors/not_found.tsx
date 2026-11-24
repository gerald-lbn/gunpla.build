import BaseLayout from '~/layouts/base'
import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import { UserSearchDialog } from '~/components/user_search_dialog'
import { ErrorPoster, type CodeBlock } from '~/components/error_poster'

interface NotFoundProps {
  handle?: string
}

/* 4, an empty slot where the 0 was nipped off, 4 */
const CODE: CodeBlock[] = [
  { digit: '4', height: 92, tone: 'vfin' },
  { digit: '0', height: 74, tone: 'missing' },
  { digit: '4', height: 84, tone: 'fed-blue' },
]

export default function NotFound({ handle }: NotFoundProps) {
  const displayHandle = handle ? (handle.startsWith('@') ? handle : `@${handle}`) : null

  if (displayHandle) {
    return (
      <>
        <Head title={`${displayHandle} not found`} />
        <ErrorPoster
          code={CODE}
          title={['No builder', 'by that name']}
          body={
            <>
              <strong className="font-semibold">{displayHandle}</strong> isn&apos;t an AT Protocol
              account. Check the spelling, or search for the builder by their handle.
            </>
          }
          actions={
            <>
              <UserSearchDialog trigger="field" className="h-14 w-72 max-w-full" />
              <Button size="xl" variant="ink" render={<Link route="home" />}>
                See the latest builds
              </Button>
            </>
          }
        />
      </>
    )
  }

  return (
    <>
      <Head title="Page not found" />
      <ErrorPoster
        code={CODE}
        title={['This page', 'isn’t here']}
        body="The link may have a typo, or the kit it pointed to was deleted from its builder’s repository."
        actions={
          <>
            <Button size="xl" render={<Link route="home" />}>
              See the latest builds
            </Button>
            <Button size="xl" variant="ink" render={<Link route="explore" />}>
              Explore builds
            </Button>
          </>
        }
      />
    </>
  )
}

NotFound.layout = [BaseLayout]
