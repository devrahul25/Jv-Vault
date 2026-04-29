/**
 * Domain types shared by server and client.
 */

export type ColumnType = "text" | "secret" | "url" | "email" | "date" | "longtext" | "status";

export type ColumnDef = {
  id: string;
  name: string;
  type: ColumnType;
  width?: number;
};

export type Section = {
  id: string;
  title: string;
  columns: ColumnDef[];
  rows: Array<{
    id: string;
    cells: Record<string, string>;
  }>;
};

export type ClientRecord = {
  id: string;
  workspace_id: string;
  name: string;
  position: number;
  attrs: Record<string, string>;
  sections: Section[];
  created_at: number;
  updated_at: number;
};

export type Workspace = {
  id: string;
  name: string;
  icon: string | null;
  position: number;
  columns: ColumnDef[];
  created_at: number;
  updated_at: number;
};

/** Columns for the JV Client Website List (matches user's Notion screenshot) */
export const JV_CLIENT_COLUMNS: ColumnDef[] = [
  { id: "col_website", name: "Website", type: "url", width: 220 },
  { id: "col_jv_client", name: "JV Client", type: "status", width: 160 },
  { id: "col_amc", name: "AMC", type: "status", width: 100 },
  { id: "col_backup", name: "Last Backup", type: "date", width: 160 },
  { id: "col_note", name: "Note", type: "text", width: 240 },
  { id: "col_domain", name: "Domain", type: "text", width: 180 },
];

/** Default sub-tables that appear in a client's drawer */
export const DEFAULT_SECTIONS: Section[] = [
  {
    id: "sec_web_admin",
    title: "Website Admin",
    columns: [
      { id: "c1", name: "Admin Login URL", type: "url", width: 260 },
      { id: "c2", name: "Username", type: "text", width: 160 },
      { id: "c3", name: "Password", type: "secret", width: 200 },
      { id: "c4", name: "Email", type: "email", width: 220 },
    ],
    rows: [],
  },
  {
    id: "sec_hosting",
    title: "Hosting cPanel / hPanel",
    columns: [
      { id: "c1", name: "Login URL", type: "url", width: 260 },
      { id: "c2", name: "Email", type: "email", width: 220 },
      { id: "c3", name: "Password", type: "secret", width: 200 },
      { id: "c4", name: "Expiration Date", type: "date", width: 160 },
    ],
    rows: [],
  },
];

/**
 * Seed data matching the user's "JV Client Website List" screenshot.
 * `attrs` keys map to JV_CLIENT_COLUMNS ids.
 */
