import Kit from '#kits/models/kit'

export default class FeedService {
  async getRecentKits(limit = 50): Promise<Kit[]> {
    return Kit.query().preload('profile').orderBy('indexed_at', 'desc').limit(limit)
  }
}
