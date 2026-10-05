import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { Client } from '@atproto/lex'
import { AtUri } from '@atproto/syntax'
import { main as buildLogSchema } from '#lexicons/build/gunpla/buildLog'

export default class KitsDeleteAllLogs extends BaseCommand {
  static commandName = 'kits:delete-all-logs'
  static description = 'Delete all build.gunpla.buildLog records for a given DID'

  static options: CommandOptions = { startApp: true }

  @args.string({ description: 'DID of the user whose build logs to delete' })
  declare did: string

  async run() {
    const config = await this.app.container.make('atproto.oauth.config')
    const oauthService = await this.app.container.make('atproto.oauth.client')
    await oauthService.configure(config.publicUrl, config.metadata, config.jwks)
    const session = await oauthService.client.restore(this.did)
    const client = new Client(session)

    let cursor: string | undefined
    let deleted = 0

    do {
      const { records, cursor: next } = await client.list(buildLogSchema, { cursor })
      cursor = next

      for (const record of records) {
        const atUri = new AtUri(record.uri)
        const rkey = atUri.rkey
        await client.delete(buildLogSchema, { rkey })
        this.logger.info(`deleted ${record.uri}`)
        deleted++
      }
    } while (cursor)

    this.logger.success(`deleted ${deleted} build log record(s)`)
  }
}
