import {
  defineConfig,
  lucidSessionStore,
  lucidStateStore,
} from '@thisismissem/adonisjs-atproto-oauth'
import env from '#start/env'

export default defineConfig({
  publicUrl: env.get('PUBLIC_URL'),
  metadata: {
    // If ATPROTO_OAUTH_CLIENT_ID is set, the client metadata will be fetched from that URL:
    client_id: env.get('ATPROTO_OAUTH_CLIENT_ID'),
    client_name: 'Some App',
    client_uri: new URL('/', env.get('PUBLIC_URL')).toString(),
    // See: https://atproto.com/guides/scopes
    scope: [
      'atproto',
      'repo:build.gunpla.kit?action=create',
      'repo:build.gunpla.kit?action=update',
      'repo:build.gunpla.kit?action=delete',
      'repo:build.gunpla.buildLog?action=create',
      'repo:build.gunpla.buildLog?action=update',
      'repo:build.gunpla.buildLog?action=delete',
    ].join(' '),
    // logo_uri: 'https://my-app.com/logo.png',
    // tos_uri: 'https://my-app.com/tos',
    // policy_uri: 'https://my-app.com/policy',
  },

  // For a confidential client, set this environment variable:
  // Empty values are ignored
  jwks: [env.get('ATPROTO_OAUTH_JWT_PRIVATE_KEY')],
  // Models to store OAuth State and Sessions:
  stores: {
    states: lucidStateStore(() => import('#auth/models/oauth_state')),
    sessions: lucidSessionStore(() => import('#auth/models/oauth_session')),
  },
})
