# JV Vault

An internal Notion-style database for Jaiveeru — a single encrypted table of client websites and credentials, with per-client sub-tables (Website Admin, Hosting cPanel, Email, API keys, etc.). Built on Next.js 14 + SQLite.

## What it looks like

- **Top-level table** ("JV Sites Credentials"): one row per client, with editable columns you can add/rename/delete.
- **Hover a client row** → an **Open** button slides in on the right edge of the client name cell.
- **Click Open** → a right-side drawer slides in showing **sub-tables** for that client.
- **Each sub-table** (e.g. "Website Admin") has its own schema — add/rename/delete **columns**, add/delete **rows**, edit cells inline. Exactly like a Notion database, but every single cell is encrypted at rest.

## Features

- **Inline editing everywhere.** Click a cell → type → Enter to save. Auto-saves to the server.
- **Column types:** Text, Long text, Secret (masked with show/copy), URL (clickable), Email, Date.
- **Add columns on any table** — top-level or any sub-table. Rename, change type, reorder, delete.
- **Add rows** in any sub-table. Add clients in the top table.
- **Right-side drawer** (Notion "open-as-page" style) with multiple sub-tables per client.
- **Global search** — matches across client name, top-level attributes, section titles, and every cell in every sub-table.
- **Copy / show-hide** buttons on Secret cells, clickable URL cells, mailto-friendly Email cells.
- **Master-password-gated.** Auto-lock after 30 min. Rate-limited login.
- **AES-256-GCM** encryption with scrypt-derived key. See "Security model" below.

## Quick start

```bash
npm install
cp .env.example .env.local
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # paste as SESSION_SECRET
npm run dev     # http://localhost:3000
```

First run: go to `/setup` and create the master password. After that: `/login` → `/dashboard`.

## Production

```bash
npm run build && npm run start
```

Behind HTTPS (nginx/Caddy). Session cookie is `Secure` in production.

### Recommended nginx

```
server {
  listen 443 ssl http2;
  server_name vault.jaiveeru.co.in;

  add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "no-referrer" always;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_http_version 1.1;
  }
}
```

## Data model

All schema and values live as **encrypted JSON blobs** in SQLite:

- `vault_schema.top_columns_ct` → JSON array of the top-table's columns.
- `clients.attrs_ct` → JSON object of the top-table row's cells (keyed by column id).
- `clients.sections_ct` → JSON array of sub-tables:
  ```
  [
    {
      "id": "sec_web_admin",
      "title": "Website Admin",
      "columns": [
        { "id": "c1", "name": "Admin Login URL", "type": "url" },
        { "id": "c2", "name": "Username", "type": "text" },
        { "id": "c3", "name": "Password", "type": "secret" },
        { "id": "c4", "name": "Email", "type": "email" }
      ],
      "rows": [
        { "id": "r1", "cells": { "c1": "https://...", "c2": "admin", "c3": "...", "c4": "..." } }
      ]
    }
  ]
  ```

Every blob is AES-256-GCM encrypted with a fresh 12-byte IV + 16-byte auth tag, stored as base64.

## Security model

- Master password → **scrypt** (N=32768, r=8, p=1) + per-vault salt → 32-byte AES key.
- Separate scrypt hash + salt for login verification (DB leak ≠ key leak).
- A verifier ciphertext is stored at setup; every login decrypts it to confirm the key.
- The derived key is kept server-side against a `sessions` row keyed by SHA-256 of a random cookie token. The raw token is never stored.
- Cookies: `HttpOnly`, `SameSite=Strict`, `Secure` in production.
- Login rate-limit: 6 attempts / 15 min / IP.
- **No password recovery.** Lose the master password → data is unrecoverable. Write it down offline.

### Backups

Back up `./data/vault.db` — it's encrypted, so the backup file is safe to copy to S3/Drive.

## File layout

```
src/
  app/
    setup/page.tsx             # first-run master password
    login/page.tsx             # unlock
    dashboard/page.tsx         # main app (server-gated)
    api/
      auth/setup/route.ts      # POST — create master password
      auth/login/route.ts      # POST — unlock
      auth/logout/route.ts     # POST — lock
      status/route.ts          # GET — initialized / authenticated
      schema/route.ts          # GET / PUT — top-level column defs
      clients/route.ts         # GET list / POST create
      clients/[id]/route.ts    # GET / PATCH / DELETE
      generate-password/route.ts # GET — strong random password
  components/
    SetupForm.tsx / LoginForm.tsx
    VaultApp.tsx               # dashboard shell
    TopTable.tsx               # top-level clients table
    ClientDrawer.tsx           # right-side panel per client
    SectionTable.tsx           # editable sub-table
    EditableCell.tsx           # inline cell editor (all types)
    ColumnMenu.tsx              # rename / retype / reorder / delete column
  lib/
    db.ts                      # SQLite schema
    crypto.ts                  # AES-GCM + scrypt + pw generator
    auth.ts                    # sessions, cookies, key management
    vault.ts                   # domain types + defaults (client-safe)
    client-id.ts               # browser-safe id gen
    id.ts                      # server id gen
  middleware.ts                # redirects /dashboard if no cookie
```

## Roadmap ideas

- Drag-to-reorder rows/columns/sections.
- Per-user accounts with TOTP 2FA.
- CSV import/export of sub-tables.
- Inline password generator on Secret cells.
- Per-client icons / color tags.
- Docker image + one-line self-host.

## License

Internal Jaiveeru tool.
