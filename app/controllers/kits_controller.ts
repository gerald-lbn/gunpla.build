import type { HttpContext } from '@adonisjs/core/http'
import { l } from '@atproto/lex'
import gunplaKit from '#lexicons/build/gunpla/kit'
import { createKitValidator } from '#validators/kit'

export default class KitsController {
  async index({ auth, inertia }: HttpContext) {
    const { records } = await auth.user!.client.list(gunplaKit)
    const kits = records
      .filter((r) => r.valid)
      .map((r) => ({ uri: r.uri as string, value: r.value }))
    return inertia.render('dashboard', { kits })
  }

  async new({ inertia }: HttpContext) {
    return inertia.render('kits/new', {})
  }

  async store({ request, auth, response }: HttpContext) {
    const data = await request.validateUsing(createKitValidator)

    await auth.user!.client.create(gunplaKit, {
      ...data,
      createdAt: l.currentDatetimeString(),
    })

    return response.redirect().toRoute('dashboard')
  }
}
