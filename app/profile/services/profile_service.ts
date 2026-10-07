import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import Kit from '#kits/models/kit'
import BuildLog from '#kits/models/build_log'
import Profile from '#profile/models/profile'
import BuildLogTransformer from '#kits/transformers/build_log_transformer'
import { AchievementsService } from '#profile/services/achievements_service'
import { IdentityService } from '#profile/services/identity_service'

@inject()
export class ProfileService {
  constructor(
    private achievementsService: AchievementsService,
    private identityService: IdentityService
  ) {}

  private async fetchBskyProfile(
    did: string
  ): Promise<{ avatarUrl: string | null; description: string | null; displayName: string | null }> {
    try {
      const url = `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) })
      if (!res.ok) return { avatarUrl: null, description: null, displayName: null }
      const data = (await res.json()) as {
        avatar?: string
        description?: string
        displayName?: string
      }
      return {
        avatarUrl: data.avatar ?? null,
        description: data.description ?? null,
        displayName: data.displayName ?? null,
      }
    } catch {
      return { avatarUrl: null, description: null, displayName: null }
    }
  }

  async syncProfile(did: string, knownHandle?: string): Promise<Profile> {
    const existing = await Profile.find(did)
    const resolvedIdentity = await this.identityService.resolve(did)
    const bskyProfile = await this.fetchBskyProfile(did)

    const handle =
      knownHandle && !knownHandle.startsWith('did:')
        ? knownHandle
        : (resolvedIdentity?.handle ?? existing?.handle ?? did)

    const now = DateTime.now()
    if (existing) {
      existing.handle = handle
      if (bskyProfile.displayName !== null) existing.displayName = bskyProfile.displayName
      if (bskyProfile.avatarUrl !== null) existing.avatarUrl = bskyProfile.avatarUrl
      if (bskyProfile.description !== null) existing.description = bskyProfile.description
      existing.indexedAt = now
      await existing.save()
      return existing
    }

    return Profile.create({
      did,
      handle,
      displayName: bskyProfile.displayName,
      avatarUrl: bskyProfile.avatarUrl,
      description: bskyProfile.description,
      indexedAt: now,
    })
  }

  async getOrCreate(did: string): Promise<Profile> {
    const existing = await Profile.find(did)
    if (existing) return existing
    return this.syncProfile(did)
  }

  async getProfileData(handleOrDid: string) {
    let profile = await Profile.query()
      .where('handle', handleOrDid)
      .orWhere('did', handleOrDid)
      .first()

    if (!profile) {
      const identity = await this.identityService.resolve(handleOrDid)
      if (!identity) {
        return null
      }
      profile = await Profile.find(identity.did)
      if (!profile) {
        profile = await this.syncProfile(identity.did, identity.handle)
      }
    }

    const [kits, buildLogs] = await Promise.all([
      Kit.query()
        .where('did', profile.did)
        .preload('profile')
        .preload('buildLogs')
        .orderBy('indexed_at', 'desc')
        .limit(100),
      BuildLog.query()
        .where('did', profile.did)
        .preload('profile')
        .orderBy('indexed_at', 'desc')
        .limit(50),
    ])

    const stats = this.achievementsService.computeStats(kits, buildLogs)
    const achievements = this.achievementsService.computeAchievements(kits, buildLogs)

    return {
      handle: profile.handle,
      did: profile.did,
      avatarUrl: profile.avatarUrl,
      description: profile.description,
      displayName: profile.displayName,
      kits,
      buildLogs: BuildLogTransformer.transform(buildLogs),
      stats,
      achievements,
    }
  }
}
