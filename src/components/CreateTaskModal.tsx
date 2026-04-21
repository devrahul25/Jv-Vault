"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Plus, 
  User, 
  Calendar, 
  Type, 
  AlignLeft, 
  Briefcase,
  AlertCircle,
  Mail,
  CheckCircle2,
  ListTodo
} from "lucide-react";

export default function CreateTaskModal({ 
  onClose, 
  onCreated 
}: { 
  onClose: () => void, 
  onCreated: () => void 
}) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    clientId: "",
    assignedEmail: "",
    title: "",
    description: "",
    due_date: ""
  });

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (data.clients) setClients(data.clients);
    } catch (err) {
      console.error("Failed to fetch clients", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!formData.clientId || !formData.assignedEmail || !formData.title) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: formData.clientId,
          assignedEmail: formData.assignedEmail,
          title: formData.title,
          description: formData.description,
          dueDate: formData.due_date ? new Date(formData.due_date).getTime() : null
        })
      });

      if (res.ok) {
        onCreated();
        onClose();
      } else {
        const d = await res.json();
        setError(d.error || "Failed to create task");
      }
    } catch (err) {
      setError("A network error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-ink-900 border border-ink-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-ink-700 bg-ink-800/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-accent-500/10 rounded-lg border border-accent-500/20">
                <ListTodo className="w-5 h-5 text-accent-400" />
             </div>
             <h2 className="text-xl font-bold text-ink-100">Create New Task</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-ink-700 rounded-xl transition-colors">
            <X className="w-5 h-5 text-ink-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in shake duration-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-500 uppercase tracking-widest flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5" />
              Relate to Client*
            </label>
            <select
              required
              className="w-full px-4 py-3 bg-ink-800 border border-ink-700 rounded-xl text-sm text-ink-100 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all appearance-none cursor-pointer"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            >
              <option value="">Select a client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-500 uppercase tracking-widest flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              Assign to Member Email*
            </label>
            <input
              type="email"
              required
              placeholder="member@example.com"
              className="w-full px-4 py-3 bg-ink-800 border border-ink-700 rounded-xl text-sm text-ink-100 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
              value={formData.assignedEmail}
              onChange={(e) => setFormData({ ...formData, assignedEmail: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-500 uppercase tracking-widest flex items-center gap-2">
              <Type className="w-3.5 h-3.5" />
              Task Title*
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Update SSL Certificate"
              className="w-full px-4 py-3 bg-ink-800 border border-ink-700 rounded-xl text-sm text-ink-100 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-500 uppercase tracking-widest flex items-center gap-2">
              <AlignLeft className="w-3.5 h-3.5" />
              Description
            </label>
            <textarea
              placeholder="Specify requirements or steps..."
              rows={3}
              className="w-full px-4 py-3 bg-ink-800 border border-ink-700 rounded-xl text-sm text-ink-100 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-500 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Due Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-ink-800 border border-ink-700 rounded-xl text-sm text-ink-100 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all [color-scheme:dark]"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-ink-800 hover:bg-ink-700 text-ink-200 text-sm font-bold rounded-xl border border-ink-700 transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-accent-500 hover:bg-accent-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-accent-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
