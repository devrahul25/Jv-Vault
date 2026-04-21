import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const RAW_PATH = process.env.VAULT_DB_PATH || "./data/vault.db";
const DB_PATH = path.resolve(process.cwd(), RAW_PATH);

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // -------- Core auth tables (stable) --------
  db.exec(`
    CREATE TABLE IF NOT EXISTS vault_meta (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      kdf_salt TEXT NOT NULL,
      verifier_ct TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      email TEXT,
      ip TEXT,
      key_b64 TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    -- Manual migration for existing table
    PRAGMA table_info(sessions);
  `);

  const sessionCols = db.prepare("PRAGMA table_info(sessions)").all() as Array<{ name: string }>;
  const names = new Set(sessionCols.map((c) => c.name));
  if (!names.has("email")) {
    db.exec("ALTER TABLE sessions ADD COLUMN email TEXT;");
  }
  if (!names.has("ip")) {
    db.exec("ALTER TABLE sessions ADD COLUMN ip TEXT;");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      avatar TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workspace_permissions (
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('full', 'edit', 'comment', 'view')),
      PRIMARY KEY (workspace_id, member_id)
    );

    CREATE TABLE IF NOT EXISTS access_requests (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'denied')),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  // -------- Workspaces (top-level containers) --------
  db.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      top_columns_ct TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_workspaces_position ON workspaces(position);
  `);

  // -------- Notion-style data model --------
  // Light migration. Older builds had either a different clients schema,
  // a separate credentials table, or a single global vault_schema.
  // We walk through and upgrade.
  const clientCols = db.prepare("PRAGMA table_info(clients)").all() as Array<{ name: string }>;
  if (clientCols.length > 0) {
    const names = new Set(clientCols.map((c) => c.name));
    const hasWorkspaceCol = names.has("workspace_id");
    const hasNewShape = names.has("attrs_ct") && names.has("sections_ct");
    if (!hasNewShape || !hasWorkspaceCol) {
      // best-effort: drop and recreate (old encrypted data can't be read without
      // the user's master password anyway; the old build hasn't shipped).
      db.exec(`DROP TABLE IF EXISTS credentials;`);
      db.exec(`DROP TABLE IF EXISTS clients;`);
    }
  } else {
    db.exec(`DROP TABLE IF EXISTS credentials;`);
  }

  // Old global schema table → superseded by workspaces.top_columns_ct
  db.exec(`DROP TABLE IF EXISTS vault_schema;`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      attrs_ct TEXT,
      sections_ct TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_clients_workspace ON clients(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_clients_position ON clients(workspace_id, position);

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      assigned_email TEXT NOT NULL,
      creator_email TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
      due_date INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_client ON tasks(client_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_email);

    CREATE TABLE IF NOT EXISTS task_comments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      author_email TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);
  `);

  _db = db;
  return db;
}

export type VaultMetaRow = {
  id: number;
  password_hash: string;
  password_salt: string;
  kdf_salt: string;
  verifier_ct: string;
  created_at: number;
  updated_at: number;
};

export type SessionRow = {
  token_hash: string;
  email: string | null;
  ip: string | null;
  key_b64: string;
  expires_at: number;
  created_at: number;
};

export type WorkspaceRow = {
  id: string;
  name: string;
  icon: string | null;
  position: number;
  top_columns_ct: string | null;
  created_at: number;
  updated_at: number;
};

export type ClientRow = {
  id: string;
  workspace_id: string;
  name: string;
  position: number;
  attrs_ct: string | null;
  sections_ct: string | null;
  created_at: number;
  updated_at: number;
};

export type TaskRow = {
  id: string;
  client_id: string;
  assigned_email: string;
  creator_email: string;
  title: string;
  description: string | null;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  due_date: number | null;
  created_at: number;
  updated_at: number;
};

export type TaskCommentRow = {
  id: string;
  task_id: string;
  author_email: string;
  content: string;
  created_at: number;
};
