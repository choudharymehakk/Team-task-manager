import { motion } from "framer-motion";
import { Plus, Search, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "../api/hooks/useAuth.js";
import { useProjects } from "../api/hooks/useProjects.js";
import { useAllProjectTasks } from "../api/hooks/useTasks.js";
import { useCreateUser, useDeleteUser, useUsers } from "../api/hooks/useUsers.js";
import Modal from "../components/Modal.jsx";
import { getMembersFromProjects, shortMemberLabel } from "../utils/analytics.js";
import { assigneeIds } from "../utils/tasks.js";

function userStats(userId, projects, tasks) {
  const assigned = tasks.filter((task) => assigneeIds(task).includes(userId));
  const completed = assigned.filter((task) => task.status === "done").length;
  return {
    projectCount: projects.filter((project) => project.owner_id === userId || (project.member_ids || []).includes(userId)).length,
    assignedTasks: assigned.length,
    completedTasks: completed,
    pendingTasks: assigned.length - completed,
    completionPct: assigned.length ? Math.round((completed / assigned.length) * 100) : 0
  };
}

export default function Team() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: "", username: "", password: "", role: "member" });
  const projects = useProjects();
  const { tasks, isLoading } = useAllProjectTasks(projects.data || []);
  const users = useUsers(isAdmin);
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const rows = useMemo(() => {
    if (isAdmin) {
      return (users.data || []).map((item) => ({
        ...item,
        displayName: item.username,
        ...userStats(item.id, projects.data || [], tasks)
      }));
    }
    return getMembersFromProjects(projects.data || [], tasks).map((item) => ({
      id: item.id,
      username: item.displayName,
      email: item.id,
      role: item.role.toLowerCase(),
      displayName: item.displayName,
      projectCount: item.projectCount,
      assignedTasks: item.assignedTasks,
      completedTasks: item.completedTasks,
      pendingTasks: item.pendingTasks,
      completionPct: item.completionPct
    }));
  }, [isAdmin, users.data, projects.data, tasks]);

  const filtered = rows.filter((item) =>
    `${item.username} ${item.email} ${item.id}`.toLowerCase().includes(query.toLowerCase())
  );

  async function submit(event) {
    event.preventDefault();
    await createUser.mutateAsync(form);
    toast.success("User added successfully");
    setForm({ email: "", username: "", password: "", role: "member" });
    setModalOpen(false);
  }

  async function removeUser(id) {
    await deleteUser.mutateAsync(id);
    toast.success("User deleted");
  }

  return (
    <main className="app-page">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-bold text-indigo-600">{isAdmin ? "User Management" : "Team"}</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">{isAdmin ? "Users" : "Collaborators"}</h1>
          <p className="mt-2 text-slate-500">
            {isAdmin
              ? "Manage application users and review their project/task assignments."
              : "View collaborators from projects you belong to."}
          </p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus size={18} />Add user</button>}
      </div>

      <div className="mt-6 relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input className="input-premium pl-10" placeholder="Search users..." value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(users.isLoading || projects.isLoading || isLoading) && Array.from({ length: 6 }).map((_, index) => <div className="skeleton h-48" key={index} />)}
        {!users.isLoading && !isLoading && filtered.map((item) => (
          <motion.article whileHover={{ y: -4 }} className="premium-card p-5" key={item.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                  {(item.username || shortMemberLabel(item.id)).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-black text-slate-950">{item.username || shortMemberLabel(item.id)}</h2>
                  <p className="truncate text-xs text-slate-500">{item.email}</p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${item.role === "admin" || item.role === "owner" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                {item.role}
              </span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Projects</p>
                <p className="text-2xl font-black">{item.projectCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Assigned</p>
                <p className="text-2xl font-black">{item.assignedTasks}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Done</p>
                <p className="text-2xl font-black">{item.completedTasks}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold text-slate-600">{item.pendingTasks} pending</span>
                <strong>{item.completionPct}%</strong>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-indigo-600" style={{ width: `${item.completionPct}%` }} />
              </div>
            </div>
            {isAdmin && item.id !== user?.id && (
              <button className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-rose-700" onClick={() => removeUser(item.id)}>
                <Trash2 size={16} />Delete user
              </button>
            )}
          </motion.article>
        ))}
      </section>

      {!users.isLoading && !projects.isLoading && !isLoading && !filtered.length && (
        <div className="mt-8 grid place-items-center rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-12 text-center">
          <Users className="text-indigo-500" size={42} />
          <h2 className="mt-4 text-xl font-black">{isAdmin ? "No users found" : "No collaborators yet"}</h2>
          <p className="mt-2 max-w-md text-slate-500">{isAdmin ? "Add users to begin assigning team work." : "Collaborators appear when users are added to your projects."}</p>
        </div>
      )}

      {modalOpen && (
        <Modal title="Add user" onClose={() => setModalOpen(false)}>
          <form className="grid gap-4" onSubmit={submit}>
            <label className="grid gap-2"><span className="label-premium">Email</span><input className="input-premium" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label className="grid gap-2"><span className="label-premium">Username</span><input className="input-premium" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></label>
            <label className="grid gap-2"><span className="label-premium">Temporary password</span><input className="input-premium" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
            <label className="grid gap-2">
              <span className="label-premium">Role</span>
              <select className="input-premium" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button className="btn-primary" disabled={createUser.isPending}>{createUser.isPending ? "Adding..." : "Add user"}</button>
          </form>
        </Modal>
      )}
    </main>
  );
}
