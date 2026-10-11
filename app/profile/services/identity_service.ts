import {
  asAtprotoDid,
  AtprotoHandleResolverNode,
  DidResolverCommon,
} from '@atproto/oauth-client-node'
import { isValidHandle, isValidDid, isValidAtUri, normalizeHandle, AtUri } from '@atproto/syntax'

export type ResolvedIdentity = {
  did: string
  handle: string
}

export class IdentityService {
  private handleResolver = new AtprotoHandleResolverNode()
  private didResolver = new DidResolverCommon()

  async resolve(identifier: string): Promise<ResolvedIdentity | null> {
    const raw = identifier.trim()
    if (!raw) return null

    if (isValidDid(raw)) {
      try {
        const did = asAtprotoDid(raw)
        const doc = await this.didResolver.resolve(did)
        if (!doc) return null
        const handleUri = doc.alsoKnownAs?.find((uri) => isValidAtUri(uri))
        if (!handleUri) return null
        const handle = new AtUri(handleUri).hostname
        if (!isValidHandle(handle)) return null
        return { did, handle: normalizeHandle(handle) }
      } catch {
        return null
      }
    }

    const clean = raw.startsWith('@') ? raw.slice(1) : raw
    if (!isValidHandle(clean)) {
      return null
    }
    const normalizedHandle = normalizeHandle(clean)

    try {
      const did = await this.handleResolver.resolve(normalizedHandle)
      if (!did) return null
      return { did, handle: normalizedHandle }
    } catch {
      return null
    }
  }
}
