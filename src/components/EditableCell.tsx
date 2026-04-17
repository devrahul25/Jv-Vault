"use client";

import { useEffect, useRef, useState } from "react";
import { ColumnType } from "@/lib/vault";
import NotionEditor from "./NotionEditor";

/**
 * Notion-style inline cell. Click to edit, Enter to commit, Escape to cancel.
 * Supports: text, secret, url, email, date, longtext
 */
export default function EditableCell({
  value,
  type = "text",
  placeholder = "",
  onChange,
  className = "",
  autoFocus = false,
  readOnly = false,
}: {
  value: string;
  type?: ColumnType;
  placeholder?: string;
  onChange: (next: string) => void;
  className?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [local, setLocal] = useState(value);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => setLocal(value), [value]);

  useEffect(() => {
    if ((editing || autoFocus) && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) inputRef.current.select();
    }
  }, [editing, autoFocus]);

  function commit() {
    setEditing(false);
    if (local !== value) onChange(local);
  }

  function cancel() {
    setLocal(value);
    setEditing(false);
  }

  async function copy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  // Display formatting
  const display = (() => {
    if (!value) return <span className="text-ink-500">{placeholder || "Empty"}</span>;
    if (type === "secret") {
      return (
        <span className="font-mono tracking-tight">
          {reveal ? value : "••••••••••"}
        </span>
      );
    }
    if (type === "url") {
      return (
        <a
          href={normalizeUrl(value)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="truncate text-accent-400 hover:underline"
        >
          {value}
        </a>
      );
    }
    if (type === "email") {
      return <span className="truncate text-ink-200">{value}</span>;
    }
    if (type === "date") {
      let isAlert = false;
      let daysLeftStr = "";
      if (value) {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          daysLeftStr = ` ( ${diff} )`;
          if (diff <= 30) isAlert = true;
        }
      }
      return (
        <span className={`truncate ${isAlert ? "text-red-400 font-medium" : "text-ink-200"}`}>
          {value}{isAlert && " ⏰"}{daysLeftStr}
        </span>
      );
    }
    return (
      <div 
        className="truncate text-ink-100 whitespace-nowrap [&_a]:text-accent-400 [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_code]:bg-ink-700 [&_code]:px-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-accent-300 [&_p]:inline" 
        dangerouslySetInnerHTML={{ __html: value }} 
      />
    );
  })();

  if (editing) {
    const commonCls =
      "cell-input px-2 py-1.5 text-sm";

    if (type === "text" || type === "longtext") {
      return (
        <div className="min-w-[120px] bg-ink-900 rounded p-1 w-full max-w-sm z-50">
          <NotionEditor
            value={local}
            onChange={setLocal}
            onCommit={commit}
            onCancel={cancel}
            autoFocus={true}
            isSingleLine={type === "text"}
          />
        </div>
      );
    }
    return (
      <input
        ref={(el) => (inputRef.current = el)}
        type={type === "date" ? "date" : type === "email" ? "email" : "text"}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") cancel();
          if (e.key === "Enter") commit();
        }}
        className={`${commonCls} ${type === "secret" ? "font-mono tracking-tight" : ""} ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onClick={() => !readOnly && setEditing(true)}
      className={`group flex min-h-[34px] w-full cursor-text items-center gap-2 px-2 py-1.5 text-sm ${className} ${readOnly ? "cursor-default" : ""}`}
      title={readOnly ? "" : "Click to edit"}
    >
      <div className="min-w-0 flex-1 truncate">{display}</div>
      {value && (type === "secret" || type === "email" || type === "url" || type === "text") && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
          {type === "secret" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setReveal((v) => !v);
              }}
              className="rounded px-1.5 py-0.5 text-[10px] text-ink-300 hover:bg-ink-700"
              title={reveal ? "Hide" : "Show"}
            >
              {reveal ? "Hide" : "Show"}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              copy();
            }}
            className="rounded px-1.5 py-0.5 text-[10px] text-ink-300 hover:bg-ink-700"
            title="Copy"
          >
            {copied ? "✓" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}

function normalizeUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return "https://" + url;
}
