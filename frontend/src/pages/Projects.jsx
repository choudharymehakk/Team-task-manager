import { AnimatePresence, motion } from "framer-motion";
import { FolderPlus, Plus, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "../api/hooks/useAuth.js";
import { useCreateProject, useProjects } from "../api/hooks/useProjects.js";
import { useAllProjectTasks } from "../api/hooks/useTasks.js";
import { useUsers } from "../api/hooks/useUsers.js";
import Modal from "../components/Modal.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import { projectProgress } from "../utils/analytics.js";
import { assigneeIds, displayUserName, isDueSoon, isOverdue } from "../utils/tasks.js";

const initialFilters = {
  query: "",
  status: "all",
  priority: "all",
  assignee: "all",
  due: "all"
};

export default function Projects() {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [form, setForm] = useState({ name: "", description: "" });
  const { user } = useAuth();
  const projects = useProjects();
  const { tasks } = useAllProjectTasks(projects.data || []);
  const users = useUsers(user?.role === "admin");
  const createProject = useCreateProject();

  const filtered = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return (projects.data || []).filter((project) => {
      const projectTasks = tasks.filter((task) => task.project_id === project.id);
      const matchesSearch = !query ||
        project.name.toLowerCase().includes(query) ||
        (project.description || "").toLowerCase().includes(query);
      const matchesStatus = filters.status === "all" || projectTasks.some((task) => task.status === filters.status);
      const matchesPriority = filters.priority === "all" || projectTasks.some((task) => task.priority === filters.priority);
      const matchesAssignee = filters.assignee === "all" || projectTasks.some((task) => assigneeIds(task).includes(filters.assignee));
      const matchesDue =
        filters.due === "all" ||
        projectTasks.some((task) =>
          (filters.due === "overdue" && isOverdue(task)) ||
          (filters.due === "due_soon" && isDueSoon(task)) ||
          (filters.due === "no_due" && !task.due_date)
        );
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesDue;
    });
  }, [projects.data, tasks, filters]);

  function setFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    await createProject.mutateAsync(form);
    toast.success("Project created successfully");
    setForm({ name: "", description: "" });
    setOpen(false);
  }

  return (
    <main className="app-page">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-bold text-indigo-600">Project portfolio</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Projects</h1>
          <p className="mt-2 text-slate-500">A polished view of every workspace you own or belong to.</p>
        </div>
        {user?.role === "admin" && (
          <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={18} />New Project</button>
        )}
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-card backdrop-blur">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(4,minmax(0,0.8fr))_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="input-premium pl-10" placeholder="Search projects..." value={filters.query} onChange={(event) => setFilter("query", event.target.value)} />
        </div>
        <select className="input-premium" value={filters.status} onChange={(event) => setFilter("status", event.target.value)}>
          <option value="all">Any status</option>
          <option value="todo">Todo tasks</option>
          <option value="in_progress">In progress tasks</option>
          <option value="done">Done tasks</option>
        </select>
        <select className="input-premium" value={filters.priority} onChange={(event) => setFilter("priority", event.target.value)}>
          <option value="all">Any priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        {user?.role === "admin" && (
          <select className="input-premium" value={filters.assignee} onChange={(event) => setFilter("assignee", event.target.value)}>
            <option value="all">Any assignee</option>
            {(users.data || []).map((item) => <option value={item.id} key={item.id}>{displayUserName(item)}</option>)}
          </select>
        )}
        <select className="input-premium" value={filters.due} onChange={(event) => setFilter("due", event.target.value)}>
          <option value="all">Any due date</option>
          <option value="overdue">Overdue</option>
          <option value="due_soon">Due soon</option>
          <option value="no_due">No due date</option>
        </select>
        <button className="btn-secondary" type="button" onClick={() => setFilters(initialFilters)}>
          <RotateCcw size={17} />Reset
        </button>
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-500">{filtered.length} project{filtered.length === 1 ? "" : "s"} shown</p>
      </div>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {filtered.map((project) => (
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key={project.id}>
              <ProjectCard
                project={project}
                progress={projectProgress(project, tasks)}
                taskCount={tasks.filter((task) => task.project_id === project.id).length}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </section>

      {!projects.isLoading && !filtered.length && (
        <div className="mt-8 grid place-items-center rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-12 text-center">
          <FolderPlus className="text-indigo-500" size={42} />
          <h2 className="mt-4 text-xl font-black">No projects found</h2>
          <p className="mt-2 max-w-md text-slate-500">Create a project or adjust your search to bring the right workspace into view.</p>
        </div>
      )}

      {open && (
        <Modal title="New project" onClose={() => setOpen(false)}>
          <form className="grid gap-4" onSubmit={submit}>
            <label className="grid gap-2">
              <span className="label-premium">Name</span>
              <input className="input-premium" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="label-premium">Description</span>
              <textarea className="textarea-premium" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </label>
            <button className="btn-primary" disabled={createProject.isPending}>{createProject.isPending ? "Creating..." : "Create project"}</button>
          </form>
        </Modal>
      )}
    </main>
  );
}
