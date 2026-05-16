from datetime import datetime

from beanie.odm.fields import PydanticObjectId
from pydantic import BaseModel, ConfigDict, Field, field_validator


class CommentCreate(BaseModel):
    body: str = Field(min_length=1)

    @field_validator("body")
    @classmethod
    def body_not_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Comment body must not be empty")
        return stripped


class CommentOut(BaseModel):
    id: PydanticObjectId
    body: str
    task_id: PydanticObjectId
    author_id: PydanticObjectId
    author_username: str | None = None
    author_full_name: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, json_encoders={PydanticObjectId: str})
