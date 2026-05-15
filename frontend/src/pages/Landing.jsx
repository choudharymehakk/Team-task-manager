import { motion } from "framer-motion";
import { ArrowRight, BarChart3, CheckCircle2, Github, KanbanSquare, LockKeyhole, Users } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  ["Task Management", CheckCircle2, "Create, prioritize, update, and complete tasks with clear status tracking."],
  ["Team Collaboration", Users, "Add project members and keep discussions attached to each task."],
  ["Kanban Workflow", KanbanSquare, "Move work across todo, in-progress, and done columns with drag and drop."],
  ["Analytics Dashboard", BarChart3, "View real project and task metrics from the database."],
  ["Role-based Access", LockKeyhole, "Admin and member permissions are enforced by the backend."]
];

const workflow = ["Create Project", "Add Members", "Assign Tasks", "Track Progress"];

export default function Landing() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white/80 px-5 py-4 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 font-black text-white">T</span>
            <span className="text-lg font-black">Team Task Manager</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link className="text-sm font-semibold text-slate-600 hover:text-slate-950" to="/login">Login</Link>
            <Link className="btn-primary" to="/signup">Get Started</Link>
          </div>
        </nav>
      </header>

      <section className="px-5 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-bold text-indigo-600">Full-stack project management app</p>
            <h1 className="mt-4 text-5xl font-black leading-tight tracking-tight sm:text-6xl">
              Manage projects, tasks, teams, and progress in one clean workspace.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              A professional React and FastAPI application with JWT authentication, MongoDB persistence, role-based access, kanban task tracking, comments, and real dashboard insights.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary" to="/signup">Get Started <ArrowRight size={18} /></Link>
              <Link className="btn-secondary" to="/login">Login</Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="premium-card p-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Dashboard Preview</p>
                  <h2 className="text-xl font-black">Project overview</h2>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">Live data UI</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["Projects", "Tasks", "Members"].map((label) => (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4" key={label}>
                    <div className="h-3 w-20 rounded-full bg-slate-200" />
                    <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {["Todo", "In Progress", "Done"].map((label) => (
                  <div className="min-h-44 rounded-2xl border border-slate-200 bg-white p-3" key={label}>
                    <p className="text-sm font-black text-slate-700">{label}</p>
                    <div className="mt-3 grid gap-2">
                      <div className="h-16 rounded-xl bg-slate-100" />
                      <div className="h-12 rounded-xl bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black">Features</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {features.map(([title, Icon, body]) => (
              <motion.article whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={title}>
                <Icon className="text-indigo-600" size={24} />
                <h3 className="mt-4 font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black">Workflow</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {workflow.map((step, index) => (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={step}>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-sm font-black text-white">{index + 1}</span>
                <h3 className="mt-4 font-black">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-slate-600 md:flex-row">
          <p><strong className="text-slate-950">Team Task Manager</strong> portfolio project</p>
          <p>React, Vite, Tailwind, FastAPI, MongoDB, JWT</p>
          <a className="inline-flex items-center gap-2 font-semibold text-slate-950" href="https://github.com/" target="_blank" rel="noreferrer">
            <Github size={16} /> GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
