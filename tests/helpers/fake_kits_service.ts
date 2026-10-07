import { KitsService } from '#kits/services/kits_service'
import type { IdentityService } from '#profile/services/identity_service'
import { FakeIdentityService } from './fake_identity_service.js'
import { FakeAtprotoUser } from './fake_atproto_user.js'
import CannotResolveHandleException from '#kits/exceptions/cannot_resolve_handle_exception'
import KitRecordTransformer from '#kits/transformers/kit_record_transformer'
import Kit from '#kits/models/kit'
import { asAtUriString } from '@atproto/syntax'
import { l } from '@atproto/lex'
import { DateTime } from 'luxon'
import type { Infer } from '@vinejs/vine/types'
import type { createKitValidator, updateKitValidator } from '#kits/validators/kit'

export class FakeKitsService extends KitsService {
  constructor(identityService: IdentityService = new FakeIdentityService()) {
    super(new FakeAtprotoUser(), identityService)
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
    const identity = await this.identityService.resolve('did:plc:test')
    if (!identity?.handle) {
      throw new CannotResolveHandleException()
    }
    const handle = identity.handle

    const photoCids: string[] = []
    if (data.photo) photoCids.push('bafyfakephotocid')
    if (Array.isArray(data.photos)) {
      data.photos.forEach((_, i) => photoCids.push(`bafyfakephotocid${i}`))
    }
    const photoCid = photoCids[0] ?? null

    await Kit.create({
      uri: 'at://did:plc:test/build.gunpla.kit/new-aerial',
      did: 'did:plc:test',
      handle,
      name: data.name,
      grade: data.grade ?? null,
      scale: data.scale ?? null,
      manufacturer: data.manufacturer ?? null,
      acquiredAt: data.acquiredAt ? DateTime.fromISO(data.acquiredAt) : null,
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
        acquiredAt: data.acquiredAt ? DateTime.fromISO(data.acquiredAt) : null,
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
