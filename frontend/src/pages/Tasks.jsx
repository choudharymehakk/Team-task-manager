import { motion } from "framer-motion";
import { CheckSquare, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../api/hooks/useAuth.js";
import { useProjects } from "../api/hooks/useProjects.js";
import { useAllProjectTasks } from "../api/hooks/useTasks.js";
import { useUsers } from "../api/hooks/useUsers.js";

export default function Tasks() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const { user } = useAuth();
  const projects = useProjects();
  const { tasks, isLoading } = useAllProjectTasks(projects.data || []);
  const users = useUsers(user?.role === "admin");
  const userMap = new Map((users.data || []).map((item) => [item.id, item]));
  const filtered = useMemo(
    () => tasks.filter((task) =>
      (status === "all" || task.status === status) &&
      task.title.toLowerCase().includes(query.toLowerCase())
    ),
    [tasks, query, status]
  );

  return (
    <main className="app-page">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-bold text-indigo-600">Execution queue</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Tasks</h1>
          <p className="mt-2 text-slate-500">{user?.role === "admin" ? "All tasks across every project." : "Only tasks assigned to you are shown."}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-card backdrop-blur md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="input-premium pl-10" placeholder="Search tasks..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <select className="input-premium md:w-56" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <section className="mt-6 grid gap-3">
        {isLoading && Array.from({ length: 5 }).map((_, index) => <div className="skeleton h-20" key={index} />)}
        {filtered.map((task) => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={task.id}>
            <Link className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-card md:grid-cols-[1fr_auto_auto_auto_auto]" to={`/tasks/${task.id}`}>
              <div>
                <h2 className="font-black text-slate-950">{task.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{task.project_name}</p>
              </div>
              <span className="self-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">{task.status.replace("_", " ")}</span>
              <span className="self-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold capitalize text-indigo-700">{task.priority}</span>
              <span className="self-center text-sm font-semibold text-slate-500">{task.due_date || "No due date"}</span>
              <span className="self-center text-sm font-semibold text-slate-500">{task.assigned_to ? (userMap.get(task.assigned_to)?.username || "Assigned") : "Unassigned"}</span>
            </Link>
          </motion.div>
        ))}
        {!isLoading && !filtered.length && (
          <div className="grid place-items-center rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-12 text-center">
            <CheckSquare className="text-indigo-500" size={42} />
            <h2 className="mt-4 text-xl font-black">No tasks found</h2>
          </div>
        )}
      </section>
    </main>
  );
}
