import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { IdentityService } from '#profile/services/identity_service'

@inject()
export default class ListKitsController {
  constructor(private identityService: IdentityService) {}

  async render({ auth, response }: HttpContext) {
    const did = auth.user!.did
    const identity = await this.identityService.resolve(did)
    const handle = identity?.handle ?? did
    return response.redirect().toRoute('profile', { handle })
  }
}
