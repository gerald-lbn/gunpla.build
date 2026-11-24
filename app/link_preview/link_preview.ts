import linkPreviewConfig from '#config/link_preview'
import type { LinkPreviewImage } from '#types/link_preview'

type LinkPreviewOptions = {
  path: string
  title?: string
  description?: string
  image?: LinkPreviewImage
  type?: 'website' | 'article' | 'profile'
}

/**
 * What a link to a page shows when it is pasted into Bluesky, Discord or a
 * chat app: the Open Graph and Twitter card tags of the HTML shell.
 *
 * Crawlers do not run the React app, so these tags are rendered by the Edge
 * layout from view props, not by `<Head>`.
 */
export default class LinkPreview {
  readonly path: string
  readonly title: string | null
  readonly description: string
  readonly image: LinkPreviewImage
  readonly type: 'website' | 'article' | 'profile'

  constructor({ path, title, description, image, type }: LinkPreviewOptions) {
    this.path = path
    this.title = title?.trim() || null
    this.description = LinkPreview.#clip(
      description?.trim() || linkPreviewConfig.description.default
    )
    this.image = image ?? linkPreviewConfig.fallbackImage
    this.type = type ?? 'website'
  }

  get documentTitle(): string {
    const { siteName, titleSeparator } = linkPreviewConfig
    return this.title ? `${this.title}${titleSeparator}${siteName}` : siteName
  }

  get url(): string {
    return LinkPreview.#absolute(this.path)
  }

  get imageUrl(): string {
    return LinkPreview.#absolute(this.image.path)
  }

  toViewProps() {
    return {
      linkPreview: {
        documentTitle: this.documentTitle,
        title: this.title ?? linkPreviewConfig.siteName,
        description: this.description,
        url: this.url,
        type: this.type,
        siteName: linkPreviewConfig.siteName,
        twitterCard: linkPreviewConfig.twitterCard,
        image: {
          url: this.imageUrl,
          type: this.image.type,
          width: this.image.width,
          height: this.image.height,
          alt: this.image.alt,
        },
      },
    }
  }

  static #absolute(path: string): string {
    return new URL(path, linkPreviewConfig.baseUrl).toString()
  }

  static #clip(text: string): string {
    const flat = text.replace(/\s+/g, ' ')
    const { maxLength } = linkPreviewConfig.description
    if (flat.length <= maxLength) {
      return flat
    }
    return `${flat.slice(0, maxLength - 3).replace(/\s+\S*$/, '')}…`
  }
}
