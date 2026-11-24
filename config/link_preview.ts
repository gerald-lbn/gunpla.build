import env from '#start/env'
import type { LinkPreviewImage, LinkPreviewImageType } from '#types/link_preview'

/**
 * The size every preview image is made at: the 1.91:1 that Open Graph and
 * Twitter cards show without cropping.
 */
const imageSize = { width: 1200, height: 630 }

/**
 * Link previews: the Open Graph and Twitter card tags of each page, and the
 * generated kit and profile cards they point at.
 */
const linkPreviewConfig = {
  /**
   * Shown as `og:site_name`, and after the page title: `Title - gunpla.build`.
   */
  siteName: 'gunpla.build',
  titleSeparator: ' - ',

  /**
   * Origin that page and image URLs are made absolute against. Crawlers
   * need absolute URLs.
   */
  baseUrl: env.get('PUBLIC_URL'),

  description: {
    /**
     * For pages that do not pass their own.
     */
    default:
      'A shelf for your Gunpla builds, stored in your own AT Protocol repository. Log kits by grade and scale, add photos, and browse what the community is building.',

    /**
     * Previews cut descriptions off around here, so they are clipped at a
     * word before it.
     */
    maxLength: 200,
  },

  twitterCard: 'summary_large_image',

  /**
   * For pages without a card of their own: home, explore, stats, sign-in
   * and error pages.
   */
  fallbackImage: {
    path: '/og-default.png',
    type: 'image/png',
    ...imageSize,
    alt: 'Build it. Shelf it. Your Gunpla shelf, on the AT Protocol: gunpla.build',
  } satisfies LinkPreviewImage as LinkPreviewImage,

  /**
   * The generated kit and profile cards.
   */
  cards: {
    ...imageSize,
    type: 'image/jpeg' as LinkPreviewImageType,
    jpegQuality: 88,

    /**
     * How long to wait for a kit photo or an avatar before drawing the card
     * without it.
     */
    photoTimeoutMs: 4000,

    /**
     * A card URL carries its version, so the current version can be cached
     * for good. A request for any other version is cached only briefly.
     */
    cacheControl: {
      current: 'public, max-age=31536000, immutable',
      stale: 'public, max-age=300',
    },
  },
}

export default linkPreviewConfig
