import type { HttpContext } from '@adonisjs/core/http'
import Kit from '#models/kit'
import KitTransformer from '#transformers/kit_transformer'

export default class HomeController {
  async index({ inertia }: HttpContext) {
    const kits = await Kit.query().orderBy('indexed_at', 'desc').limit(50)
    return inertia.render('home', {
      kits: KitTransformer.transform(kits),
    })
  }
}
