import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({
  workspaces,
  currentWorkspace,
  onSelectWorkspace,
  onAddWorkspace,
  onDeleteWorkspace,
  onOpenProfile,
  user,
  activeTab,
  onSelectTab,
}: {
  workspaces: { id: string; name: string }[];
  currentWorkspace: string;
  onSelectWorkspace: (id: string) => void;
  onAddWorkspace: () => void;
  onDeleteWorkspace: (id: string) => void;
  onOpenProfile: () => void;
  user?: any;
  activeTab: "table" | "tasks" | "members" | "settings";
  onSelectTab: (tab: "table" | "tasks" | "members" | "settings") => void;
}) {
  const currentWs = workspaces.find((w) => w.id === currentWorkspace);
  
  return (
    <div className="flex h-screen w-64 flex-col border-r border-ink-800 bg-ink-950 text-ink-300">
      {/* Profile Section */}
      <motion.div 
        onClick={onOpenProfile}
        whileHover={{ backgroundColor: "rgba(32, 31, 29, 0.5)" }}
        className="relative mb-4 flex items-center gap-3 px-4 py-4 cursor-pointer overflow-hidden transition-colors"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
        <motion.div 
          whileHover={{ rotate: 5, scale: 1.05 }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-xs font-black text-white shadow-lg ring-2 ring-white/10 overflow-hidden"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "J"
          )}
        </motion.div>
        <div className="flex-1 overflow-hidden">
          <div className="truncate text-sm font-black text-ink-100">{user?.name || user?.email || "JV Vault"}</div>
          <div className="truncate text-[10px] uppercase font-black text-accent-500 tracking-[0.1em] flex items-center gap-1.5 mt-0.5 opacity-80">
            <span className="w-1 h-1 rounded-full bg-accent-500" />
            {user?.isMaster ? "Super Admin" : "Editor Access"}
          </div>
        </div>
        <span className="text-ink-600 text-[10px] opacity-40 group-hover:opacity-100">⇕</span>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-2 space-y-6 text-sm">
        {user?.isMaster && (
          <div>
            <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-ink-500">
              Management
            </div>
            <div className="space-y-0.5 mt-1">
               <button 
                onClick={() => onSelectTab("members")}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-all group ${
                  activeTab === "members" ? "bg-ink-800 text-ink-100" : "hover:bg-ink-900 text-ink-300"
                }`}
               >
                 <span className={`text-ink-400 group-hover:text-ink-100 ${activeTab === "members" ? "text-accent-500" : ""}`}>👥</span>
                 <span>Members & Roles</span>
               </button>
               <button 
                onClick={() => onSelectTab("settings")}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-all group ${
                  activeTab === "settings" ? "bg-ink-800 text-ink-100" : "hover:bg-ink-900 text-ink-300"
                }`}
               >
                 <span className={`text-ink-400 group-hover:text-ink-100 ${activeTab === "settings" ? "text-accent-500" : ""}`}>🛡️</span>
                 <span>Global Controls</span>
               </button>
            </div>
          </div>
        )}
        {/* Workspaces Section */}
        <div>
          <div className="px-2 py-1 text-[11px] font-semibold text-ink-400 hover:text-ink-200 cursor-pointer group flex justify-between items-center">
            Private Workspaces
            <button onClick={onAddWorkspace} className="opacity-0 group-hover:opacity-100 p-1 hover:text-white">+</button>
          </div>
          <div className="space-y-0.5 mt-1">
            <AnimatePresence initial={true}>
              {workspaces.map((ws, index) => (
                <motion.div
                  key={ws.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  layout
                  className={`group flex w-full items-center gap-2 rounded-md px-2 py-1 text-left ${
                    ws.id === currentWorkspace
                      ? "bg-ink-800 text-ink-100 font-medium"
                      : "hover:bg-ink-900 text-ink-300"
                  }`}
                >
                  <button
                    className="flex flex-1 items-center gap-2 truncate text-left"
                    onClick={() => onSelectWorkspace(ws.id)}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-ink-800 text-[10px] text-ink-200"
                    >
                      {ws.name.charAt(0).toUpperCase()}
                    </motion.div>
                    <span className="truncate flex-1">{ws.name}</span>
                  </button>
                  {ws.id === currentWorkspace ? (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-ink-400 text-xs flex-shrink-0"
                    >
                      ✓
                    </motion.span>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteWorkspace(ws.id); }}
                      className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-red-500 hover:bg-red-500/20 rounded px-1.5 py-0.5 text-xs transition-opacity"
                      title="Delete workspace"
                    >
                      🗑
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <motion.button
              whileHover={{ x: 2 }}
              onClick={onAddWorkspace}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-ink-900 text-ink-400 group"
            >
              <span className="pl-1 text-accent-500 font-bold group-hover:text-accent-400">+</span>
              <span className="text-accent-500 group-hover:text-accent-400">New workspace</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
