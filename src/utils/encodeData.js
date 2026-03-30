/**
 * Encodes an array of image URLs into a URL-safe Base64 string.
 * Used to embed multiple image URLs into a single shareable link.
 *
 * @param {string[]} urls - Array of image URLs to encode
 * @returns {string} URL-safe Base64-encoded JSON string
 */
export function encodeImageUrls(urls) {
  try {
    if (!urls || urls.length === 0) return '';
    
    // Find the longest common prefix among all URLs
    let prefix = urls[0];
    for (let i = 1; i < urls.length; i++) {
      while (urls[i].indexOf(prefix) !== 0) {
        prefix = prefix.substring(0, prefix.length - 1);
        if (!prefix) break;
      }
    }
    
    // Create an array with the prefix as the first element,
    // followed by the remaining suffixes for each URL
    const suffixes = urls.map(u => u.substring(prefix.length));
    const dataToEncode = [prefix, ...suffixes];
    
    const json = JSON.stringify(dataToEncode)
    const bytes = new TextEncoder().encode(json)
    
    // Convert bytes to binary string efficiently
    const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('')
    const base64 = btoa(binary)
    
    // Return with v3_ prefix to indicate compressed LCP array
    return 'v3_' + base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
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
