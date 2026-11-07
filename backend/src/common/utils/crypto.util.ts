import * as crypto from 'crypto';

/**
 * Generates a high-entropy cryptographically secure random token (hex string).
 */
export function generateSecureToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * Computes a SHA-256 hash of a string/token for safe indexing and lookup in the database.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
