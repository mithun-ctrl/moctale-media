/**
 * Decodes a URL-safe Base64 string back into an array of image URLs.
 * Handles both standard Base64 links and v3_ LZP-compressed links.
 *
 * @param {string} encoded - URL-safe Base64-encoded string, or v3_prefix
 * @returns {string[]} Array of image URLs
 */
export function decodeImageUrls(encoded) {
  try {
    if (!encoded) return []
    
    let json = ''
    let isV3 = false
    
    if (encoded.startsWith('v3_')) {
      isV3 = true
      const base64Str = encoded.slice(3).replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64Str + '='.repeat((4 - (base64Str.length % 4)) % 4)
      const binary = atob(padded)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      json = new TextDecoder().decode(bytes)
    } else {
      // Fallback for old uncompressed Base64 links
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
      const binary = atob(padded)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      json = new TextDecoder().decode(bytes)
    }

    const parsed = JSON.parse(json)
    if (!Array.isArray(parsed)) {
      throw new Error('Decoded data is not an array')
    }
    
    if (isV3) {
      if (parsed.length === 0) return []
      const prefix = parsed[0]
      const suffixes = parsed.slice(1)
      return suffixes.map(suffix => prefix + suffix).filter(url => typeof url === 'string' && url.length > 0)
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
