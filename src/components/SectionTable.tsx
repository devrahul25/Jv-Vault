"use client";

import { ColumnDef, Section } from "@/lib/vault";
import EditableCell from "./EditableCell";
import ColumnMenu from "./ColumnMenu";
import { newClientId } from "@/lib/client-id";

export default function SectionTable({
  section,
  onChange,
  onRename,
  onDelete,
  onMoveUp,
  onMoveDown,
  readOnly = false,
}: {
  section: Section;
  onChange: (next: Section) => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  readOnly?: boolean;
}) {
  function addColumn() {
    const col: ColumnDef = {
      id: newClientId("c"),
      name: "New column",
      type: "text",
      width: 180,
    };
    onChange({ ...section, columns: [...section.columns, col] });
  }

  function patchColumn(idx: number, next: ColumnDef) {
    const cols = [...section.columns];
    cols[idx] = next;
    onChange({ ...section, columns: cols });
  }

  function deleteColumn(idx: number) {
    const cols = [...section.columns];
    const removed = cols.splice(idx, 1)[0];
    const rows = section.rows.map((r) => {
      const cells = { ...r.cells };
      delete cells[removed.id];
      return { ...r, cells };
    });
    onChange({ ...section, columns: cols, rows });
  }

  function moveColumn(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= section.columns.length) return;
    const cols = [...section.columns];
    [cols[idx], cols[j]] = [cols[j], cols[idx]];
    onChange({ ...section, columns: cols });
  }

  function addRow() {
    const row = { id: newClientId("r"), cells: {} as Record<string, string> };
    onChange({ ...section, rows: [...section.rows, row] });
  }

  function patchCell(rowIdx: number, colId: string, value: string) {
    const rows = section.rows.map((r, i) =>
      i === rowIdx ? { ...r, cells: { ...r.cells, [colId]: value } } : r
    );
    onChange({ ...section, rows });
  }

  function deleteRow(rowIdx: number) {
    const rows = section.rows.filter((_, i) => i !== rowIdx);
    onChange({ ...section, rows });
  }

  return (
    <section className="rounded-xl border border-ink-700 bg-ink-800/60">
      <header className="flex items-center justify-between gap-2 border-b border-ink-700 px-3 py-2">
        <input
          value={section.title}
          onChange={(e) => !readOnly && onRename(e.target.value)}
          readOnly={readOnly}
          className={`w-full bg-transparent text-base font-semibold text-ink-100 outline-none ${readOnly ? "cursor-default" : ""}`}
        />
        <div className="flex shrink-0 items-center gap-1">
          {!readOnly && (
            <>
              {onMoveUp && (
                <button
                  onClick={onMoveUp}
                  title="Move up"
                  className="rounded px-1.5 py-0.5 text-[11px] text-ink-400 hover:bg-ink-700 hover:text-ink-200"
                >
                  ↑
                </button>
              )}
              {onMoveDown && (
                <button
                  onClick={onMoveDown}
                  title="Move down"
                  className="rounded px-1.5 py-0.5 text-[11px] text-ink-400 hover:bg-ink-700 hover:text-ink-200"
                >
                  ↓
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm(`Delete sub-table "${section.title}"?`)) onDelete();
                }}
                title="Delete sub-table"
                className="rounded px-1.5 py-0.5 text-[11px] text-red-400 hover:bg-red-500/10"
              >
                🗑
              </button>
            </>
          )}
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-max min-w-full border-collapse">
          <thead>
            <tr className="border-b border-ink-700 text-left">
              <th className="w-8 border-r border-ink-700 bg-ink-800/60 px-2 py-1.5 text-[10px] text-ink-500">
                #
              </th>
              {section.columns.map((c, idx) => (
                <th
                  key={c.id}
                  style={{ width: c.width || 180, minWidth: c.width || 180 }}
                  className="border-r border-ink-700 bg-ink-800/60 px-3 py-1.5 text-xs font-medium text-ink-300"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-1 truncate">
                      <TypeIcon type={c.type} />
                    <span className="truncate">{c.name}</span>
                  </span>
                  {!readOnly && (
                    <ColumnMenu
                      column={c}
                      onChange={(next) => patchColumn(idx, next)}
                      onDelete={() => deleteColumn(idx)}
                      onMoveLeft={idx > 0 ? () => moveColumn(idx, -1) : undefined}
                      onMoveRight={
                        idx < section.columns.length - 1 ? () => moveColumn(idx, 1) : undefined
                      }
                    />
                  )}
                </div>
                </th>
              ))}
              <th className="w-10 bg-ink-800/60 px-1 py-1.5 text-xs text-ink-400">
                {!readOnly && (
                  <button
                    onClick={addColumn}
                    title="Add column"
                    className="rounded px-1.5 py-0.5 text-ink-300 hover:bg-ink-700"
                  >
                    +
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {section.rows.length === 0 && (
              <tr>
                <td
                  colSpan={section.columns.length + 2}
                  className="px-3 py-6 text-center text-xs text-ink-400"
                >
                  No rows.{" "}
                  {!readOnly && (
                    <button onClick={addRow} className="text-accent-400 hover:underline">
                      + Add row
                    </button>
                  )}
                </td>
              </tr>
            )}
            {section.rows.map((row, rIdx) => (
              <tr key={row.id} className="group border-b border-ink-700/80 hover:bg-ink-800/50">
                <td className="w-8 border-r border-ink-700 bg-ink-800/40 px-2 py-1.5 text-center text-[10px] text-ink-500">
                  <div className="flex items-center justify-center gap-1">
                    <span>{rIdx + 1}</span>
                    {!readOnly && (
                      <button
                        onClick={() => deleteRow(rIdx)}
                        className="opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                        title="Delete row"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </td>
                {section.columns.map((c) => (
                  <td
                    key={c.id}
                    style={{ width: c.width || 180, minWidth: c.width || 180 }}
                    className="border-r border-ink-700 p-0 align-middle"
                  >
                    <EditableCell
                      value={row.cells[c.id] || ""}
                      type={c.type}
                      placeholder={c.name}
                      onChange={(v) => patchCell(rIdx, c.id, v)}
                      readOnly={readOnly}
                    />
                  </td>
                ))}
                <td className="w-10" />
              </tr>
            ))}
          {!readOnly && (
            <tr>
              <td
                colSpan={section.columns.length + 2}
                className="px-3 py-1.5 text-left text-xs text-ink-400"
              >
                <button
                  onClick={addRow}
                  className="rounded px-2 py-1 hover:bg-ink-700 hover:text-ink-200"
                >
                  + New row
                </button>
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TypeIcon({ type }: { type: string }) {
  const m: Record<string, string> = {
    text: "T",
    longtext: "¶",
    secret: "🔒",
    url: "🔗",
    email: "✉",
    date: "📅",
  };
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center text-[10px] text-ink-400">
      {m[type] || "T"}
    </span>
  );
}
