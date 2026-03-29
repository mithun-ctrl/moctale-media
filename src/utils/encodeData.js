/**
 * Encodes an array of image URLs into a URL-safe Base64 string.
 * Used to embed multiple image URLs into a single shareable link.
 *
 * @param {string[]} urls - Array of image URLs to encode
 * @returns {string} URL-safe Base64-encoded JSON string
 */
export function encodeImageUrls(urls) {
  try {
    const json = JSON.stringify(urls)
    // Convert to Base64 using TextEncoder for Unicode safety
    const bytes = new TextEncoder().encode(json)
    let binary = ''
    bytes.forEach(byte => (binary += String.fromCharCode(byte)))
    const base64 = btoa(binary)
    // Make URL-safe by replacing + with - and / with _
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } catch (err) {
    console.error('Error encoding image URLs:', err)
    throw new Error('Failed to encode image URLs')
  }
}

/**
 * Builds the full shareable URL for a collection of images.
 *
 * @param {string[]} urls - Array of image URLs
 * @param {string} [origin] - Base origin URL (defaults to window.location.origin)
 * @returns {string} Full shareable URL
 */
export function buildShareableLink(urls, origin) {
  const base = origin || window.location.origin
  const encoded = encodeImageUrls(urls)
  return `${base}/view?data=${encoded}`
}
