"""
SQLite persistence for HandoverIQ.

One small database file (handoveriq.db) holds generated reports and the user/workspace
store. Set HANDOVERIQ_DATA_DIR to a persistent volume (e.g. /data on Railway) so data
survives redeploys and restarts. Legacy JSON files are imported automatically once.
"""
from __future__ import annotations

import json
import os
import sqlite3
import threading
from pathlib import Path
from typing import Optional

_DEFAULT_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DATA_DIR = Path(os.environ.get("HANDOVERIQ_DATA_DIR", str(_DEFAULT_DIR)))
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "handoveriq.db"

_lock = threading.Lock()


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=15)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _lock, _connect() as conn:
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute(
            "CREATE TABLE IF NOT EXISTS reports ("
            "report_id TEXT PRIMARY KEY, generated_at TEXT NOT NULL, body TEXT NOT NULL)"
        )
        conn.execute("CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, body TEXT NOT NULL)")


def put_report(report_id: str, generated_at: str, body: str) -> None:
    with _lock, _connect() as conn:
        conn.execute(
            "INSERT INTO reports(report_id, generated_at, body) VALUES(?,?,?) "
            "ON CONFLICT(report_id) DO UPDATE SET generated_at=excluded.generated_at, body=excluded.body",
            (report_id, generated_at, body),
        )


def get_report_body(report_id: str) -> Optional[str]:
    with _lock, _connect() as conn:
        row = conn.execute("SELECT body FROM reports WHERE report_id=?", (report_id,)).fetchone()
    return row["body"] if row else None


def all_report_bodies() -> list[str]:
    with _lock, _connect() as conn:
        rows = conn.execute("SELECT body FROM reports ORDER BY generated_at DESC").fetchall()
    return [r["body"] for r in rows]


def kv_get(key: str) -> Optional[dict]:
    with _lock, _connect() as conn:
        row = conn.execute("SELECT body FROM kv WHERE key=?", (key,)).fetchone()
    return json.loads(row["body"]) if row else None


def kv_put(key: str, value: dict) -> None:
    with _lock, _connect() as conn:
        conn.execute(
            "INSERT INTO kv(key, body) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET body=excluded.body",
            (key, json.dumps(value)),
        )


def storage_info() -> dict:
    with _lock, _connect() as conn:
        n = conn.execute("SELECT COUNT(*) AS n FROM reports").fetchone()["n"]
    return {"engine": "sqlite", "path": str(DB_PATH), "reports": n}


init_db()
