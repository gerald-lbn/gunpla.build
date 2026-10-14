import IdentityService from '#profile/services/identity_service'
import type { ResolvedIdentity } from '#types/profile'

export type FakeIdentityOptions = {
  resolver?: (identifier: string) => Promise<ResolvedIdentity | null> | ResolvedIdentity | null
  defaultHandle?: string | null
}

export class FakeIdentityService extends IdentityService {
  constructor(private options: FakeIdentityOptions = {}) {
    super()
  }

  override async resolve(identifier: string): Promise<ResolvedIdentity | null> {
    if (this.options.resolver) {
      return this.options.resolver(identifier)
    }
    if (this.options.defaultHandle === null) {
      return null
    }
    const handle = this.options.defaultHandle ?? 'builder.bsky.social'
    return {
      did: identifier.startsWith('did:') ? identifier : `did:plc:${identifier}`,
      handle,
    }
  }
}
