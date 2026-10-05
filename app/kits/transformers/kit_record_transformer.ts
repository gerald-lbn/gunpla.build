import { BaseTransformer } from '@adonisjs/core/transformers'
import type { Main } from '#lexicons/build/gunpla/kit.defs'
import { AtUri } from '@atproto/syntax'
import { getBlobCidString, isBlobRef } from '@atproto/lex'
import { getBlobUrl } from '#kits/helpers/atproto'

export interface PhotoItem {
  cid: string
  thumbUrl: string
  fullUrl: string
}

type KitRecord = { uri: string; value: Main }

export default class KitRecordTransformer extends BaseTransformer<KitRecord> {
  toObject() {
    const atUri = new AtUri(this.resource.uri)
    const rkey = atUri.rkey
    const did = atUri.did

    const rawPhotos = this.resource.value.photos
    const photoCidList: string[] = []
    if (Array.isArray(rawPhotos)) {
      for (const p of rawPhotos) {
        if (isBlobRef(p)) {
          const cid = getBlobCidString(p)
          if (cid) photoCidList.push(cid)
        }
      }
    }

    const coverCid = photoCidList[0] ?? null
    const photos: PhotoItem[] = did
      ? photoCidList.map((cid) => ({
          cid,
          thumbUrl: getBlobUrl(did, cid, 'thumb'),
          fullUrl: getBlobUrl(did, cid, 'full'),
        }))
      : []

    return {
      uri: this.resource.uri,
      rkey,
      did,
      name: this.resource.value.name,
      grade: this.resource.value.grade ?? null,
      scale: this.resource.value.scale ?? null,
      status: this.resource.value.status,
      photoCid: coverCid,
      photoUrl: coverCid && did ? getBlobUrl(did, coverCid, 'thumb') : null,
      fullPhotoUrl: coverCid && did ? getBlobUrl(did, coverCid, 'full') : null,
      photos,
      photoCount: photos.length,
    }
  }
}
