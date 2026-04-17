/**
 * Browser-safe random id generator (not a secret — just unique keys for columns/rows/sections).
 */
export function newClientId(prefix = ""): string {
  let id: string;
  try {
    // modern browsers + node 19+
    id = (globalThis as any).crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  } catch {
    id = Math.random().toString(36).slice(2);
  }
  id = id.replace(/-/g, "").slice(0, 12);
  return prefix ? `${prefix}_${id}` : id;
}
