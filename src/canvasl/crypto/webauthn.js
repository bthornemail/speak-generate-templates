/**
 * WebAuthn Integration - Biometric authentication
 */

/**
 * Register a new WebAuthn credential
 *
 * @returns {Promise<PublicKeyCredential>} The created credential
 */
export async function registerWebAuthn() {
  if (!navigator.credentials) {
    throw new Error('WebAuthn not supported in this browser');
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));

  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'CANVASL A₁₁',
          id: window.location.hostname
        },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: 'canvasl-user',
          displayName: 'CANVASL User'
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },  // ES256
          { type: 'public-key', alg: -257 } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required'
        },
        timeout: 60000,
        attestation: 'direct'
      }
    });

    return credential;
  } catch (error) {
    console.error('WebAuthn registration failed:', error);
    throw error;
  }
}

/**
 * Authenticate with existing WebAuthn credential
 *
 * @param {string} credentialId - Credential ID to authenticate
 * @returns {Promise<PublicKeyCredential>} The authentication assertion
 */
export async function authenticateWebAuthn(credentialId) {
  if (!navigator.credentials) {
    throw new Error('WebAuthn not supported in this browser');
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));

  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{
          type: 'public-key',
          id: Uint8Array.from(atob(credentialId), c => c.charCodeAt(0))
        }],
        timeout: 60000,
        userVerification: 'required'
      }
    });

    return assertion;
  } catch (error) {
    console.error('WebAuthn authentication failed:', error);
    throw error;
  }
}

/**
 * Extract public key from WebAuthn credential
 *
 * @param {PublicKeyCredential} credential - WebAuthn credential
 * @returns {Promise<CryptoKey>} Extracted public key
 */
export async function extractPublicKey(credential) {
  // Parse attestation object
  const response = credential.response;
  const attestationObject = response.attestationObject;

  // This is a simplified version - proper implementation would parse CBOR
  // and extract the public key from the attestation object

  // For now, return a placeholder
  console.warn('extractPublicKey: Simplified implementation');
  return null;
}
