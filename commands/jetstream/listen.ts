import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { JetstreamService } from '#services/jetstream_service'

export default class JetstreamListen extends BaseCommand {
  static commandName = 'jetstream:listen'
  static description = 'Subscribe to ATProto Jetstream firehose and index kit records'

  static options: CommandOptions = { startApp: true, staysAlive: true }

  @flags.string({
    description: 'Jetstream WebSocket endpoint',
    default: 'wss://jetstream2.us-east.bsky.network/subscribe',
  })
  declare endpoint: string

  @flags.string({
    description: 'Comma-separated list of collections to subscribe to',
    default: 'build.gunpla.kit,build.gunpla.buildLog',
  })
  declare collections: string

  async run() {
    const wantedCollections = this.collections
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
    this.logger.info(`Starting Jetstream listener for: ${wantedCollections.join(', ')}`)

    const jetstream = new JetstreamService({
      endpoint: this.endpoint,
      wantedCollections,
    })

    jetstream.start()

    await new Promise<void>((resolve) => {
      const shutdown = () => {
        this.logger.info('Shutting down...')
        jetstream.stop()
        this.exitCode = 0
        resolve()
      }
      process.once('SIGINT', shutdown)
      process.once('SIGTERM', shutdown)
    })
  }
}
