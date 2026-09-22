/**
 * Sovereign Citizen Cryptographic Passport & Action Signing (Agent SIM-0 & SIM-5)
 * Class-0 Invariant: Zero-Registration, Zero-Passwords, 100% Client-Side Cryptography.
 *
 * Implements:
 * 1. Web Crypto API ECDSA P-256 Keypair generation (inviolable citizen sovereignty).
 * 2. Passport Token format: ONE:<Name>:<TimestampMs>:<SaltHex>:<PublicKeyHex>
 * 3. Cryptographic signature of simulation deltas & actions.
 * 4. Invertible zero-backend token parsing for PC ↔ Phone ↔ Tablet sync.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

function bufToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function hexToBuf(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

function getRandomSalt(bytesCount = 4) {
  const bytes = new Uint8Array(bytesCount);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytesCount; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return bufToHex(bytes);
}

export class CitizenPassportManager {
  /**
   * Generates a new sovereign citizen identity with ECDSA P-256 keypair.
   * @param {string} avatarName - Chosen avatar name (e.g. "John")
   * @param {string} vocationId - Initial chosen vocation (e.g. "farmer")
   * @returns {Promise<{ passport: object, privateKeyJwk: object }>}
   */
  static async issueSovereignPassport(avatarName = 'Pioneer', vocationId = 'farmer', appearance = null) {
    const cleanName = (avatarName.trim() || 'Pioneer').replace(/[:\s]+/g, '_');
    const timestampMs = Date.now();
    const saltHex = getRandomSalt(4);

    let pubKeyHex = '';
    let privateKeyJwk = null;

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      try {
        const keyPair = await crypto.subtle.generateKey(
          {
            name: 'ECDSA',
            namedCurve: 'P-256'
          },
          true,
          ['sign', 'verify']
        );

        // Export public key in raw format (uncompressed 65 bytes = 130 hex chars)
        const rawPubKey = await crypto.subtle.exportKey('raw', keyPair.publicKey);
        pubKeyHex = bufToHex(rawPubKey);

        // Export private key in JWK format for secure local storage
        privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
      } catch (err) {
        console.warn('[Passport] WebCrypto ECDSA fallback:', err);
        pubKeyHex = 'fallback_' + getRandomSalt(16);
      }
    } else {
      pubKeyHex = 'compat_' + getRandomSalt(16);
    }

    const token = `ONE:${encodeURIComponent(cleanName)}:${timestampMs}:${saltHex}:${pubKeyHex}`;
    const shortFingerprint = pubKeyHex.slice(0, 8) + '…' + pubKeyHex.slice(-6);

    const passport = {
      id: `cit-${saltHex}-${timestampMs}`,
      name: cleanName,
      vocationId,
      appearance: appearance || null,
      timestampMs,
      saltHex,
      pubKeyHex,
      shortFingerprint,
      token,
      createdAt: new Date(timestampMs).toISOString(),
      reputationScore: 100, // Starts with full cooperative trust
      signedActionsCount: 0
    };

    return { passport, privateKeyJwk };
  }

  /**
   * Parses and validates a sovereign passport token.
   * Reversible: extracts name, creation timestamp, salt, and public key without any server.
   * @param {string} token
   * @returns {object|null}
   */
  static parseToken(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.trim().split(':');
    if (parts.length < 5 || parts[0] !== 'ONE') {
      return null;
    }

    const rawName = decodeURIComponent(parts[1]);
    const timestampMs = parseInt(parts[2], 10);
    const saltHex = parts[3];
    const pubKeyHex = parts.slice(4).join(':'); // Handle any colons

    if (isNaN(timestampMs) || !saltHex || !pubKeyHex) {
      return null;
    }

    const shortFingerprint = pubKeyHex.slice(0, 8) + '…' + pubKeyHex.slice(-6);

    return {
      valid: true,
      id: `cit-${saltHex}-${timestampMs}`,
      name: rawName,
      timestampMs,
      saltHex,
      pubKeyHex,
      shortFingerprint,
      token,
      createdAt: new Date(timestampMs).toISOString()
    };
  }

  /**
   * Signs an action delta using the citizen's ECDSA private key.
   * @param {object} actionPayload - The action details
   * @param {object} privateKeyJwk - The stored JWK private key
   * @returns {Promise<string>} Hex signature
   */
  static async signAction(actionPayload, privateKeyJwk) {
    if (!privateKeyJwk || typeof crypto === 'undefined' || !crypto.subtle) {
      return 'unsigned_' + Date.now();
    }

    try {
      const privateKey = await crypto.subtle.importKey(
        'jwk',
        privateKeyJwk,
        {
          name: 'ECDSA',
          namedCurve: 'P-256'
        },
        false,
        ['sign']
      );

      const encoder = new TextEncoder();
      const actionBytes = encoder.encode(JSON.stringify(actionPayload));

      const signature = await crypto.subtle.sign(
        {
          name: 'ECDSA',
          hash: { name: 'SHA-256' }
        },
        privateKey,
        actionBytes
      );

      return bufToHex(signature);
    } catch (err) {
      console.error('[Passport] Signing error:', err);
      return 'err_sig_' + Date.now();
    }
  }

  /**
   * Verifies an action delta's signature using the citizen's public key.
   * @param {object} actionPayload
   * @param {string} signatureHex
   * @param {string} pubKeyHex
   * @returns {Promise<boolean>}
   */
  static async verifyAction(actionPayload, signatureHex, pubKeyHex) {
    if (!pubKeyHex || !signatureHex || typeof crypto === 'undefined' || !crypto.subtle) {
      return false;
    }
    if (signatureHex.startsWith('unsigned_') || signatureHex.startsWith('err_sig_')) {
      return false;
    }

    try {
      const pubKeyBuf = hexToBuf(pubKeyHex);
      const signatureBuf = hexToBuf(signatureHex);

      const publicKey = await crypto.subtle.importKey(
        'raw',
        pubKeyBuf,
        {
          name: 'ECDSA',
          namedCurve: 'P-256'
        },
        false,
        ['verify']
      );

      const encoder = new TextEncoder();
      const actionBytes = encoder.encode(JSON.stringify(actionPayload));

      return await crypto.subtle.verify(
        {
          name: 'ECDSA',
          hash: { name: 'SHA-256' }
        },
        publicKey,
        signatureBuf,
        actionBytes
      );
    } catch (err) {
      console.warn('[Passport] Verification failed:', err);
      return false;
    }
  }

  /**
   * Creates an append-only, cryptographically signed event delta
   * @param {string} actionType - e.g. 'CHORE_ALLOCATION' | 'COUNCIL_VOTE' | 'CLAIM_DWELLING'
   * @param {object} payload - Action parameters
   * @param {object} passport - The citizen passport
   * @param {object} privateKeyJwk - The citizen private key
   * @param {number} tick - Current simulation tick
   * @returns {Promise<object>} Complete signed delta
   */
  static async createSignedDelta(actionType, payload, passport, privateKeyJwk, tick = 0) {
    const rawAction = {
      type: actionType,
      payload,
      tick,
      authorToken: passport ? passport.token : 'anonymous',
      authorName: passport ? passport.name : 'Unknown',
      timestamp: Date.now()
    };

    const signature = await this.signAction(rawAction, privateKeyJwk);

    return {
      id: `delta-${Date.now()}-${getRandomSalt(2)}`,
      ...rawAction,
      signature
    };
  }
}
