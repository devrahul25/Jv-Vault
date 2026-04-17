"use client";

import { useEffect } from "react";
import { ClientRecord, Section } from "@/lib/vault";
import SectionTable from "./SectionTable";
import { newClientId } from "@/lib/client-id";

/**
 * Right-side sliding panel for a single client. Contains editable sub-tables (sections).
 */
export default function ClientDrawer({
  client,
  onClose,
  onSectionsChange,
  onRename,
  readOnly = false,
}: {
  client: ClientRecord;
  onClose: () => void;
  onSectionsChange: (sections: Section[]) => void;
  onRename: (name: string) => void;
  readOnly?: boolean;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sections = client.sections || [];

  function addSection() {
    const s: Section = {
      id: newClientId("sec"),
      title: "New sub-table",
      columns: [
        { id: newClientId("c"), name: "Field", type: "text", width: 200 },
        { id: newClientId("c"), name: "Value", type: "text", width: 260 },
      ],
      rows: [],
    };
    onSectionsChange([...sections, s]);
  }

  function patchSection(idx: number, next: Section) {
    const arr = [...sections];
    arr[idx] = next;
    onSectionsChange(arr);
  }

  function deleteSection(idx: number) {
    const arr = sections.filter((_, i) => i !== idx);
    onSectionsChange(arr);
  }

  function moveSection(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= sections.length) return;
    const arr = [...sections];
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    onSectionsChange(arr);
  }

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-30 bg-ink-950/60 backdrop-blur-sm"
        aria-hidden
      />
      {/* drawer */}
      <aside
        role="dialog"
        className="fixed right-0 top-0 z-40 flex h-screen w-full max-w-[900px] flex-col border-l border-ink-700 bg-ink-900 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-ink-700 px-5 py-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-wider text-ink-400">Client</div>
            <input
              value={client.name}
              onChange={(e) => !readOnly && onRename(e.target.value)}
              readOnly={readOnly}
              className={`mt-0.5 w-full bg-transparent text-xl font-semibold text-ink-100 outline-none ${readOnly ? "cursor-default" : ""}`}
            />
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-ink-300 hover:bg-ink-800"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {sections.length === 0 && (
            <div className="rounded-xl border border-dashed border-ink-700 p-8 text-center text-sm text-ink-400">
              No sub-tables yet.
              {!readOnly && (
                <div className="mt-3">
                  <button
                    onClick={addSection}
                    className="rounded-lg bg-accent-500 px-3 py-1.5 text-sm text-white hover:bg-accent-600"
                  >
                    + Add first sub-table
                  </button>
                </div>
              )}
            </div>
          )}

          {sections.map((s, idx) => (
            <SectionTable
              key={s.id}
              section={s}
              onChange={(next) => patchSection(idx, next)}
              onRename={(title) => patchSection(idx, { ...s, title })}
              onDelete={() => deleteSection(idx)}
              onMoveUp={idx > 0 ? () => moveSection(idx, -1) : undefined}
              onMoveDown={idx < sections.length - 1 ? () => moveSection(idx, 1) : undefined}
              readOnly={readOnly}
            />
          ))}

          {sections.length > 0 && !readOnly && (
            <button
              onClick={addSection}
              className="w-full rounded-lg border border-dashed border-ink-700 py-3 text-sm text-ink-300 hover:border-ink-500 hover:text-ink-100"
            >
              + Add sub-table
            </button>
          )}
        </div>

        <footer className="border-t border-ink-700 px-5 py-2 text-[11px] text-ink-400">
          All changes auto-save · Encrypted at rest with AES-256-GCM
        </footer>
      </aside>
    </>
  );
}
