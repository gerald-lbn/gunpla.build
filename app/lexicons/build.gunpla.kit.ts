import { lx, type Infer } from 'prototypey'
import { MAX_NOTES_GRAPHEMES, MAX_PHOTOS, PHOTO_MIME_TYPES, STATUSES } from './constants.js'

export const buildGunplaKit = lx.lexicon('build.gunpla.kit', {
  main: lx.record({
    key: 'tid',
    description: 'A Gunpla kit owned or tracked by a user.',
    record: lx.object({
      name: lx.string({ required: true, maxGraphemes: 300, maxLength: 3000 }),
      grade: lx.string({
        description:
          'Common values: HG, RG, MG, PG, SD, EG, MGSD, HGUC, RE/100, FM. Not a closed set.',
      }),
      scale: lx.string({ description: 'e.g. "1/144". Omit for non-scale kits.' }),
      manufacturer: lx.string({ description: 'e.g. "Bandai".' }),
      status: lx.string({
        required: true,
        knownValues: [...STATUSES],
        default: 'backlog',
      }),
      acquiredAt: lx.string({ format: 'datetime' }),
      startedAt: lx.string({ format: 'datetime' }),
      completedAt: lx.string({ format: 'datetime' }),
      notes: lx.string({ maxGraphemes: MAX_NOTES_GRAPHEMES }),
      photos: lx.array(lx.blob({ accept: PHOTO_MIME_TYPES }), {
        maxLength: MAX_PHOTOS,
        description: 'First photo is used as the shelf cover.',
      }),
      createdAt: lx.string({ required: true, format: 'datetime' }),
    }),
  }),
})

export type Kit = Infer<typeof buildGunplaKit>
