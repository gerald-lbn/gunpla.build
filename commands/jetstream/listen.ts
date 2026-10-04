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
    description: 'Lexicon collection to subscribe to',
    default: 'build.gunpla.kit',
  })
  declare collection: string

  async run() {
    this.logger.info(`Starting Jetstream listener for: ${this.collection}`)

    const jetstream = new JetstreamService({
      endpoint: this.endpoint,
      wantedCollection: this.collection,
    })

    jetstream.start()

    await new Promise<void>((resolve) => {
      const shutdown = () => {
        this.logger.info('Shutting down...')
        jetstream.stop()
        this.exitCode = 0
        resolve()
      }
      process.on('SIGINT', shutdown)
      process.on('SIGTERM', shutdown)
    })
  }
}
