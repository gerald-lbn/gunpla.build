import { BaseSeeder } from '@adonisjs/lucid/seeders'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'
import { RepoSyncService } from '#kits/services/repo_sync_service'

export default class extends BaseSeeder {
  async run() {
    const syncUser = env.get('SYNC_USER')
    if (!syncUser) {
      logger.info(
        'Skipping ATProto sync: no SYNC_USER env variable set. (Pass SYNC_USER=<handle> or run "node ace kits:sync <handle>")'
      )
      return
    }

    const syncService = await app.container.make(RepoSyncService)
    const result = await syncService.syncUser(syncUser)
    logger.info(`Synced @${result.handle} (${result.kitsSynced} kits) from ${result.pdsEndpoint}`)
  }
}
