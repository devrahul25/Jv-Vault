"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Trash2, 
  Shield, 
  Mail, 
  Calendar,
  AlertCircle,
  MoreVertical,
  Search,
  CheckCircle2,
  Lock
} from "lucide-react";

interface Member {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  created_at: number;
}

interface Permission {
  workspace_id: string;
  workspace_name: string;
  role: string;
}

export default function MembersManager() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    try {
      const res = await fetch("/api/members");
      const data = await res.json();
      if (data.members) setMembers(data.members);
    } catch (err) {
      console.error("Failed to fetch members", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMemberDetail(member: Member) {
    setSelectedMember(member);
    try {
      const res = await fetch(`/api/members/${member.id}/permissions`);
      const data = await res.json();
      if (data.permissions) setPermissions(data.permissions);
    } catch (err) {
      console.error("Failed to fetch permissions", err);
    }
  }

  const filteredMembers = members.filter(m => 
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#121210]">
      <div className="p-8 border-b border-ink-800 bg-ink-900/30">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-accent-500" />
          Members & Access Control
        </h1>
        <p className="text-ink-400 mt-2 max-w-2xl text-sm">
          Manage your organization's members, review their workspace permissions, and audit security access.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
            <input 
              type="text"
              placeholder="Search members by email or name..."
              className="w-full pl-10 pr-4 py-2.5 bg-ink-800 border border-ink-700 rounded-xl text-sm text-ink-100 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="px-4 py-2 bg-ink-800/50 rounded-xl border border-ink-700/50 text-[11px] font-bold text-ink-400 uppercase tracking-widest">
            Total Members: {members.length}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Members List */}
        <div className="w-1/2 border-r border-ink-800 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-500 border-ink-700"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMembers.map(member => (
                <div 
                  key={member.id}
                  onClick={() => fetchMemberDetail(member)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    selectedMember?.id === member.id 
                      ? 'bg-accent-500/10 border-accent-500/30' 
                      : 'bg-ink-800/40 border-ink-800 hover:border-ink-700 hover:bg-ink-800/60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-ink-700 flex items-center justify-center text-accent-400 font-black border border-ink-600 group-hover:border-accent-500/30 transition-all shadow-lg shadow-black/20">
                      {member.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-ink-100">{member.email}</div>
                      <div className="text-[10px] text-ink-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Joined {new Date(member.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {member.email === "team@jaiveeru.co.in" && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent-500/10 border border-accent-500/20 text-[10px] font-black text-accent-500 uppercase tracking-tighter">
                       <Shield className="w-3 h-3" />
                       Master
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Member Detail Sidebar */}
        <div className="w-1/2 p-10 bg-ink-950/20 overflow-y-auto custom-scrollbar">
          {selectedMember ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-accent-500 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-accent-500/20 border-4 border-white/10 ring-1 ring-accent-400">
                       {selectedMember.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-white">{selectedMember.email}</h2>
                       <p className="text-ink-400 text-sm mt-1">{selectedMember.name || "Full team access member"}</p>
                    </div>
                  </div>
                  <button className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl border border-red-500/20 transition-all group shadow-lg shadow-red-500/5 active:scale-95">
                     <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
               </div>

               <div className="space-y-6">
                 <div className="bg-ink-800/40 border border-ink-700/50 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                       <Lock className="w-4 h-4 text-accent-400" />
                       <h3 className="text-xs font-black text-ink-200 uppercase tracking-widest">Workspace Permissions</h3>
                    </div>
                    
                    {permissions.length === 0 ? (
                      <div className="text-center py-10 bg-ink-900/50 rounded-xl border border-dashed border-ink-700 flex flex-col items-center gap-3">
                         <AlertCircle className="w-8 h-8 text-ink-600" />
                         <p className="text-xs text-ink-500">No specific workspace permissions found.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {permissions.map(p => (
                          <div key={p.workspace_id} className="flex items-center justify-between p-3 bg-ink-900/50 rounded-xl border border-ink-700 shadow-sm transition-all hover:bg-ink-900">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-ink-800 flex items-center justify-center text-xs font-bold text-ink-400 border border-ink-700">
                                   {p.workspace_name.charAt(0)}
                                </div>
                                <span className="text-sm font-bold text-ink-200">{p.workspace_name}</span>
                             </div>
                             <div className="flex items-center gap-2 px-3 py-1 bg-ink-800 rounded-lg border border-ink-700 text-[10px] font-bold text-accent-400 uppercase tracking-widest">
                                {p.role}
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>

                 <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                    <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />
                    <p className="text-[11px] leading-relaxed text-orange-200/80">
                       <span className="font-bold text-orange-400">Security Note:</span> To revoke all access, delete the member. To update specific permissions, use the "Share" menu within the workspace itself.
                    </p>
                 </div>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
               <div className="w-20 h-20 rounded-full bg-ink-800/50 flex items-center justify-center border border-dashed border-ink-700">
                  <UserCheck className="w-10 h-10 text-ink-600" />
               </div>
               <div className="max-w-xs">
                  <h3 className="text-lg font-bold text-ink-200">Select a Member</h3>
                  <p className="text-sm text-ink-500 mt-2">Choose a member from the left list to view their detailed access and manage roles.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}
