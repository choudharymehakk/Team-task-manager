from datetime import date, datetime
from typing import Literal

from beanie.odm.fields import PydanticObjectId
from pydantic import BaseModel, ConfigDict, Field, field_validator


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: str = ""
    assigned_to: list[PydanticObjectId] = Field(default_factory=list)
    status: Literal["todo", "in_progress", "done"] = "todo"
    priority: Literal["low", "medium", "high"] = "medium"
    due_date: date | None = None

    @field_validator("due_date")
    @classmethod
    def due_date_not_past(cls, value: date | None) -> date | None:
        if value is not None and value < date.today():
            raise ValueError("due_date must not be in the past")
        return value

    @field_validator("assigned_to", mode="before")
    @classmethod
    def normalize_assignees(cls, value):
        if value is None or value == "":
            return []
        if isinstance(value, list):
            return [item for item in value if item not in (None, "")]
        return [value]


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None
    assigned_to: list[PydanticObjectId] | None = None
    status: Literal["todo", "in_progress", "done"] | None = None
    priority: Literal["low", "medium", "high"] | None = None
    due_date: date | None = None

    @field_validator("due_date")
    @classmethod
    def due_date_not_past(cls, value: date | None) -> date | None:
        if value is not None and value < date.today():
            raise ValueError("due_date must not be in the past")
        return value

    @field_validator("assigned_to", mode="before")
    @classmethod
    def normalize_assignees(cls, value):
        if value is None:
            return None
        if value == "":
            return []
        if isinstance(value, list):
            return [item for item in value if item not in (None, "")]
        return [value]


class TaskOut(BaseModel):
    id: PydanticObjectId
    title: str
    description: str
    project_id: PydanticObjectId
    assigned_to: list[PydanticObjectId] = Field(default_factory=list)
    status: Literal["todo", "in_progress", "done"]
    priority: Literal["low", "medium", "high"]
    due_date: date | None
    created_by: PydanticObjectId
    created_at: datetime
    updated_at: datetime

    @field_validator("assigned_to", mode="before")
    @classmethod
    def normalize_assignees(cls, value):
        if value is None:
            return []
        if isinstance(value, list):
            return [item for item in value if item is not None]
        return [value]

    model_config = ConfigDict(from_attributes=True, json_encoders={PydanticObjectId: str})
