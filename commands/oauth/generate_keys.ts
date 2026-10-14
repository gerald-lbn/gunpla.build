import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { JoseKey } from '@atproto/jwk-jose'

export default class OauthGenerateKeys extends BaseCommand {
  static commandName = 'oauth:generate-keys'
  static description =
    'Generate an ES256 JWK key pair for ATProto OAuth confidential client authentication'

  static options: CommandOptions = {}

  async run() {
    const key = await JoseKey.generate(['ES256'])
    this.logger.log('ATPROTO_OAUTH_JWT_PRIVATE_KEY=' + JSON.stringify(key.jwk))
  }
}
