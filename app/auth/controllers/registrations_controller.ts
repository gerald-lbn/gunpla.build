import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { signupRequestValidator } from '#auth/validators/oauth'
import AuthService from '#auth/services/auth_service'
import RegistrationNotSupportedException from '#auth/exceptions/registration_not_supported_exception'

@inject()
export default class RegistrationsController {
  constructor(private authService: AuthService) {}

  async store({ request, inertia, oauth }: HttpContext) {
    const { input } = await request.validateUsing(signupRequestValidator)
    const service = input ?? 'https://bsky.social'
    const registrationSupported = await this.authService.canRegister(service, oauth)

    if (!registrationSupported) {
      throw new RegistrationNotSupportedException()
    }

    const authorizationUrl = await this.authService.register(service, oauth)
    inertia.location(authorizationUrl)
  }
}
