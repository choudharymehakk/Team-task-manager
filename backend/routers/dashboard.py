from datetime import date

from fastapi import APIRouter, Depends

from dependencies import get_current_user
from models.project import Project
from models.task import Task
from models.user import User

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
async def dashboard(current_user: User = Depends(get_current_user)) -> dict:
    if current_user.role == "admin":
        projects = await Project.find_all().to_list()
    else:
        projects = await Project.find(
            {"$or": [{"owner_id": current_user.id}, {"member_ids": current_user.id}]}
        ).to_list()
    project_ids = [project.id for project in projects]
    if not project_ids:
        tasks = []
    elif current_user.role == "admin":
        tasks = await Task.find({"project_id": {"$in": project_ids}}).to_list()
    else:
        tasks = await Task.find(
            {"project_id": {"$in": project_ids}, "assigned_to": current_user.id}
        ).to_list()
    total = len(tasks)
    by_status = {
        "todo": sum(1 for task in tasks if task.status == "todo"),
        "in_progress": sum(1 for task in tasks if task.status == "in_progress"),
        "done": sum(1 for task in tasks if task.status == "done"),
    }
    overdue = sum(
        1 for task in tasks if task.due_date is not None and task.due_date < date.today() and task.status != "done"
    )
    completed_pct = round((by_status["done"] / total) * 100, 1) if total else 0
    return {
        "total_tasks": total,
        "completed_pct": completed_pct,
        "overdue_count": overdue,
        "by_status": by_status,
    }
