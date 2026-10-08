import vine from '@vinejs/vine'

export const loginRequestValidator = vine.create({
  input: vine.unionOfTypes([vine.atproto.did(), vine.atproto.handle()]),
})

export const signupRequestValidator = vine.create({
  input: vine.atproto.service().optional(),
})