export const JV_CLIENT_SEED: Array<{
  name: string;
  attrs: Record<string, string>;
  sections?: Section[];
}> = [
  { name: "Content contact", attrs: { col_jv_client: "No access" } },
  { name: "CITIART", attrs: { col_jv_client: "No access", col_amc: "Yes", col_backup: "2025-05-26" } },
  { name: "Sri Ramakrishna Sangha", attrs: { col_jv_client: "No access", col_amc: "No", col_backup: "2025-06-21" } },
  { name: "Asia Freedom Institute", attrs: { col_jv_client: "No access", col_amc: "No", col_backup: "2025-06-26" } },
  { name: "Pel-India", attrs: { col_jv_client: "No access", col_amc: "Yes", col_backup: "2025-05-30" } },
  {
    name: "Aavishkaar Foundation",
    attrs: {
      col_jv_client: "No access",
      col_amc: "Yes",
      col_backup: "2025-05-27",
      col_note: "Working on content",
    },
  },
  { name: "Agtechodisha", attrs: { col_amc: "No" } },
  { name: "Jai Veeru.co.inf", attrs: { col_amc: "Yes", col_backup: "2025-05-26" } },
  { name: "jaiveeru.site", attrs: { col_amc: "Yes", col_backup: "2025-04-18" } },
  { name: "twins", attrs: { col_amc: "No" } },
  { name: "Modi rubber", attrs: {} },
  { 
    name: "Jai Veeru Website & Hosting", 
    attrs: { col_jv_client: "No access" },
    sections: [
      {
        id: "sec_jv_domain",
        title: "JV Domain",
        columns: [
          { id: "col_url", name: "URL", type: "url", width: 200 },
          { id: "col_domain", name: "Domain", type: "text", width: 140 },
          { id: "col_domain_expiry", name: "Domain Expiry", type: "date", width: 180 },
          { id: "col_days_left", name: "Days Left", type: "text", width: 100 },
          { id: "col_jv_hosting", name: "JV Hosting", type: "text", width: 140 },
          { id: "col_login", name: "Login", type: "email", width: 220 },
          { id: "col_pass4", name: "password4", type: "secret", width: 180 },
        ],
        rows: [
          { id: "r_1", cells: { "col_url": "jaiveeru.co.in", "col_domain": "Hostinger", "col_domain_expiry": "October 18, 2024 12:00 PM", "col_days_left": "-557", "col_jv_hosting": "Hostinger", "col_login": "jaiveeruwebsite@gmail.com", "col_pass4": "J@iVeeruTe@m@" } },
          { id: "r_2", cells: { "col_url": "jvcreatives.com", "col_domain": "Web Miles", "col_domain_expiry": "August 7, 2027 12:00 PM", "col_days_left": "465", "col_jv_hosting": "Miles Web", "col_login": "jaiveeruwebsite@gmail.com", "col_pass4": "" } },
          { id: "r_3", cells: { "col_url": "jvcreatives.in", "col_domain": "Hostinger", "col_domain_expiry": "June 26, 2026 12:00 PM", "col_days_left": "58", "col_jv_hosting": "", "col_login": "jaiveeruwebsite@gmail.com", "col_pass4": "" } },
          { id: "r_4", cells: { "col_url": "jaiveeru.site", "col_domain": "Hostinger", "col_domain_expiry": "June 26, 2024 12:00 PM", "col_days_left": "-671", "col_jv_hosting": "Red Hosting", "col_login": "jaiveeruwebsite@gmail.com", "col_pass4": "" } },
          { id: "r_5", cells: { "col_url": "jaiveerucreatives.com", "col_domain": "Hostinger", "col_domain_expiry": "April 25, 2026 12:00 PM", "col_days_left": "-3", "col_jv_hosting": "Red Hosting", "col_login": "jaiveeruwebsite@gmail.com", "col_pass4": "" } },
          { id: "r_6", cells: { "col_url": "jaiveerucreatives.in", "col_domain": "Hostinger", "col_domain_expiry": "April 25, 2026 12:00 PM", "col_days_left": "-3", "col_jv_hosting": "Red Hosting", "col_login": "jaiveeruwebsite@gmail.com", "col_pass4": "" } },
        ]
      },
      {
        id: "sec_jv_hosting",
        title: "JV Hosting",
        columns: [
          { id: "col_account", name: "Account", type: "text", width: 140 },
          { id: "col_jv_domain_col", name: "JV Domain", type: "text", width: 240 },
          { id: "col_renew_date", name: "Renew Date", type: "date", width: 160 },
          { id: "col_days_left_2", name: "Days Left", type: "text", width: 100 },
          { id: "col_login_2", name: "Login", type: "email", width: 220 },
          { id: "col_pass_2", name: "Pass", type: "secret", width: 180 },
        ],
        rows: [
          { id: "r_h1", cells: { "col_account": "Hostinger", "col_jv_domain_col": "jaiveeru.co.in", "col_renew_date": "October 4, 2024", "col_days_left_2": "-572", "col_login_2": "jaiveeruwebsite@gmail.com", "col_pass_2": "Google" } },
          { id: "r_h2", cells: { "col_account": "Miles Web", "col_jv_domain_col": "jvcreatives.com", "col_renew_date": "August 25, 2024", "col_days_left_2": "-612", "col_login_2": "jaiveeruwebsite@gmail.com", "col_pass_2": "Ganesha@4321" } },
          { id: "r_h3", cells: { "col_account": "Red Hosting", "col_jv_domain_col": "jaiveeru.site\njaiveerucreatives.in\njaiveerucreatives.com", "col_renew_date": "May 25, 2024", "col_days_left_2": "-704", "col_login_2": "jaiveeruwebsite@gmail.com", "col_pass_2": "JV@9935" } },
        ]
      },
      {
        id: "sec_other_logins",
        title: "Other Logins",
        columns: [
          { id: "col_platform", name: "Platform", type: "text", width: 160 },
          { id: "col_other_login", name: "Login", type: "text", width: 220 },
          { id: "col_other_pass", name: "Password", type: "secret", width: 200 }
        ],
        rows: [
          { id: "r_o1", cells: { "col_platform": "Elementor", "col_other_login": "jvteam@jaiveeru.co.in", "col_other_pass": "Ganesha@4321" } },
          { id: "r_o2", cells: { "col_platform": "Wordpress", "col_other_login": "admin", "col_other_pass": "JV@2023-24" } },
        ]
      }
    ]
  },
  { name: "womanpreneur", attrs: {} },
  { name: "Zuna.ai", attrs: { col_backup: "2023-09-07", col_note: "Working on new site" } },
  {
    name: "Srias Life Space",
    attrs: {
      col_jv_client: "No access",
      col_amc: "Yes",
      col_backup: "2025-05-26",
      col_note: "New Website working",
    },
  },
  { name: "Anreya", attrs: { col_amc: "No", col_note: "New Website working" } },
  { name: "Pollinateimpact", attrs: { col_amc: "No", col_backup: "2025-04-18", col_note: "Redesign working" } },
];
