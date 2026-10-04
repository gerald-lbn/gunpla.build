import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { AuthService } from '#auth/services/auth_service'

@inject()
export default class CallbackController {
  constructor(private authService: AuthService) {}

  async handle({ response, logger }: HttpContext) {
    try {
      await this.authService.handleCallback()
      return response.redirect().toRoute('dashboard')
    } catch (err) {
      logger.error(err, 'Error completing AT Protocol OAuth flow')
      return response.redirect().toRoute('login')
    }
  }
}
