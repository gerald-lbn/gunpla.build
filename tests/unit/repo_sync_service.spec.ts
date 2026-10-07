import { test } from '@japa/runner'
import { IdentityService } from '#profile/services/identity_service'
import { RepoSyncService, type SyncResult } from '#kits/services/repo_sync_service'
import { FakeProfileService } from '#tests/helpers/fake_profile_service'
import { FakeIdentityService } from '#tests/helpers/fake_identity_service'
import { TestableRepoSyncService } from '#tests/helpers/testable_repo_sync_service'

test.group('RepoSyncService', () => {
  const identityService = new IdentityService()
  const fakeProfileService = new FakeProfileService()
  const syncService = new RepoSyncService(identityService, fakeProfileService)

  test('resolves PDS endpoint for a known DID', async ({ assert }) => {
    const pds = await syncService.resolvePdsEndpoint('did:plc:abiaoe3hpp2cqiuptrss75fp')
    assert.isNotNull(pds)
    assert.isTrue(pds!.startsWith('https://') || pds!.startsWith('http://'))
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

  test('syncUsers aggregates results for multiple identifiers', async ({ assert }) => {
    const customService = new RepoSyncService(identityService, fakeProfileService)
    customService.syncUser = async (id: string): Promise<SyncResult> => {
      if (id === 'user1.bsky.social') {
        return {
          did: 'did:plc:user1',
          handle: 'user1.bsky.social',
          pdsEndpoint: 'https://pds1',
          kitsSynced: 2,
        }
      }
      return {
        did: 'did:plc:user2',
        handle: 'user2.bsky.social',
        pdsEndpoint: 'https://pds2',
        kitsSynced: 3,
      }
    }

    const result = await customService.syncUsers(['user1.bsky.social', 'user2.bsky.social'])
    assert.equal(result.totalKits, 5)
    assert.isFalse(result.hasFailures)
    assert.lengthOf(result.results, 2)
    assert.isTrue(result.results[0].success)
    assert.isTrue(result.results[1].success)
  })

  test('syncUsers isolates individual errors and marks hasFailures true', async ({ assert }) => {
    const customService = new RepoSyncService(identityService, fakeProfileService)
    customService.syncUser = async (id: string): Promise<SyncResult> => {
      if (id === 'invalid.bsky.social') {
        throw new Error('Connection refused to PDS')
      }
      return {
        did: 'did:plc:valid',
        handle: 'valid.bsky.social',
        pdsEndpoint: 'https://pds',
        kitsSynced: 4,
      }
    }

    const result = await customService.syncUsers(['invalid.bsky.social', 'valid.bsky.social'])
    assert.isTrue(result.hasFailures)
    assert.lengthOf(result.results, 2)
    assert.isFalse(result.results[0].success)
    assert.equal(result.results[0].error, 'Connection refused to PDS')
    assert.isTrue(result.results[1].success)
    assert.equal(result.totalKits, 4)
  })

  test('syncUser invokes ProfileService.syncProfile when profileService is injected', async ({
    assert,
  }) => {
    const fakeIdentity = new FakeIdentityService({
      resolver: () => ({ did: 'did:plc:abiaoe3hpp2cqiuptrss75fp', handle: 'mockuser.bsky.social' }),
    })
    const fakeProfile = new FakeProfileService()
    const service = new TestableRepoSyncService(fakeIdentity, fakeProfile, {
      kitsSynced: 2,
    })

    const result = await service.syncUser('mockuser.bsky.social')
    assert.equal(result.did, 'did:plc:abiaoe3hpp2cqiuptrss75fp')
    assert.equal(result.kitsSynced, 2)
    assert.lengthOf(fakeProfile.syncedProfiles, 1)
    assert.equal(fakeProfile.syncedProfiles[0].did, 'did:plc:abiaoe3hpp2cqiuptrss75fp')
    assert.equal(fakeProfile.syncedProfiles[0].handle, 'mockuser.bsky.social')
  })
})
