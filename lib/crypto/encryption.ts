/**
 * Client-side encryption for API keys using Web Crypto API
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

/**
 * Derive encryption key from user ID
 */
async function deriveKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId);

  // Hash the userId to get consistent key material
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  return crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt API key
 */
export async function encryptApiKey(apiKey: string, userId: string): Promise<string> {
  const key = await deriveKey(userId);
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );

  // Combine IV + encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt API key
 */
export async function decryptApiKey(encryptedKey: string, userId: string): Promise<string> {
  const key = await deriveKey(userId);

  // Decode from base64
  const combined = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));

  // Extract IV and encrypted data
  const iv = combined.slice(0, IV_LENGTH);
  const data = combined.slice(IV_LENGTH);

  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Mask API key for display (show only last 4 chars)
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) return '••••••••';

  const visibleChars = 4;
  const masked = '•'.repeat(Math.max(8, apiKey.length - visibleChars));
  const visible = apiKey.slice(-visibleChars);

  return `${masked}${visible}`;
}
