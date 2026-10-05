export function getBlobUrl(did: string, cid: string, format: 'thumb' | 'full' = 'thumb'): string {
  const type = format === 'thumb' ? 'feed_thumbnail' : 'feed_fullsize'
  return `https://cdn.bsky.app/img/${type}/plain/${encodeURIComponent(did)}/${encodeURIComponent(cid)}@jpeg`
}
