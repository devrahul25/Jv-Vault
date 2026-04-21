"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Plus, 
  Search,
  Timer,
  User,
  MoreVertical,
  X,
  PlusCircle,
  AlertCircle
} from "lucide-react";

import TaskDrawer from "./TaskDrawer";
import CreateTaskModal from "./CreateTaskModal";

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

export default function TasksList({ isMaster, userEmail }: { isMaster: boolean, userEmail: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "in-progress": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "completed": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "cancelled": return "text-ink-400 bg-ink-400/10 border-ink-400/20";
      default: return "text-ink-400 bg-ink-400/10 border-ink-400/20";
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-ink-700 bg-ink-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-semibold text-ink-100 flex items-center gap-2">
            <Timer className="w-5 h-5 text-accent-400" />
            Workspace Tasks
          </h2>
          <p className="text-sm text-ink-400 mt-1">Manage and track collaboration tasks</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
            <input 
              type="text"
              placeholder="Search tasks or clients..."
              className="pl-9 pr-4 py-2 bg-ink-800 border border-ink-700 rounded-lg text-sm text-ink-200 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-300 focus:outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {isMaster && (
            <button 
              className="flex items-center gap-1.5 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-accent-500/20"
              onClick={() => setShowCreateModal(true)}
            >
              <PlusCircle className="w-4 h-4" />
              New Task
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-500 border-ink-700"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-ink-500 space-y-4 bg-ink-800/20 rounded-2xl border border-dashed border-ink-700">
            <AlertCircle className="w-12 h-12 stroke-[1.5]" />
            <div className="text-center">
              <p className="text-lg font-medium text-ink-300">No tasks found</p>
              <p className="text-sm">Try adjusting your filters or search terms</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <div 
                key={task.id}
                className="group p-5 bg-ink-800 border border-ink-700 rounded-xl hover:border-accent-500/50 hover:shadow-xl hover:shadow-accent-500/5 transition-all cursor-pointer relative overflow-hidden"
                onClick={() => setSelectedTask(task)}
              >
                {/* Status Indicator */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  task.status === 'completed' ? 'bg-emerald-500' : 
                  task.status === 'in-progress' ? 'bg-blue-500' : 'bg-amber-500'
                }`} />

                <div className="flex justify-between items-start mb-3">
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(task.status)}`}>
                    {task.status}
                  </div>
                </div>

                <h3 className="text-base font-semibold text-ink-100 mb-1 group-hover:text-accent-400 transition-colors">
                  {task.title}
                </h3>
                
                <div className="flex items-center gap-1.5 text-xs text-ink-400 mb-4 bg-ink-900/50 px-2 py-1 rounded-md w-fit font-medium">
                  <User className="w-3 h-3" />
                  {task.client_name}
                </div>

                <div className="space-y-2.5 pt-4 border-t border-ink-700/50">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-ink-400">
                      <Clock className="w-3.5 h-3.5" />
                      Assigned to
                    </div>
                    <span className="text-accent-400 font-bold truncate max-w-[120px]">
                      {task.assigned_email === userEmail ? "You" : task.assigned_email}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-ink-400">
                      <Calendar className="w-3.5 h-3.5" />
                      Due Date
                    </div>
                    <span className={task.due_date && task.due_date < Date.now() ? "text-red-400 font-bold" : "text-ink-300 font-bold"}>
                      {task.due_date ? format(task.due_date, "MMM d, yyyy") : "Not set"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 pt-3 border-t border-ink-700/30">
                   <div className="flex items-center gap-1 text-[11px] text-ink-500 group-hover:text-ink-300 transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" />
                       View Detail & Feedback
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDrawer 
          task={selectedTask}
          userEmail={userEmail}
          onClose={() => setSelectedTask(null)}
          onStatusUpdate={() => {
            fetchTasks();
            setSelectedTask(null);
          }}
        />
      )}

      {showCreateModal && (
        <CreateTaskModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchTasks}
        />
      )}
    </div>
  );
}
