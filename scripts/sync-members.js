const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.resolve(__dirname, "../data/vault.db");
const db = new Database(dbPath);

console.log("Checking for members...");

// Get all unique emails from sessions
const sessionEmails = db.prepare("SELECT DISTINCT email FROM sessions WHERE email IS NOT NULL").all();

for (const { email } of sessionEmails) {
  const exists = db.prepare("SELECT id FROM members WHERE email = ?").get(email);
  if (!exists) {
    console.log(`Adding missing member: ${email}`);
    const memberId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    db.prepare("INSERT INTO members (id, email, created_at, updated_at) VALUES (?, ?, ?, ?)")
      .run(memberId, email, Date.now(), Date.now());
  }
}

// Specifically ensure team@jaiveeru.co.in is in there
const masterEmail = "team@jaiveeru.co.in";
const masterExists = db.prepare("SELECT id FROM members WHERE email = ?").get(masterEmail);
if (!masterExists) {
  console.log(`Adding master member: ${masterEmail}`);
  const memberId = `mem_master_${Date.now()}`;
  db.prepare("INSERT INTO members (id, email, created_at, updated_at) VALUES (?, ?, ?, ?)")
    .run(memberId, masterEmail, Date.now(), Date.now());
}

console.log("Members table sync complete.");
