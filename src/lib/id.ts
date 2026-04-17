import crypto from "node:crypto";

export function newId(prefix = ""): string {
  const bytes = crypto.randomBytes(12).toString("hex");
  return prefix ? `${prefix}_${bytes}` : bytes;
}
