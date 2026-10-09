import vine from '@vinejs/vine'
import { recordKeyRule } from '#kits/validators/kit'

export const showProfileParamsValidator = vine.create({
  handle: vine.atproto.handle(),
})

export const showKitParamsValidator = vine.create({
  handle: vine.atproto.handle(),
  rkey: vine.string().use(recordKeyRule()),
})
