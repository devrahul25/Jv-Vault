"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) return setErr("Use at least 8 characters.");
    if (password !== confirm) return setErr("Passwords do not match.");
    setBusy(true);
    const r = await fetch("/api/auth/setup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password, confirm }),
    });
    const data = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(data.error || "Setup failed");
    router.replace("/dashboard");
    router.refresh();
  }

  const strength = scoreStrength(password);

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-ink-300">Master password</label>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-400 focus:border-accent-500"
          placeholder="At least 12 characters recommended"
        />
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-ink-800">
          <div
            className={`h-full transition-all ${
              strength.pct < 30
                ? "bg-red-400"
                : strength.pct < 60
                ? "bg-yellow-400"
                : strength.pct < 85
                ? "bg-lime-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${strength.pct}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-ink-400">{strength.label}</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink-300">Confirm master password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-ink-100 focus:border-accent-500"
        />
      </div>
      {err && <div className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</div>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-60"
      >
        {busy ? "Creating vault…" : "Create vault"}
      </button>
    </form>
  );
}

function scoreStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score += 20;
  if (pw.length >= 12) score += 20;
  if (pw.length >= 16) score += 10;
  if (/[a-z]/.test(pw)) score += 10;
  if (/[A-Z]/.test(pw)) score += 15;
  if (/[0-9]/.test(pw)) score += 10;
  if (/[^A-Za-z0-9]/.test(pw)) score += 15;
  const pct = Math.min(100, score);
  const label =
    pct < 30
      ? "Weak — consider a longer password"
      : pct < 60
      ? "Okay — could be stronger"
      : pct < 85
      ? "Good"
      : "Strong";
  return { pct, label };
}
