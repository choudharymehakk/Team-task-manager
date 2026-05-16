import { assigneeIds, initialsForUser, memberLabel } from "../utils/tasks.js";

export default function AssigneeAvatars({ task, users = [], max = 4 }) {
  const ids = assigneeIds(task);
  if (!ids.length) {
    return <span className="text-xs font-semibold text-slate-400">Unassigned</span>;
  }

  const visible = ids.slice(0, max);
  const extra = ids.length - visible.length;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {visible.map((id) => (
          <span
            className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-slate-900 text-[10px] font-black text-white"
            key={id}
            title={memberLabel(id, users)}
          >
            {initialsForUser(users.find((item) => item.id === id))}
          </span>
        ))}
        {extra > 0 && (
          <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-black text-slate-700">
            +{extra}
          </span>
        )}
      </div>
      <span className="text-xs font-semibold text-slate-500">{ids.length} assigned</span>
    </div>
  );
}
