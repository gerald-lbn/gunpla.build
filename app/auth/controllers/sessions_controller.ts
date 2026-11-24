import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { loginRequestValidator } from '#auth/validators/oauth'
import AuthService from '#auth/services/auth_service'
import RepoSyncService from '#kits/services/repo_sync_service'
import ProfileService from '#profile/services/profile_service'
import Kit from '#kits/models/kit'
import KitTransformer from '#kits/transformers/kit_transformer'
import WideEvent from '#observability/wide_event'

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
    { response, logger, oauth, auth, wideEvent }: HttpContext,
    repoSyncService: RepoSyncService,
    profileService: ProfileService
  ) {
    const session = await this.authService.handleCallback(oauth, auth)
    const did = session.user.did

    await profileService.syncProfile(did).catch((err) => {
      wideEvent.failStep('profile_sync', err)
    })

    const isNewUser = !(await Kit.hasKitsFor(did))
    wideEvent.set({ login: { did, new_user: isNewUser } })

    if (!isNewUser) {
      const backgroundSync = new WideEvent('login.background_sync', { did })
      repoSyncService
        .syncAccount(did)
        .then(({ handle, kitsSynced, kitsPruned }) => {
          backgroundSync.set({ handle, kits_synced: kitsSynced, kits_pruned: kitsPruned })
        })
        .catch((err) => backgroundSync.fail(err))
        .finally(() => backgroundSync.emit(logger))

      return response.redirect().toRoute('shelf')
    }

    await repoSyncService
      .syncAccount(did)
      .then(({ handle, kitsSynced, kitsPruned }) => {
        wideEvent.set({
          pds_sync: {
            outcome: 'success',
            handle,
            kits_synced: kitsSynced,
            kits_pruned: kitsPruned,
          },
        })
      })
      .catch((err) => {
        wideEvent.failStep('pds_sync', err)
      })

    return response.redirect().toRoute('shelf')
  }

  async destroy({ response, oauth, auth }: HttpContext) {
    await this.authService.logout(oauth, auth)
    return response.redirect().back()
  }
}
