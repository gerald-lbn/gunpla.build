import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { AuthService } from '#auth/services/auth_service'
import { RepoSyncService } from '#kits/services/repo_sync_service'
import { ProfileService } from '#profile/services/profile_service'
import Kit from '#kits/models/kit'

@inject()
export default class CallbackController {
  constructor(
    private authService: AuthService,
    private repoSyncService: RepoSyncService,
    private profileService: ProfileService
  ) {}

  async handle({ response, logger }: HttpContext) {
    try {
      const session = await this.authService.handleCallback()
      const did = session.user.did

      await this.profileService.syncProfile(did).catch((err) => {
        logger.warn({ err, did }, 'Profile sync failed on login')
      })

      const isNewUser = !(await Kit.hasKitsFor(did))

      if (isNewUser) {
        await this.repoSyncService.syncUser(did).catch((err) => {
          logger.warn({ err, did }, 'PDS sync failed on first login')
        })
      } else {
        this.repoSyncService
          .syncUser(did)
          .then(({ handle, kitsSynced, logsSynced }) => {
            logger.info(
              { did, handle, kitsSynced, logsSynced },
              `PDS sync completed on login for ${handle}`
            )
          })
          .catch((err) => {
            logger.warn({ err, did }, `PDS sync failed on login for ${did}`)
          })
      }

      return response.redirect().toRoute('shelf')
    } catch (err) {
      logger.error(err, 'Error completing AT Protocol OAuth flow')
      return response.redirect().toRoute('login')
    }
  }
}
