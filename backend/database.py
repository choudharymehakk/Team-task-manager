from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from config import settings
from models.comment import Comment
from models.project import Project
from models.task import Task
from models.user import User

client: AsyncIOMotorClient | None = None


async def init_db() -> None:
    global client
    client = AsyncIOMotorClient(
    settings.mongo_uri,
    tls=True,
    tlsAllowInvalidCertificates=True
)
    await init_beanie(
        database=client[settings.database_name],
        document_models=[User, Project, Task, Comment],
    )


async def close_db() -> None:
    if client is not None:
        client.close()
