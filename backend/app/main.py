"""
HandoverIQ — FastAPI application factory.

Mounts all routers and configures CORS so the Next.js frontend
can communicate with this backend in local development.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import health, github, analysis, report, auth

app = FastAPI(
    title="HandoverIQ API",
    description=(
        "AI-powered project knowledge handover platform. "
        "Connect a GitHub repository, analyse activity, and generate "
        "an evidence-linked handover report."
    ),
    version="0.2.0",
)

# ── CORS ──────────────────────────────────────────────────────────
# Allows the Next.js dev server (and later the Vercel deployment)
# to call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(github.router)
app.include_router(analysis.router)
app.include_router(report.router)
