import { test } from '@japa/runner'
import { AtUri } from '@atproto/syntax'
import testUtils from '@adonisjs/core/services/test_utils'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { DateTime } from 'luxon'
import AuthMiddleware from '#middleware/auth_middleware'
import { KitsService } from '#kits/services/kits_service'
import Kit from '#kits/models/kit'
import { FakeKitsService } from '../helpers/fake_kits_service.js'

class FakeAuthMiddleware extends AuthMiddleware {
  override async handle(_ctx: HttpContext, next: NextFn) {
    return next()
  }
}

test.group('Kits Management', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('renders new kit page', async ({ client, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new FakeKitsService())

    const response = await client.visit('kits.new').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('kits/new')
  })

  test('validates and creates a new kit', async ({ client, db, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new FakeKitsService())

    const response = await client
      .visit('kits.store')
      .withCsrfToken()
      .header('referer', '/kits/new')
      .form({
        name: 'HG Aerial',
        grade: 'HG',
        scale: '1/144',
        manufacturer: 'Bandai',
        status: 'done',
      })
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/shelf')

    await db.assertHas('kits', {
      name: 'HG Aerial',
      grade: 'HG',
      status: 'done',
    })
  })

  test('validates and creates a new kit with an uploaded photo', async ({ client, db, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new FakeKitsService())

    const response = await client
      .visit('kits.store')
      .withCsrfToken()
      .fields({
        name: 'RG Hi-Nu Gundam',
        grade: 'RG',
        scale: '1/144',
        status: 'in-progress',
      })
      .file('photo', Buffer.from([0xff, 0xd8, 0xff, 0xe0]), {
        filename: 'hi-nu.jpg',
        contentType: 'image/jpeg',
      })
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/shelf')

    await db.assertHas('kits', {
      name: 'RG Hi-Nu Gundam',
      grade: 'RG',
      status: 'in-progress',
      photo_cid: 'bafyfakephotocid',
    })
  })

  test('validates and creates a new kit with single uploaded photo using photos[]', async ({
    client,
    db,
    swap,
  }) => {
    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new FakeKitsService())

    const response = await client
      .visit('kits.store')
      .withCsrfToken()
      .fields({
        name: 'MG Nu Gundam',
        grade: 'MG',
        scale: '1/100',
        status: 'in-progress',
      })
      .file('photos[]', Buffer.from([0xff, 0xd8, 0xff, 0xe0]), {
        filename: 'nu.jpg',
        contentType: 'image/jpeg',
      })
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/shelf')

    await db.assertHas('kits', {
      name: 'MG Nu Gundam',
      photo_cid: 'bafyfakephotocid0',
    })
  })

  test('validates and creates a new kit with multiple uploaded photos', async ({
    client,
    db,
    swap,
  }) => {
    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new FakeKitsService())

    const response = await client
      .visit('kits.store')
      .withCsrfToken()
      .fields({
        name: 'MG Sazabi Ver Ka',
        grade: 'MG',
        scale: '1/100',
        status: 'in-progress',
      })
      .file('photos[0]', Buffer.from([0xff, 0xd8, 0xff, 0xe0]), {
        filename: 'sazabi-1.jpg',
        contentType: 'image/jpeg',
      })
      .file('photos[1]', Buffer.from([0xff, 0xd8, 0xff, 0xe0]), {
        filename: 'sazabi-2.jpg',
        contentType: 'image/jpeg',
      })
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/shelf')

    await db.assertHas('kits', {
      name: 'MG Sazabi Ver Ka',
      grade: 'MG',
      status: 'in-progress',
      photo_cid: 'bafyfakephotocid0',
    })
  })

  test('fails validation when submitting an invalid acquiredAt date', async ({
    client,
    db,
    swap,
  }) => {
    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new FakeKitsService())

    const response = await client
      .visit('kits.store')
      .withCsrfToken()
      .form({
        name: 'Invalid Date Kit',
        status: 'backlog',
        acquiredAt: 'invalid-date',
      })
      .redirects(0)

    response.assertStatus(302)
    response.assertFlashMissing('success')
    response.assertFlashMessage('errorsBag.E_VALIDATION_ERROR')
    response.assertFlashMessage('inputErrorsBag.acquiredAt')

    await db.assertCount('kits', 0)
  })

  test('fails validation when uploading an invalid file format', async ({ client, db, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new FakeKitsService())

    const response = await client
      .visit('kits.store')
      .withCsrfToken()
      .fields({
        name: 'Invalid File Kit',
        status: 'backlog',
      })
      .file('photo', Buffer.from('plain text file'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      })
      .redirects(0)

    response.assertStatus(302)
    response.assertFlashMissing('success')
    response.assertFlashMessage('errorsBag.E_VALIDATION_ERROR')
    response.assertFlashMessage('inputErrorsBag.photo')

    await db.assertCount('kits', 0)
  })

  test('fails validation when creating kit without required name', async ({ client, db, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new FakeKitsService())

    const response = await client
      .visit('kits.store')
      .withCsrfToken()
      .unsafeForm({
        grade: 'HG',
        status: 'done',
      })
      .redirects(0)

    response.assertStatus(302)
    response.assertFlashMissing('success')
    response.assertFlashMessage('errorsBag.E_VALIDATION_ERROR')
    response.assertFlashMessage('inputErrorsBag.name')

    await db.assertCount('kits', 0)
  })

  test('malformed rkey parameter on edit view returns 404 without calling remote kits service', async ({
    client,
    swap,
  }) => {
    let getByRkeyCalled = false
    class TrackingKitsService extends FakeKitsService {
      override async getByRkey(rkey: string) {
        getByRkeyCalled = true
        return super.getByRkey(rkey)
      }
    }

    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new TrackingKitsService())

    const response = await client.visit('kits.edit', { rkey: 'invalid/rkey!' }).withInertia()

    response.assertStatus(404)
    response.assertInertiaComponent('errors/not_found')
    if (getByRkeyCalled) {
      throw new Error('KitsService.getByRkey was unexpectedly called for malformed rkey')
    }
  })

  test('renders edit kit page with existing kit details', async ({ client, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new FakeKitsService())

    const response = await client.visit('kits.edit', { rkey: 'aerial-1' }).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('kits/edit')
    response.assertInertiaPropsContains({
      kit: {
        rkey: 'aerial-1',
        name: 'HG Aerial',
        grade: 'HG',
        scale: '1/144',
        status: 'done',
        manufacturer: '',
        acquiredAt: '',
      },
    })
  })

  test('valid update payload and rkey updates kit and redirects to shelf', async ({
    client,
    swap,
  }) => {
    let updateCalledWith: { rkey: string; data: any } | null = null
    class TrackingKitsService extends FakeKitsService {
      override async update(rkey: string, data: any) {
        updateCalledWith = { rkey, data }
        return super.update(rkey, data)
      }
    }

    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new TrackingKitsService())

    const response = await client
      .visit('kits.update', { rkey: 'aerial-1' })
      .withCsrfToken()
      .form({
        name: 'Updated Aerial',
        status: 'done',
        grade: 'HG',
        scale: '1/144',
      })
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/shelf')
    response.assertFlashMessage('success', 'Updated "Updated Aerial"')
    if (!updateCalledWith || (updateCalledWith as any).rkey !== 'aerial-1') {
      throw new Error('KitsService.update was not called with expected rkey')
    }
  })

  test('malformed rkey parameter on update fails validation without calling kits service', async ({
    client,
    swap,
  }) => {
    let updateCalled = false
    class TrackingKitsService extends FakeKitsService {
      override async update(rkey: string, data: any) {
        updateCalled = true
        return super.update(rkey, data)
      }
    }

    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new TrackingKitsService())

    const response = await client
      .visit('kits.update', { rkey: 'invalid/rkey!' })
      .withCsrfToken()
      .form({
        name: 'Updated Aerial',
        status: 'done',
      })
      .redirects(0)

    response.assertStatus(302)
    response.assertFlashMessage('errorsBag.E_VALIDATION_ERROR')
    if (updateCalled) {
      throw new Error('KitsService.update was unexpectedly called for malformed rkey')
    }
  })

  test('malformed rkey parameter on destroy fails validation without calling kits service delete', async ({
    client,
    swap,
  }) => {
    let deleteCalled = false
    class TrackingKitsService extends FakeKitsService {
      override async delete(rkey: string) {
        deleteCalled = true
        return super.delete(rkey)
      }
    }

    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new TrackingKitsService())

    const response = await client
      .visit('kits.destroy', { rkey: 'invalid/rkey!' })
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(302)
    response.assertFlashMessage('errorsBag.E_VALIDATION_ERROR')
    if (deleteCalled) {
      throw new Error('KitsService.delete was unexpectedly called for malformed rkey')
    }
  })

  test('deletes a kit and removes it from the database', async ({ client, db, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new FakeKitsService())

    const kit = await Kit.create({
      uri: AtUri.make('did:plc:test', 'build.gunpla.kit', 'aerial-delete').toString(),
      did: 'did:plc:test',
      name: 'Kit to delete',
      status: 'backlog',
      indexedAt: DateTime.now(),
    })

    await db.assertModelExists(kit)

    const response = await client
      .visit('kits.destroy', { rkey: 'aerial-delete' })
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/shelf')

    await db.assertModelMissing(kit)
  })

  test('first kit creation succeeds and creates profile row', async ({ client, db, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new FakeKitsService())

    const response = await client
      .visit('kits.store')
      .withCsrfToken()
      .form({
        name: 'HG Aerial',
        status: 'done',
        grade: 'HG',
        scale: '1/144',
      })
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/shelf')
    response.assertFlashMessage('success', 'Kit "HG Aerial" added to your shelf')

    await db.assertHas('kits', { name: 'HG Aerial', did: 'did:plc:test' })
  })
})
