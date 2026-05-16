import { motion } from "framer-motion";
import { CalendarDays, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "../api/hooks/useAuth.js";
import { useAddMember, useProject, useProjectMembers, useRemoveMember } from "../api/hooks/useProjects.js";
import { useCreateTask, useProjectTasks, useUpdateTask } from "../api/hooks/useTasks.js";
import KanbanBoard from "../components/KanbanBoard.jsx";
import Modal from "../components/Modal.jsx";
import { projectProgress } from "../utils/analytics.js";
import { assigneeIds, displayUserName } from "../utils/tasks.js";

export default function ProjectDetail() {
  const { id } = useParams();
  const [taskOpen, setTaskOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium", due_date: "", assigned_to: [] });
  const { user } = useAuth();
  const project = useProject(id);
  const tasks = useProjectTasks(id);
  const createTask = useCreateTask(id);
  const updateTask = useUpdateTask(id);
  const addMember = useAddMember(id);
  const removeMember = useRemoveMember(id);
  const members = useProjectMembers(id);
  const progress = project.data ? projectProgress(project.data, tasks.data || []) : 0;

  async function submitTask(event) {
    event.preventDefault();
    const payload = { ...taskForm, due_date: taskForm.due_date || null };
    await createTask.mutateAsync(payload);
    toast.success("Task created successfully");
    setTaskForm({ title: "", description: "", priority: "medium", due_date: "", assigned_to: [] });
    setTaskOpen(false);
  }

  async function submitMember(event) {
    event.preventDefault();
    await addMember.mutateAsync(memberEmail);
    toast.success("Member added to project");
    setMemberEmail("");
  }

  async function moveTask(task, status) {
    await updateTask.mutateAsync({ id: task.id, payload: { status } });
    toast.success("Task updated successfully");
  }

  async function handleRemoveMember(userId) {
    await removeMember.mutateAsync(userId);
    toast.success("Member removed from project");
  }

  function assignedCount(userId) {
    return (tasks.data || []).filter((task) => assigneeIds(task).includes(userId)).length;
  }

  return (
    <main className="app-page">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-soft">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="font-bold text-indigo-200">Project workspace</p>
            <h1 className="mt-2 text-4xl font-black">{project.data?.name || "Project"}</h1>
            <p className="mt-3 max-w-2xl text-slate-300">{project.data?.description || "Manage tasks, members, and delivery flow."}</p>
          </div>
          {user?.role === "admin" && (
            <button className="btn-primary bg-white text-slate-950 hover:bg-slate-100" onClick={() => setTaskOpen(true)}><Plus size={18} />Add Task</button>
          )}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-sm text-slate-300">Progress</p>
            <p className="mt-1 text-3xl font-black">{progress}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-300" style={{ width: `${progress}%` }} /></div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-sm text-slate-300">Tasks</p>
            <p className="mt-1 text-3xl font-black">{tasks.data?.length || 0}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-sm text-slate-300">Members</p>
            <p className="mt-1 text-3xl font-black">{members.data?.length || 0}</p>
          </div>
        </div>
      </section>

      {user?.role === "admin" && (
        <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-card backdrop-blur md:grid-cols-[auto_1fr_auto]" onSubmit={submitMember}>
          <div className="flex items-center gap-3 font-bold text-slate-700"><UserPlus size={20} />Manage members</div>
          <input className="input-premium" type="email" placeholder="Add member by email" value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} />
          <button className="btn-secondary" disabled={addMember.isPending}>Add member</button>
        </motion.form>
      )}

      <section className="premium-card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950">Collaborators</h2>
            <p className="text-sm text-slate-500">Project members and their assigned task counts.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{members.data?.length || 0} members</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {members.isLoading && Array.from({ length: 3 }).map((_, index) => <div className="skeleton h-24" key={index} />)}
          {members.data?.map((member) => (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4" key={member.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-black text-slate-950">{displayUserName(member)}</p>
                  <p className="truncate text-xs text-slate-500">{member.email}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${member.role === "admin" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                  {member.role}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-slate-500">{assignedCount(member.id)} assigned task{assignedCount(member.id) === 1 ? "" : "s"}</p>
                {user?.role === "admin" && project.data?.owner_id !== member.id && (
                  <button className="inline-flex items-center gap-1 text-xs font-bold text-rose-600" onClick={() => handleRemoveMember(member.id)}>
                    <Trash2 size={14} />Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          {!members.isLoading && !members.data?.length && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">No collaborators yet.</div>
          )}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Kanban board</h2>
            <p className="text-slate-500">{user?.role === "admin" ? "Drag cards between stages to update status." : "Only tasks assigned to you are shown."}</p>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-500 shadow-sm sm:flex">
            <Users size={16} /> {members.data?.length || 0} collaborators
          </div>
        </div>
        <KanbanBoard tasks={tasks.data || []} users={members.data || []} onStatusChange={moveTask} />
      </section>

      {taskOpen && (
        <Modal title="Add task" onClose={() => setTaskOpen(false)}>
          <form className="grid gap-4" onSubmit={submitTask}>
            <label className="grid gap-2">
              <span className="label-premium">Title</span>
              <input className="input-premium" value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="label-premium">Description</span>
              <textarea className="textarea-premium" value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 sm:col-span-2">
                <span className="label-premium">Assign members</span>
                <select
                  className="min-h-28 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-indigo-100"
                  multiple
                  value={taskForm.assigned_to}
                  onChange={(event) => setTaskForm({
                    ...taskForm,
                    assigned_to: Array.from(event.target.selectedOptions).map((option) => option.value)
                  })}
                >
                  {members.data?.map((member) => (
                    <option value={member.id} key={member.id}>{displayUserName(member)} ({member.email})</option>
                  ))}
                </select>
                <span className="text-xs text-slate-500">Hold Ctrl or Cmd to select multiple members.</span>
              </label>
              <label className="grid gap-2">
                <span className="label-premium">Priority</span>
                <select className="input-premium" value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="label-premium">Due date</span>
                <span className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input className="input-premium pl-10" type="date" value={taskForm.due_date} onChange={(event) => setTaskForm({ ...taskForm, due_date: event.target.value })} />
                </span>
              </label>
            </div>
            <button className="btn-primary" disabled={createTask.isPending}>{createTask.isPending ? "Creating..." : "Create task"}</button>
          </form>
        </Modal>
      )}
    </main>
  );
}
