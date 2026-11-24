export type LinkPreviewImageType = 'image/png' | 'image/jpeg'

export type LinkPreviewImage = {
  path: string
  type: LinkPreviewImageType
  width: number
  height: number
  alt: string
}

/**
 * A drawn link preview card: the card, for its version and headers, and its
 * JPEG.
 */
export type DrawnCard<Card> = {
  card: Card
  image: Buffer
}
