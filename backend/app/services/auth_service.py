"""
Authentication & User Workspace Service for HandoverIQ.

Provides file-backed persistence in backend/data/users.json, PBKDF2-HMAC-SHA256
password hashing, session tokens, pre-seeded demo engineer account, bookmarked
repositories, and automatic linking of generated Handover Reports.
"""
import hashlib
import json
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from app.models.auth_models import (
    ActivityEntry,
    AuthSessionResponse,
    BookmarkedRepo,
    BookmarkRequest,
    PasswordChangeRequest,
    ProfileUpdateRequest,
    UserLoginRequest,
    UserPreferences,
    UserProfile,
    UserRegisterRequest,
)
from app.services import db
from app.services.report_storage import list_reports

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
USERS_FILE = DATA_DIR / "users.json"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100_000,
    )
    return dk.hex(), salt


def _verify_password(password: str, expected_hash: str, salt: str) -> bool:
    computed, _ = _hash_password(password, salt)
    return secrets.compare_digest(computed, expected_hash)


def _mask_token(raw_token: str) -> str:
    cleaned = raw_token.strip()
    if len(cleaned) <= 8:
        return "••••••••"
    return f"{cleaned[:4]}••••{cleaned[-4:]}"


def _default_demo_record() -> dict:
    pw_hash, salt = _hash_password("handover2026")
    existing_reports = [r.report_id for r in list_reports()]
    now = _now_iso()
    return {
        "user_id": "usr_codevengers_demo",
        "name": "Alex Rivera",
        "email": "alex.rivera@handoveriq.dev",
        "password_hash": pw_hash,
        "password_salt": salt,
        "role": "Staff Systems Architect",
        "organization": "CodeVengers 2026 · Platform Engineering",
        "bio": "Leading platform architecture transitions, repository continuity audits, and onboarding dossiers across distributed engineering squads.",
        "avatar_color": "#171717",
        "plan_tier": "Enterprise Pitch Edition",
        "created_at": "2026-10-15T09:30:00+00:00",
        "last_login_at": now,
        "preferences": {
            "default_ai_provider": "auto",
            "export_format": "markdown",
            "github_token_configured": False,
            "github_token_masked": None,
            "email_notifications": True,
            "auto_save_dossiers": True,
        },
        "bookmarked_repos": [
            {
                "repo_url": "https://github.com/tiangolo/fastapi",
                "repo_name": "tiangolo/fastapi",
                "notes": "Core API framework reference & async dependency injection handover audit",
                "added_at": "2026-11-01T11:20:00+00:00",
            },
            {
                "repo_url": "https://github.com/pallets/flask",
                "repo_name": "pallets/flask",
                "notes": "Legacy WSGI service comparison & maintainer transition study",
                "added_at": "2026-11-04T15:45:00+00:00",
            },
            {
                "repo_url": "https://github.com/octocat/Hello-World",
                "repo_name": "octocat/Hello-World",
                "notes": "Quick smoke-test repository for live pitch demonstrations",
                "added_at": "2026-11-08T18:10:00+00:00",
            },
        ],
        "saved_report_ids": existing_reports,
        "recent_activity": [
            {
                "id": "act_1",
                "action": "Synthesized 5-Pillar Handover Dossier",
                "target": "octocat/Hello-World",
                "timestamp": now,
            },
            {
                "id": "act_2",
                "action": "Bookmarked repository for transition audit",
                "target": "tiangolo/fastapi",
                "timestamp": "2026-11-08T16:40:00+00:00",
            },
            {
                "id": "act_3",
                "action": "Configured Evidence-First Verification Policy",
                "target": "CodeVengers 2026 Workspace",
                "timestamp": "2026-11-06T10:15:00+00:00",
            },
        ],
    }


def _load_store() -> dict:
    """Load the users/sessions store from SQLite (importing legacy users.json once)."""
    raw = db.kv_get("users_store")
    if raw is None and USERS_FILE.exists():
        try:
            raw = json.loads(USERS_FILE.read_text(encoding="utf-8"))
        except Exception:
            raw = None
    if raw is None:
        raw = {}
    changed = False
    if "users" not in raw:
        raw["users"] = {}
        changed = True
    if "sessions" not in raw:
        raw["sessions"] = {}
        changed = True
    if "usr_codevengers_demo" not in raw["users"]:
        demo = _default_demo_record()
        raw["users"][demo["user_id"]] = demo
        changed = True
    if changed or db.kv_get("users_store") is None:
        _save_store(raw)
    return raw


def _save_store(store: dict) -> None:
    db.kv_put("users_store", store)


