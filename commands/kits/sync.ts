import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { inject } from '@adonisjs/core'
import { RepoSyncService } from '#kits/services/repo_sync_service'

export default class KitsSync extends BaseCommand {
  static commandName = 'kits:sync'
  static description = 'Fetch and populate kit records from a user PDS into the database'

  static options: CommandOptions = { startApp: true }

  @args.spread({
    description: 'One or more handles or DIDs of users to sync records for',
    required: false,
  })
  declare identifiers: string[]

  @inject()
  async run(syncService: RepoSyncService) {
    const { syncIdentifierValidator } = await import('#kits/validators/kit')

    if (!this.identifiers || this.identifiers.length === 0) {
      this.logger.error('At least one user handle or identifier is required.')
      this.exitCode = 1
      return
    }

    const validIdentifiers: string[] = []

    for (const rawId of this.identifiers) {
      try {
        const { identifier } = await syncIdentifierValidator.validate({ identifier: rawId })
        validIdentifiers.push(identifier)
      } catch {
        this.logger.error(`Invalid identifier format: "${rawId}". Expected a valid handle or DID.`)
        this.exitCode = 1
        return
      }
    }

    const batchResult = await syncService.syncAccounts(validIdentifiers)

    for (const res of batchResult.results) {
      if (res.success && res.data) {
        const data = res.data
        this.logger.success(
          `Synced @${data.handle} (${data.did}) from ${data.pdsEndpoint}: ${data.kitsSynced} kit(s) synced, ${data.kitsPruned} pruned`
        )
        if (data.kitsSynced === 0) {
          this.logger.info(`0 kit records found for @${data.handle}`)
        }
        this.logger.info(`Profile: /@${data.handle}`)
      } else {
        this.logger.error(`Failed to sync "${res.identifier}": ${res.error}`)
      }
    }

    if (batchResult.hasFailures) {
      this.exitCode = 1
    }
  }
}
