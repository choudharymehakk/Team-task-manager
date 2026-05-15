from datetime import datetime
from typing import Literal

from beanie.odm.fields import PydanticObjectId
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=40)
    password: str = Field(min_length=8)
    role: Literal["admin", "member"] = "member"


class UserOut(BaseModel):
    id: PydanticObjectId
    email: EmailStr
    username: str
    role: Literal["admin", "member"]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, json_encoders={PydanticObjectId: str})


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AccessToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenData(BaseModel):
    sub: str
    token_type: Literal["access", "refresh"]
