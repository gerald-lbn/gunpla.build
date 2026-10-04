import {
  asAtprotoDid,
  AtprotoHandleResolverNode,
  DidResolverCommon,
} from '@atproto/oauth-client-node'
import { isValidHandle, AtUri } from '@atproto/syntax'

export interface ResolvedIdentity {
  did: string
  handle: string
}

export class IdentityService {
  private handleResolver = new AtprotoHandleResolverNode()
  private didResolver = new DidResolverCommon()

  async resolve(identifier: string): Promise<ResolvedIdentity | null> {
    const clean = identifier.trim().replace(/^@/, '')
    if (!clean) return null

    if (clean.startsWith('did:')) {
      try {
        const did = asAtprotoDid(clean)
        const doc = await this.didResolver.resolve(did)
        if (!doc) return null
        const handleUri = doc.alsoKnownAs?.find((uri) => uri.startsWith('at://'))
        const handle = handleUri ? new AtUri(handleUri).hostname : clean
        return { did, handle }
      } catch {
        return null
      }
    }

    if (!isValidHandle(clean)) {
      return null
    }

    try {
      const did = await this.handleResolver.resolve(clean)
      if (!did) return null
      return { did, handle: clean }
    } catch {
      return null
    }
  }
}