def _record_to_profile(rec: dict) -> UserProfile:
    # Ensure any reports on disk are synced for the demo user or included if matching
    all_disk_ids = [r.report_id for r in list_reports()]
    saved_ids = list(rec.get("saved_report_ids", []))
    for rid in all_disk_ids:
        if rid not in saved_ids:
            saved_ids.append(rid)

    return UserProfile(
        user_id=rec["user_id"],
        name=rec["name"],
        email=rec["email"],
        role=rec.get("role", "Software Engineer"),
        organization=rec.get("organization", "Engineering Workspace"),
        bio=rec.get("bio", ""),
        avatar_color=rec.get("avatar_color", "#171717"),
        plan_tier=rec.get("plan_tier", "Workspace Pro"),
        created_at=rec["created_at"],
        last_login_at=rec.get("last_login_at", rec["created_at"]),
        preferences=UserPreferences(**rec.get("preferences", {})),
        bookmarked_repos=[
            BookmarkedRepo(**b) for b in rec.get("bookmarked_repos", [])
        ],
        saved_report_ids=saved_ids,
        recent_activity=[
            ActivityEntry(**a) for a in rec.get("recent_activity", [])[:12]
        ],
    )


def _append_activity(rec: dict, action: str, target: str) -> None:
    entries = list(rec.get("recent_activity", []))
    entries.insert(
        0,
        {
            "id": f"act_{secrets.token_hex(4)}",
            "action": action,
            "target": target,
            "timestamp": _now_iso(),
        },
    )
    rec["recent_activity"] = entries[:15]


def register_user(req: UserRegisterRequest) -> AuthSessionResponse:
    store = _load_store()
    email_clean = req.email.strip().lower()

    for u in store["users"].values():
        if u["email"].lower() == email_clean:
            raise ValueError("An account with this email already exists. Please sign in.")

    user_id = f"usr_{secrets.token_hex(6)}"
    pw_hash, salt = _hash_password(req.password)
    now = _now_iso()
    existing_reports = [r.report_id for r in list_reports()]

    new_user = {
        "user_id": user_id,
        "name": req.name.strip(),
        "email": email_clean,
        "password_hash": pw_hash,
        "password_salt": salt,
        "role": (req.role or "Software Engineer").strip(),
        "organization": (req.organization or "Independent Workspace").strip(),
        "bio": "Engineering handover lead tracking repository continuity and architectural decisions.",
        "avatar_color": "#171717",
        "plan_tier": "Workspace Pro",
        "created_at": now,
        "last_login_at": now,
        "preferences": {
            "default_ai_provider": "auto",
            "export_format": "markdown",
            "github_token_configured": False,
            "github_token_masked": None,
            "email_notifications": True,
            "auto_save_dossiers": True,
        },
        "bookmarked_repos": [
            {
                "repo_url": "https://github.com/tiangolo/fastapi",
                "repo_name": "tiangolo/fastapi",
                "notes": "Starter benchmark repository",
                "added_at": now,
            }
        ],
        "saved_report_ids": existing_reports,
        "recent_activity": [
            {
                "id": f"act_{secrets.token_hex(4)}",
                "action": "Created HandoverIQ Workspace Account",
                "target": email_clean,
                "timestamp": now,
            }
        ],
    }

    token = f"hiq_{secrets.token_urlsafe(24)}"
    store["users"][user_id] = new_user
    store["sessions"][token] = user_id
    _save_store(store)

    return AuthSessionResponse(token=token, user=_record_to_profile(new_user))


def login_user(req: UserLoginRequest) -> AuthSessionResponse:
    store = _load_store()
    email_clean = req.email.strip().lower()

    matched_user = None
    for u in store["users"].values():
        if u["email"].lower() == email_clean:
            matched_user = u
            break

    if not matched_user:
        raise LookupError("No account found with that email address.")

    if not _verify_password(
        req.password, matched_user["password_hash"], matched_user["password_salt"]
    ):
        raise PermissionError("Incorrect password. Please try again.")

    matched_user["last_login_at"] = _now_iso()
    _append_activity(matched_user, "Signed in to workspace", matched_user["email"])

    token = f"hiq_{secrets.token_urlsafe(24)}"
    store["sessions"][token] = matched_user["user_id"]
    _save_store(store)

    return AuthSessionResponse(token=token, user=_record_to_profile(matched_user))


def login_demo_user() -> AuthSessionResponse:
    store = _load_store()
    demo_user = store["users"].get("usr_codevengers_demo")
    if not demo_user:
        demo_user = _default_demo_record()
        store["users"][demo_user["user_id"]] = demo_user

    demo_user["last_login_at"] = _now_iso()
    _append_activity(
        demo_user,
        "Activated CodeVengers 2026 Pitch Demo Session",
        "Enterprise Pitch Edition",
    )

    token = f"hiq_{secrets.token_urlsafe(24)}"
    store["sessions"][token] = demo_user["user_id"]
    _save_store(store)

    return AuthSessionResponse(token=token, user=_record_to_profile(demo_user))


def get_user_by_token(token: Optional[str]) -> Optional[UserProfile]:
    if not token:
        return None
    cleaned = token.replace("Bearer ", "").strip()
    store = _load_store()
    user_id = store["sessions"].get(cleaned)
    if not user_id:
        return None
    user_rec = store["users"].get(user_id)
    if not user_rec:
        return None
    return _record_to_profile(user_rec)


