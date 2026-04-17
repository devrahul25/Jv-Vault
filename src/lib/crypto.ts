import crypto from "node:crypto";

/**
 * Crypto model
 * ------------
 * Master password → scrypt(password, kdf_salt) → 32-byte AES key.
 * All secret fields are encrypted with AES-256-GCM (random 12-byte IV per record).
 * Ciphertext format: base64( iv(12) || authTag(16) || ciphertext )
 *
 * A "verifier" ciphertext of a known plaintext is stored at setup time.
 * On login we derive the key and try to decrypt the verifier; if it works,
 * the password is correct and the key is valid.
 */

const SCRYPT_N = 1 << 15; // 32768
const SCRYPT_r = 8;
const SCRYPT_p = 1;
const KEY_LEN = 32;

export const VERIFIER_PLAINTEXT = "jv-vault-verifier-v1";

export function randomBytes(n: number): Buffer {
  return crypto.randomBytes(n);
}

export function randomHex(n: number): string {
  return crypto.randomBytes(n).toString("hex");
}

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function deriveKey(password: string, saltHex: string): Buffer {
  const salt = Buffer.from(saltHex, "hex");
  return crypto.scryptSync(password, salt, KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_r,
    p: SCRYPT_p,
    maxmem: 128 * SCRYPT_N * SCRYPT_r * 2,
  });
}

export function hashPassword(password: string, saltHex: string): string {
  // Separate hash for login verification — independent of the encryption key.
  const salt = Buffer.from(saltHex, "hex");
  const hash = crypto.scryptSync(password, salt, 64, {
    N: SCRYPT_N,
    r: SCRYPT_r,
    p: SCRYPT_p,
    maxmem: 128 * SCRYPT_N * SCRYPT_r * 2,
  });
  return hash.toString("hex");
}

export function verifyPassword(password: string, saltHex: string, expectedHex: string): boolean {
  const actual = hashPassword(password, saltHex);
  const a = Buffer.from(actual, "hex");
  const b = Buffer.from(expectedHex, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function encrypt(plaintext: string, key: Buffer): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64");
}

export function decrypt(payload: string, key: Buffer): string {
  const buf = Buffer.from(payload, "base64");
  if (buf.length < 12 + 16) throw new Error("Ciphertext too short");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString("utf8");
}

export function tryDecrypt(payload: string | null, key: Buffer): string | null {
  if (!payload) return null;
  try {
    return decrypt(payload, key);
  } catch {
    return null;
  }
}

/**
 * Generate a cryptographically strong password.
 */
export function generatePassword(opts?: {
  length?: number;
  upper?: boolean;
  lower?: boolean;
  digits?: boolean;
  symbols?: boolean;
}): string {
  const length = opts?.length ?? 20;
  const upper = opts?.upper ?? true;
  const lower = opts?.lower ?? true;
  const digits = opts?.digits ?? true;
  const symbols = opts?.symbols ?? true;

  let pool = "";
  if (upper) pool += "ABCDEFGHJKLMNPQRSTUVWXYZ";
  if (lower) pool += "abcdefghijkmnopqrstuvwxyz";
  if (digits) pool += "23456789";
  if (symbols) pool += "!@#$%^&*()-_=+[]{};:,.?/";
  if (!pool) pool = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const out: string[] = [];
  const bytes = crypto.randomBytes(length * 2);
  for (let i = 0; i < length; i++) {
    const idx = bytes.readUInt16BE(i * 2) % pool.length;
    out.push(pool[idx]);
  }
  return out.join("");
}
