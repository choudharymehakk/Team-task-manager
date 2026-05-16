from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_current_user, require_task_access
from models.comment import Comment
from models.user import User
from schemas.comment import CommentCreate, CommentOut

router = APIRouter(tags=["comments"])


def is_assigned_to(task, user: User) -> bool:
    assignees = task.assigned_to or []
    if not isinstance(assignees, list):
        assignees = [assignees]
    return str(user.id) in {str(assignee) for assignee in assignees}


async def with_author(comment: Comment) -> CommentOut:
    author = await User.get(comment.author_id)
    return CommentOut(
        id=comment.id,
        body=comment.body,
        task_id=comment.task_id,
        author_id=comment.author_id,
        author_username=author.username if author else None,
        created_at=comment.created_at,
    )


@router.get("/api/tasks/{task_id}/comments", response_model=list[CommentOut])
async def list_comments(task_id: str, current_user: User = Depends(get_current_user)) -> list[CommentOut]:
    task, _ = await require_task_access(task_id, current_user)
    if current_user.role != "admin" and not is_assigned_to(task, current_user):
        raise HTTPException(status_code=403, detail="You can view comments only on assigned tasks")
    comments = await Comment.find(Comment.task_id == task.id).sort("created_at").to_list()
    return [await with_author(comment) for comment in comments]


@router.post("/api/tasks/{task_id}/comments", response_model=CommentOut, status_code=201)
async def create_comment(
    task_id: str, payload: CommentCreate, current_user: User = Depends(get_current_user)
) -> CommentOut:
    task, _ = await require_task_access(task_id, current_user)
    if current_user.role != "admin" and not is_assigned_to(task, current_user):
        raise HTTPException(status_code=403, detail="You can comment only on assigned tasks")
    comment = Comment(body=payload.body, task_id=task.id, author_id=current_user.id)
    await comment.insert()
    return await with_author(comment)


@router.delete("/api/comments/{comment_id}", status_code=204)
async def delete_comment(comment_id: str, current_user: User = Depends(get_current_user)) -> None:
    from dependencies import parse_object_id

    comment = await Comment.get(parse_object_id(comment_id))
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    if str(comment.author_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="You can delete only your own comments")
    await comment.delete()
