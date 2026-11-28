import sharp from 'sharp'
import { rgbaToThumbHash } from 'thumbhash'
import { getBlobUrl } from '#kits/helpers/atproto'

export default class CoverPlaceholder {
  readonly hash: string

  constructor(hash: string) {
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(hash) || hash.length > 64) {
      throw new Error(`Not a ThumbHash: "${hash}"`)
    }
    this.hash = hash
  }

  static async fromImage(image: Buffer | string): Promise<CoverPlaceholder | null> {
    try {
      const { data, info } = await sharp(image)
        .rotate()
        .resize(100, 100, { fit: 'inside' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })
      const hash = rgbaToThumbHash(info.width, info.height, data)
      return new CoverPlaceholder(Buffer.from(hash).toString('base64'))
    } catch {
      return null
    }
  }

  static async fromBlob(did: string, cid: string): Promise<CoverPlaceholder | null> {
    try {
      const res = await fetch(getBlobUrl(null, did, cid, 'thumb'), {
        signal: AbortSignal.timeout(4000),
      })
      if (!res.ok) {
        return null
      }
      return CoverPlaceholder.fromImage(Buffer.from(await res.arrayBuffer()))
    } catch {
      return null
    }
  }

  toString(): string {
    return this.hash
  }
}
