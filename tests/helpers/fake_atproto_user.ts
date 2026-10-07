import { AtprotoUser } from '@thisismissem/adonisjs-atproto-oauth'
import {
  Client,
  type CreateOptions,
  type CreateOutput,
  type RecordSchema,
  type Main,
  type Infer,
  asAtUriString,
} from '@atproto/lex'

export interface FakeAtprotoUserOptions {
  did?: `did:plc:${string}`
  createHandler?: () => Promise<CreateOutput>
  uploadBlobHandler?: () => Promise<unknown>
}

export class FakeClient extends Client {
  #createHandler?: () => Promise<CreateOutput>
  #uploadBlobHandler?: () => Promise<unknown>

  constructor(options: FakeAtprotoUserOptions = {}) {
    const did = options.did ?? 'did:plc:test'
    super({
      did,
      fetchHandler: async () => {
        const body = JSON.stringify({
          blob: {
            $type: 'blob',
            ref: { $link: 'bafkreiadsbmmn4waznesyuz3bjgrj33xzqhxrk6mz3ksq7meugrachh3qe' },
            mimeType: 'image/jpeg',
            size: 1234,
          },
        })
        return new Response(body, {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    })
    this.#createHandler = options.createHandler
    this.#uploadBlobHandler = options.uploadBlobHandler
  }

  override async create<const T extends RecordSchema>(
    _ns: Main<T>,
    _input: Omit<Infer<T>, '$type'>,
    _options?: CreateOptions<T>
  ): Promise<CreateOutput> {
    if (this.#createHandler) {
      return this.#createHandler()
    }
    return {
      uri: asAtUriString(`at://${this.assertDid}/build.gunpla.kit/fake`),
      cid: 'bafkreiadsbmmn4waznesyuz3bjgrj33xzqhxrk6mz3ksq7meugrachh3qe',
    }
  }

  override async uploadBlob(
    ...args: Parameters<Client['uploadBlob']>
  ): ReturnType<Client['uploadBlob']> {
    if (this.#uploadBlobHandler) {
      await this.#uploadBlobHandler()
    }
    return super.uploadBlob(...args)
  }
}

export class FakeAtprotoUser extends AtprotoUser {
  #fakeDid: `did:plc:${string}`
  #fakeClient: Client

  constructor(options: FakeAtprotoUserOptions = {}) {
    super(Object.create(null))
    this.#fakeDid = options.did ?? 'did:plc:test'
    this.#fakeClient = new FakeClient(options)
  }

  override get did(): `did:plc:${string}` {
    return this.#fakeDid
  }

  override get client(): Client {
    return this.#fakeClient
  }
}
