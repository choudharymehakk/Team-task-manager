import { AnimatePresence, motion } from "framer-motion";
import { FolderPlus, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "../api/hooks/useAuth.js";
import { useCreateProject, useProjects } from "../api/hooks/useProjects.js";
import { useAllProjectTasks } from "../api/hooks/useTasks.js";
import Modal from "../components/Modal.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import { projectProgress } from "../utils/analytics.js";

export default function Projects() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });
  const { user } = useAuth();
  const projects = useProjects();
  const { tasks } = useAllProjectTasks(projects.data || []);
  const createProject = useCreateProject();

  const filtered = useMemo(
    () => (projects.data || []).filter((project) => project.name.toLowerCase().includes(query.toLowerCase())),
    [projects.data, query]
  );

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

      <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-card backdrop-blur sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="input-premium pl-10" placeholder="Search projects..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">{filtered.length} projects</span>
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
