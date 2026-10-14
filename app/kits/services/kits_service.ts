import fs from 'node:fs'
import { inject } from '@adonisjs/core'
import { AtprotoUser } from '@thisismissem/adonisjs-atproto-oauth'
import AtprotoSyncException from '#kits/exceptions/atproto_sync_exception'
import { getBlobCidString, isBlobRef, l } from '@atproto/lex'
import { AtUri, ensureValidRecordKey } from '@atproto/syntax'
import { DateTime } from 'luxon'
import gunplaKit from '#lexicons/build/gunpla/kit'
import Kit from '#kits/models/kit'
import type { Main as KitRecordValue } from '#lexicons/build/gunpla/kit.defs'
import type { CreateKitPayload, UpdateKitPayload } from '#kits/validators/kit'
import type { KitRecordEntry, KitRecord, CreatedKitRecord, UpdatedKitResult } from '#types/kits'

type PhotoUploadTarget = {
  tmpPath: string
  type?: string
  subtype?: string
}

@inject()
export default class KitsService {
  constructor(protected user: AtprotoUser) {}

  async listForUser(): Promise<KitRecordEntry[]> {
    const { records } = await this.user.client.list(gunplaKit)
    return records.filter((r) => r.valid).map((r) => ({ uri: r.uri, value: r.value }))
  }

  async getByRkey(rkey: string): Promise<KitRecord> {
    ensureValidRecordKey(rkey)
    return this.user.client.get(gunplaKit, { rkey })
  }

  async create(data: CreateKitPayload): Promise<CreatedKitRecord> {
    const { blobs, cids } = await this.uploadPhotos(data)
    const record = await this.publishRecord(data, blobs)
    await this.createKit(record, data, cids)
    return record
  }

  async update(rkey: string, data: UpdateKitPayload): Promise<UpdatedKitResult> {
    ensureValidRecordKey(rkey)

    try {
      const existingRecord = await this.user.client.get(gunplaKit, { rkey })
      const currentKit = existingRecord.value

      const { blobs, cids } = await this.resolvePhotos(currentKit, data)
      const updatedKit = this.buildKitRecord(currentKit, data, blobs)
      await this.updateRecord(rkey, updatedKit)

      const kitUri = AtUri.make(this.user.did, 'build.gunpla.kit', rkey).toString()
      await this.updateKit(kitUri, data, cids)

      return { uri: kitUri, value: updatedKit }
    } catch (e) {
      if (e instanceof AtprotoSyncException) throw e
      throw new AtprotoSyncException('Failed to update kit on ATProto')
    }
  }

  async delete(rkey: string): Promise<void> {
    ensureValidRecordKey(rkey)

    try {
      await this.user.client.delete(gunplaKit, { rkey })

      const kitUri = AtUri.make(this.user.did, 'build.gunpla.kit', rkey).toString()
      await Kit.query().where('uri', kitUri).delete()
    } catch (e) {
      if (e instanceof AtprotoSyncException) throw e
      throw new AtprotoSyncException('Failed to delete kit from ATProto')
    }
  }

  private async uploadPhotos(data: {
    photo?: { tmpPath?: string; type?: string; subtype?: string } | null
    photos?: Array<{ tmpPath?: string; type?: string; subtype?: string } | null> | null
  }): Promise<{ blobs: l.BlobRef[]; cids: string[] }> {
    const filesToUpload: PhotoUploadTarget[] = []
    if (data.photo?.tmpPath) {
      filesToUpload.push({
        tmpPath: data.photo.tmpPath,
        type: data.photo.type,
        subtype: data.photo.subtype,
      })
    }
    if (Array.isArray(data.photos)) {
      for (const f of data.photos) {
        if (f?.tmpPath) {
          filesToUpload.push({
            tmpPath: f.tmpPath,
            type: f.type,
            subtype: f.subtype,
          })
        }
      }
    }

    const blobs: l.BlobRef[] = []
    for (const file of filesToUpload) {
      const buffer = await fs.promises.readFile(file.tmpPath)
      const encoding: `${string}/${string}` =
        file.type && file.subtype ? `${file.type}/${file.subtype}` : 'image/jpeg'
      const uploadRes = await this.user.client.uploadBlob(buffer, { encoding })
      blobs.push(uploadRes.body.blob)
    }

    const cids = blobs.map(getBlobCidString).filter((c): c is string => Boolean(c))
    return { blobs, cids }
  }

