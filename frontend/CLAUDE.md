# MODULE OVERVIEW
Purpose: Next.js 14 frontend providing real-time UI for code review.

# ENTRY POINTS
- app/page.tsx: main UI.
- WebSocket client: lib/ws-client or equivalent.

# PUBLIC UI BEHAVIOR
- Accepts code input.
- Sends review request through WebSocket.
- Streams results in real time.
- Displays agent-specific updates (Security, Performance, Style).
- Renders final summary and scores.

# INVARIANTS
- WebSocket must connect to ws://localhost:8000/ws/review unless overridden by env.
- UI must remain reactive to streaming messages.
- No client-side mutation of agent roles or ordering.

# FORBIDDEN PATTERNS
- No direct backend logic inside components.
- No rewriting streaming protocol.
- No mixing server/client boundaries outside Next.js conventions.

# TESTING
Use React Testing Library if needed.
Manually verify streaming UI after changes.
