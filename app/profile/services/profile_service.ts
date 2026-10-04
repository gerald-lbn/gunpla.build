import Kit from '#kits/models/kit'
import BuildLog from '#kits/models/build_log'
import KitTransformer from '#kits/transformers/kit_transformer'
import BuildLogTransformer from '#kits/transformers/build_log_transformer'

export class ProfileService {
  async getProfileData(handle: string) {
    const [kits, buildLogs] = await Promise.all([
      Kit.query().where('handle', handle).orderBy('indexed_at', 'desc').limit(100),
      BuildLog.query().where('handle', handle).orderBy('indexed_at', 'desc').limit(50),
    ])

    return {
      kits: KitTransformer.transform(kits),
      buildLogs: BuildLogTransformer.transform(buildLogs),
    }
  }
}
