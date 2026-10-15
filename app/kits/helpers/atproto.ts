export function getBlobUrl(
  pdsUrl: string | null,
  did: string,
  cid: string,
  format: 'thumb' | 'full' = 'thumb'
): string {
  if (pdsUrl) {
    return `${pdsUrl}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`
  }
  const type = format === 'thumb' ? 'feed_thumbnail' : 'feed_fullsize'
  return `https://cdn.bsky.app/img/${type}/plain/${encodeURIComponent(did)}/${encodeURIComponent(cid)}@jpeg`
}
