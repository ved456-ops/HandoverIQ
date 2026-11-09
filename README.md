# HandoverIQ

> AI-powered project knowledge handover platform.

Connect a GitHub repository → collect activity → generate an evidence-linked handover report → identify missing information → allow human review.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Python FastAPI |
| AI | Google Gemini API |
| GitHub | GitHub REST API |
| Database | Supabase / PostgreSQL *(Phase 5)* |
| Deployment | Vercel + Render *(Phase 5)* |

---

## Local Development

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.11
- A GitHub Personal Access Token (PAT) with `repo` read scope
- A Gemini API key from [AI Studio](https://aistudio.google.com) *(required for Phase 3+)*

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # then fill in your keys
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # then set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Frontend runs at http://localhost:3000  
Backend runs at http://localhost:8000  
API docs at http://localhost:8000/docs

---

## Development Phases

- [x] **Phase 1** — Scaffolding (both servers start, CORS verified)
- [ ] **Phase 2** — GitHub data collection
- [ ] **Phase 3** — Gemini AI analysis
- [ ] **Phase 4** — Report viewer with evidence links
- [ ] **Phase 5** — Persistence & deployment
