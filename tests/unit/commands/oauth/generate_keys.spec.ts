import { test } from '@japa/runner'
import ace from '@adonisjs/core/services/ace'
import OauthGenerateKeys from '../../../../commands/oauth/generate_keys.js'

test.group('Command oauth:generate-keys', (group) => {
  group.each.setup(() => {
    ace.ui.switchMode('raw')
    return () => ace.ui.switchMode('normal')
  })

  test('outputs a valid ES256 JWK assignment line', async () => {
    const command = await ace.create(OauthGenerateKeys, [])
    await command.exec()

    command.assertSucceeded()
    command.assertLogMatches(/ATPROTO_OAUTH_JWT_PRIVATE_KEY=/)
  })
})
