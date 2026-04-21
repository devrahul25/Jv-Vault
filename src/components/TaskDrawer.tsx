"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { 
  X, 
  Send, 
  Clock, 
  User, 
  Calendar, 
  Briefcase,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  UserCheck,
  History
} from "lucide-react";

interface Comment {
  id: string;
  task_id: string;
  author_email: string;
  content: string;
  created_at: number;
}

interface Task {
  id: string;
  client_id: string;
  client_name: string;
  assigned_email: string;
  creator_email: string;
  title: string;
  description: string | null;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  due_date: number | null;
  created_at: number;
}

export default function TaskDrawer({ 
  task, 
  onClose, 
  userEmail,
  onStatusUpdate 
}: { 
  task: Task, 
  onClose: () => void, 
  userEmail: string,
  onStatusUpdate: () => void
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments();
  }, [task.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  async function fetchComments() {
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`);
      const data = await res.json();
      if (data.comments) setComments(data.comments);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment })
      });
      if (res.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        onStatusUpdate();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg h-full bg-ink-900 border-l border-ink-700 animate-in slide-in-from-right duration-500 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-ink-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center border border-accent-500/20">
              <CheckCircle2 className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink-100">Task Details</h2>
              <p className="text-xs text-ink-400">ID: {task.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-ink-800 rounded-lg text-ink-400 hover:text-ink-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            {/* Title Section */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-ink-100 leading-tight">{task.title}</h1>
              {task.description && (
                <p className="text-ink-300 text-sm leading-relaxed bg-ink-800/40 p-4 rounded-xl border border-ink-700/50 italic">
                  "{task.description}"
                </p>
              )}
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-ink-800/60 rounded-xl border border-ink-700/50">
                <div className="text-[10px] text-ink-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  Assigned To
                </div>
                <div className="text-sm font-medium text-ink-200 truncate">{task.assigned_email}</div>
              </div>
              <div className="p-4 bg-ink-800/60 rounded-xl border border-ink-700/50">
                <div className="text-[10px] text-ink-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Due Date
                </div>
                <div className={`text-sm font-medium ${task.due_date && task.due_date < Date.now() ? 'text-red-400' : 'text-ink-200'}`}>
                  {task.due_date ? format(task.due_date, "MMM d, yyyy") : "No deadline"}
                </div>
              </div>
              <div className="p-4 bg-ink-800/60 rounded-xl border border-ink-700/50">
                <div className="text-[10px] text-ink-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Related Client
                </div>
                <div className="text-sm font-medium text-accent-400">{task.client_name}</div>
              </div>
              <div className="p-4 bg-ink-800/60 rounded-xl border border-ink-700/50">
                <div className="text-[10px] text-ink-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Created On
                </div>
                <div className="text-sm font-medium text-ink-200">{format(task.created_at, "MMM d, yyyy")}</div>
              </div>
            </div>

            {/* Status Update section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-ink-500 uppercase tracking-widest px-1">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {["pending", "in-progress", "completed", "cancelled"].map((s) => (
                  <button
                    key={s}
                    disabled={updating}
                    onClick={() => updateStatus(s)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all border ${
                      task.status === s 
                        ? 'bg-accent-500 border-accent-400 text-white shadow-lg shadow-accent-500/20 scale-105' 
                        : 'bg-ink-800 border-ink-700 text-ink-400 hover:border-ink-500 hover:text-ink-200'
                    }`}
                  >
                    {s.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments/Feedback Section */}
            <div className="pt-4 space-y-4">
               <div className="flex items-center gap-2 px-1">
                  <MessageCircle className="w-4 h-4 text-accent-400" />
                  <h3 className="text-sm font-bold text-ink-200">Task Feedback & Collaboration</h3>
               </div>
               
               <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-ink-500 text-sm italic bg-ink-800/20 rounded-xl border border-dashed border-ink-700">
                      No comments yet. Start the conversation!
                    </div>
                  ) : (
                    comments.map(c => (
                      <div 
                        key={c.id} 
                        className={`flex flex-col gap-1.5 ${c.author_email === userEmail ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 text-[10px] text-ink-500 px-1">
                           <span className="font-bold">{c.author_email === userEmail ? "You" : c.author_email}</span>
                           <span>•</span>
                           <span>{format(c.created_at, "h:mm a, MMM d")}</span>
                        </div>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[90%] shadow-sm ${
                          c.author_email === userEmail 
                            ? 'bg-accent-600 text-white rounded-tr-none' 
                            : 'bg-ink-800 text-ink-200 border border-ink-700 rounded-tl-none'
                        }`}>
                          {c.content}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
               </div>
            </div>
          </div>
        </div>

        {/* Footer / Input */}
        <div className="p-6 border-t border-ink-700 bg-ink-900 shadow-2xl">
          <form onSubmit={postComment} className="relative">
            <input 
              type="text"
              placeholder="Write feedback or message..."
              className="w-full pl-4 pr-12 py-3 bg-ink-800 border border-ink-700 rounded-xl text-sm text-ink-100 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all shadow-inner"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!newComment.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent-500 hover:bg-accent-600 rounded-lg text-white disabled:opacity-50 disabled:grayscale transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
