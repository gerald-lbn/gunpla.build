import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { RepoSyncService } from '#kits/services/repo_sync_service'

export default class KitsSync extends BaseCommand {
  static commandName = 'kits:sync'
  static description =
    'Fetch and populate kit and build log records from a user PDS into the database'

  static options: CommandOptions = { startApp: true }

  @args.string({ description: 'Handle or DID of the user to sync records for' })
  declare identifier: string

  async run() {
    this.logger.info(`Resolving identity and PDS for "${this.identifier}"...`)

    try {
      const syncService = await this.app.container.make(RepoSyncService)
      const result = await syncService.syncUser(this.identifier)

      this.logger.success(
        `Synced @${result.handle} (${result.did}) from ${result.pdsEndpoint}: ${result.kitsSynced} kit(s), ${result.logsSynced} build log(s)`
      )
    } catch (err) {
      this.logger.error(err instanceof Error ? err.message : String(err))
      this.exitCode = 1
    }
  }
}
