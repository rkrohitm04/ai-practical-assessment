# PR Description
## Summary
Implements the core Support Ticket Management System featuring an enforced state-machine workflow, search/filter capabilities, comment threads, and user-specific CSV export.
## Key Changes
- `src/backend/`: FastAPI API with SQLite/SQLAlchemy models, Pydantic validation, and state machine transitions.
- `src/frontend/`: React Vite dashboard with live state-transition controls and UI error handling.
- `tests/`: Pytest integration suite testing all allowed and rejected state transitions.
