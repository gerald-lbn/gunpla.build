import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { loginRequestValidator } from '#auth/validators/oauth'
import AuthService from '#auth/services/auth_service'
import RepoSyncService from '#kits/services/repo_sync_service'
import ProfileService from '#profile/services/profile_service'
import Kit from '#kits/models/kit'
import KitTransformer from '#kits/transformers/kit_transformer'

@inject()
export default class SessionsController {
  constructor(private authService: AuthService) {}

  async create({ inertia }: HttpContext) {
    const kit = await Kit.randomFeatured()

    return inertia.render('auth/login', {
      kit: kit ? KitTransformer.transform(kit) : null,
    })
  }

  async store({ request, inertia, oauth }: HttpContext) {
    const { input } = await request.validateUsing(loginRequestValidator)
    const authorizationUrl = await this.authService.authorize(input, oauth)
    inertia.location(authorizationUrl)
  }

  @inject()
  async show(
    { response, logger, oauth, auth }: HttpContext,
    repoSyncService: RepoSyncService,
    profileService: ProfileService
  ) {
    const session = await this.authService.handleCallback(oauth, auth)
    const did = session.user.did

    await profileService.syncProfile(did).catch((err) => {
      logger.warn({ err, did }, 'Profile sync failed on login')
    })

    const isNewUser = !(await Kit.hasKitsFor(did))

    if (isNewUser) {
      await repoSyncService.syncAccount(did).catch((err) => {
        logger.warn({ err, did }, 'PDS sync failed on first login')
      })
    } else {
      repoSyncService
        .syncAccount(did)
        .then(({ handle, kitsSynced }) => {
          logger.info({ did, handle, kitsSynced }, `PDS sync completed on login for ${handle}`)
        })
        .catch((err) => {
          logger.warn({ err, did }, `PDS sync failed on login for ${did}`)
        })
    }

    return response.redirect().toRoute('shelf')
  }

  async destroy({ response, oauth, auth }: HttpContext) {
    await this.authService.logout(oauth, auth)
    return response.redirect().back()
  }
}
