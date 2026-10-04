import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { Client } from '@atproto/lex'
import { AtUri } from '@atproto/syntax'
import { main as kitSchema } from '#lexicons/build/gunpla/kit'

export default class KitsDeleteAll extends BaseCommand {
  static commandName = 'kits:delete-all'
  static description = 'Delete all build.gunpla.kit records for a given DID'

  static options: CommandOptions = { startApp: true }

  @args.string({ description: 'DID of the user whose kits to delete' })
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
      const { records, cursor: next } = await client.list(kitSchema, { cursor })
      cursor = next

      for (const record of records) {
        const atUri = new AtUri(record.uri)
        const rkey = atUri.rkey
        await client.delete(kitSchema, { rkey })
        this.logger.info(`deleted ${record.uri}`)
        deleted++
      }
    } while (cursor)

    this.logger.success(`deleted ${deleted} kit record(s)`)
  }
}
