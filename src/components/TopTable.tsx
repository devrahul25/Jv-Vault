"use client";

import { useState } from "react";
import { ColumnDef, ClientRecord } from "@/lib/vault";
import EditableCell from "./EditableCell";
import ColumnMenu from "./ColumnMenu";
import { newClientId } from "@/lib/client-id";

/**
 * The top-level Notion-like database: one row per client.
 * First column = client name (pinned). Additional custom columns after.
 * Hovering a row shows the "Open" button on the right of the name cell.
 */
export default function TopTable({
  columns,
  clients,
  onColumnsChange,
  onAddClient,
  onOpenClient,
  onPatchClient,
  onDeleteClient,
  readOnly = false,
}: {
  columns: ColumnDef[];
  clients: ClientRecord[];
  onColumnsChange: (next: ColumnDef[]) => void;
  onAddClient: () => void;
  onOpenClient: (id: string) => void;
  onPatchClient: (id: string, patch: Partial<ClientRecord>) => void;
  onDeleteClient: (id: string) => void;
  readOnly?: boolean;
}) {
  // Default width for name column + new columns
  const NAME_WIDTH = 260;

  function addColumn() {
    const id = newClientId("col");
    onColumnsChange([...columns, { id, name: "New column", type: "text", width: 180 }]);
  }

  function patchColumn(idx: number, next: ColumnDef) {
    const cp = [...columns];
    cp[idx] = next;
    onColumnsChange(cp);
  }

  function deleteColumn(idx: number) {
    const cp = [...columns];
    const removed = cp.splice(idx, 1)[0];
    onColumnsChange(cp);
    // Also clean up attrs on all clients for this column id (best-effort; server will keep data until next patch)
    // We don't force a server sweep here; attrs with the removed column id just become orphan keys.
    void removed;
  }

  function moveColumn(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= columns.length) return;
    const cp = [...columns];
    [cp[idx], cp[j]] = [cp[j], cp[idx]];
    onColumnsChange(cp);
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-700 bg-ink-800 shadow-soft">
      <table className="w-max min-w-full border-collapse">
        <thead>
          <tr className="border-b border-ink-700 bg-ink-800/60 text-left">
            <th
              style={{ width: NAME_WIDTH, minWidth: NAME_WIDTH }}
              className="sticky left-0 z-10 border-r border-ink-700 bg-ink-800 px-3 py-2 text-xs font-medium text-ink-100"
            >
              <span className="mr-1 text-ink-300">⊞</span> Client
            </th>
            {columns.map((c, idx) => (
              <th
                key={c.id}
                style={{ width: c.width || 180, minWidth: c.width || 180 }}
                className="border-r border-ink-700 px-3 py-2 text-xs font-medium text-ink-100"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1 truncate text-ink-100">
                    <TypeIcon type={c.type} />
                    <span className="truncate">{c.name}</span>
                  </span>
                  {!readOnly && (
                    <ColumnMenu
                      column={c}
                      onChange={(next) => patchColumn(idx, next)}
                      onDelete={() => deleteColumn(idx)}
                      onMoveLeft={idx > 0 ? () => moveColumn(idx, -1) : undefined}
                      onMoveRight={idx < columns.length - 1 ? () => moveColumn(idx, 1) : undefined}
                    />
                  )}
                </div>
              </th>
            ))}
            <th className="w-10 px-1 py-2 text-xs text-ink-200">
              {!readOnly && (
                <button
                  onClick={addColumn}
                  title="Add column"
                  className="rounded px-1.5 py-0.5 text-ink-100 hover:bg-ink-700"
                >
                  +
                </button>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 2}
                className="px-4 py-10 text-center text-sm text-ink-200"
              >
                No clients yet. Click{" "}
                <button onClick={onAddClient} className="text-accent-400 hover:underline">
                  + New client
                </button>{" "}
                below to add the first one.
              </td>
            </tr>
          )}
          {clients.map((c) => (
            <TopRow
              key={c.id}
              client={c}
              columns={columns}
              nameWidth={NAME_WIDTH}
              onOpen={() => onOpenClient(c.id)}
              onRename={(name) => onPatchClient(c.id, { name })}
              onCell={(colId, value) =>
                onPatchClient(c.id, { attrs: { ...c.attrs, [colId]: value } })
              }
              onDelete={() => {
                if (confirm(`Delete client "${c.name}" and all its data?`)) onDeleteClient(c.id);
              }}
              readOnly={readOnly}
            />
          ))}
          {!readOnly && (
            <tr>
              <td
                colSpan={columns.length + 2}
                className="px-3 py-2 text-left text-sm text-ink-300"
              >
                <button
                  onClick={onAddClient}
                  className="rounded px-2 py-1 hover:bg-ink-700 hover:text-ink-200"
                >
                  + New client
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TopRow({
  client,
  columns,
  nameWidth,
  onOpen,
  onRename,
  onCell,
  onDelete,
  readOnly = false,
}: {
  client: ClientRecord;
  columns: ColumnDef[];
  nameWidth: number;
  onOpen: () => void;
  onRename: (name: string) => void;
  onCell: (columnId: string, value: string) => void;
  onDelete: () => void;
  readOnly?: boolean;
}) {
  const [hover, setHover] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="border-b border-ink-700/80 hover:bg-ink-800/70"
    >
      <td
        style={{ width: nameWidth, minWidth: nameWidth }}
        className="sticky left-0 z-[5] border-r border-ink-700 bg-ink-800 px-0 py-0 align-middle"
      >
        <div className="group relative flex items-center">
          <div className="flex-1">
            <EditableCell
              value={client.name}
              type="text"
              placeholder="Untitled client"
              onChange={onRename}
              readOnly={readOnly}
            />
          </div>
          <div
            className={`absolute right-1 top-1/2 -translate-y-1/2 transition ${
              hover ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-1 rounded-md bg-ink-900/80 px-1 py-0.5 shadow-soft">
              <button
                onClick={onOpen}
                className="rounded px-2 py-0.5 text-[11px] font-medium text-ink-100 hover:bg-ink-700"
                title="Open detail panel"
              >
                Open
              </button>
              {!readOnly && (
                <button
                  onClick={onDelete}
                  className="rounded px-1.5 py-0.5 text-[11px] text-red-400 hover:bg-red-500/10"
                  title="Delete client"
                >
                  🗑
                </button>
              )}
            </div>
          </div>
        </div>
      </td>
      {columns.map((c) => (
        <td
          key={c.id}
          style={{ width: c.width || 180, minWidth: c.width || 180 }}
          className="border-r border-ink-700 p-0 align-middle"
        >
          <EditableCell
            value={client.attrs?.[c.id] || ""}
            type={c.type}
            placeholder={c.name}
            onChange={(v) => onCell(c.id, v)}
            readOnly={readOnly}
          />
        </td>
      ))}
      <td className="w-10" />
    </tr>
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
    <span className="inline-flex h-4 w-4 items-center justify-center text-[10px] text-ink-200">
      {m[type] || "T"}
    </span>
  );
}
