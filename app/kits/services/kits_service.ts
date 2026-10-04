import { inject } from '@adonisjs/core'
import { AtprotoUser } from '@thisismissem/adonisjs-atproto-oauth'
import { l } from '@atproto/lex'
import { DateTime } from 'luxon'
import gunplaKit from '#lexicons/build/gunpla/kit'
import Kit from '#kits/models/kit'
import KitRecordTransformer from '#kits/transformers/kit_record_transformer'
import type { Main } from '#lexicons/build/gunpla/kit.defs'
import type { Infer } from '@vinejs/vine/types'
import type { createKitValidator, updateKitValidator } from '#kits/validators/kit'

@inject()
export class KitsService {
  constructor(protected user: AtprotoUser) {}

  async listForUser() {
    const { records } = await this.user.client.list(gunplaKit)
    const items: Array<{ uri: string; value: Main }> = records
      .filter((r) => r.valid)
      .map((r) => ({ uri: r.uri, value: r.value }))
    return KitRecordTransformer.transform(items)
  }

  async getByRkey(rkey: string) {
    return this.user.client.get(gunplaKit, { rkey })
  }

  async create(data: Infer<typeof createKitValidator>) {
    const record = await this.user.client.create(gunplaKit, {
      ...data,
      createdAt: l.currentDatetimeString(),
    })

    const existingKit = await Kit.query().where('did', this.user.did).whereNotNull('handle').first()
    const handle = existingKit?.handle ?? null

    await Kit.updateOrCreate(
      { uri: record.uri },
      {
        did: this.user.did,
        handle,
        name: data.name,
        grade: data.grade ?? null,
        scale: data.scale ?? null,
        status: data.status,
        recordCreatedAt: DateTime.now(),
        indexedAt: DateTime.now(),
      }
    )

    return record
  }

  async update(rkey: string, data: Infer<typeof updateKitValidator>) {
    const remote = await this.user.client.get(gunplaKit, { rkey })
    const val = remote.value

    const updatedVal: typeof val = {
      ...val,
      name: data.name,
      status: data.status,
      grade: data.grade || undefined,
      scale: data.scale || undefined,
    }

    if (data.status === 'in-progress' && !val.startedAt) {
      updatedVal.startedAt = l.currentDatetimeString()
    } else if (data.status === 'done' && !val.completedAt) {
      updatedVal.completedAt = l.currentDatetimeString()
    }

    await this.user.client.put(gunplaKit, updatedVal, { rkey })

    const kitUri = `at://${this.user.did}/build.gunpla.kit/${rkey}`
    await Kit.query()
      .where('uri', kitUri)
      .update({
        name: data.name,
        status: data.status,
        grade: data.grade || null,
        scale: data.scale || null,
      })

    return { uri: kitUri, value: updatedVal }
  }
}
