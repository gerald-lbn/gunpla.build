import {
  asAtprotoDid,
  AtprotoHandleResolverNode,
  DidResolverCommon,
} from '@atproto/oauth-client-node'
import { isAtUriString, isValidHandle, isValidDid, normalizeHandle, AtUri } from '@atproto/syntax'

import type { ResolvedIdentity } from '#types/profile'

export default class IdentityService {
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
        const handleUri = doc.alsoKnownAs?.find((uri) => isAtUriString(uri))
        if (!handleUri) return null
        const handle = new AtUri(handleUri).hostname
        if (!isValidHandle(handle)) return null
        const pdsService = doc.service?.find((s) => s.id === '#atproto_pds')
        const pdsUrl =
          pdsService && typeof pdsService.serviceEndpoint === 'string'
            ? pdsService.serviceEndpoint
            : null
        return { did, handle: normalizeHandle(handle), pdsUrl }
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
