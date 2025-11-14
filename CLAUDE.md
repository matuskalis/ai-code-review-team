# PROJECT OVERVIEW
Stack: Next.js 14 + TypeScript (frontend), FastAPI + Python 3.11 (backend).
Architecture: WebSocket-driven multi-agent review pipeline.
Entry points:
- Frontend: frontend/app/page.tsx and related components.
- Backend: backend/main.py (FastAPI) with WebSocket endpoint /ws/review.

# RULES
- Follow existing multi-agent architecture from TECHNICAL_DOCUMENTATION.md.
- Do not change agent roles, responsibilities, or orchestration flow.
- Do not restructure the Next.js app router layout.
- No new dependencies unless required to preserve documented behavior.
- Maintain real-time WebSocket streaming as the communication method.
- Preserve separate frontend/backend directories.

# NAMING
Variables: lowerCamelCase.
Functions: lowerCamelCase.
Classes (Python): PascalCase.
Components: PascalCase.
Files:
- TS/JS: kebab-case or folder-based component conventions.
- Python: snake_case.

# BUILD & TEST
Frontend:
- Install: npm install
- Run dev: npm run dev
- Build: npm run build

Backend:
- Create venv: python -m venv venv
- Activate: source venv/bin/activate
- Install: pip install -r requirements.txt
- Run dev: python main.py

# DIRECTORY MAP
backend/ → FastAPI backend and agent orchestrator :contentReference[oaicite:0]{index=0}  
frontend/ → Next.js frontend with WebSocket UI :contentReference[oaicite:1]{index=1}  
backend/agents/ → Security, Performance, Style specialists (multi-agent system)  
backend/schemas/ → Request/response models  
backend/core/ → Orchestrator and utilities  
frontend/app/ → App Router pages  
frontend/components/ → UI components  
frontend/lib/ → WebSocket client and helpers  
tests/ → Validation and automated test suite

# EDITING PROTOCOL
- Only modify files explicitly requested by me.
- For multi-file changes, generate a short plan before touching anything.
- Preserve WebSocket endpoint contract defined in TECHNICAL_DOCUMENTATION.md.
- Maintain streaming response format (status, partial, complete).
- Keep agent outputs aligned with Security/Performance/Style specializations.

# DOCUMENTATION
- Update README.md only when behavior or usage changes.
- Keep comments minimal and technical.
- Use TECHNICAL_DOCUMENTATION.md as authoritative for architecture.

# SECURITY & DATA RULES
- Never output or log secrets.
- Keep SQL injection examples safe and non-executable.
- Ensure all dangerous code appears only inside safe fenced code blocks.
