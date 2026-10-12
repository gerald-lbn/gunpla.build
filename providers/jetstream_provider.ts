import type { ApplicationService } from '@adonisjs/core/types'
import jetstreamService from '#services/jetstream_service'

export default class JetstreamProvider {
  constructor(protected app: ApplicationService) {}

  async ready() {
    jetstreamService.start()
  }

  async shutdown() {
    await jetstreamService.stop()
  }
}
