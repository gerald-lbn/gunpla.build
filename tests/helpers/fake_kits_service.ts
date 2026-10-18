import KitsService from '#kits/services/kits_service'
import type { KitRecordEntry } from '#types/kits'
import { FakeAtprotoUser } from './fake_atproto_user.js'
import Kit from '#kits/models/kit'
import { asAtUriString, AtUri } from '@atproto/syntax'
import { l } from '@atproto/lex'
import { DateTime } from 'luxon'
import type { CreateKitPayload, UpdateKitPayload } from '#kits/validators/kit'

export class FakeKitsService extends KitsService {
  constructor() {
    super(new FakeAtprotoUser())
  }

  override async getPdsUrl(): Promise<string> {
    return 'https://pds.local'
  }

  override async listForUser(): Promise<KitRecordEntry[]> {
    return []
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

  override async create(data: CreateKitPayload) {
    const photoCids: string[] = []
    if (data.photo) photoCids.push('bafyfakephotocid')
    if (Array.isArray(data.photos)) {
      data.photos.forEach((_, i) => photoCids.push(`bafyfakephotocid${i}`))
    }

    const uri = AtUri.make('did:plc:test', 'build.gunpla.kit', 'new-aerial').toString()
    await Kit.create({
      uri,
      did: 'did:plc:test',
      name: data.name,
      grade: data.grade ?? null,
      scale: data.scale ?? null,
      manufacturer: data.manufacturer ?? null,
      status: data.status,
      photos: photoCids.length > 0 ? photoCids : null,
      indexedAt: DateTime.now(),
    })

    return {
      uri: asAtUriString(uri),
      cid: 'bafytestcid',
    }
  }

  override async update(rkey: string, data: UpdateKitPayload) {
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
