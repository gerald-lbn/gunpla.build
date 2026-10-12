import vine from '@vinejs/vine'
import { recordKeyRule } from '#kits/validators/kit'

export const listKitCommentsQueryValidator = vine.create({
  page: vine.number().withoutDecimals().min(1).optional(),
})

export const kitCommentParamsValidator = vine.create({
  handle: vine.atproto.handle(),
  rkey: vine.string().use(recordKeyRule()),
})

export const destroyKitCommentParamsValidator = vine.create({
  handle: vine.atproto.handle(),
  rkey: vine.string().use(recordKeyRule()),
  commentId: vine.number().withoutDecimals().positive(),
})

export const storeKitCommentValidator = vine.create({
  text: vine.string().trim().minLength(1).maxLength(300),
})
