import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProjectCard({ project, progress = 0, taskCount = 0 }) {
  const members = project.member_ids || [];
  return (
    <motion.article whileHover={{ y: -7 }} className="group premium-card overflow-hidden p-5">
      <Link to={`/projects/${project.id}`} className="block">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Project</span>
            <h2 className="mt-3 text-xl font-black text-slate-950">{project.name}</h2>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
            <ArrowRight size={18} />
          </span>
        </div>
        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">{project.description || "No description yet."}</p>
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-600">Progress</span>
            <span className="font-black text-slate-950">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((member) => (
              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-slate-900 text-xs font-black text-white" key={member}>
                {member.slice(-2).toUpperCase()}
              </span>
            ))}
            {!members.length && <span className="text-sm text-slate-400">No members</span>}
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1"><Users size={14} />{members.length}</span>
            <span className="flex items-center gap-1"><CalendarDays size={14} />{taskCount} tasks</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
