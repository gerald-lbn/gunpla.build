import fs from 'node:fs'
import { inject } from '@adonisjs/core'
import { AtprotoUser } from '@thisismissem/adonisjs-atproto-oauth'
import { getBlobCidString, l } from '@atproto/lex'
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
    let photos: l.BlobRef[] | undefined
    let photoCid: string | null = null

    if (data.photo && data.photo.tmpPath) {
      const buffer = await fs.promises.readFile(data.photo.tmpPath)
      const encoding: `${string}/${string}` =
        data.photo.type && data.photo.subtype
          ? `${data.photo.type}/${data.photo.subtype}`
          : 'image/jpeg'
      const uploadRes = await this.user.client.uploadBlob(buffer, { encoding })
      const blobRef = uploadRes.body.blob
      photos = [blobRef]
      photoCid = getBlobCidString(blobRef)
    }

    const record = await this.user.client.create(gunplaKit, {
      name: data.name,
      status: data.status,
      grade: data.grade,
      scale: data.scale,
      photos,
      createdAt: l.currentDatetimeString(),
    })

    const existingKit = await Kit.query().where('did', this.user.did).whereNotNull('handle').first()
    const handle = existingKit?.handle

    await Kit.updateOrCreate(
      { uri: record.uri },
      {
        did: this.user.did,
        handle,
        name: data.name,
        grade: data.grade,
        scale: data.scale,
        status: data.status,
        photoCid,
        recordCreatedAt: DateTime.now(),
        indexedAt: DateTime.now(),
      }
    )

    return record
  }

  async update(rkey: string, data: Infer<typeof updateKitValidator>) {
    const existingRecord = await this.user.client.get(gunplaKit, { rkey })
    const currentKit = existingRecord.value

    let photos = currentKit.photos
    let photoCid: string | undefined = getBlobCidString(photos?.[0])

    if (data.photo && data.photo.tmpPath) {
      const buffer = await fs.promises.readFile(data.photo.tmpPath)
      const encoding: `${string}/${string}` =
        data.photo.type && data.photo.subtype
          ? `${data.photo.type}/${data.photo.subtype}`
          : 'image/jpeg'
      const uploadRes = await this.user.client.uploadBlob(buffer, { encoding })
      const blobRef = uploadRes.body.blob
      photos = [blobRef]
      photoCid = getBlobCidString(blobRef)
    }

    const updatedKit: typeof currentKit = {
      ...currentKit,
      name: data.name,
      status: data.status,
      grade: data.grade,
      scale: data.scale,
      photos,
    }

    if (data.status === 'in-progress' && !currentKit.startedAt) {
      updatedKit.startedAt = l.currentDatetimeString()
    } else if (data.status === 'done' && !currentKit.completedAt) {
      updatedKit.completedAt = l.currentDatetimeString()
    }

    await this.user.client.put(gunplaKit, updatedKit, { rkey })

    const kitUri = `at://${this.user.did}/build.gunpla.kit/${rkey}`
    await Kit.query()
      .where('uri', kitUri)
      .update({
        name: data.name,
        status: data.status,
        grade: data.grade ?? null,
        scale: data.scale ?? null,
        photoCid,
      })

    return { uri: kitUri, value: updatedKit }
  }

  async delete(rkey: string) {
    await this.user.client.delete(gunplaKit, { rkey })

    const kitUri = `at://${this.user.did}/build.gunpla.kit/${rkey}`
    await Kit.query().where('uri', kitUri).delete()
  }
}
