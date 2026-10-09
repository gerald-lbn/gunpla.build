import { KitLikesService } from '#kits/services/kit_likes_service'
import { FakeAtprotoUser } from './fake_atproto_user.js'

export class FakeKitLikesService extends KitLikesService {
  constructor(private options: { likeCount?: number } = {}) {
    super(new FakeAtprotoUser())
  }

  override async like(_handle: string, _rkey: string) {
    return { likeCount: this.options.likeCount ?? 1 }
  }

  override async unlike(_handle: string, _rkey: string) {
    return { likeCount: this.options.likeCount ?? 0 }
  }
}
