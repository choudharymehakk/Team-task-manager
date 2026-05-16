import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";

import TaskCard from "./TaskCard.jsx";

const columns = [
  ["todo", "To do", "bg-indigo-500"],
  ["in_progress", "In progress", "bg-amber-500"],
  ["done", "Done", "bg-emerald-500"]
];

function DraggableTask({ task, users }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, data: { task } });
  const style = { transform: CSS.Translate.toString(transform), zIndex: isDragging ? 20 : undefined, opacity: isDragging ? 0.75 : 1 };
  return <TaskCard task={task} users={users} setNodeRef={setNodeRef} style={style} listeners={listeners} attributes={attributes} />;
}

function Column({ id, title, tone, tasks, users }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <motion.section layout className={`min-h-[520px] rounded-[1.5rem] border p-3 transition ${isOver ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-slate-100/70"}`} ref={setNodeRef}>
      <header className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${tone}`} />
          <h2 className="text-sm font-black uppercase tracking-normal text-slate-700">{title}</h2>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-500 shadow-sm">{tasks.length}</span>
      </header>
      <div className="grid gap-3">
        {tasks.map((task) => <DraggableTask task={task} users={users} key={task.id} />)}
        {!tasks.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-center text-sm text-slate-400">Drop tasks here</div>}
      </div>
    </motion.section>
  );
}

export default function KanbanBoard({ tasks = [], users = [], onStatusChange }) {
  function handleDragEnd(event) {
    const task = event.active.data.current?.task;
    const status = event.over?.id;
    if (task && status && task.status !== status) {
      onStatusChange(task, status);
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid gap-4 xl:grid-cols-3">
        {columns.map(([id, title, tone]) => (
          <Column key={id} id={id} title={title} tone={tone} users={users} tasks={tasks.filter((task) => task.status === id)} />
        ))}
      </div>
    </DndContext>
  );
}
