import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { AuthService } from '#auth/services/auth_service'

@inject()
export default class LogoutController {
  constructor(private authService: AuthService) {}

  async handle({ response }: HttpContext) {
    await this.authService.logout()
    return response.redirect().back()
  }
}
