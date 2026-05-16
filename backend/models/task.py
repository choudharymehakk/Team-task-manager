from datetime import date, datetime, timezone
from typing import Literal

from beanie import Document
from beanie.odm.fields import PydanticObjectId
from pydantic import Field, field_validator


class Task(Document):
    title: str
    description: str = ""
    project_id: PydanticObjectId
    assigned_to: list[PydanticObjectId] = Field(default_factory=list)
    status: Literal["todo", "in_progress", "done"] = "todo"
    priority: Literal["low", "medium", "high"] = "medium"
    due_date: date | None = None
    created_by: PydanticObjectId
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator("assigned_to", mode="before")
    @classmethod
    def normalize_assignees(cls, value):
        if value is None:
            return []
        if isinstance(value, list):
            return [item for item in value if item is not None]
        return [value]

    class Settings:
        name = "tasks"
