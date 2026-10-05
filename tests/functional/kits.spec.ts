import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { AtprotoUser } from '@thisismissem/adonisjs-atproto-oauth'
import { asAtUriString } from '@atproto/syntax'
import { l } from '@atproto/lex'
import { DateTime } from 'luxon'
import AuthMiddleware from '#middleware/auth_middleware'
import { KitsService } from '#kits/services/kits_service'
import KitRecordTransformer from '#kits/transformers/kit_record_transformer'
import Kit from '#kits/models/kit'
import type { Infer } from '@vinejs/vine/types'
import type { createKitValidator, updateKitValidator } from '#kits/validators/kit'

class FakeAuthMiddleware extends AuthMiddleware {
  override async handle(_ctx: HttpContext, next: NextFn) {
    return next()
  }
}

class FakeKitsService extends KitsService {
  constructor() {
    super(Object.create(AtprotoUser.prototype) as AtprotoUser)
  }

  override async listForUser() {
    return KitRecordTransformer.transform([])
  }

  override async getByRkey(rkey: string) {
    if (rkey === 'not-found') {
      throw new Error('Not found')
    }
    return {
      uri: asAtUriString(`at://did:plc:test/build.gunpla.kit/${rkey}`),
      cid: 'bafytestcid',
      value: {
        $type: 'build.gunpla.kit' as const,
        name: 'HG Aerial',
        grade: 'HG',
        scale: '1/144',
        status: 'done' as const,
        createdAt: l.currentDatetimeString(),
      },
    }
  }

  override async create(data: Infer<typeof createKitValidator>) {
    const photoCids: string[] = []
    if (data.photo) photoCids.push('bafyfakephotocid')
    if (Array.isArray(data.photos)) {
      data.photos.forEach((_, i) => photoCids.push(`bafyfakephotocid${i}`))
    }
    const photoCid = photoCids[0] ?? null

    await Kit.create({
      uri: 'at://did:plc:test/build.gunpla.kit/new-aerial',
      did: 'did:plc:test',
      name: data.name,
      grade: data.grade ?? null,
      scale: data.scale ?? null,
      manufacturer: data.manufacturer ?? null,
      status: data.status,
      photoCid,
      photos: photoCids.length > 0 ? photoCids : null,
      indexedAt: DateTime.now(),
    })
    return {
      uri: asAtUriString('at://did:plc:test/build.gunpla.kit/new-aerial'),
      cid: 'bafytestcid',
    }
  }

  override async update(rkey: string, data: Infer<typeof updateKitValidator>) {
    const photoCids: string[] = []
    if (data.existingPhotos) {
      photoCids.push(...data.existingPhotos)
    }
    if (data.photo) photoCids.push('bafynewphoto')
    if (Array.isArray(data.photos)) {
      data.photos.forEach((_, i) => photoCids.push(`bafynewphoto${i}`))
    }

    await Kit.query()
      .where('uri', 'like', `%/${rkey}`)
      .update({
        name: data.name,
        grade: data.grade ?? null,
        scale: data.scale ?? null,
        manufacturer: data.manufacturer ?? null,
        status: data.status,
        photoCid: photoCids[0] ?? null,
        photos: photoCids.length > 0 ? JSON.stringify(photoCids) : null,
      })
    return {
      uri: `at://did:plc:test/build.gunpla.kit/${rkey}`,
      value: {
        $type: 'build.gunpla.kit' as const,
        name: data.name,
        grade: data.grade ?? undefined,
        scale: data.scale ?? undefined,
        status: data.status,
        createdAt: l.currentDatetimeString(),
      },
    }
  }

  override async delete(rkey: string) {
    await Kit.query().where('uri', 'like', `%/${rkey}`).delete()
  }
}

test.group('Kits Management', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('renders new kit page', async ({ client, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new FakeKitsService())

    const response = await client.get('/kits/new').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('kits/new')
  })

  test('validates and creates a new kit', async ({ client, db, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new FakeKitsService())

    const response = await client
      .post('/kits')
      .withCsrfToken()
      .form({
        name: 'HG Aerial',
        grade: 'HG',
        scale: '1/144',
        manufacturer: 'Bandai',
        status: 'done',
      })
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/dashboard')

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
      .post('/kits')
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
    response.assertHeader('location', '/dashboard')

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
      .post('/kits')
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
    response.assertHeader('location', '/dashboard')

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
      .post('/kits')
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
    response.assertHeader('location', '/dashboard')

    await db.assertHas('kits', {
      name: 'MG Sazabi Ver Ka',
      grade: 'MG',
      status: 'in-progress',
      photo_cid: 'bafyfakephotocid0',
    })
  })

  test('fails validation when uploading an invalid file format', async ({ client, db, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new FakeKitsService())

    const response = await client
      .post('/kits')
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
      .post('/kits')
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

  test('renders edit kit page with existing kit details', async ({ client, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new FakeKitsService())

    const response = await client.get('/kits/aerial-1/edit').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('kits/edit')
    response.assertInertiaPropsContains({
      kit: {
        rkey: 'aerial-1',
        name: 'HG Aerial',
        grade: 'HG',
        scale: '1/144',
        status: 'done',
      },
    })
  })

  test('deletes a kit and removes it from the database', async ({ client, db, swap }) => {
    swap(AuthMiddleware, new FakeAuthMiddleware())
    swap(KitsService, new FakeKitsService())

    const kit = await Kit.create({
      uri: 'at://did:plc:test/build.gunpla.kit/aerial-delete',
      did: 'did:plc:test',
      name: 'Kit to delete',
      status: 'backlog',
      indexedAt: DateTime.now(),
    })

    await db.assertModelExists(kit)

    const response = await client.delete('/kits/aerial-delete').withCsrfToken().redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/dashboard')

    await db.assertModelMissing(kit)
  })
})
