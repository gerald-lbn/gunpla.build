import Kit from '#kits/models/kit'
import KitTransformer from '#kits/transformers/kit_transformer'

export class FeedService {
  async getRecentKits(limit = 50) {
    const kits = await Kit.query().preload('profile').orderBy('indexed_at', 'desc').limit(limit)
    return KitTransformer.transform(kits)
  }
}
