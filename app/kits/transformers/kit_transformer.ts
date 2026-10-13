import { BaseTransformer } from '@adonisjs/core/transformers'
import type Kit from '#kits/models/kit'
import { getBlobUrl } from '#kits/helpers/atproto'
import { AtUri } from '@atproto/syntax'
import ProfileTransformer from '#profile/transformers/profile_transformer'

export type PhotoItem = {
  cid: string
  thumbUrl: string
  fullUrl: string
}

export default class KitTransformer extends BaseTransformer<Kit> {
  private readonly viewerLikedKitIds: Set<number>

  constructor(resource: Kit, viewerLikedKitIds: Set<number> = new Set()) {
    super(resource)
    this.viewerLikedKitIds = viewerLikedKitIds
  }

  toObject() {
    const atUri = new AtUri(this.resource.uri)
    const rkey = atUri.rkey
    const did = this.resource.did

    const photoCidList: string[] = []
    if (Array.isArray(this.resource.photos) && this.resource.photos.length > 0) {
      photoCidList.push(...this.resource.photos)
    } else if (this.resource.photoCid) {
      photoCidList.push(this.resource.photoCid)
    }

    const coverCid = photoCidList[0] ?? null
    const photos: PhotoItem[] = did
      ? photoCidList.map((cid) => ({
          cid,
          thumbUrl: getBlobUrl(did, cid, 'thumb'),
          fullUrl: getBlobUrl(did, cid, 'full'),
        }))
      : []

    const handle = this.resource.profile?.handle ?? null

    return {
      id: this.resource.id,
      uri: this.resource.uri,
      rkey,
      did,
      handle,
      author: ProfileTransformer.transform(this.whenLoaded(this.resource.profile)),
      name: this.resource.name,
      grade: this.resource.grade,
      scale: this.resource.scale,
      manufacturer: this.resource.manufacturer,
      acquiredAt: this.resource.acquiredAt ? this.resource.acquiredAt.toISO() : null,
      status: this.resource.status,
      photoCid: coverCid,
      photoUrl: coverCid && did ? getBlobUrl(did, coverCid, 'thumb') : null,
      fullPhotoUrl: coverCid && did ? getBlobUrl(did, coverCid, 'full') : null,
      photos,
      photoCount: photos.length,
      indexedAt: this.resource.indexedAt.toISO()!,
    }
  }

  forProfileShelf() {
    return {
      ...this.toObject(),
      likeCount: Number(this.resource.$extras.kit_likes_count ?? 0),
      viewerHasLiked: this.viewerLikedKitIds.has(this.resource.id),
    }
  }

  forExplore() {
    return {
      ...this.toObject(),
      likeCount: Number(this.resource.$extras.kit_likes_count ?? 0),
      viewerHasLiked: this.viewerLikedKitIds.has(this.resource.id),
    }
  }
}
