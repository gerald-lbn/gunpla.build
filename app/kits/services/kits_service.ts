import fs from 'node:fs'
import { inject } from '@adonisjs/core'
import { AtprotoUser } from '@thisismissem/adonisjs-atproto-oauth'
import { getBlobCidString, isBlobRef, l } from '@atproto/lex'
import { AtUri, ensureValidRecordKey } from '@atproto/syntax'
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
    ensureValidRecordKey(rkey)
    return this.user.client.get(gunplaKit, { rkey })
  }

  async create(data: Infer<typeof createKitValidator>) {
    const filesToUpload: Array<{ tmpPath: string; type?: string; subtype?: string }> = []
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

    const uploadedBlobs: l.BlobRef[] = []
    for (const file of filesToUpload) {
      const buffer = await fs.promises.readFile(file.tmpPath)
      const encoding: `${string}/${string}` =
        file.type && file.subtype ? `${file.type}/${file.subtype}` : 'image/jpeg'
      const uploadRes = await this.user.client.uploadBlob(buffer, { encoding })
      uploadedBlobs.push(uploadRes.body.blob)
    }

    const photos = uploadedBlobs.length > 0 ? uploadedBlobs : undefined
    const photoCids = uploadedBlobs.map(getBlobCidString).filter((c): c is string => Boolean(c))
    const photoCid = photoCids[0] ?? null

    const acquiredAt =
      data.acquiredAt && DateTime.fromISO(data.acquiredAt).isValid
        ? l.asDatetimeString(DateTime.fromISO(data.acquiredAt).toISO()!)
        : undefined

    const record = await this.user.client.create(gunplaKit, {
      name: data.name,
      status: data.status,
      grade: data.grade,
      scale: data.scale,
      manufacturer: data.manufacturer,
      acquiredAt: acquiredAt ?? undefined,
      photos,
      createdAt: l.currentDatetimeString(),
    })

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
        photoCid,
        photos: photoCids.length > 0 ? photoCids : null,
        recordCreatedAt: DateTime.now(),
        indexedAt: DateTime.now(),
      }
    )

    return record
  }

  async update(rkey: string, data: Infer<typeof updateKitValidator>) {
    ensureValidRecordKey(rkey)
    const existingRecord = await this.user.client.get(gunplaKit, { rkey })
    const currentKit = existingRecord.value

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

    const filesToUpload: Array<{ tmpPath: string; type?: string; subtype?: string }> = []
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

    const newBlobs: l.BlobRef[] = []
    for (const file of filesToUpload) {
      const buffer = await fs.promises.readFile(file.tmpPath)
      const encoding: `${string}/${string}` =
        file.type && file.subtype ? `${file.type}/${file.subtype}` : 'image/jpeg'
      const uploadRes = await this.user.client.uploadBlob(buffer, { encoding })
      newBlobs.push(uploadRes.body.blob)
    }

    const combinedBlobs = [...retainedBlobs, ...newBlobs].slice(0, 20)
    const photos = combinedBlobs.length > 0 ? combinedBlobs : undefined
    const photoCids = combinedBlobs.map(getBlobCidString).filter((c): c is string => Boolean(c))
    const photoCid = photoCids[0] ?? null

    const acquiredAt =
      data.acquiredAt !== undefined
        ? data.acquiredAt && DateTime.fromISO(data.acquiredAt).isValid
          ? l.asDatetimeString(DateTime.fromISO(data.acquiredAt).toISO()!)
          : undefined
        : currentKit.acquiredAt

    const updatedKit: typeof currentKit = {
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

    await this.user.client.put(gunplaKit, updatedKit, { rkey })

    const kitUri = AtUri.make(this.user.did, 'build.gunpla.kit', rkey).toString()
    await Kit.query()
      .where('uri', kitUri)
      .update({
        name: data.name,
        status: data.status,
        grade: data.grade ?? null,
        scale: data.scale ?? null,
        manufacturer: data.manufacturer ?? null,
        acquiredAt: acquiredAt ? DateTime.fromISO(acquiredAt) : null,
        photoCid,
        photos: photoCids.length > 0 ? JSON.stringify(photoCids) : null,
      })

    return { uri: kitUri, value: updatedKit }
  }

  async delete(rkey: string) {
    ensureValidRecordKey(rkey)
    await this.user.client.delete(gunplaKit, { rkey })

    const kitUri = AtUri.make(this.user.did, 'build.gunpla.kit', rkey).toString()
    await Kit.query().where('uri', kitUri).delete()
  }
}
