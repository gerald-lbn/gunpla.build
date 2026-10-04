import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { signupRequestValidator } from '#auth/validators/oauth'
import { AuthService } from '#auth/services/auth_service'

@inject()
export default class SignupController {
  constructor(private authService: AuthService) {}

  async handle({ request, response, inertia }: HttpContext) {
    const { input } = await request.validateUsing(signupRequestValidator)
    const service = input ?? 'https://bsky.social'
    const registrationSupported = await this.authService.canRegister(service)

    if (!registrationSupported) {
      return response.abort('Registration not supported')
    }

    const authorizationUrl = await this.authService.register(service)
    inertia.location(authorizationUrl)
  }
}
