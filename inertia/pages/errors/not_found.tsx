import BaseLayout from '~/layouts/base'
import { Link } from '@adonisjs/inertia/react'

interface NotFoundProps {
  handle?: string
}

export default function NotFound({ handle }: NotFoundProps) {
  const displayHandle = handle ? (handle.startsWith('@') ? handle : `@${handle}`) : null

  return (
    <div className="home">
      <article className="prose-card">
        <div className="pc-top">
          <span className="pc-status mono tag" style={{ color: 'var(--subtle)' }}>
            <span className="dot" /> 404
          </span>
        </div>
        <div className="pc-lead">
          <span>{displayHandle ? 'Nobody by that name' : 'Not found.'}</span>
          {!displayHandle && <em>That route hasn&apos;t been built yet.</em>}
        </div>
        <p className="pc-para">
          {displayHandle
            ? `${displayHandle} does not resolve to an account. The handle may be mistyped, or its owner may have changed it.`
            : "The page you tried to reach doesn't exist. Check the URL or head back home."}
        </p>
        <div style={{ marginTop: '1.5rem' }}>
          <Link route="home" className="btn btn--secondary btn--sm">
            Back to the feed
          </Link>
        </div>
      </article>
    </div>
  )
}

NotFound.layout = [BaseLayout]
