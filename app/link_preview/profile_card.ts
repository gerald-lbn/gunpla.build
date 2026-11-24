import { urlFor } from '@adonisjs/core/services/url_builder'
import type Profile from '#profile/models/profile'
import CardImage from '#link_preview/card_image'
import linkPreviewConfig from '#config/link_preview'
import type { LinkPreviewImage } from '#types/link_preview'

/**
 * The link preview card of a builder: their avatar, name and handle, and
 * how many kits are on their shelf.
 */
export default class ProfileCard {
  static readonly avatarSize = 300

  readonly profile: Profile
  readonly kitCount: number

  constructor(profile: Profile, kitCount: number) {
    this.profile = profile
    this.kitCount = kitCount
  }

  get name(): string {
    return this.profile.displayName?.trim() || this.profile.handle
  }

  get version(): string {
    const synced = (this.profile.updatedAt ?? this.profile.indexedAt).toMillis()
    return `${synced}-${this.kitCount}`
  }

  get path(): string {
    return urlFor('profiles.card', { handle: this.profile.handle }, { qs: { v: this.version } })
  }

  get kitCountLabel(): string {
    return `${this.kitCount} ${this.kitCount === 1 ? 'kit' : 'kits'}`
  }

  get alt(): string {
    return `${this.name} (@${this.profile.handle}), ${this.kitCountLabel} on the shelf`
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
   * Where to fetch the avatar from: Bluesky's image CDN.
   */
  get avatarUrls(): string[] {
    return this.profile.avatarUrl ? [this.profile.avatarUrl] : []
  }

  /**
   * Draws the card, with `avatar` (a data URI cropped to `avatarSize`) in
   * the circle, or the first letter of the name when it is `null`.
   */
  async toJpeg(avatar: string | null): Promise<Buffer> {
    const { ink, paper, vfin, fedBlue } = CardImage.colours
    const { box, image } = CardImage
    const avatarSize = ProfileCard.avatarSize

    const name = this.name
    const nameSize = name.length <= 14 ? 132 : name.length <= 26 ? 100 : 76

    return new CardImage(
      box(
        {
          width: CardImage.width,
          height: CardImage.height,
          background: vfin,
          color: ink,
          fontFamily: CardImage.fonts.text,
        },
        box({ flex: 1, flexDirection: 'column', justifyContent: 'space-between', padding: 64 }, [
          box({ height: avatarSize, alignItems: 'center', gap: 56 }, [
            avatar
              ? image(avatar, {
                  width: avatarSize,
                  height: avatarSize,
                  flexShrink: 0,
                  borderRadius: '50%',
                  border: `8px solid ${ink}`,
                })
              : box(
                  {
                    width: avatarSize,
                    height: avatarSize,
                    flexShrink: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: fedBlue,
                    border: `8px solid ${ink}`,
                    fontFamily: CardImage.fonts.display,
                    fontSize: 170,
                    textTransform: 'uppercase',
                  },
                  name.slice(0, 1)
                ),
            box({ flex: 1, minWidth: 0, flexDirection: 'column', gap: 18 }, [
              box(
                {
                  display: 'block',
                  lineClamp: 2,
                  fontFamily: CardImage.fonts.display,
                  fontSize: nameSize,
                  lineHeight: 0.9,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                },
                name
              ),
              box({ fontSize: 34, fontWeight: 600 }, `@${this.profile.handle}`),
            ]),
          ]),
          box({ height: 96, alignItems: 'flex-end', justifyContent: 'space-between' }, [
            box(
              {
                height: 96,
                padding: '0 40px',
                alignItems: 'center',
                borderRadius: 48,
                background: ink,
                color: paper,
                fontFamily: CardImage.fonts.display,
                fontSize: 72,
                textTransform: 'uppercase',
              },
              this.kitCountLabel
            ),
            CardImage.wordmark(56, vfin),
          ]),
        ])
      )
    ).toJpeg()
  }
}
