"use client";

import { useEffect, useRef, useState } from "react";
import { ColumnDef, ColumnType } from "@/lib/vault";

const TYPES: { value: ColumnType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "longtext", label: "Long text" },
  { value: "secret", label: "Secret (password)" },
  { value: "url", label: "URL" },
  { value: "email", label: "Email" },
  { value: "date", label: "Date" },
];

export default function ColumnMenu({
  column,
  onChange,
  onDelete,
  onMoveLeft,
  onMoveRight,
}: {
  column: ColumnDef;
  onChange: (next: ColumnDef) => void;
  onDelete: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded px-1 py-0.5 text-[10px] text-ink-400 hover:bg-ink-700 hover:text-ink-200"
        title="Column options"
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-30 w-56 rounded-lg border border-ink-700 bg-ink-800 p-1 shadow-soft">
          <div className="px-2 pb-1 pt-2 text-[10px] uppercase tracking-wider text-ink-400">
            Rename
          </div>
          <input
            value={column.name}
            onChange={(e) => onChange({ ...column, name: e.target.value })}
            className="mx-1 w-[calc(100%-0.5rem)] rounded bg-ink-900 px-2 py-1 text-sm text-ink-100 focus:outline-none"
          />
          <div className="mt-2 px-2 pb-1 text-[10px] uppercase tracking-wider text-ink-400">
            Type
          </div>
          <select
            value={column.type}
            onChange={(e) =>
              onChange({ ...column, type: e.target.value as ColumnType })
            }
            className="mx-1 w-[calc(100%-0.5rem)] rounded bg-ink-900 px-2 py-1 text-sm text-ink-100 focus:outline-none"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="my-1 border-t border-ink-700" />
          {onMoveLeft && (
            <button
              onClick={() => {
                onMoveLeft();
                setOpen(false);
              }}
              className="w-full rounded px-2 py-1.5 text-left text-sm text-ink-200 hover:bg-ink-700"
            >
              ← Move left
            </button>
          )}
          {onMoveRight && (
            <button
              onClick={() => {
                onMoveRight();
                setOpen(false);
              }}
              className="w-full rounded px-2 py-1.5 text-left text-sm text-ink-200 hover:bg-ink-700"
            >
              Move right →
            </button>
          )}
          <button
            onClick={() => {
              if (confirm(`Delete column "${column.name}" and all its values?`)) {
                onDelete();
                setOpen(false);
              }
            }}
            className="w-full rounded px-2 py-1.5 text-left text-sm text-red-400 hover:bg-red-500/10"
          >
            Delete column
          </button>
        </div>
      )}
    </div>
  );
}