def update_user_profile(token: str, req: ProfileUpdateRequest) -> UserProfile:
    cleaned = token.replace("Bearer ", "").strip()
    store = _load_store()
    user_id = store["sessions"].get(cleaned)
    if not user_id or user_id not in store["users"]:
        raise PermissionError("Invalid or expired session token.")

    rec = store["users"][user_id]
    if req.name is not None and req.name.strip():
        rec["name"] = req.name.strip()
    if req.role is not None:
        rec["role"] = req.role.strip()
    if req.organization is not None:
        rec["organization"] = req.organization.strip()
    if req.bio is not None:
        rec["bio"] = req.bio.strip()
    if req.avatar_color is not None:
        rec["avatar_color"] = req.avatar_color.strip()

    prefs = rec.get("preferences", {})
    if req.default_ai_provider is not None:
        prefs["default_ai_provider"] = req.default_ai_provider
    if req.export_format is not None:
        prefs["export_format"] = req.export_format
    if req.email_notifications is not None:
        prefs["email_notifications"] = req.email_notifications
    if req.auto_save_dossiers is not None:
        prefs["auto_save_dossiers"] = req.auto_save_dossiers

    if req.github_personal_token is not None:
        raw_tok = req.github_personal_token.strip()
        if raw_tok == "":
            prefs["github_token_configured"] = False
            prefs["github_token_masked"] = None
        else:
            prefs["github_token_configured"] = True
            prefs["github_token_masked"] = _mask_token(raw_tok)
            rec["github_personal_token_raw"] = raw_tok

    rec["preferences"] = prefs
    _append_activity(rec, "Updated account profile & workspace preferences", rec["name"])
    _save_store(store)
    return _record_to_profile(rec)


def add_bookmark(token: str, req: BookmarkRequest) -> UserProfile:
    cleaned = token.replace("Bearer ", "").strip()
    store = _load_store()
    user_id = store["sessions"].get(cleaned)
    if not user_id or user_id not in store["users"]:
        raise PermissionError("Invalid or expired session token.")

    rec = store["users"][user_id]
    bookmarks = list(rec.get("bookmarked_repos", []))
    bookmarks = [
        b for b in bookmarks if b["repo_name"].lower() != req.repo_name.strip().lower()
    ]
    bookmarks.insert(
        0,
        {
            "repo_url": req.repo_url.strip(),
            "repo_name": req.repo_name.strip(),
            "notes": (req.notes or "").strip(),
            "added_at": _now_iso(),
        },
    )
    rec["bookmarked_repos"] = bookmarks
    _append_activity(rec, "Bookmarked repository", req.repo_name.strip())
    _save_store(store)
    return _record_to_profile(rec)


def remove_bookmark(token: str, repo_name: str) -> UserProfile:
    cleaned = token.replace("Bearer ", "").strip()
    store = _load_store()
    user_id = store["sessions"].get(cleaned)
    if not user_id or user_id not in store["users"]:
        raise PermissionError("Invalid or expired session token.")

    rec = store["users"][user_id]
    bookmarks = list(rec.get("bookmarked_repos", []))
    rec["bookmarked_repos"] = [
        b for b in bookmarks if b["repo_name"].lower() != repo_name.strip().lower()
    ]
    _append_activity(rec, "Removed bookmarked repository", repo_name.strip())
    _save_store(store)
    return _record_to_profile(rec)


def change_password(token: str, req: PasswordChangeRequest) -> UserProfile:
    cleaned = token.replace("Bearer ", "").strip()
    store = _load_store()
    user_id = store["sessions"].get(cleaned)
    if not user_id or user_id not in store["users"]:
        raise PermissionError("Invalid or expired session token.")

    rec = store["users"][user_id]
    if not _verify_password(
        req.current_password, rec["password_hash"], rec["password_salt"]
    ):
        raise ValueError("Current password is incorrect.")

    new_hash, new_salt = _hash_password(req.new_password)
    rec["password_hash"] = new_hash
    rec["password_salt"] = new_salt
    _append_activity(rec, "Updated account security password", rec["email"])
    _save_store(store)
    return _record_to_profile(rec)


def logout_session(token: Optional[str]) -> None:
    if not token:
        return
    cleaned = token.replace("Bearer ", "").strip()
    store = _load_store()
    if cleaned in store["sessions"]:
        del store["sessions"][cleaned]
        _save_store(store)


def attach_report_to_user(token: Optional[str], report_id: str, repo_name: str) -> None:
    if not token:
        return
    cleaned = token.replace("Bearer ", "").strip()
    store = _load_store()
    user_id = store["sessions"].get(cleaned)
    if not user_id or user_id not in store["users"]:
        return

    rec = store["users"][user_id]
    saved = list(rec.get("saved_report_ids", []))
    if report_id not in saved:
        saved.insert(0, report_id)
    rec["saved_report_ids"] = saved
    _append_activity(rec, "Generated 5-Pillar Handover Dossier", repo_name)
    _save_store(store)
