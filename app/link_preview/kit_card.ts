import { urlFor } from '@adonisjs/core/services/url_builder'
import { AtUri } from '@atproto/syntax'
import type Kit from '#kits/models/kit'
import { getBlobUrl } from '#kits/helpers/atproto'
import CardImage from '#link_preview/card_image'
import linkPreviewConfig from '#config/link_preview'
import type { LinkPreviewImage } from '#types/link_preview'

/**
 * The link preview card of one kit: its cover photo beside its name,
 * status, grade, scale and builder.
 */
export default class KitCard {
  /**
   * The cover photo fills the left square of the card.
   */
  static readonly photoSize = CardImage.height

  static readonly statusStickers: Record<string, { label: string; colour: string }> = {
    'done': { label: 'Built', colour: CardImage.colours.vfin },
    'in-progress': { label: 'Building', colour: CardImage.colours.fedBlue },
    'backlog': { label: 'Backlog', colour: CardImage.colours.runner },
    'on-hold': { label: 'On hold', colour: CardImage.colours.runner },
    'dropped': { label: 'Dropped', colour: CardImage.colours.shield },
  }

  readonly kit: Kit
  readonly handle: string
  readonly pdsUrl: string | null

  constructor(kit: Kit, handle: string, pdsUrl: string | null) {
    this.kit = kit
    this.handle = handle
    this.pdsUrl = pdsUrl
  }

  get rkey(): string {
    return new AtUri(this.kit.uri).rkey
  }

  get version(): string {
    return this.kit.cid ?? String(this.kit.indexedAt.toMillis())
  }

  get path(): string {
    return urlFor(
      'kits.card',
      { handle: this.handle, rkey: this.rkey },
      { qs: { v: this.version } }
    )
  }

  get status(): { label: string; colour: string } {
    return (
      KitCard.statusStickers[this.kit.status] ?? {
        label: this.kit.status,
        colour: CardImage.colours.runner,
      }
    )
  }

  get alt(): string {
    const spec = [this.kit.grade, this.kit.scale].filter(Boolean).join(' ')
    return `${this.kit.name}${spec ? `, ${spec}` : ''}, ${this.status.label.toLowerCase()} on @${this.handle}'s shelf`
  }

  cacheControl(requestedVersion: unknown): string {
    const { cacheControl } = linkPreviewConfig.cards
    return requestedVersion === this.version ? cacheControl.current : cacheControl.stale
  }

  toLinkPreviewImage(): LinkPreviewImage {
    return {
      path: this.path,
      type: linkPreviewConfig.cards.type,
      width: CardImage.width,
      height: CardImage.height,
      alt: this.alt,
    }
  }

  /**
   * Where to fetch the cover photo from, in order. Bluesky's image CDN
   * serves a small JPEG of the blob; the builder's PDS serves the original,
   * which can be several megabytes.
   */
  get photoUrls(): string[] {
    const coverCid = this.kit.photos?.[0]
    if (!coverCid) {
      return []
    }
    return [
      getBlobUrl(null, this.kit.did, coverCid, 'thumb'),
      ...(this.pdsUrl ? [getBlobUrl(this.pdsUrl, this.kit.did, coverCid, 'full')] : []),
    ]
  }

  /**
   * Draws the card, with `photo` (a data URI of the cover photo, cropped
   * to `photoSize`) on the left, or the grade on yellow when it is `null`.
   */
  async toJpeg(photo: string | null): Promise<Buffer> {
    const { ink, paper, vfin } = CardImage.colours
    const { box, image } = CardImage
    const side = KitCard.photoSize

    const sticker = (text: string, background: string, color: string, border?: string) =>
      box(
        {
          height: 52,
          padding: '0 24px',
          alignItems: 'center',
          borderRadius: 26,
          background,
          color,
          fontSize: 26,
          fontWeight: 800,
          border: border ?? 'none',
        },
        text
      )

    const name = this.kit.name
    const nameSize = name.length <= 18 ? 120 : name.length <= 36 ? 92 : 70

    return new CardImage(
      box(
        {
          width: CardImage.width,
          height: CardImage.height,
          background: paper,
          color: ink,
          fontFamily: CardImage.fonts.text,
        },
        [
          photo
            ? image(photo, { width: side, height: side, objectFit: 'cover' })
            : box(
                {
                  width: side,
                  height: side,
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: vfin,
                  fontFamily: CardImage.fonts.display,
                  fontSize: 300,
                  textTransform: 'uppercase',
                },
                this.kit.grade ?? 'GP'
              ),
          box(
            {
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '52px 52px 48px',
            },
            [
              box({ gap: 10, flexWrap: 'wrap' }, [
                sticker(this.status.label, this.status.colour, ink),
                this.kit.grade && sticker(this.kit.grade, ink, paper),
                this.kit.scale && sticker(this.kit.scale, paper, ink, `3px solid ${ink}`),
              ]),
              box(
                {
                  display: 'block',
                  lineClamp: 4,
                  fontFamily: CardImage.fonts.display,
                  fontSize: nameSize,
                  lineHeight: 0.9,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                },
                name
              ),
              box({ flexDirection: 'column', gap: 18 }, [
                box({ fontSize: 30, fontWeight: 600 }, `@${this.handle}`),
                CardImage.wordmark(44),
              ]),
            ]
          ),
        ]
      )
    ).toJpeg()
  }
}
