import sharp from 'sharp'
import { inject } from '@adonisjs/core'
import { AtprotoUser } from '@thisismissem/adonisjs-atproto-oauth'
import AtprotoSyncException from '#kits/exceptions/atproto_sync_exception'
import { getBlobCidString, isBlobRef, l } from '@atproto/lex'
import { AtUri, ensureValidRecordKey } from '@atproto/syntax'
import { DateTime } from 'luxon'
import gunplaKit from '#lexicons/build/gunpla/kit'
import Kit from '#kits/models/kit'
import CoverPlaceholder from '#kits/helpers/cover_placeholder'
import type { Main as KitRecordValue } from '#lexicons/build/gunpla/kit.defs'
import type { CreateKitPayload, UpdateKitPayload } from '#kits/validators/kit'
import type { KitRecordEntry, KitRecord, CreatedKitRecord, UpdatedKitResult } from '#types/kits'

/** longest edge of an uploaded photo, in pixels */
const PHOTO_MAX_EDGE = 2000
const PHOTO_WEBP_QUALITY = 80

@inject()
export default class KitsService {
  constructor(protected user: AtprotoUser) {}

  async getPdsUrl(): Promise<string> {
    const tokenInfo = await this.user.getTokenInfo()
    return tokenInfo.iss
  }

  async listForUser(): Promise<KitRecordEntry[]> {
    const { records } = await this.user.client.list(gunplaKit)
    return records.filter((r) => r.valid).map((r) => ({ uri: r.uri, value: r.value }))
  }

  async getByRkey(rkey: string): Promise<KitRecord> {
    ensureValidRecordKey(rkey)
    return this.user.client.get(gunplaKit, { rkey })
  }

  async create(data: CreateKitPayload): Promise<CreatedKitRecord> {
    const { blobs, cids, firstPlaceholder } = await this.uploadPhotos(data)
    const record = await this.publishRecord(data, blobs)
    await this.createKit(record, data, cids, firstPlaceholder)
    return record
  }

  async update(rkey: string, data: UpdateKitPayload): Promise<UpdatedKitResult> {
    ensureValidRecordKey(rkey)

    try {
      const existingRecord = await this.user.client.get(gunplaKit, { rkey })
      const currentKit = existingRecord.value

      const { blobs, cids, newCids, firstPlaceholder } = await this.resolvePhotos(currentKit, data)
      const updatedKit = this.buildKitRecord(currentKit, data, blobs)
      await this.updateRecord(rkey, updatedKit)

      const kitUri = AtUri.make(this.user.did, 'build.gunpla.kit', rkey).toString()
      const coverPlaceholder = await this.coverPlaceholderFor(
        kitUri,
        cids[0],
        newCids[0],
        firstPlaceholder
      )
      await this.updateKit(kitUri, data, cids, coverPlaceholder)

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
    photo?: { tmpPath?: string } | null
    photos?: Array<{ tmpPath?: string } | null> | null
  }): Promise<{ blobs: l.BlobRef[]; cids: string[]; firstPlaceholder: string | null }> {
    const tmpPaths = [data.photo, ...(data.photos ?? [])]
      .map((f) => f?.tmpPath)
      .filter((p): p is string => Boolean(p))

    const blobs: l.BlobRef[] = []
    let firstPlaceholder: string | null = null
    for (const tmpPath of tmpPaths) {
      const buffer = await sharp(tmpPath)
        .rotate()
        .resize({
          width: PHOTO_MAX_EDGE,
          height: PHOTO_MAX_EDGE,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: PHOTO_WEBP_QUALITY })
        .toBuffer()
      const uploadRes = await this.user.client.uploadBlob(buffer, { encoding: 'image/webp' })
      if (blobs.length === 0) {
        const placeholder = await CoverPlaceholder.fromImage(buffer)
        firstPlaceholder = placeholder?.hash ?? null
      }
      blobs.push(uploadRes.body.blob)
    }

    const cids = blobs.map(getBlobCidString).filter((c): c is string => Boolean(c))
    return { blobs, cids, firstPlaceholder }
  }

  private async resolvePhotos(
    currentKit: KitRecordValue,
    data: UpdateKitPayload
  ): Promise<{
    blobs: l.BlobRef[]
    cids: string[]
    newCids: string[]
    firstPlaceholder: string | null
  }> {
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

    const { blobs: newBlobs, cids: newCids, firstPlaceholder } = await this.uploadPhotos(data)
    const combinedBlobs = [...retainedBlobs, ...newBlobs].slice(0, 20)
    const cids = combinedBlobs.map(getBlobCidString).filter((c): c is string => Boolean(c))

    return { blobs: combinedBlobs, cids, newCids, firstPlaceholder }
  }

  private async coverPlaceholderFor(
    kitUri: string,
    coverCid: string | undefined,
    firstUploadedCid: string | undefined,
    firstUploadedPlaceholder: string | null
  ): Promise<string | null> {
    if (!coverCid) {
      return null
    }
    if (coverCid === firstUploadedCid) {
      return firstUploadedPlaceholder
    }
    const stored = await Kit.storedCoverPlaceholder(kitUri, coverCid)
    if (stored) {
      return stored
    }
    const fetched = await CoverPlaceholder.fromBlob(this.user.did, coverCid)
    return fetched?.hash ?? null
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
    photoCids: string[],
    coverPlaceholder: string | null
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
        coverPlaceholder,
        recordCreatedAt: DateTime.now(),
        indexedAt: DateTime.now(),
      }
    )
  }

  private async updateKit(
    kitUri: string,
    data: UpdateKitPayload,
    photoCids: string[],
    coverPlaceholder: string | null
  ): Promise<void> {
    const acquiredAt =
      data.acquiredAt !== undefined ? this.normalizeAcquiredDate(data.acquiredAt) : undefined

    const kit = await Kit.findByOrFail('uri', kitUri)
    kit.merge({
      name: data.name,
      status: data.status,
      grade: data.grade ?? null,
      scale: data.scale ?? null,
      manufacturer: data.manufacturer ?? null,
      acquiredAt: acquiredAt ? DateTime.fromISO(acquiredAt) : null,
      photos: photoCids.length > 0 ? photoCids : null,
      coverPlaceholder,
    })
    await kit.save()
  }
}
