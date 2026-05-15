from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_current_user, parse_object_id, require_admin
from models.comment import Comment
from models.project import Project
from models.task import Task
from models.user import User
from routers.auth import get_password_hash
from schemas.user import UserCreate, UserOut

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[UserOut])
async def list_users(_: User = Depends(require_admin)) -> list[User]:
    return await User.find_all().sort("username").to_list()


@router.post("", response_model=UserOut, status_code=201)
async def create_user(payload: UserCreate, _: User = Depends(require_admin)) -> User:
    if await User.find_one(User.email == payload.email):
        raise HTTPException(status_code=409, detail="Email is already registered")
    if await User.find_one(User.username == payload.username):
        raise HTTPException(status_code=409, detail="Username is already taken")
    user = User(
        email=payload.email,
        username=payload.username,
        hashed_password=get_password_hash(payload.password),
        role=payload.role,
    )
    await user.insert()
    return user


@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: str, current_user: User = Depends(require_admin)) -> None:
    object_id = parse_object_id(user_id)
    if str(current_user.id) == str(object_id):
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    user = await User.get(object_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    projects = await Project.find(
        {"$or": [{"owner_id": object_id}, {"member_ids": object_id}]}
    ).to_list()
    for project in projects:
        project.member_ids = [member_id for member_id in project.member_ids if str(member_id) != str(object_id)]
        if str(project.owner_id) == str(object_id):
            project.owner_id = current_user.id
            if all(str(member_id) != str(current_user.id) for member_id in project.member_ids):
                project.member_ids.append(current_user.id)
        await project.save()

    assigned_tasks = await Task.find(Task.assigned_to == object_id).to_list()
    for task in assigned_tasks:
        task.assigned_to = None
        await task.save()

    await Comment.find(Comment.author_id == object_id).delete()
    await user.delete()
