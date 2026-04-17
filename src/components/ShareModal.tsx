"use client";

import { useState, useEffect } from "react";

type Member = {
  id: string;
  email: string;
  role: "full" | "edit" | "comment" | "view";
};

export default function ShareModal({
  workspaceId,
  workspaceName,
  onClose,
}: {
  workspaceId: string;
  workspaceName: string;
  onClose: () => void;
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [role, setRole] = useState<Member["role"]>("edit");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`/api/share?workspaceId=${workspaceId}`);
        const data = await res.json();
        setMembers(data.permissions || []);
        setLoading(false);
      } catch {}
    };
    fetchMembers();
  }, [workspaceId]);

  const [copying, setCopying] = useState(false);

  async function handleInvite() {
    if (!inviteEmail) return;
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, email: inviteEmail, role }),
      });
      if (res.ok) {
        setMembers([...members, { id: `new_${Date.now()}`, email: inviteEmail, role }]);
        setInviteEmail("");
      }
    } catch {}
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-ink-700 bg-ink-900 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Share "{workspaceName}"</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-6">
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Add people by email..."
              className="flex-1 rounded-md border border-ink-800 bg-ink-950 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
            />
            <select 
               value={role}
               onChange={(e) => setRole(e.target.value as any)}
               className="rounded-md border border-ink-800 bg-ink-950 px-2 py-2 text-sm text-white focus:outline-none"
            >
              <option value="full">Full access</option>
              <option value="edit">Can edit</option>
              <option value="comment">Can comment</option>
              <option value="view">Can view</option>
            </select>
            <button 
              onClick={handleInvite}
              className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500"
            >
              Invite
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500">People with access</h3>
            <div className="space-y-3 min-h-[100px]">
              {loading ? (
                <div className="text-sm text-ink-500 italic">Loading members...</div>
              ) : members.length === 0 ? (
                <div className="text-sm text-ink-500 italic">No members yet. Invite someone!</div>
              ) : (
                members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-ink-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                        {m.email[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{m.email}</div>
                        <div className="text-xs text-ink-400 capitalize">{m.role} access</div>
                      </div>
                    </div>
                    <select 
                      value={m.role}
                      onChange={async (e) => {
                         const newRole = e.target.value as any;
                         if (newRole === "remove") {
                           // We need to implement delete API too, but for now just filter UI
                           setMembers(members.filter(x => x.id !== m.id));
                           return;
                         }
                         try {
                           await fetch("/api/share", {
                             method: "POST",
                             headers: { "Content-Type": "application/json" },
                             body: JSON.stringify({ workspaceId, email: m.email, role: newRole }),
                           });
                           setMembers(members.map(x => x.id === m.id ? {...x, role: newRole} : x));
                         } catch {}
                      }}
                      className="bg-transparent text-xs text-ink-400 focus:outline-none cursor-pointer hover:text-white"
                    >
                      <option value="full">Full access</option>
                      <option value="edit">Can edit</option>
                      <option value="comment">Can comment</option>
                      <option value="view">Can view</option>
                      <option value="remove">Remove</option>
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-ink-800 pt-4 flex items-center justify-between">
            <div className="text-xs text-ink-400">
              Anyone with the link can view this workspace? <button className="text-accent-400 hover:underline">Change</button>
            </div>
            <button 
              onClick={copyLink}
              className="flex items-center gap-1.5 rounded-md border border-ink-700 bg-ink-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-700"
            >
              🔗 {copying ? "Link copied!" : "Copy link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
