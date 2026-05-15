import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, FolderKanban, ListTodo, Plus, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Link } from "react-router-dom";

import { useAuth } from "../api/hooks/useAuth.js";
import { useProjects } from "../api/hooks/useProjects.js";
import { useAllProjectTasks } from "../api/hooks/useTasks.js";
import {
  deriveTaskStats,
  getMembersFromProjects,
  projectChartData,
  recentActivity,
  upcomingDeadlines
} from "../utils/analytics.js";
import { relativeTime } from "../utils/relativeTime.js";

function EmptyState({ icon: Icon, title, body }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <Icon className="text-slate-400" size={34} />
      <h3 className="mt-3 font-black text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{body}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone = "indigo" }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    slate: "bg-slate-100 text-slate-700"
  };
  return (
    <motion.article whileHover={{ y: -3 }} className="premium-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${tones[tone]}`}>
          <Icon size={21} />
        </div>
      </div>
    </motion.article>
  );
}

function SkeletonDashboard() {
  return (
    <main className="app-page">
      <div className="skeleton h-28" />
      <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => <div className="skeleton h-28" key={index} />)}
      </div>
    </main>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const projectsQuery = useProjects();
  const projects = projectsQuery.data || [];
  const { tasks, isLoading } = useAllProjectTasks(projects);
  const stats = deriveTaskStats(tasks, projects);
  const projectBars = projectChartData(projects, tasks);
  const members = getMembersFromProjects(projects, tasks);
  const deadlines = upcomingDeadlines(tasks);
  const activity = user?.role === "admin" ? recentActivity(projects, tasks) : recentActivity([], tasks);
  const isAdmin = user?.role === "admin";

  if (projectsQuery.isLoading || isLoading) return <SkeletonDashboard />;

  return (
    <main className="app-page">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-bold text-indigo-600">Overview</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-slate-500">
              {isAdmin
                ? "Real-time summary from all projects, tasks, members, and deadlines."
                : "Your assigned tasks, status summary, upcoming deadlines, and recent task activity."}
            </p>
          </div>
          {isAdmin && <Link className="btn-primary" to="/projects"><Plus size={18} />New project</Link>}
        </div>
      </motion.section>

      <section className={`mt-6 grid gap-4 md:grid-cols-2 ${isAdmin ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
        {isAdmin && <StatCard icon={FolderKanban} label="Projects" value={stats.totalProjects} />}
        <StatCard icon={ListTodo} label="Tasks" value={stats.totalTasks} tone="slate" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completedTasks} tone="emerald" />
        <StatCard icon={Clock} label="Pending" value={stats.pendingTasks} tone="amber" />
        {isAdmin && <StatCard icon={Users} label="Members" value={stats.totalMembers} tone="indigo" />}
      </section>

      {stats.overdueTasks > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <AlertTriangle size={20} />
          <p className="font-semibold">{stats.overdueTasks} overdue task{stats.overdueTasks === 1 ? "" : "s"} need attention.</p>
        </div>
      )}

      <section className={`mt-6 grid gap-6 ${isAdmin ? "xl:grid-cols-[1.2fr_0.8fr]" : ""}`}>
        {isAdmin && (
          <article className="premium-card p-5">
            <h2 className="text-xl font-black">Project overview</h2>
            <p className="mt-1 text-sm text-slate-500">Completed tasks by project.</p>
            {projectBars.length ? (
              <div className="mt-5 h-80">
                <ResponsiveContainer minWidth={1} minHeight={1}>
                  <BarChart data={projectBars}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#CBD5E1" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="completed" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState icon={FolderKanban} title="No task data yet" body="Create tasks inside projects to see progress charts." />
              </div>
            )}
          </article>
        )}

        <article className="premium-card p-5">
          <h2 className="text-xl font-black">Task status</h2>
          <p className="mt-1 text-sm text-slate-500">Distribution by current workflow state.</p>
          {stats.byStatus.length ? (
            <>
              <div className="mt-5 h-64">
                <ResponsiveContainer minWidth={1} minHeight={1}>
                  <PieChart>
                    <Pie data={stats.byStatus} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={4}>
                      {stats.byStatus.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-2">
                {stats.byStatus.map((item) => (
                  <div className="flex items-center justify-between text-sm" key={item.name}>
                    <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: item.fill }} />{item.name}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-5">
              <EmptyState icon={ListTodo} title="No tasks available" body="Task status charts appear once tasks are created." />
            </div>
          )}
        </article>
      </section>

      <section className={`mt-6 grid gap-6 ${isAdmin ? "xl:grid-cols-3" : "xl:grid-cols-2"}`}>
        <article className="premium-card p-5">
          <h2 className="text-xl font-black">Upcoming deadlines</h2>
          <div className="mt-5 grid gap-3">
            {deadlines.length ? deadlines.map((task) => (
              <Link className="rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-indigo-200 hover:bg-indigo-50" to={`/tasks/${task.id}`} key={task.id}>
                <p className="font-bold text-slate-950">{task.title}</p>
                <p className="mt-1 text-sm text-slate-500">{task.project_name}</p>
                <p className="mt-3 text-xs font-bold text-amber-700">Due {task.due_date}</p>
              </Link>
            )) : <EmptyState icon={Clock} title="No deadlines available" body="Tasks with future due dates will show here." />}
          </div>
        </article>

        <article className="premium-card p-5">
          <h2 className="text-xl font-black">Recent activity</h2>
          <div className="mt-5 grid gap-3">
            {activity.length ? activity.map((item) => (
              <div className="rounded-2xl bg-slate-50 p-4" key={item.id}>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.label}</p>
                <p className="mt-1 font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{relativeTime(item.date)}</p>
              </div>
            )) : <EmptyState icon={ListTodo} title="No activity found" body="Project and task updates will appear here." />}
          </div>
        </article>

        {isAdmin && (
          <article className="premium-card p-5">
            <h2 className="text-xl font-black">Team overview</h2>
            <div className="mt-5 grid gap-3">
              {members.length ? members.slice(0, 5).map((member) => (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3" key={member.id}>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-xs font-black text-white">{member.displayName.slice(-2)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-900">{member.displayName}</p>
                    <p className="text-xs text-slate-500">{member.assignedTasks} assigned, {member.completedTasks} completed</p>
                  </div>
                </div>
              )) : <EmptyState icon={Users} title="No team members yet" body="Members appear after they are added to projects." />}
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
