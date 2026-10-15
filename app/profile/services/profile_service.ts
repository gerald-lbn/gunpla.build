import { inject } from '@adonisjs/core'
import { isValidHandle, normalizeHandle } from '@atproto/syntax'
import { DateTime } from 'luxon'
import Kit from '#kits/models/kit'
import KitLike from '#kits/models/kit_like'
import Profile from '#profile/models/profile'
import AchievementsService from '#profile/services/achievements_service'
import IdentityService from '#profile/services/identity_service'

type BskyProfileData = {
  avatarUrl: string | null
  description: string | null
  displayName: string | null
}

@inject()
export default class ProfileService {
  constructor(
    private achievementsService: AchievementsService,
    private identityService: IdentityService
  ) {}

  private async fetchBskyProfile(did: string): Promise<BskyProfileData> {
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
    const profile = await Profile.find(did)
    const [resolvedIdentity, bskyProfile] = await Promise.all([
      this.identityService.resolve(did),
      this.fetchBskyProfile(did),
    ])

    const handle = this.resolveCanonicalHandle(
      did,
      knownHandle,
      resolvedIdentity?.handle,
      profile?.handle
    )
    const pdsUrl = resolvedIdentity?.pdsUrl ?? null

    return profile
      ? this.updateProfile(profile, handle, bskyProfile, pdsUrl)
      : this.createProfile(did, handle, bskyProfile, pdsUrl)
  }

  async getOrCreate(did: string): Promise<Profile> {
    const profile = await Profile.find(did)
    if (profile) return profile
    return this.syncProfile(did)
  }

  async getProfileData(handleOrDid: string, viewerDid?: string) {
    const profile = await this.resolveProfile(handleOrDid)
    if (!profile) {
      return null
    }

    const kits = await this.fetchKitsShelf(profile.did)
    const viewerLikedKitIds = await this.resolveViewerLikedKitIds(viewerDid, kits)
    const stats = this.achievementsService.computeStats(kits)
    const achievements = this.achievementsService.computeAchievements(kits)

    return {
      handle: profile.handle,
      did: profile.did,
      avatarUrl: profile.avatarUrl,
      description: profile.description,
      displayName: profile.displayName,
      kits,
      viewerLikedKitIds,
      stats,
      achievements,
    }
  }

  private resolveCanonicalHandle(
    did: string,
    knownHandle?: string,
    resolvedHandle?: string,
    existingHandle?: string
  ): string {
    const cleanKnown = knownHandle
      ? knownHandle.startsWith('@')
        ? knownHandle.slice(1)
        : knownHandle
      : null

    const handle =
      (cleanKnown && isValidHandle(cleanKnown) ? normalizeHandle(cleanKnown) : null) ??
      resolvedHandle ??
      existingHandle

    if (!handle) {
      throw new Error(`Cannot resolve handle for DID: ${did}`)
    }

    return handle
  }

  private async updateProfile(
    existing: Profile,
    handle: string,
    bskyProfile: BskyProfileData,
    pdsUrl: string | null
  ): Promise<Profile> {
    existing.handle = handle
    if (bskyProfile.displayName !== null) existing.displayName = bskyProfile.displayName
    if (bskyProfile.avatarUrl !== null) existing.avatarUrl = bskyProfile.avatarUrl
    if (bskyProfile.description !== null) existing.description = bskyProfile.description
    if (pdsUrl !== null) existing.pdsUrl = pdsUrl
    existing.indexedAt = DateTime.now()
    await existing.save()
    return existing
  }

  private async createProfile(
    did: string,
    handle: string,
    bskyProfile: BskyProfileData,
    pdsUrl: string | null
  ): Promise<Profile> {
    return Profile.create({
      did,
      handle,
      displayName: bskyProfile.displayName,
      avatarUrl: bskyProfile.avatarUrl,
      description: bskyProfile.description,
      pdsUrl,
      indexedAt: DateTime.now(),
    })
  }

  private async resolveProfile(handleOrDid: string): Promise<Profile | null> {
    let profile = await Profile.query()
      .where('handle', handleOrDid)
      .orWhere('did', handleOrDid)
      .first()

    if (profile) return profile

    const identity = await this.identityService.resolve(handleOrDid)
    if (!identity) return null

    profile = await Profile.find(identity.did)
    if (!profile) {
      profile = await this.syncProfile(identity.did, identity.handle)
    }

    return profile
  }

  private async fetchKitsShelf(did: string): Promise<Kit[]> {
    return Kit.query()
      .where('did', did)
      .preload('profile')
      .withCount('kitLikes', (q) => q.as('kit_likes_count'))
      .orderBy('indexed_at', 'desc')
      .limit(100)
  }

  private async resolveViewerLikedKitIds(
    viewerDid: string | undefined,
    kits: Kit[]
  ): Promise<Set<number>> {
    const kitIds = kits.map((k) => k.id)
    return KitLike.resolveViewerLikedKitIds(viewerDid, kitIds)
  }
}
