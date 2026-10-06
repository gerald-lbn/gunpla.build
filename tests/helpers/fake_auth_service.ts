import { AuthService } from '#auth/services/auth_service'

export class FakeAuthService extends AuthService {
  constructor(private fakeDid: string) {
    super(null as any)
  }

  async handleCallback() {
    return { user: { did: this.fakeDid } } as any
  }
}
