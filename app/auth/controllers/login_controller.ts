import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { OAuthResolverError } from '@atproto/oauth-client-node'
import { loginRequestValidator } from '#auth/validators/oauth'
import { AuthService } from '#auth/services/auth_service'

@inject()
export default class LoginController {
  constructor(private authService: AuthService) {}

  async render({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async handle({ request, response, inertia, logger }: HttpContext) {
    const { input } = await request.validateUsing(loginRequestValidator)
    try {
      const authorizationUrl = await this.authService.authorize(input)
      inertia.location(authorizationUrl)
    } catch (err) {
      logger.error(err, 'Error starting AT Protocol OAuth flow')
      if (err instanceof OAuthResolverError) {
        // Handle the input not being AT Protocol OAuth compatible
      }
      return response.redirect().back()
    }
  }
}
