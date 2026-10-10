import { KitsService } from '#kits/services/kits_service'
import { FakeAtprotoUser } from './fake_atproto_user.js'
import KitRecordTransformer from '#kits/transformers/kit_record_transformer'
import Kit from '#kits/models/kit'
import { asAtUriString, AtUri } from '@atproto/syntax'
import { l } from '@atproto/lex'
import { DateTime } from 'luxon'
import type { Infer } from '@vinejs/vine/types'
import type { createKitValidator, updateKitValidator } from '#kits/validators/kit'

export class FakeKitsService extends KitsService {
  constructor() {
    super(new FakeAtprotoUser())
  }

  override async listForUser() {
    return KitRecordTransformer.transform([])
  }

  override async getByRkey(rkey: string) {
    if (rkey === 'not-found') {
      throw new Error('Not found')
    }
    return {
      uri: asAtUriString(AtUri.make('did:plc:test', 'build.gunpla.kit', rkey).toString()),
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

    const uri = AtUri.make('did:plc:test', 'build.gunpla.kit', 'new-aerial').toString()
    await Kit.create({
      uri,
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
      uri: asAtUriString(uri),
      cid: 'bafytestcid',
    }
  }

  override async update(rkey: string, data: Infer<typeof updateKitValidator>) {
    return {
      uri: asAtUriString(AtUri.make('did:plc:test', 'build.gunpla.kit', rkey).toString()),
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
    const uri = AtUri.make('did:plc:test', 'build.gunpla.kit', rkey).toString()
    await Kit.query().where('uri', uri).delete()
  }
}
