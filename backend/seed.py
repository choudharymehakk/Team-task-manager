import asyncio

from database import close_db, init_db
from models.user import User
from routers.auth import get_password_hash


async def main() -> None:
    await init_db()
    email = "admin@example.com"
    existing = await User.find_one(User.email == email)
    if existing:
        print("Admin user already exists")
    else:
        user = User(
            email=email,
            username="admin",
            hashed_password=get_password_hash("Admin123!"),
            role="admin",
        )
        await user.insert()
        print("Created admin@example.com with password Admin123!")
    await close_db()


if __name__ == "__main__":
    asyncio.run(main())
