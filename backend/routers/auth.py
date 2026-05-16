from datetime import datetime, timedelta, timezone

from beanie.odm.fields import PydanticObjectId
from fastapi import APIRouter, HTTPException, status
from fastapi.params import Depends
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext

from config import settings
from dependencies import ALGORITHM, get_current_user, parse_object_id
from models.user import User
from schemas.user import AccessToken, RefreshRequest, Token, UserCreate, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_token(user_id: str, token_type: str, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    payload = {"sub": user_id, "type": token_type, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def issue_tokens(user: User) -> Token:
    access = create_token(
        str(user.id), "access", timedelta(minutes=settings.access_token_expire_minutes)
    )
    refresh = create_token(
        str(user.id), "refresh", timedelta(days=settings.refresh_token_expire_days)
    )
    return Token(access_token=access, refresh_token=refresh)


async def unique_username(email: str, requested: str | None = None) -> str:
    base = (requested or email.split("@")[0]).strip().lower().replace(" ", "_")
    base = "".join(char for char in base if char.isalnum() or char in {"_", "-"})
    if len(base) < 3:
        base = "user"
    candidate = base[:40]
    suffix = 1
    while await User.find_one(User.username == candidate):
        suffix_text = str(suffix)
        candidate = f"{base[:40 - len(suffix_text) - 1]}_{suffix_text}"
        suffix += 1
    return candidate


@router.post("/signup", response_model=UserOut, status_code=201)
async def signup(payload: UserCreate) -> User:
    if await User.find_one(User.email == payload.email):
        raise HTTPException(status_code=409, detail="Email is already registered")
    if payload.username and await User.find_one(User.username == payload.username):
        raise HTTPException(status_code=409, detail="Username is already taken")
    user = User(
        email=payload.email,
        username=await unique_username(str(payload.email), payload.username),
        full_name=payload.full_name.strip(),
        avatar_url=payload.avatar_url,
        hashed_password=get_password_hash(payload.password),
        role=payload.role,
    )
    await user.insert()
    return user


@router.post("/login", response_model=Token)
async def login(form: OAuth2PasswordRequestForm = Depends()) -> Token:
    user = await User.find_one(User.username == form.username)
    if user is None:
        user = await User.find_one(User.email == form.username)
    if user is None or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return issue_tokens(user)


@router.post("/refresh", response_model=AccessToken)
async def refresh(payload: RefreshRequest) -> AccessToken:
    try:
        decoded = jwt.decode(payload.refresh_token, settings.secret_key, algorithms=[ALGORITHM])
        if decoded.get("type") != "refresh" or decoded.get("sub") is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        user = await User.get(parse_object_id(decoded["sub"]))
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    return AccessToken(
        access_token=create_token(
            str(user.id), "access", timedelta(minutes=settings.access_token_expire_minutes)
        )
    )


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
