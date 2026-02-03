// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  CORNER - Password Security Module                                        ║
// ║  Search "CORNER" to find password configuration                           ║
// ║  To change: update CORNER_PASSWORD below, hash is auto-computed           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * CORNER: The password to access the app
 * Change this value to set a new password
 * The hash is computed automatically at runtime
 */
const CORNER_PASSWORD = '11018240';

/**
 * CORNER: Salt for password hashing
 * Adds security to prevent rainbow table attacks
 */
const CORNER_SALT = '_corner_salt_2026';

// Cache for the computed hash
let cachedHash: string | null = null;

/**
 * Hash a password using SHA-256 with salt
 * CORNER: Use this to generate hashes for new passwords
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + CORNER_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get the cached password hash or compute it
 */
async function getPasswordHash(): Promise<string> {
  if (!cachedHash) {
    cachedHash = await hashPassword(CORNER_PASSWORD);
  }
  return cachedHash;
}

/**
 * Verify a password against the stored password
 * CORNER: This is the main verification function
 */
export async function verifyPassword(inputPassword: string): Promise<boolean> {
  const inputHash = await hashPassword(inputPassword);
  const correctHash = await getPasswordHash();
  return inputHash === correctHash;
}

// CORNER: To change password, simply modify CORNER_PASSWORD above
// The hash comparison happens automatically at runtime
