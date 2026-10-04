import type { HttpContext } from '@adonisjs/core/http'
import KitIndex from '#models/kit_index'

export default class HomeController {
  async index({ inertia }: HttpContext) {
    const kits = await KitIndex.query().orderBy('indexed_at', 'desc').limit(50)
    return inertia.render('home', { kits: kits.map((k) => k.serialize()) })
  }
}
