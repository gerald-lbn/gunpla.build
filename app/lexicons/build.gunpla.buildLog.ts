import { lx, type Infer } from 'prototypey'
import { MAX_LOG_TEXT_GRAPHEMES, MAX_PHOTOS, PHOTO_MIME_TYPES } from './constants.js'

export const buildGunplaBuildLog = lx.lexicon('build.gunpla.buildLog', {
  main: lx.record({
    key: 'tid',
    description: 'A progress entry logged against a kit.',
    record: lx.object({
      kit: lx.string({
        required: true,
        format: 'at-uri',
        description:
          'AT-URI of the parent build.gunpla.kit record. Use the DID form (at://did:...), not a handle.',
      }),
      stage: lx.string({
        description: 'Free-form, e.g. "gate-cutting", "panel-lining", "topcoat". Not a closed set.',
      }),
      text: lx.string({ maxGraphemes: MAX_LOG_TEXT_GRAPHEMES }),
      photos: lx.array(lx.blob({ accept: PHOTO_MIME_TYPES }), { maxLength: MAX_PHOTOS }),
      createdAt: lx.string({ required: true, format: 'datetime' }),
    }),
  }),
})

export type BuildLog = Infer<typeof buildGunplaBuildLog>
