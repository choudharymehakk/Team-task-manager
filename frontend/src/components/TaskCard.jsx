import { motion } from "framer-motion";
import { CalendarDays, GripVertical } from "lucide-react";
import { Link } from "react-router-dom";

import AssigneeAvatars from "./AssigneeAvatars.jsx";
import { isDueSoon, isOverdue } from "../utils/tasks.js";

const priorityStyles = {
  high: "bg-rose-50 text-rose-700 ring-rose-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200"
};

export default function TaskCard({ task, users = [], listeners, attributes, setNodeRef, style }) {
  const overdue = isOverdue(task);
  const dueSoon = isDueSoon(task);
  return (
    <motion.article
      whileHover={{ y: -3 }}
      className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-card"
      ref={setNodeRef}
      style={style}
    >
      <button
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-xl text-slate-300 transition hover:bg-slate-100 hover:text-slate-700"
        {...listeners}
        {...attributes}
        aria-label={`Drag ${task.title}`}
        title="Drag task"
      >
        <GripVertical size={16} />
      </button>
      <Link to={`/tasks/${task.id}`}>
        <div className="pr-8">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${priorityStyles[task.priority] || priorityStyles.medium}`}>
            {task.priority}
          </span>
          <h3 className="mt-3 text-base font-black text-slate-950">{task.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{task.description || "No description."}</p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-600">{task.status.replace("_", " ")}</span>
          {task.due_date && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
              overdue ? "bg-rose-50 text-rose-700" : dueSoon ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"
            }`}>
              <CalendarDays size={13} /> {overdue ? "Overdue" : dueSoon ? "Due soon" : task.due_date}
            </span>
          )}
        </div>
        <div className="mt-4">
          <AssigneeAvatars task={task} users={users} />
        </div>
      </Link>
    </motion.article>
  );
}
