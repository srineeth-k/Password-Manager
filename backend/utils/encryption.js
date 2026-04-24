import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt plaintext using AES-256-GCM
 * @param {string} text - The plaintext to encrypt
 * @returns {{ encrypted: string, iv: string, authTag: string }}
 */
export function encrypt(text) {
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * @param {string} encrypted - The encrypted hex string
 * @param {string} iv - The initialization vector (hex)
 * @param {string} authTag - The authentication tag (hex)
 * @returns {string} The decrypted plaintext
 */
export function decrypt(encrypted, iv, authTag) {
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
