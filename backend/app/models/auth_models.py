"""
Pydantic models for HandoverIQ Authentication, Accounts & User Profiles.
"""
from typing import Optional
from pydantic import BaseModel, Field


class UserPreferences(BaseModel):
    default_ai_provider: str = Field(
        default="auto",
        description="Preferred synthesis engine: auto | gemini | claude | deterministic",
    )
    export_format: str = Field(
        default="markdown",
        description="Default dossier export format: markdown | json | pdf_print",
    )
    github_token_configured: bool = Field(
        default=False,
        description="Whether the user has saved a personal GitHub token",
    )
    github_token_masked: Optional[str] = Field(
        default=None,
        description="Masked preview of personal GitHub token (e.g. ghp_••••12ab)",
    )
    email_notifications: bool = Field(
        default=True,
        description="Receive notifications when handover gaps are resolved",
    )
    auto_save_dossiers: bool = Field(
        default=True,
        description="Automatically attach generated dossiers to user workspace",
    )


class BookmarkedRepo(BaseModel):
    repo_url: str
    repo_name: str
    notes: Optional[str] = ""
    added_at: str


class ActivityEntry(BaseModel):
    id: str
    action: str
    target: str
    timestamp: str


class UserProfile(BaseModel):
    user_id: str
    name: str
    email: str
    role: str = "Senior Software Engineer"
    organization: str = "CodeVengers Engineering"
    bio: str = "Building resilient systems and verifiable engineering handovers."
    avatar_color: str = "#171717"
    plan_tier: str = "Workspace Pro"
    created_at: str
    last_login_at: str
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    bookmarked_repos: list[BookmarkedRepo] = Field(default_factory=list)
    saved_report_ids: list[str] = Field(default_factory=list)
    recent_activity: list[ActivityEntry] = Field(default_factory=list)


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: str = Field(..., min_length=4, max_length=120)
    password: str = Field(..., min_length=6, max_length=128)
    role: Optional[str] = "Software Engineer"
    organization: Optional[str] = "Independent Workspace"


class UserLoginRequest(BaseModel):
    email: str
    password: str


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    organization: Optional[str] = None
    bio: Optional[str] = None
    avatar_color: Optional[str] = None
    default_ai_provider: Optional[str] = None
    export_format: Optional[str] = None
    github_personal_token: Optional[str] = None
    email_notifications: Optional[bool] = None
    auto_save_dossiers: Optional[bool] = None


class BookmarkRequest(BaseModel):
    repo_url: str
    repo_name: str
    notes: Optional[str] = ""


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=128)


class AuthSessionResponse(BaseModel):
    token: str
    user: UserProfile
