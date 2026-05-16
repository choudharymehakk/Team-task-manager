from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_current_user, parse_object_id, require_admin, require_project_member
from models.comment import Comment
from models.project import Project
from models.task import Task
from models.user import User
from schemas.project import AddMemberRequest, ProjectCreate, ProjectOut, ProjectUpdate
from schemas.user import UserOut

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=list[ProjectOut])
async def list_projects(current_user: User = Depends(get_current_user)) -> list[Project]:
    if current_user.role == "admin":
        return await Project.find_all().sort("-created_at").to_list()
    return await Project.find(
        {"$or": [{"owner_id": current_user.id}, {"member_ids": current_user.id}]}
    ).sort("-created_at").to_list()


@router.post("", response_model=ProjectOut, status_code=201)
async def create_project(
    payload: ProjectCreate, current_user: User = Depends(require_admin)
) -> Project:
    project = Project(
        name=payload.name,
        description=payload.description,
        owner_id=current_user.id,
        member_ids=[current_user.id],
    )
    await project.insert()
    return project


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(project_id: str, current_user: User = Depends(get_current_user)) -> Project:
    return await require_project_member(project_id, current_user)


@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: str, payload: ProjectUpdate, current_user: User = Depends(get_current_user)
) -> Project:
    project = await Project.get(parse_object_id(project_id))
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update projects")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(project, key, value)
    await project.save()
    return project


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str, current_user: User = Depends(get_current_user)) -> None:
    project = await Project.get(parse_object_id(project_id))
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete projects")
    tasks = await Task.find(Task.project_id == project.id).to_list()
    for task in tasks:
        await Comment.find(Comment.task_id == task.id).delete()
        await task.delete()
    await project.delete()


@router.post("/{project_id}/members", response_model=ProjectOut)
async def add_member(
    project_id: str,
    payload: AddMemberRequest,
    _: User = Depends(require_admin),
) -> Project:
    project = await Project.get(parse_object_id(project_id))
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    user = await User.find_one(User.email == payload.email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if str(user.id) not in {str(member_id) for member_id in project.member_ids}:
        project.member_ids.append(user.id)
        await project.save()
    return project


@router.get("/{project_id}/members", response_model=list[UserOut])
async def list_project_members(
    project_id: str, current_user: User = Depends(get_current_user)
) -> list[User]:
    project = await require_project_member(project_id, current_user)
    ids = list({str(project.owner_id), *(str(member_id) for member_id in project.member_ids)})
    users = []
    for user_id in ids:
        user = await User.get(parse_object_id(user_id))
        if user is not None:
            users.append(user)
    return sorted(users, key=lambda user: user.full_name or user.email)


@router.delete("/{project_id}/members/{user_id}", response_model=ProjectOut)
async def remove_member(
    project_id: str,
    user_id: str,
    _: User = Depends(require_admin),
) -> Project:
    project = await Project.get(parse_object_id(project_id))
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    object_id = parse_object_id(user_id)
    if str(project.owner_id) == str(object_id):
        raise HTTPException(status_code=400, detail="Project owner cannot be removed")
    project.member_ids = [member_id for member_id in project.member_ids if str(member_id) != str(object_id)]
    tasks = await Task.find(Task.project_id == project.id, Task.assigned_to == object_id).to_list()
    for task in tasks:
        task.assigned_to = [assignee for assignee in (task.assigned_to or []) if str(assignee) != str(object_id)]
        await task.save()
    await project.save()
    return project
