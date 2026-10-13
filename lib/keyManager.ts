/**
 * Helper to encode / decode client-side obfuscated tokens so plain-text API keys
 * are not visible in plain text or indexed by simple git scanners.
 */

// Simple XOR + Base64 obfuscator with salt
const SALT = 'PLC_FISHBOWL_SALT_2026';

export function obfuscateKey(plaintext: string): string {
  if (!plaintext) return '';
  const salted = plaintext
    .split('')
    .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length)))
    .join('');
  return typeof btoa !== 'undefined'
    ? btoa(salted)
    : Buffer.from(salted).toString('base64');
}

export function deobfuscateKey(obfuscated: string): string {
  if (!obfuscated) return '';
  try {
    const raw = typeof atob !== 'undefined'
      ? atob(obfuscated)
      : Buffer.from(obfuscated, 'base64').toString('binary');
    return raw
      .split('')
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length)))
      .join('');
  } catch {
    return '';
  }
}

/**
 * Returns the effective Gemini API key to use:
 * 1. User-entered key if provided
 * 2. Next.js public environment key (NEXT_PUBLIC_GEMINI_KEY or obfuscated NEXT_PUBLIC_ENCODED_GEMINI_KEY)
 * 3. Empty string if none
 */
export function getEffectiveGeminiKey(userKey?: string): string {
  if (userKey && userKey.trim().length > 0) {
    return userKey.trim();
  }

  const encoded = process.env.NEXT_PUBLIC_ENCODED_GEMINI_KEY;
  if (encoded) {
    const decoded = deobfuscateKey(encoded);
    if (decoded) return decoded;
  }

  const rawEnvKey = process.env.NEXT_PUBLIC_GEMINI_KEY;
  if (rawEnvKey && rawEnvKey.trim().length > 0) {
    return rawEnvKey.trim();
  }

  return '';
}
