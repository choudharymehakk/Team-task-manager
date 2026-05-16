export function assigneeIds(task) {
  const value = task?.assigned_to;
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

export function isAssignedTo(task, userId) {
  return Boolean(userId) && assigneeIds(task).includes(userId);
}

export function memberLabel(userId, users = []) {
  const user = users.find((item) => item.id === userId);
  const label = displayUserName(user);
  if (label !== "Unknown User") return label;
  return userId ? "Unknown User" : "Unassigned";
}

export function memberEmail(userId, users = []) {
  return users.find((item) => item.id === userId)?.email || "";
}

export function displayUserName(user) {
  return user?.full_name || user?.username || user?.email || "Unknown User";
}

export function initialsForUser(user) {
  const source = displayUserName(user);
  return source
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}

export function isOverdue(task) {
  if (!task?.due_date || task.status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${task.due_date}T00:00:00`) < today;
}

export function isDueSoon(task, days = 3) {
  if (!task?.due_date || task.status === "done" || isOverdue(task)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${task.due_date}T00:00:00`);
  const diff = (due - today) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}
