/**
 * Decodes a URL-safe Base64 string back into an array of image URLs.
 *
 * @param {string} encoded - URL-safe Base64-encoded string
 * @returns {string[]} Array of image URLs
 */
export function decodeImageUrls(encoded) {
  try {
    if (!encoded) return []
    // Restore standard Base64 characters
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const json = new TextDecoder().decode(bytes)
    const parsed = JSON.parse(json)
    if (!Array.isArray(parsed)) {
      throw new Error('Decoded data is not an array')
    }
    return parsed.filter(url => typeof url === 'string' && url.length > 0)
  } catch (err) {
    console.error('Error decoding image URLs:', err)
    return []
  }
}

/**
 * Parses image URLs from the current page's URL query string.
 *
 * @returns {{ urls: string[], error: string|null }}
 */
export function parseUrlData() {
  try {
    const params = new URLSearchParams(window.location.search)
    const data = params.get('data')
    if (!data) {
      return { urls: [], error: 'No data found in URL.' }
    }
    const urls = decodeImageUrls(data)
    if (urls.length === 0) {
      return { urls: [], error: 'Could not decode image URLs from this link.' }
    }
    return { urls, error: null }
  } catch {
    return { urls: [], error: 'Invalid or corrupted share link.' }
  }
}
