/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring the database
  |----------------------------------------------------------
  */
  DB_HOST: Env.schema.string(),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string(),
  DB_DATABASE: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the AT Protocol OAuth
  |----------------------------------------------------------
  */
  PUBLIC_URL: Env.schema.string({ format: 'url', tld: false }),
  ATPROTO_OAUTH_CLIENT_ID: Env.schema.string.optional({ format: 'url', tld: true, protocol: true }),
  ATPROTO_OAUTH_JWT_PRIVATE_KEY: Env.schema.secret.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the Jetstream firehose
  |----------------------------------------------------------
  */
  JETSTREAM_URL: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Optional user handle/DID for syncing records on migration
  |----------------------------------------------------------
  */
  SYNC_USER: Env.schema.string.optional(),
})
