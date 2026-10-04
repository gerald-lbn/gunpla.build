import type { HttpContext } from '@adonisjs/core/http'
import Kit from '#models/kit'
import BuildLog from '#models/build_log'
import KitTransformer from '#transformers/kit_transformer'
import BuildLogTransformer from '#transformers/build_log_transformer'

export default class ProfileController {
  async show({ params, inertia }: HttpContext) {
    const handle = params.handle as string
    const [kits, buildLogs] = await Promise.all([
      Kit.query().where('handle', handle).orderBy('indexed_at', 'desc').limit(100),
      BuildLog.query().where('handle', handle).orderBy('indexed_at', 'desc').limit(50),
    ])
    return inertia.render('profile', {
      handle,
      kits: KitTransformer.transform(kits),
      buildLogs: BuildLogTransformer.transform(buildLogs),
    })
  }
}
