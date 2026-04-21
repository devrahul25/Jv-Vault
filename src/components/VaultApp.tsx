"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef, ClientRecord, Section } from "@/lib/vault";
import TopTable from "./TopTable";
import ClientDrawer from "./ClientDrawer";
import Sidebar from "./Sidebar";
import ShareModal from "./ShareModal";
import TasksList from "./TasksList";
import MembersManager from "./MembersManager";
import GlobalControls from "./GlobalControls";

export default function VaultApp() {
  const [activeTab, setActiveTab] = useState<"table" | "tasks" | "members" | "settings">("table");
  const [columns, setColumns] = useState<ColumnDef[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [presence, setPresence] = useState<any[]>([]);
  const [showShare, setShowShare] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [requested, setRequested] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const wRes = await fetch("/api/workspaces");
      const wData = await wRes.json();
      setWorkspaces(wData.workspaces || []);
      
      let targetWs = currentWorkspace;
      if (!targetWs && wData.workspaces?.length > 0) {
        targetWs = wData.workspaces[0].id;
        setCurrentWorkspace(targetWs);
      }

      if (targetWs) {
        const [s, c] = await Promise.all([
          fetch(`/api/schema?workspaceId=${targetWs}`).then((r) => r.json()),
          fetch(`/api/clients?workspaceId=${targetWs}`).then((r) => r.json()),
        ]);
        setColumns(s.columns || []);
        setClients(c.clients || []);
      }
    } catch (e) {
      console.error("Load failed:", e);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  useEffect(() => {
    load();
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setUser(data);
      } catch {}
    };
    fetchMe();

    const fetchPresence = async () => {
      try {
        const res = await fetch("/api/presence");
        const data = await res.json();
        setPresence(data.sessions || []);
      } catch {}
    };
    fetchPresence();
    const timer = setInterval(fetchPresence, 10000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
     if (user?.isMaster) {
       const fetchReqs = async () => {
         try {
           const res = await fetch("/api/access-requests");
           const data = await res.json();
           setPendingRequests(data.requests || []);
         } catch {}
       };
       fetchReqs();
       const t = setInterval(fetchReqs, 15000);
       return () => clearInterval(t);
     }
  }, [user]);

  const canEdit = useMemo(() => {
    if (!user) return false;
    if (user.isMaster) return true;
    return user.roles?.[currentWorkspace] === "edit" || user.roles?.[currentWorkspace] === "full";
  }, [user, currentWorkspace]);

  const openClient = useMemo(
    () => clients.find((c) => c.id === openId) || null,
    [clients, openId]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return clients;
    const q = query.toLowerCase();
    return clients.filter((c) => {
      if (c.name.toLowerCase().includes(q)) return true;
      for (const v of Object.values(c.attrs || {})) {
        if (String(v || "").toLowerCase().includes(q)) return true;
      }
      for (const s of c.sections || []) {
        if (s.title.toLowerCase().includes(q)) return true;
        for (const row of s.rows || []) {
          for (const v of Object.values(row.cells || {})) {
            if (String(v || "").toLowerCase().includes(q)) return true;
          }
        }
      }
      return false;
    });
  }, [clients, query]);

  async function saveColumns(next: ColumnDef[]) {
    setColumns(next);
    await fetch("/api/schema", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ columns: next }),
    });
  }

  async function addClient() {
    const r = await fetch("/api/clients", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ 
        name: "New client", 
        workspace_id: currentWorkspace 
      }),
    });
    if (r.ok) {
      const { client } = await r.json();
      setClients((prev) => [...prev, client]);
    }
  }

  async function patchClient(id: string, patch: Partial<ClientRecord>) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function deleteClient(id: string) {
    setClients((prev) => prev.filter((c) => c.id !== id));
    if (openId === id) setOpenId(null);
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  async function requestEditAccess() {
    setRequested(true);
    await fetch("/api/access-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: currentWorkspace }),
    });
    setToast({ message: "Request sent to Super Admin! Please wait for approval.", type: "success" });
    setTimeout(() => setToast(null), 5000);
  }

  async function handleRequestAction(id: string, status: "approved" | "denied") {
    await fetch("/api/access-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setPendingRequests(prev => prev.filter(r => r.id !== id));
    // Refresh user roles if approved
    if (status === 'approved') {
       const res = await fetch("/api/auth/me");
       const data = await res.json();
       setUser(data);
    }
  }

  async function handleAddWorkspace() {
    const name = prompt("Enter new workspace name:");
    if (!name) return;
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const nw = await res.json();
    setWorkspaces([...workspaces, nw]);
    setCurrentWorkspace(nw.id);
  }

  async function handleDeleteWorkspace(id: string) {
    if (!confirm("Are you sure? This will delete everything in this workspace.")) return;
    await fetch(`/api/workspaces?id=${id}`, { method: "DELETE" });
    const next = workspaces.filter((w) => w.id !== id);
    setWorkspaces(next);
    if (currentWorkspace === id) {
      setCurrentWorkspace(next[0]?.id || "");
    }
  }

  const currentWs = workspaces.find((w) => w.id === currentWorkspace);

  return (
    <div className="flex h-screen w-full bg-ink-950 text-white overflow-hidden font-sans">
      <Sidebar
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        onSelectWorkspace={(ws) => {
          setCurrentWorkspace(ws);
          setActiveTab("table");
        }}
        onAddWorkspace={handleAddWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
        user={user}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />
      <div className="flex-1 flex flex-col min-w-0 bg-[#121210]">
        {!["members", "settings"].includes(activeTab) && (
          <TopBar 
            currentWsName={currentWs?.name} 
            onLogout={logout} 
            presence={presence}
            onShare={() => setShowShare(true)}
          />
        )}

        <main className="flex-1 overflow-auto">
          {activeTab === "members" ? (
            <MembersManager />
          ) : activeTab === "settings" ? (
            <GlobalControls />
          ) : (
            <div className="px-6 py-10 sm:px-12">
              <div className="mx-auto w-full max-w-[1400px]">
                <header className="mb-8">
                  <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3 mb-6">
                    🌐 {currentWs?.name || "Workspace"}
                  </h1>
                  <div className="flex items-center justify-between border-b border-ink-800 pb-2 text-sm text-ink-300">
                    <div className="flex items-center gap-6">
                       <button 
                        onClick={() => setActiveTab("table")}
                        className={`pb-2 -mb-2 font-medium flex items-center gap-2 transition-all ${
                         activeTab === "table" ? "text-white border-b-2 border-white" : "text-ink-500 hover:text-ink-300"
                        }`}
                       >
                         <span>🗂</span> Table
                       </button>
                       <button 
                        onClick={() => setActiveTab("tasks")}
                        className={`pb-2 -mb-2 font-medium flex items-center gap-2 transition-all ${
                         activeTab === "tasks" ? "text-white border-b-2 border-white" : "text-ink-500 hover:text-ink-300"
                        }`}
                       >
                         <span>✅</span> Tasks
                       </button>
                       {!canEdit && activeTab === "table" && (
                         <button 
                            onClick={requestEditAccess}
                            disabled={requested}
                            className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50"
                         >
                           {requested ? "Request pending..." : "Request edit access"}
                         </button>
                       )}
                    </div>
                    {activeTab === "table" && (
                      <div className="flex items-center gap-4">
                        <div className="relative w-64 text-ink-300">
                          <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search…"
                            className="w-full rounded-md border border-ink-800 bg-ink-900 px-8 py-1 text-sm text-white placeholder:text-ink-400 focus:border-ink-600 focus:outline-none"
                          />
                          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400">
                            ⌕
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </header>

                {loading ? (
                  <div className="text-ink-400">Loading…</div>
                ) : activeTab === "table" ? (
                  <TopTable
                    columns={columns}
                    clients={filtered}
                    onColumnsChange={saveColumns}
                    onAddClient={addClient}
                    onOpenClient={(id) => setOpenId(id)}
                    onPatchClient={patchClient}
                    onDeleteClient={deleteClient}
                    readOnly={!canEdit}
                  />
                ) : (
                  <TasksList 
                    isMaster={user?.isMaster || false} 
                    userEmail={user?.email || ""}
                  />
                )}
              </div>
            </div>
          )}
        </main>
      </div>

        {openClient && (
          <ClientDrawer
            client={openClient}
            onClose={() => setOpenId(null)}
            onSectionsChange={(sections: Section[]) => patchClient(openClient.id, { sections })}
            onRename={(name: string) => patchClient(openClient.id, { name })}
            readOnly={!canEdit}
          />
        )}

        {/* Floating Success Toast */}
        {toast && (
          <div className="fixed bottom-8 right-8 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-2xl ${
              toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}>
              <span className="text-xl">Check</span>
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        )}

        {/* Super Admin Top Banner Notification */}
        {user?.isMaster && pendingRequests.length > 0 && (
          <div className="fixed inset-x-0 top-0 z-[100] flex justify-center p-4">
            <div className="flex items-center gap-4 rounded-2xl bg-red-600 px-6 py-3 text-white shadow-2xl ring-4 ring-red-900/20 animate-in slide-in-from-top-10 duration-500">
              <div className="flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-white font-black text-red-600">
                {pendingRequests.length}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-tight">Active Permissions Requests</span>
                <span className="text-xs opacity-80">Team members are waiting for your approval to edit this vault.</span>
              </div>
              <div className="flex items-center gap-2 border-l border-white/20 pl-4">
                {pendingRequests.map(r => (
                  <div key={r.id} className="flex items-center gap-3 rounded-xl bg-black/20 px-3 py-1.5">
                    <span className="text-xs font-bold">{r.email}</span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleRequestAction(r.id, "approved")}
                        className="rounded-lg bg-white px-3 py-1 text-xs font-black text-red-600 hover:bg-ink-100"
                      >
                        APPROVE
                      </button>
                      <button 
                         onClick={() => handleRequestAction(r.id, "denied")}
                         className="rounded-lg bg-red-800/40 px-3 py-1 text-xs font-bold hover:bg-black/40"
                      >
                        DENY
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      {showShare && (
        <ShareModal 
          workspaceId={currentWorkspace}
          workspaceName={currentWs?.name || "Workspace"} 
          onClose={() => setShowShare(false)} 
        />
      )}
    </div>
  );
}

function TopBar({ 
  currentWsName, 
  onLogout, 
  presence,
  onShare 
}: { 
  currentWsName?: string; 
  onLogout: () => void;
  presence: any[];
  onShare: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-2 text-sm border-b border-ink-800 bg-[#121210]/80 backdrop-blur">
      <div className="flex items-center gap-2 text-ink-300">
        <span className="text-ink-100 cursor-pointer hover:underline">🌐 {currentWsName}</span>
        <span className="mx-1 text-ink-600">/</span>
        <span className="text-ink-300 flex items-center gap-1 cursor-pointer hover:text-ink-100">🔒 Private</span>
      </div>
      <div className="flex items-center gap-4 text-ink-300">
        <span className="hidden sm:inline text-xs text-ink-400">Edited recently</span>
        <div className="flex items-center px-2">
           <div className="relative flex -space-x-1.5">
             {presence.slice(0, 3).map((p, i) => (
               <div 
                key={p.id} 
                className="h-6 w-6 rounded-full border border-[#121210] flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-[#121210]"
                style={{ 
                  backgroundColor: `hsl(${(i * 137) % 360}, 50%, 40%)`,
                  zIndex: 30 - i 
                }}
                title={p.label}
               >
                 {p.initial}
               </div>
             ))}
             {presence.length > 3 && (
               <div className="z-0 h-6 w-6 rounded-full bg-ink-700 border border-[#121210] flex items-center justify-center text-[10px] text-white">
                 +{presence.length - 3}
               </div>
             )}
           </div>
        </div>
        <button 
          onClick={onShare}
          className="flex items-center gap-1 rounded bg-ink-800 px-3 py-1 font-medium text-ink-50 hover:bg-ink-700 transition-colors"
        >
          Share
        </button>
        <button
          onClick={onLogout}
          className="rounded px-2.5 py-1 text-xs text-ink-400 hover:text-ink-100 hover:bg-ink-800"
          title="Lock vault"
        >
          Lock
        </button>
      </div>
    </div>
  );
}
