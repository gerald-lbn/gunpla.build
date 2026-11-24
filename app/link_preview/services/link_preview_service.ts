import sharp from 'sharp'
import { AtUri } from '@atproto/syntax'
import linkPreviewConfig from '#config/link_preview'
import Kit from '#kits/models/kit'
import Profile from '#profile/models/profile'
import LinkPreview from '#link_preview/link_preview'
import KitCard from '#link_preview/kit_card'
import ProfileCard from '#link_preview/profile_card'
import type { DrawnCard } from '#types/link_preview'

/**
 * What a shared link to a builder's shelf or to one of their kits shows:
 * the preview tags of the page, and the card image they point at.
 */
export default class LinkPreviewService {
  async previewProfile(path: string, profile: Profile): Promise<LinkPreview> {
    const card = new ProfileCard(profile, await Kit.countFor(profile.did))

    return new LinkPreview({
      path,
      title: `${profile.displayName?.trim() || `@${profile.handle}`}'s shelf`,
      description: [`${card.kitCountLabel} on @${profile.handle}'s shelf.`, profile.description]
        .filter(Boolean)
        .join(' '),
      image: card.toLinkPreviewImage(),
      type: 'profile',
    })
  }

  previewKit(path: string, profile: Profile, kit: Kit): LinkPreview {
    const card = new KitCard(kit, profile.handle, profile.pdsUrl)
    const spec = [kit.grade, kit.scale, kit.manufacturer].filter(Boolean).join(' · ')

    return new LinkPreview({
      path,
      title: `${kit.name} on @${profile.handle}'s shelf`,
      description: `${card.status.label}${spec ? ` · ${spec}` : ''}. A Gunpla build on @${profile.handle}'s shelf.`,
      image: card.toLinkPreviewImage(),
      type: 'article',
    })
  }

  async drawProfileCard(handle: string): Promise<DrawnCard<ProfileCard>> {
    // Profiles are public, like the profile page this card previews: no policy check.
    const profile = await Profile.findByOrFail('handle', handle)
    const card = new ProfileCard(profile, await Kit.countFor(profile.did))
    const avatar = await this.#fetchPhoto(card.avatarUrls, ProfileCard.avatarSize)

    return { card, image: await card.toJpeg(avatar) }
  }

  async drawKitCard(handle: string, rkey: string): Promise<DrawnCard<KitCard>> {
    // Kits and profiles are public, like the kit page this card previews: no policy check.
    const profile = await Profile.findByOrFail('handle', handle)
    // Scoped to the builder: the AT-URI carries their DID.
    const kit = await Kit.findByOrFail(
      'uri',
      AtUri.make(profile.did, 'build.gunpla.kit', rkey).toString()
    )
    const card = new KitCard(kit, profile.handle, profile.pdsUrl)
    const photo = await this.#fetchPhoto(card.photoUrls, KitCard.photoSize)

    return { card, image: await card.toJpeg(photo) }
  }

  async #fetchPhoto(urls: string[], size: number): Promise<string | null> {
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(linkPreviewConfig.cards.photoTimeoutMs),
        })
        if (!res.ok) {
          continue
        }
        const jpeg = await sharp(Buffer.from(await res.arrayBuffer()))
          .rotate()
          .resize(size, size, { fit: 'cover' })
          .jpeg({ quality: 82 })
          .toBuffer()
        return `data:image/jpeg;base64,${jpeg.toString('base64')}`
      } catch {
        continue
      }
    }
    return null
  }
}
