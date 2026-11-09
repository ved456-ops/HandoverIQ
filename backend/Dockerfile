# HandoverIQ Backend Dockerfile
# Optimized for free-tier cloud deployment (Render, Fly.io, Railway, Google Cloud Run)

FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies if required (curl for healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY app/ ./app
COPY .env.example .

# Create data directory for reports
RUN mkdir -p /app/data/reports

EXPOSE 8000

# Start Uvicorn binding to 0.0.0.0 and dynamic $PORT provided by host
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
