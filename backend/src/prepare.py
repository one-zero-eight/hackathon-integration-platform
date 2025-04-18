import asyncio
import os
import secrets
import shutil
import subprocess
from pathlib import Path

import yaml
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

BASE_DIR = Path(__file__).resolve().parents[1]
SETTINGS_TEMPLATE = BASE_DIR / "settings.example.yaml"
SETTINGS_FILE = BASE_DIR / "settings.yaml"
PRE_COMMIT_CONFIG = BASE_DIR / ".pre-commit-config.yaml"
DEFAULT_DB_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"


def get_settings():
    """
    Load and return the settings from `settings.yaml` if it exists.
    """
    if not SETTINGS_FILE.exists():
        raise RuntimeError("❌ No `settings.yaml` found.")

    try:
        with open(SETTINGS_FILE) as f:
            return yaml.safe_load(f) or {}
    except Exception as e:
        raise RuntimeError("❌ No `settings.yaml` found.") from e


def ensure_settings_file():
    """
    Ensure `settings.yaml` exists. If not, copy `settings.yaml.example`.
    """
    if not SETTINGS_TEMPLATE.exists():
        print("❌ No `settings.yaml.example` found. Skipping copying.")
        return

    if SETTINGS_FILE.exists():
        print("✅ `settings.yaml` exists.")
        return

    shutil.copy(SETTINGS_TEMPLATE, SETTINGS_FILE)
    print(f"✅ Copied `{SETTINGS_TEMPLATE}` to `{SETTINGS_FILE}`")


def check_and_generate_session_secret_key():
    """
    Ensure the session_secret_key is set in `settings.yaml`. If missing, generate random one
    """
    settings = get_settings()
    session_secret_key = settings.get("api_settings", {}).get("session_secret_key")

    if not session_secret_key or session_secret_key == "...":
        print("⚠️ `session_secret_key` is missing in `settings.yaml`.")
        print("  ➡️ Generate a random one")
        secret = secrets.token_hex(32)
        try:
            with open(SETTINGS_FILE) as f:
                as_text = f.read()
            as_text = as_text.replace("session_secret_key: null", f"session_secret_key: {secret}")
            as_text = as_text.replace("session_secret_key: ...", f"session_secret_key: {secret}")
            with open(SETTINGS_FILE, "w") as f:
                f.write(as_text)
            print("  ✅ `session_secret_key` has been updated in `settings.yaml`.")
        except Exception as e:
            print(f"  ❌ Error updating `settings.yaml`: {e}")
    else:
        print("✅ `session_secret_key` is specified.")


def ensure_pre_commit_hooks():
    """
    Ensure `pre-commit` hooks are installed.
    """

    def is_pre_commit_installed():
        pre_commit_hook = BASE_DIR / ".git" / "hooks" / "pre-commit"
        return pre_commit_hook.exists() and os.access(pre_commit_hook, os.X_OK)

    if not PRE_COMMIT_CONFIG.exists():
        print("❌ No `.pre-commit-config.yaml` found. Skipping pre-commit setup.")
        return

    if is_pre_commit_installed():
        print("✅ Pre-commit hooks are installed.")
        return

    try:
        subprocess.run(
            ["uv", "run", "pre-commit", "install", "--install-hooks", "-t", "pre-commit", "-t", "commit-msg"],
            check=True,
            text=True,
        )
        print("✅ Pre-commit hooks installed successfully.")
    except subprocess.CalledProcessError as e:
        print(
            f"❌ Error setting up pre-commit hooks:\n{e.stderr}\nPlease, setup it manually with `uv run pre-commit install --install-hooks -t pre-commit -t commit-msg`"
        )


def check_database_access():
    """
    Ensure the database is accessible using `db_url` from `settings.yaml`. If missing, set a default value.
    """
    settings = get_settings()
    db_url = settings.get("api_settings", {}).get("db_url")

    if not db_url or db_url == "...":
        print("⚠️ `db_url` is missing in `settings.yaml`. Setting default one.")

        try:
            with open(SETTINGS_FILE) as f:
                as_text = f.read()
            as_text = as_text.replace("db_url: null", f"db_url: {DEFAULT_DB_URL}")
            as_text = as_text.replace("db_url: ...", f"db_url: {DEFAULT_DB_URL}")
            with open(SETTINGS_FILE, "w") as f:
                f.write(as_text)
            print("  ✅ `db_url` has been updated in `settings.yaml`.")
            db_url = DEFAULT_DB_URL
        except Exception as e:
            print(f"  ❌ Error updating `settings.yaml`: {e}")
            return

    def get_docker_compose_command():
        commands = ["docker compose", "docker-compose"]

        for cmd in commands:
            try:
                subprocess.run(cmd.split(), check=True, text=True, capture_output=True)
                return cmd
            except subprocess.CalledProcessError:
                # Command not available
                continue
        return None

    def run_alembic_upgrade():
        """
        Run `alembic upgrade head` to apply migrations.
        """
        try:
            print("⚙️ Running Alembic migrations...")
            subprocess.run(["alembic", "upgrade", "head"], check=True, text=True, capture_output=True)
            print("  ✅ Alembic migrations applied successfully.")
        except subprocess.CalledProcessError as e:
            print(f"  ❌ Error running Alembic migrations:\n  {e.stderr}")
        except Exception as e:
            print(f"  ❌ Unexpected error running Alembic migrations: {e}")

    async def test_connection():
        try:
            engine = create_async_engine(db_url)
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
                print("✅ Successfully connected to the database.")
            run_alembic_upgrade()
        except Exception:
            print(f"⚠️ Failed to connect to the database at `{db_url}`")
            docker_compose = get_docker_compose_command()

            if docker_compose:
                print(f"  ➡ Attempting to start the database using `{docker_compose} up -d db` (wait for it)")
                try:
                    subprocess.run(
                        [*docker_compose.split(), "up", "-d", "--wait", "db"],
                        check=True,
                        text=True,
                        capture_output=True,
                    )
                    print(f"  ✅ `{docker_compose} up -d db` executed successfully. Retrying connection...")
                    # Retry the database connection after starting the container
                    engine = create_async_engine(db_url)
                    async with engine.connect() as conn:
                        await conn.execute(text("SELECT 1"))
                        print("  ✅ Successfully connected to the database after starting the container.")
                    run_alembic_upgrade()
                except subprocess.CalledProcessError as docker_error:
                    print(f"  ❌ Failed to start the database using `{docker_compose} up -d db`:\n  {docker_error}")
                except Exception as retry_error:
                    print(f"  ❌ Retried database connection but failed again:\n  {retry_error}")
            else:
                print("  ❌ Docker Compose is not available, so not able to start db automatically.")

    asyncio.run(test_connection())


def prepare():
    ensure_settings_file()
    check_and_generate_session_secret_key()
    ensure_pre_commit_hooks()
    check_database_access()
