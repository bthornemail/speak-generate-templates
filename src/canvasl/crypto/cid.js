/**
 * Content Addressing - CID computation and verification
 */

/**
 * Compute Content Identifier (CID) from content
 *
 * Uses SHA-256 hash with canonical JSON serialization
 *
 * @param {*} content - Content to hash
 * @returns {Promise<string>} CID (base58-encoded hash)
 */
export async function computeCID(content) {
  // Canonical JSON: sorted keys
  const canonical = JSON.stringify(content, Object.keys(content).sort());

  // Encode to bytes
  const encoder = new TextEncoder();
  const buffer = encoder.encode(canonical);

  // SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);

  // Convert to base58 (simplified - using hex for now)
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // IPFS-style CID prefix (simplified)
  return 'bafybei' + hashHex.slice(0, 50);
}

/**
 * Verify CID matches content
 *
 * @param {string} cid - Claimed CID
 * @param {*} content - Content to verify
 * @returns {Promise<boolean>} True if CID matches
 */
export async function verifyCID(cid, content) {
  const computed = await computeCID(content);
  return computed === cid;
}

/**
 * Convert Uint8Array to base58 (simplified)
 *
 * @param {Uint8Array} bytes - Input bytes
 * @returns {string} Base58-encoded string
 */
function toBase58(bytes) {
  // Simplified implementation - just use hex for now
  // TODO: Implement proper base58 encoding
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
