# Design Notes
## Architecture Overview
- **Backend:** FastAPI with SQLAlchemy ORM.
- **Database:** SQLite persisted locally.
- **Frontend:** React application built with Vite.
## Validation Strategy
- Pydantic models validate input types and required fields.
- State machine validation is centralized in a transition dictionary on the backend to prevent invalid status manipulation.
