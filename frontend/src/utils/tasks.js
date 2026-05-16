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
  if (user?.username) return user.username;
  if (user?.email) return user.email;
  return userId ? `User ${userId.slice(-6)}` : "Unassigned";
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