  private async resolvePhotos(
    currentKit: KitRecordValue,
    data: UpdateKitPayload
  ): Promise<{ blobs: l.BlobRef[]; cids: string[] }> {
    let retainedBlobs: l.BlobRef[] = []

    if (Array.isArray(data.existingPhotos)) {
      if (Array.isArray(currentKit.photos)) {
        for (const cid of data.existingPhotos) {
          const match = currentKit.photos.find(
            (blob) => isBlobRef(blob) && getBlobCidString(blob) === cid
          )
          if (match && isBlobRef(match)) {
            retainedBlobs.push(match)
          }
        }
      }
    } else if (!data.photosSubmitted && Array.isArray(currentKit.photos)) {
      retainedBlobs = currentKit.photos.filter((p): p is l.BlobRef => isBlobRef(p))
    }

    const { blobs: newBlobs } = await this.uploadPhotos(data)
    const combinedBlobs = [...retainedBlobs, ...newBlobs].slice(0, 20)
    const cids = combinedBlobs.map(getBlobCidString).filter((c): c is string => Boolean(c))

    return { blobs: combinedBlobs, cids }
  }

  private normalizeAcquiredDate(rawDate?: string | null): l.DatetimeString | undefined {
    if (!rawDate) return undefined
    const parsed = DateTime.fromISO(rawDate)
    return parsed.isValid ? l.asDatetimeString(parsed.toISO()!) : undefined
  }

  private buildKitRecord(
    currentKit: KitRecordValue,
    data: UpdateKitPayload,
    blobs: l.BlobRef[]
  ): KitRecordValue {
    const photos = blobs.length > 0 ? blobs : undefined
    const acquiredAt =
      data.acquiredAt !== undefined
        ? this.normalizeAcquiredDate(data.acquiredAt)
        : currentKit.acquiredAt

    const updatedKit: KitRecordValue = {
      ...currentKit,
      name: data.name,
      status: data.status,
      grade: data.grade,
      scale: data.scale,
      manufacturer: data.manufacturer,
      acquiredAt: acquiredAt ?? undefined,
      photos,
    }

    if (data.status === 'in-progress' && !currentKit.startedAt) {
      updatedKit.startedAt = l.currentDatetimeString()
    } else if (data.status === 'done' && !currentKit.completedAt) {
      updatedKit.completedAt = l.currentDatetimeString()
    }

    return updatedKit
  }

  private async publishRecord(
    data: CreateKitPayload,
    blobs: l.BlobRef[]
  ): Promise<CreatedKitRecord> {
    const photos = blobs.length > 0 ? blobs : undefined
    const acquiredAt = this.normalizeAcquiredDate(data.acquiredAt)

    return this.user.client.create(gunplaKit, {
      name: data.name,
      status: data.status,
      grade: data.grade,
      scale: data.scale,
      manufacturer: data.manufacturer,
      acquiredAt: acquiredAt ?? undefined,
      photos,
      createdAt: l.currentDatetimeString(),
    })
  }

  private async updateRecord(rkey: string, updatedKit: KitRecordValue): Promise<void> {
    await this.user.client.put(gunplaKit, updatedKit, { rkey })
  }

  private async createKit(
    record: { uri: string },
    data: CreateKitPayload,
    photoCids: string[]
  ): Promise<void> {
    const acquiredAt = this.normalizeAcquiredDate(data.acquiredAt)

    await Kit.updateOrCreate(
      { uri: record.uri },
      {
        did: this.user.did,
        name: data.name,
        grade: data.grade,
        scale: data.scale,
        manufacturer: data.manufacturer,
        status: data.status,
        acquiredAt: acquiredAt ? DateTime.fromISO(acquiredAt) : null,
        photos: photoCids.length > 0 ? photoCids : null,
        recordCreatedAt: DateTime.now(),
        indexedAt: DateTime.now(),
      }
    )
  }

  private async updateKit(
    kitUri: string,
    data: UpdateKitPayload,
    photoCids: string[]
  ): Promise<void> {
    const acquiredAt =
      data.acquiredAt !== undefined ? this.normalizeAcquiredDate(data.acquiredAt) : undefined

    await Kit.query()
      .where('uri', kitUri)
      .update({
        name: data.name,
        status: data.status,
        grade: data.grade ?? null,
        scale: data.scale ?? null,
        manufacturer: data.manufacturer ?? null,
        acquiredAt: acquiredAt ? DateTime.fromISO(acquiredAt) : null,
        photos: photoCids.length > 0 ? JSON.stringify(photoCids) : null,
      })
  }
}
