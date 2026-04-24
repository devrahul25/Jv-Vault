import { cookies } from "next/headers";
import { getDb, VaultMetaRow, SessionRow } from "./db";
import {
  decrypt,
  deriveKey,
  encrypt,
  hashPassword,
  randomHex,
  sha256Hex,
  VERIFIER_PLAINTEXT,
  verifyPassword,
} from "./crypto";

export const SESSION_COOKIE = "jv_session";
const TTL_MIN = parseInt(process.env.SESSION_TTL_MINUTES || "30", 10);

export function getMeta(): VaultMetaRow | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM vault_meta WHERE id = 1").get() as VaultMetaRow | undefined;
  return row ?? null;
}

export function isInitialized(): boolean {
  return getMeta() !== null;
}

export function initializeVault(masterPassword: string): void {
  if (isInitialized()) throw new Error("Vault is already initialized");
  if (masterPassword.length < 8) throw new Error("Master password must be at least 8 characters");

  const db = getDb();
  const now = Date.now();
  const passwordSalt = randomHex(16);
  const kdfSalt = randomHex(16);
  const passwordHash = hashPassword(masterPassword, passwordSalt);
  const key = deriveKey(masterPassword, kdfSalt);
  const verifierCt = encrypt(VERIFIER_PLAINTEXT, key);

  db.prepare(
    `INSERT INTO vault_meta (id, password_hash, password_salt, kdf_salt, verifier_ct, created_at, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, ?)`
  ).run(passwordHash, passwordSalt, kdfSalt, verifierCt, now, now);
}

/**
 * Create a server session. We generate a random token, send it to the client as
 * an HttpOnly cookie, and store ONLY the SHA-256 of that token server-side
 * alongside the derived AES key (base64-encoded). This means a DB compromise
 * alone does not leak active session cookies, and the key lives only for the
 * session TTL.
 */
export function createSession(
  masterPassword: string,
  email?: string,
  ip?: string
): { ok: true } | { ok: false; error: string } {
  const meta = getMeta();
  if (!meta) return { ok: false, error: "Vault is not initialized" };

  if (!verifyPassword(masterPassword, meta.password_salt, meta.password_hash)) {
    return { ok: false, error: "Invalid master password" };
  }

  const key = deriveKey(masterPassword, meta.kdf_salt);
  // Double-check with verifier ciphertext
  try {
    const pt = decrypt(meta.verifier_ct, key);
    if (pt !== VERIFIER_PLAINTEXT) return { ok: false, error: "Key verification failed" };
  } catch {
    return { ok: false, error: "Key verification failed" };
  }

  const token = randomHex(32);
  const tokenHash = sha256Hex(token);
  const expiresAt = Date.now() + TTL_MIN * 60 * 1000;

  const db = getDb();
  
  if (email) {
    // Upsert member
    const existing = db.prepare("SELECT id FROM members WHERE email = ?").get(email) as any;
    if (!existing) {
      const memberId = `mem_${Date.now()}`;
      db.prepare("INSERT INTO members (id, email, created_at, updated_at) VALUES (?, ?, ?, ?)")
        .run(memberId, email, Date.now(), Date.now());
    }
  }

  db.prepare(
    `INSERT INTO sessions (token_hash, email, ip, key_b64, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(tokenHash, email || null, ip || null, key.toString("base64"), expiresAt, Date.now());

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_MIN * 60,
  });

  return { ok: true };
}

export function destroySession(): void {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    const db = getDb();
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256Hex(token));
  }
  cookies().set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
}

export function currentSession(): SessionRow | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM sessions WHERE token_hash = ?")
    .get(sha256Hex(token)) as SessionRow | undefined;
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(row.token_hash);
    return null;
  }
  return row;
}

export function currentKey(): Buffer | null {
  const s = currentSession();
  if (!s) return null;
  return Buffer.from(s.key_b64, "base64");
}

export function requireKey(): Buffer {
  const k = currentKey();
  if (!k) throw new Error("Not authenticated");
  return k;
}

export function cleanupExpiredSessions(): void {
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
}
