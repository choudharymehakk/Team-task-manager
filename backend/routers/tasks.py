from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_current_user, parse_object_id, require_admin, require_project_member, require_task_access
from models.comment import Comment
from models.project import Project
from models.task import Task
from models.user import User
from schemas.task import TaskCreate, TaskOut, TaskUpdate

router = APIRouter(tags=["tasks"])


def member_id_set(project: Project) -> set[str]:
    return {str(project.owner_id), *(str(member_id) for member_id in project.member_ids)}


async def validate_assignee(project: Project, assigned_to) -> None:
    if assigned_to is not None and str(assigned_to) not in member_id_set(project):
        raise HTTPException(status_code=400, detail="assigned_to must be a project member")


@router.get("/api/projects/{project_id}/tasks", response_model=list[TaskOut])
async def list_tasks(project_id: str, current_user: User = Depends(get_current_user)) -> list[Task]:
    project = await require_project_member(project_id, current_user)
    if current_user.role != "admin":
        return await Task.find(Task.project_id == project.id, Task.assigned_to == current_user.id).sort("-created_at").to_list()
    return await Task.find(Task.project_id == project.id).sort("-created_at").to_list()


@router.post("/api/projects/{project_id}/tasks", response_model=TaskOut, status_code=201)
async def create_task(
    project_id: str, payload: TaskCreate, current_user: User = Depends(require_admin)
) -> Task:
    project = await require_project_member(project_id, current_user)
    await validate_assignee(project, payload.assigned_to)
    task = Task(project_id=project.id, created_by=current_user.id, **payload.model_dump())
    await task.insert()
    return task


@router.get("/api/tasks/{task_id}", response_model=TaskOut)
async def get_task(task_id: str, current_user: User = Depends(get_current_user)) -> Task:
    task, _ = await require_task_access(task_id, current_user)
    if current_user.role != "admin" and str(task.assigned_to) != str(current_user.id):
        raise HTTPException(status_code=403, detail="You can view only tasks assigned to you")
    return task


@router.put("/api/tasks/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: str, payload: TaskUpdate, current_user: User = Depends(get_current_user)
) -> Task:
    task, project = await require_task_access(task_id, current_user)
    if current_user.role != "admin" and str(task.assigned_to) != str(current_user.id):
        raise HTTPException(status_code=403, detail="You can update only tasks assigned to you")
    data = payload.model_dump(exclude_unset=True)
    if current_user.role != "admin":
        disallowed = set(data) - {"status"}
        if disallowed:
            raise HTTPException(status_code=403, detail="Members can update status only")
    await validate_assignee(project, data.get("assigned_to"))
    for key, value in data.items():
        setattr(task, key, value)
    task.updated_at = datetime.now(timezone.utc)
    await task.save()
    return task


@router.delete("/api/tasks/{task_id}", status_code=204)
async def delete_task(task_id: str, _: User = Depends(require_admin)) -> None:
    task = await Task.get(parse_object_id(task_id))
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    await Comment.find(Comment.task_id == task.id).delete()
    await task.delete()
