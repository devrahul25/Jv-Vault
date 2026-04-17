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
  { name: "Jai Veeru Website & Hosting", attrs: { col_jv_client: "No access" } },
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
