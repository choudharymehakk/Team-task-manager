import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "../api/hooks/useAuth.js";
import { useProjectMembers } from "../api/hooks/useProjects.js";
import { useDeleteTask, useTask, useUpdateTask } from "../api/hooks/useTasks.js";
import CommentSection from "../components/CommentSection.jsx";
import AssigneeAvatars from "../components/AssigneeAvatars.jsx";
import { assigneeIds } from "../utils/tasks.js";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const task = useTask(id);
  const members = useProjectMembers(task.data?.project_id);
  const updateTask = useUpdateTask(task.data?.project_id);
  const deleteTask = useDeleteTask(task.data?.project_id);
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (task.data) {
      setForm({
        title: task.data.title,
        description: task.data.description,
        status: task.data.status,
        priority: task.data.priority,
        assigned_to: assigneeIds(task.data),
        due_date: task.data.due_date || ""
      });
    }
  }, [task.data]);

  if (!form) {
    return (
      <main className="app-page">
        <div className="skeleton h-80" />
      </main>
    );
  }

  async function submit(event) {
    event.preventDefault();
    const payload = user?.role === "admin" ? { ...form, due_date: form.due_date || null } : { status: form.status };
    await updateTask.mutateAsync({ id, payload });
    toast.success("Task updated successfully");
  }

  async function remove() {
    await deleteTask.mutateAsync(id);
    toast.success("Task deleted");
    navigate(`/projects/${task.data.project_id}`);
  }

  return (
    <main className="app-page">
      <Link className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-950" to={`/projects/${task.data.project_id}`}>
        <ArrowLeft size={16} /> Back to project
      </Link>
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold capitalize text-indigo-100">{task.data.status.replace("_", " ")}</span>
            <h1 className="mt-4 text-4xl font-black">{task.data.title}</h1>
            <p className="mt-2 text-slate-300">Edit task details, update progress, and keep discussion close to the work.</p>
            <div className="mt-4 inline-flex rounded-2xl bg-white/10 p-3">
              <AssigneeAvatars task={task.data} users={members.data || []} />
            </div>
          </div>
          {user?.role === "admin" && (
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600" onClick={remove}>
              <Trash2 size={18} />Delete
            </button>
          )}
        </div>
      </motion.section>

      <form className="premium-card mt-6 grid gap-5 p-5" onSubmit={submit}>
        {user?.role === "admin" && (
          <>
            <label className="grid gap-2">
              <span className="label-premium">Title</span>
              <input className="input-premium" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="label-premium">Description</span>
              <textarea className="textarea-premium" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </label>
          </>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2">
            <span className="label-premium">Status</span>
            <select className="input-premium" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="todo">Todo</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>
          {user?.role === "admin" && (
            <>
              <label className="grid gap-2">
                <span className="label-premium">Assigned members</span>
                <select
                  className="min-h-28 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-indigo-100"
                  multiple
                  value={form.assigned_to}
                  onChange={(event) => setForm({
                    ...form,
                    assigned_to: Array.from(event.target.selectedOptions).map((option) => option.value)
                  })}
                >
                  {members.data?.map((member) => (
                    <option value={member.id} key={member.id}>{member.username}</option>
                  ))}
                </select>
                <span className="text-xs text-slate-500">Hold Ctrl or Cmd to select multiple members.</span>
              </label>
              <label className="grid gap-2">
                <span className="label-premium">Priority</span>
                <select className="input-premium" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="label-premium">Due date</span>
                <span className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input className="input-premium pl-10" type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} />
                </span>
              </label>
            </>
          )}
        </div>
        <button className="btn-primary justify-self-start" disabled={updateTask.isPending}><Save size={18} />Save changes</button>
      </form>
      <CommentSection taskId={id} />
    </main>
  );
}
