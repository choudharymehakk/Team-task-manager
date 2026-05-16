import { assigneeIds } from "./tasks.js";

export function deriveTaskStats(tasks = [], projects = []) {
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const pendingTasks = tasks.filter((task) => task.status !== "done").length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date || task.status === "done") return false;
    return new Date(`${task.due_date}T00:00:00`) < today;
  }).length;
  const memberIds = getMembersFromProjects(projects).map((member) => member.id);

  return {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    completedTasks,
    pendingTasks,
    overdueTasks,
    dueSoonTasks: tasks.filter((task) => {
      if (!task.due_date || task.status === "done") return false;
      const due = new Date(`${task.due_date}T00:00:00`);
      const diff = (due - today) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 3;
    }).length,
    totalMembers: memberIds.length,
    byStatus: [
      { name: "Todo", value: tasks.filter((task) => task.status === "todo").length, fill: "#6366F1" },
      { name: "In Progress", value: tasks.filter((task) => task.status === "in_progress").length, fill: "#F59E0B" },
      { name: "Done", value: completedTasks, fill: "#10B981" }
    ].filter((item) => item.value > 0),
    completionPct: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0
  };
}

export function projectProgress(project, tasks = []) {
  const scoped = tasks.filter((task) => task.project_id === project.id);
  const done = scoped.filter((task) => task.status === "done").length;
  return scoped.length ? Math.round((done / scoped.length) * 100) : 0;
}

export function upcomingDeadlines(tasks = []) {
  return tasks
    .filter((task) => task.due_date && task.status !== "done")
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 6);
}

export function projectChartData(projects = [], tasks = []) {
  return projects
    .map((project) => {
      const scoped = tasks.filter((task) => task.project_id === project.id);
      return {
        name: project.name,
        total: scoped.length,
        completed: scoped.filter((task) => task.status === "done").length
      };
    })
    .filter((item) => item.total > 0);
}

export function recentActivity(projects = [], tasks = []) {
  const projectActivity = projects.map((project) => ({
    id: `project-${project.id}`,
    label: "Project created",
    title: project.name,
    date: project.created_at
  }));
  const taskActivity = tasks.map((task) => ({
    id: `task-${task.id}`,
    label: task.status === "done" ? "Task completed" : "Task updated",
    title: task.title,
    date: task.updated_at || task.created_at
  }));

  return [...projectActivity, ...taskActivity]
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);
}

export function getMembersFromProjects(projects = [], tasks = []) {
  const map = new Map();
  projects.forEach((project) => {
    if (project.owner_id) {
      map.set(project.owner_id, {
        id: project.owner_id,
        displayName: shortMemberLabel(project.owner_id),
        role: "Owner",
        projectCount: 0,
        assignedTasks: 0,
        completedTasks: 0
      });
    }
    (project.member_ids || []).forEach((id) => {
      if (!map.has(id)) {
        map.set(id, {
          id,
          displayName: shortMemberLabel(id),
          role: id === project.owner_id ? "Owner" : "Member",
          projectCount: 0,
          assignedTasks: 0,
          completedTasks: 0
        });
      }
    });
  });

  const members = Array.from(map.values()).map((member) => {
    const projectCount = projects.filter(
      (project) => project.owner_id === member.id || (project.member_ids || []).includes(member.id)
    ).length;
    const assigned = tasks.filter((task) => assigneeIds(task).includes(member.id));
    return {
      ...member,
      projectCount,
      assignedTasks: assigned.length,
      completedTasks: assigned.filter((task) => task.status === "done").length,
      pendingTasks: assigned.filter((task) => task.status !== "done").length,
      completionPct: assigned.length ? Math.round((assigned.filter((task) => task.status === "done").length / assigned.length) * 100) : 0
    };
  });

  return members.sort((a, b) => b.assignedTasks - a.assignedTasks || a.displayName.localeCompare(b.displayName));
}

export function shortMemberLabel(id = "") {
  return id ? `User ${id.slice(-6)}` : "User";
}
