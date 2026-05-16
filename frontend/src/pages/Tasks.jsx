import { motion } from "framer-motion";
import { CheckSquare, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../api/hooks/useAuth.js";
import { useAllProjectMembers, useProjects } from "../api/hooks/useProjects.js";
import { useAllProjectTasks } from "../api/hooks/useTasks.js";
import { useUsers } from "../api/hooks/useUsers.js";
import AssigneeAvatars from "../components/AssigneeAvatars.jsx";
import { assigneeIds, displayUserName, isAssignedTo, isDueSoon, isOverdue } from "../utils/tasks.js";

const initialFilters = {
  query: "",
  status: "all",
  priority: "all",
  project: "all",
  assignee: "all",
  due: "all"
};

export default function Tasks() {
  const [filters, setFilters] = useState(initialFilters);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const projects = useProjects();
  const { tasks, isLoading } = useAllProjectTasks(projects.data || []);
  const users = useUsers(isAdmin);
  const projectMembers = useAllProjectMembers(projects.data || []);
  const userList = isAdmin ? (users.data || []) : projectMembers.members;

  const scopedTasks = useMemo(
    () => (isAdmin ? tasks : tasks.filter((task) => isAssignedTo(task, user?.id))),
    [isAdmin, tasks, user?.id]
  );

  const filtered = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return scopedTasks.filter((task) => {
      const matchesSearch = !query ||
        task.title.toLowerCase().includes(query) ||
        (task.description || "").toLowerCase().includes(query);
      const matchesStatus = filters.status === "all" || task.status === filters.status;
      const matchesPriority = filters.priority === "all" || task.priority === filters.priority;
      const matchesProject = filters.project === "all" || task.project_id === filters.project;
      const matchesAssignee = !isAdmin || filters.assignee === "all" || assigneeIds(task).includes(filters.assignee);
      const matchesDue =
        filters.due === "all" ||
        (filters.due === "overdue" && isOverdue(task)) ||
        (filters.due === "due_soon" && isDueSoon(task)) ||
        (filters.due === "no_due" && !task.due_date);
      return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesAssignee && matchesDue;
    });
  }, [filters, scopedTasks, isAdmin]);

  function setFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="app-page">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-bold text-indigo-600">Execution queue</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Tasks</h1>
          <p className="mt-2 text-slate-500">{isAdmin ? "Search and filter all tasks across projects." : "Search and filter tasks assigned to you."}</p>
        </div>
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-card backdrop-blur">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_repeat(5,minmax(0,0.8fr))_auto]">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="input-premium pl-10"
              placeholder="Search by title or description..."
              value={filters.query}
              onChange={(event) => setFilter("query", event.target.value)}
            />
          </div>
          <select className="input-premium" value={filters.status} onChange={(event) => setFilter("status", event.target.value)}>
            <option value="all">All status</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select className="input-premium" value={filters.priority} onChange={(event) => setFilter("priority", event.target.value)}>
            <option value="all">All priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select className="input-premium" value={filters.project} onChange={(event) => setFilter("project", event.target.value)}>
            <option value="all">All projects</option>
            {(projects.data || []).map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}
          </select>
          {isAdmin && (
            <select className="input-premium" value={filters.assignee} onChange={(event) => setFilter("assignee", event.target.value)}>
              <option value="all">All assignees</option>
              {userList.map((item) => <option value={item.id} key={item.id}>{displayUserName(item)}</option>)}
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
      </section>

      <section className="mt-6 grid gap-3">
        {isLoading && Array.from({ length: 5 }).map((_, index) => <div className="skeleton h-24" key={index} />)}
        {filtered.map((task) => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={task.id}>
            <Link className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-card xl:grid-cols-[1fr_auto_auto_auto_220px]" to={`/tasks/${task.id}`}>
              <div>
                <h2 className="font-black text-slate-950">{task.title}</h2>
                <p className="mt-1 line-clamp-1 text-sm text-slate-500">{task.description || task.project_name}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">{task.project_name}</p>
              </div>
              <span className="self-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">{task.status.replace("_", " ")}</span>
              <span className="self-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold capitalize text-indigo-700">{task.priority}</span>
              <span className={`self-center rounded-full px-3 py-1 text-xs font-bold ${
                isOverdue(task) ? "bg-rose-50 text-rose-700" : isDueSoon(task) ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"
              }`}>
                {task.due_date ? (isOverdue(task) ? `Overdue ${task.due_date}` : isDueSoon(task) ? `Due soon ${task.due_date}` : task.due_date) : "No due date"}
              </span>
              <div className="self-center">
                <AssigneeAvatars task={task} users={userList} />
              </div>
            </Link>
          </motion.div>
        ))}
        {!isLoading && !filtered.length && (
          <div className="grid place-items-center rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-12 text-center">
            <CheckSquare className="text-indigo-500" size={42} />
            <h2 className="mt-4 text-xl font-black">No matching tasks found</h2>
            <p className="mt-2 max-w-md text-slate-500">Try adjusting the search text or clearing filters.</p>
          </div>
        )}
      </section>
    </main>
  );
}
