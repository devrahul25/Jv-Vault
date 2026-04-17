const Database = require("better-sqlite3");
const db = new Database("data/vault.db");

const clientId = "cli_c8b301d03158b6efddc364af";

const sections = [
  {
    id: "sec_domain_" + Date.now(),
    title: "JV Domain",
    columns: [
      { id: "col_url", name: "URL", type: "url", width: 220 },
      { id: "col_domain", name: "Domain", type: "text", width: 150 },
      { id: "col_expiry", name: "Domain Expiry", type: "date", width: 180 },
      { id: "col_days", name: "Days Left", type: "text", width: 100 },
      { id: "col_hosting", name: "JV Hosting", type: "text", width: 150 },
      { id: "col_login", name: "Login", type: "email", width: 200 },
      { id: "col_pass", name: "password", type: "secret", width: 150 }
    ],
    rows: [
      { id: "row1", cells: { col_url: "jaiveeru.co.in", col_domain: "Hostinger", col_expiry: "2024-10-18", col_days: "-546", col_hosting: "Hostinger", col_login: "jaiveeruwebsite@gmail.com", col_pass: "J@iVeeruTe..." } },
      { id: "row2", cells: { col_url: "jvcreatives.com", col_domain: "Web Miles", col_expiry: "2027-08-07", col_days: "476", col_hosting: "Miles Web", col_login: "jaiveeruwebsite@gmail.com" } },
      { id: "row3", cells: { col_url: "jvcreatives.in", col_domain: "Hostinger", col_expiry: "2026-06-26", col_days: "69", col_login: "jaiveeruwebsite@gmail.com" } },
      { id: "row4", cells: { col_url: "jaiveeru.site", col_domain: "Hostinger", col_expiry: "2024-06-26", col_days: "-660", col_hosting: "Red Hosting", col_login: "jaiveeruwebsite@gmail.com" } },
      { id: "row5", cells: { col_url: "jaiveerucreatives.com", col_domain: "Hostinger", col_expiry: "2026-04-25", col_days: "7", col_hosting: "Red Hosting", col_login: "jaiveeruwebsite@gmail.com" } },
      { id: "row6", cells: { col_url: "jaiveerucreatives.in", col_domain: "Hostinger", col_expiry: "2026-04-25", col_days: "7", col_hosting: "Red Hosting", col_login: "jaiveeruwebsite@gmail.com" } }
    ]
  },
  {
    id: "sec_hosting_" + Date.now(),
    title: "JV Hosting",
    columns: [
      { id: "h_account", name: "Account", type: "text", width: 150 },
      { id: "h_domain", name: "JV Domain", type: "text", width: 200 },
      { id: "h_renew", name: "Renew Date", type: "date", width: 180 },
      { id: "h_days", name: "Days Left", type: "text", width: 100 },
      { id: "h_login", name: "Login", type: "email", width: 200 },
      { id: "h_pass", name: "Pass", type: "secret", width: 150 }
    ],
    rows: [
      { id: "h_row1", cells: { h_account: "Hostinger", h_domain: "jaiveeru.co.in", h_renew: "2024-10-04", h_days: "-560", h_login: "jaiveeruwebsite@gmail.com", h_pass: "Google" } },
      { id: "h_row2", cells: { h_account: "Miles Web", h_domain: "jvcreatives.com", h_renew: "2024-08-25", h_days: "-600", h_login: "jaiveeruwebsite@gmail.com", h_pass: "Ganesha@4321" } },
      { id: "h_row3", cells: { h_account: "Red Hosting", h_domain: "jaiveeru.site, jaiveerucreatives.in...", h_renew: "2024-05-25", h_days: "-692", h_login: "jaiveeruwebsite@gmail.com", h_pass: "JV@9935" } }
    ]
  },
  {
    id: "sec_creds_" + Date.now(),
    title: "Platform Credentials",
    columns: [
      { id: "c_type", name: "Type", type: "text", width: 120 },
      { id: "c_login", name: "Login", type: "text", width: 220 },
      { id: "c_pass", name: "Pass", type: "secret", width: 150 }
    ],
    rows: [
      { id: "c_row1", cells: { c_type: "Elementor", c_login: "jvteam@jaiveeru.co.in", c_pass: "Ganesha@4321" } },
      { id: "c_row2", cells: { c_type: "Wordpress", c_login: "admin", c_pass: "JV@2023-24" } }
    ]
  }
];

db.prepare("UPDATE clients SET sections = ? WHERE id = ?").run(JSON.stringify(sections), clientId);
console.log("Client data updated successfully.");
