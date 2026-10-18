import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { isValidRecordKey } from '@atproto/syntax'

export const recordKeyRule = vine.createRule((value, _, field) => {
  if (typeof value !== 'string' || !isValidRecordKey(value)) {
    field.report(
      'The {{ field }} field is not a valid AT Protocol record key',
      'atproto.recordKey',
      field
    )
  }
})

export const kitParamsValidator = vine.create({
  rkey: vine.string().use(recordKeyRule()),
})

export const likeKitParamsValidator = vine.create({
  handle: vine.atproto.handle(),
  rkey: vine.string().use(recordKeyRule()),
})

export const syncIdentifierValidator = vine.create({
  identifier: vine.atproto.identifier(),
})

export const listKitsValidator = vine.create({
  q: vine.string().trim().optional(),
  grade: vine.string().trim().optional(),
  scale: vine.string().trim().optional(),
  manufacturer: vine.string().trim().optional(),
  builder: vine.string().trim().optional(),
  page: vine.number().withoutDecimals().optional(),
})

export const filterValuesValidator = vine.create({
  type: vine.enum(['grade', 'scale', 'manufacturer', 'builder'] as const),
  q: vine.string().trim().optional(),
})

export const createKitValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(300),
  status: vine.enum(['backlog', 'in-progress', 'on-hold', 'dropped', 'done'] as const),
  grade: vine.string().trim().optional(),
  scale: vine.string().trim().optional(),
  manufacturer: vine.string().trim().maxLength(100).optional(),
  acquiredAt: vine
    .date({ formats: ['YYYY-MM-DD', 'ISO'] })
    .optional()
    .transform((date) => (date ? date.toISO() : undefined)),
  photo: vine
    .file({
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })
    .optional(),
  photos: vine
    .array(
      vine.file({
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
      })
    )
    .maxLength(20)
    .optional(),
})

export const updateKitValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(300),
  status: vine.enum(['backlog', 'in-progress', 'on-hold', 'dropped', 'done'] as const),
  grade: vine.string().trim().optional(),
  scale: vine.string().trim().optional(),
  manufacturer: vine.string().trim().maxLength(100).optional(),
  acquiredAt: vine
    .date({ formats: ['YYYY-MM-DD', 'ISO'] })
    .optional()
    .transform((date) => (date ? date.toISO() : undefined)),
  photo: vine
    .file({
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })
    .optional(),
  photos: vine
    .array(
      vine.file({
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
      })
    )
    .maxLength(20)
    .optional(),
  existingPhotos: vine.array(vine.string()).maxLength(20).optional(),
  photosSubmitted: vine.boolean().optional(),
})

export type CreateKitPayload = Infer<typeof createKitValidator>
export type UpdateKitPayload = Infer<typeof updateKitValidator>
export type KitParams = Infer<typeof kitParamsValidator>
export type LikeKitParams = Infer<typeof likeKitParamsValidator>
export type SyncIdentifierPayload = Infer<typeof syncIdentifierValidator>
export type ListKitsQuery = Infer<typeof listKitsValidator>
