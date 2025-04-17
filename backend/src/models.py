from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

from src.config import settings

engine = create_engine(settings.database_uri.get_secret_value(), connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

with engine.connect() as conn:
    conn.execute(text("PRAGMA foreign_keys = ON"))


def get_db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
