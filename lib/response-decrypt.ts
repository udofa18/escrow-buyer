/**
 * Decrypt API responses that return encrypted { data: "ivHex:ciphertext..." }.
 * Uses auth backend decrypt endpoint when available; falls back to client-side CryptoJS.
 */

import CryptoJS from 'crypto-js';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL;
const DECRYPT_ENDPOINT = AUTH_URL ? `${AUTH_URL.replace(/\/$/, '')}/test-handling/encryption/decrypt` : '';

function isEncryptedPayload(body: unknown): body is { data: string } {
  return (
    typeof body === 'object' &&
    body !== null &&
    'data' in body &&
    typeof (body as { data: unknown }).data === 'string'
  );
}

function looksLikeEncrypted(data: string): boolean {
  const parts = data.split(':');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  return /^[0-9a-fA-F]+$/.test(parts[0]);
}

/**
 * Decrypt via auth backend API.
 */
async function decryptViaApi(encryptedData: string): Promise<object> {
  if (!DECRYPT_ENDPOINT) {
    throw new Error('NEXT_PUBLIC_AUTH_URL not set');
  }
  const res = await fetch(DECRYPT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: encryptedData }),
  });
  const raw = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (raw as { message?: string }).message || res.statusText;
    throw new Error(`Decrypt API error: ${msg}`);
  }
  if (raw && typeof (raw as { data?: unknown }).data !== 'undefined') {
    return (raw as { data: object }).data;
  }
  return raw as object;
}

function getDecryptionKey(): CryptoJS.lib.WordArray {
  const key =
    process.env.NEXT_PUBLIC_ENCRYPTION_KEY ||
    process.env.NEXT_PUBLIC_ESCROW_DECRYPT_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_ENCRYPTION_KEY (or NEXT_PUBLIC_ESCROW_DECRYPT_KEY) is not set');
  }
  return CryptoJS.enc.Hex.parse(key);
}

function isHexString(s: string): boolean {
  return /^[0-9a-fA-F]+$/.test(s);
}

function decryptDataClient(encryptedData: string): object {
  const [ivHex, encryptedPart] = encryptedData.split(':');
  if (!ivHex || !encryptedPart) throw new Error('Invalid encrypted data format');

  const key = getDecryptionKey();
  const iv = CryptoJS.enc.Hex.parse(ivHex);

  let decrypted: CryptoJS.lib.WordArray;
  if (isHexString(encryptedPart)) {
    const ciphertext = CryptoJS.enc.Hex.parse(encryptedPart);
    decrypted = CryptoJS.AES.decrypt(
      { ciphertext } as CryptoJS.lib.CipherParams,
      key,
      { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
  } else {
    decrypted = CryptoJS.AES.decrypt(encryptedPart, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
  }

  const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
  if (!decryptedText) throw new Error('Decryption failed (wrong key or invalid data)');
  return JSON.parse(decryptedText) as object;
}

/**
 * If body is encrypted { data: "..." }, decrypt (via API or client) and return parsed JSON; else return body as-is.
 */
export async function decryptResponse<T = unknown>(body: unknown): Promise<T> {
  if (!isEncryptedPayload(body)) return body as T;

  const data = body.data;
  if (!looksLikeEncrypted(data)) return body as T;

  try {
    let parsed: object;
    if (DECRYPT_ENDPOINT) {
      parsed = await decryptViaApi(data);
      console.log('[response-decrypt] decrypted via API', parsed);
    } else {
      parsed = decryptDataClient(data);
      console.log('[response-decrypt] decrypted (client)', parsed);
    }
    return parsed as T;
  } catch (e) {
    if (DECRYPT_ENDPOINT) {
      console.warn('[response-decrypt] API decrypt failed, trying client fallback', e);
      try {
        const parsed = decryptDataClient(data) as T;
        console.log('[response-decrypt] decrypted (client fallback)', parsed);
        return parsed;
      } catch (e2) {
        console.error('[response-decrypt] decrypt failed', e2);
        throw e2;
      }
    }
    console.error('[response-decrypt] decrypt failed', e);
    throw e;
  }
}
