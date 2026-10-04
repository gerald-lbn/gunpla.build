import type { HttpContext } from '@adonisjs/core/http'
import Kit from '#models/kit'
import KitTransformer from '#transformers/kit_transformer'

export default class ProfileController {
  async show({ params, inertia }: HttpContext) {
    const handle = params.handle as string
    const kits = await Kit.query().where('handle', handle).orderBy('indexed_at', 'desc').limit(100)
    return inertia.render('profile', {
      handle,
      kits: KitTransformer.transform(kits),
    })
  }
}
