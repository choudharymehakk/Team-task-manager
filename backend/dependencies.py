from beanie.odm.fields import PydanticObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from config import settings
from models.project import Project
from models.task import Task
from models.user import User

ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def parse_object_id(value: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(value)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        token_type = payload.get("type")
        if user_id is None or token_type != "access":
            raise credentials_error
    except JWTError:
        raise credentials_error
    user = await User.get(parse_object_id(user_id))
    if user is None:
        raise credentials_error
    return user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def user_project_ids(user: User, project: Project) -> set[str]:
    return {str(project.owner_id), *(str(member_id) for member_id in project.member_ids)}


def is_project_member(user: User, project: Project) -> bool:
    return user.role == "admin" or str(user.id) in user_project_ids(user, project)


async def require_project_member(project_id: str | PydanticObjectId, user: User) -> Project:
    object_id = project_id if isinstance(project_id, PydanticObjectId) else parse_object_id(project_id)
    project = await Project.get(object_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if not is_project_member(user, project):
        raise HTTPException(status_code=403, detail="Project membership required")
    return project


async def require_task_access(task_id: str | PydanticObjectId, user: User) -> tuple[Task, Project]:
    object_id = task_id if isinstance(task_id, PydanticObjectId) else parse_object_id(task_id)
    task = await Task.get(object_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    project = await require_project_member(task.project_id, user)
    return task, project
