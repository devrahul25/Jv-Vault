"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Database, 
  Zap, 
  RotateCcw, 
  Download, 
  Trash2, 
  AlertTriangle,
  HardDrive,
  Cpu,
  Fingerprint,
  RefreshCw,
  Eye,
  Settings2,
  CheckCircle2,
  Info
} from "lucide-react";

export default function GlobalControls() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoading(false);
    }
  }

  const handleBackup = async () => {
    setBackingUp(true);
    // Simulate backup delay
    setTimeout(() => {
      setBackingUp(false);
      const link = document.createElement('a');
      link.href = '/api/backup';
      link.download = `jv_vault_backup_${new Date().toISOString().split('T')[0]}.db`;
      link.click();
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#121210] animate-in fade-in duration-500 overflow-y-auto custom-scrollbar">
      <div className="p-10 max-w-5xl mx-auto w-full space-y-12">
        {/* Hero Header */}
        <div className="relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-r from-accent-500/10 to-transparent rounded-3xl -z-10 group-hover:from-accent-500/20 transition-all duration-700" />
           <div className="p-8 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-accent-500/10 flex items-center justify-center border border-accent-500/20 shadow-lg shadow-accent-500/5">
                    <ShieldCheck className="w-6 h-6 text-accent-500" />
                 </div>
                 <h1 className="text-4xl font-black text-white tracking-tight">Global Vault Controls</h1>
              </div>
              <p className="text-ink-400 text-lg max-w-2xl leading-relaxed">
                 Master dashboard for technical oversight, data integrity tools, and core security configurations. Use with caution.
              </p>
           </div>
        </div>

        {/* System Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon={<Database className="w-4 h-4" />}
              label="Vault Database"
              value={stats?.dbSize || "2.4 MB"}
              desc="Encrypted SQLite File"
            />
            <StatCard 
              icon={<Zap className="w-4 h-4 text-amber-400" />}
              label="Avg Query Speed"
              value="12ms"
              desc="Optimized WAL Mode"
            />
            <StatCard 
              icon={<HardwareIcon className="w-4 h-4 text-blue-400" />}
              label="Storage Health"
              value="100%"
              desc="RAID Integrity Check"
            />
            <StatCard 
              icon={<Fingerprint className="w-4 h-4 text-emerald-400" />}
              label="Active Sessions"
              value={stats?.activeSessions || "3"}
              desc="Global Team Access"
            />
        </div>

        {/* Main Control Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Data Governance */}
           <div className="lg:col-span-2 space-y-6">
              <section className="bg-ink-800/30 border border-ink-800 rounded-3xl p-8 space-y-8">
                 <div className="flex items-center justify-between border-b border-ink-800 pb-6">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-ink-800 rounded-2xl border border-ink-700">
                          <RotateCcw className="w-6 h-6 text-accent-400" />
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-white">Data Maintenance</h3>
                          <p className="text-sm text-ink-500">Secure backup and recovery tools</p>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ControlAction 
                       title="Download Encrypted Backup"
                       desc="Generate a portable AES-256 encrypted SQLite snapshot for offline cold storage."
                       icon={<Download className="w-5 h-5" />}
                       buttonText={backingUp ? "Processing..." : "Export Snapshot"}
                       onClick={handleBackup}
                       loading={backingUp}
                    />
                    <ControlAction 
                       title="Optimize Database"
                       desc="Perform VACUUM and ANALYZE to reclaim disk space and rebuild index caches."
                       icon={<RefreshCw className="w-5 h-5" />}
                       buttonText="Run VACUUM"
                       variant="secondary"
                    />
                 </div>
              </section>

              <section className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 space-y-6">
                 <div className="flex items-center gap-4 text-red-500">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Danger Zone</h3>
                 </div>
                 <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-red-500/10 transition-all">
                    <div className="space-y-1">
                       <h4 className="font-bold text-red-400">Flush All Application Sessions</h4>
                       <p className="text-xs text-red-700 font-medium">Instantly log out every member and revoke all access tokens across all devices.</p>
                    </div>
                    <button className="px-6 py-2.5 bg-red-600 text-white text-xs font-black uppercase rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition-all">
                       Emergency Logout
                    </button>
                 </div>
              </section>
           </div>

           {/* Security Status Sidebar */}
           <div className="space-y-6">
              <aside className="bg-ink-800/30 border border-ink-800 rounded-3xl p-8 sticky top-8">
                 <h3 className="text-xs font-black text-ink-500 uppercase tracking-widest mb-6">Security Context</h3>
                 <div className="space-y-5">
                    <SecurityItem 
                      label="App Protocol" 
                      value="HTTPS / TLS 1.3" 
                      status="secure" 
                    />
                    <SecurityItem 
                      label="Key Derivation" 
                      value="Argon2id (64MB)" 
                      status="secure" 
                    />
                    <SecurityItem 
                      label="DB Encryption" 
                      value="AES-GCM 256-bit" 
                      status="secure" 
                    />
                    <SecurityItem 
                      label="Last Audit" 
                      value="Yesterday" 
                      status="warning" 
                    />
                 </div>

                 <div className="mt-10 p-4 bg-accent-500/10 border border-accent-500/20 rounded-2xl flex flex-col items-center text-center space-y-2">
                    <Info className="w-5 h-5 text-accent-500" />
                    <p className="text-[10px] font-bold text-accent-500 uppercase tracking-widest">Version v1.2.4 (LTS)</p>
                    <p className="text-[11px] text-ink-400 leading-relaxed px-2">Managed and maintained by <span className="text-white font-bold">Jaiveeru HQ</span> for enterprise workflows.</p>
                 </div>
              </aside>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, desc }: any) {
  return (
    <div className="p-5 bg-ink-800/40 border border-ink-800 rounded-3xl space-y-3 hover:border-accent-500/30 transition-all group shadow-sm">
       <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-xl bg-ink-800 flex items-center justify-center border border-ink-700 group-hover:bg-accent-500/10 group-hover:border-accent-500/20 transition-all">
             {icon}
          </div>
          <CheckCircle2 className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
       </div>
       <div>
          <div className="text-[10px] font-black text-ink-500 uppercase tracking-widest">{label}</div>
          <div className="text-2xl font-black text-white mt-1">{value}</div>
          <div className="text-[10px] text-ink-600 font-bold mt-1.5 uppercase">{desc}</div>
       </div>
    </div>
  );
}

function ControlAction({ title, desc, icon, buttonText, onClick, variant = "primary", loading = false }: any) {
  return (
    <div className="p-6 bg-ink-900/50 border border-ink-800 rounded-2xl flex flex-col justify-between hover:bg-ink-900 transition-all group">
       <div className="space-y-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-ink-800 flex items-center justify-center border border-ink-700 group-hover:border-accent-500/40 transition-all">
             {icon}
          </div>
          <h4 className="text-sm font-bold text-ink-100">{title}</h4>
          <p className="text-[11px] text-ink-500 leading-relaxed">{desc}</p>
       </div>
       <button 
        onClick={onClick}
        disabled={loading}
        className={`w-full py-2.5 text-[11px] font-black uppercase rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
          variant === "primary" 
            ? "bg-accent-500 text-white shadow-xl shadow-accent-500/10 hover:bg-accent-600" 
            : "bg-ink-800 text-ink-300 hover:bg-ink-700 border border-ink-700"
        } disabled:opacity-50`}
       >
          {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
          {buttonText}
       </button>
    </div>
  );
}

function SecurityItem({ label, value, status }: any) {
  return (
    <div className="flex items-center justify-between group">
       <div className="flex flex-col">
          <span className="text-[10px] font-black text-ink-600 uppercase tracking-tighter group-hover:text-ink-400 transition-colors">{label}</span>
          <span className="text-xs font-bold text-ink-200 mt-0.5">{value}</span>
       </div>
       <div className={`w-2 h-2 rounded-full shadow-sm ${status === 'secure' ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-amber-500 shadow-amber-500/40'}`} />
    </div>
  );
}

function HardwareIcon(props: any) {
  return (
     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
        <line x1="6" y1="6" x2="6" y2="6"/>
        <line x1="6" y1="18" x2="6" y2="18"/>
     </svg>
  );
}
