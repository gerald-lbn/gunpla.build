import { test } from '@japa/runner'
import { IdentityService } from '#profile/services/identity_service'
import { RepoSyncService } from '#kits/services/repo_sync_service'

test.group('RepoSyncService', () => {
  const identityService = new IdentityService()
  const syncService = new RepoSyncService(identityService)

  test('resolves PDS endpoint for a known DID', async ({ assert }) => {
    const pds = await syncService.resolvePdsEndpoint('did:plc:abiaoe3hpp2cqiuptrss75fp')
    assert.isNotNull(pds)
    assert.match(pds!, /^https?:\/\//)
  })

  test('returns null for an unresolvable DID', async ({ assert }) => {
    const pds = await syncService.resolvePdsEndpoint('did:plc:nonexistentfake123456789')
    assert.isNull(pds)
  })

  test('fails gracefully when syncing an invalid handle', async ({ assert }) => {
    await assert.rejects(
      () => syncService.syncUser('invalid handle with spaces'),
      /Could not resolve ATProto identity/
    )
  })
})
