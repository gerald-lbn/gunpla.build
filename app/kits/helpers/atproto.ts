export function getBlobUrl(
  pdsUrl: string | null,
  did: string,
  cid: string,
  format: 'thumb' | 'full' = 'thumb'
): string {
  const blob = `${encodeURIComponent(did)}/${encodeURIComponent(cid)}`
  if (format === 'thumb') {
    return `https://cdn.bsky.app/img/feed_thumbnail/plain/${blob}@webp`
  }
  if (pdsUrl) {
    return `${pdsUrl}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`
  }
  return `https://cdn.bsky.app/img/feed_fullsize/plain/${blob}@jpeg`
}
