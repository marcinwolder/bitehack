from collections.abc import Generator
from typing import Annotated
from fastapi import Depends
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import text
from app.core import config

engine = create_engine(config.settings.DATABASE_URL)


def init_db():
    SQLModel.metadata.create_all(engine)
    # Ensure legacy databases have the columns expected by current models.
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE farm ADD COLUMN IF NOT EXISTS crop TEXT"))


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
