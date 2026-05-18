"use client";

import { useState } from "react";
import { X, User, Camera, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileModal({ 
  user, 
  onClose, 
  onUpdate 
}: { 
  user: any; 
  onClose: () => void; 
  onUpdate: (data: any) => void;
}) {
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated.user);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-ink-900 border border-ink-700 rounded-[2rem] shadow-2xl overflow-hidden relative"
      >
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-accent-500/20 to-transparent" />
        
        <div className="relative p-8 flex flex-col items-center">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 hover:bg-ink-800 rounded-full text-ink-400 hover:text-ink-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative mt-4">
            <div className="w-24 h-24 rounded-3xl bg-ink-800 border-4 border-ink-900 shadow-xl overflow-hidden flex items-center justify-center group cursor-pointer relative ring-2 ring-accent-500/30">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-ink-500" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-accent-500 text-white p-2 rounded-xl shadow-lg ring-4 ring-ink-900">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>

          <h2 className="mt-6 text-2xl font-black text-white">Your Profile</h2>
          <p className="text-ink-400 text-sm">{user?.email}</p>

          <form onSubmit={handleSubmit} className="w-full mt-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-500 ml-1">
                Display Name
              </label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should we call you?"
                className="w-full bg-ink-800 border border-ink-700 rounded-2xl px-5 py-3.5 text-ink-100 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all placeholder:text-ink-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-500 ml-1">
                Avatar URL
              </label>
              <input 
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="Link to your profile image..."
                className="w-full bg-ink-800 border border-ink-700 rounded-2xl px-5 py-3.5 text-ink-100 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all placeholder:text-ink-600"
              />
            </div>

            <div className="pt-4">
              <button
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${
                  success 
                    ? "bg-emerald-500 text-white" 
                    : "bg-accent-500 hover:bg-accent-600 text-white shadow-accent-500/20 active:scale-95"
                }`}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : success ? (
                  <>
                    <Check className="w-5 h-5" />
                    Updated
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
