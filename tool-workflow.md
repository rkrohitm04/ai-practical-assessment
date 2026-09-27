# AI Tool Workflow

## 1. Primary AI Tool Used
Cursor (utilizing integrated LLM chat and Composer panels for multi-file generation).

## 2. Providing Project Context
I set up initial system prompts and project directory specifications in markdown notes before coding. When building backend features, I referenced the exact data models and state-machine flowchart requirements to keep the AI aligned with the assessment rules.

## 3. Requirement Analysis
Used AI to break down the core features into modular components: Pydantic schemas for input validation, SQLAlchemy models for SQLite persistence, and a dictionary-based transition matrix for the ticket lifecycle.

## 4. Planning and Design
Collaborated with Cursor to design a clean separation of concerns: FastAPI REST routes cleanly isolated from business validation logic, and a modular React frontend handling local state and API integration.

## 5. Code Generation
Generated boilerplate code incrementally—starting with database configuration and models, moving to API routes and state-machine validation, and finishing with the React dashboard components.

## 6. Validation of AI Output
Manually reviewed all generated code, specifically verifying that the database session lifecycle (`get_db`) follows best practices and that Pydantic models correctly enforce required fields.

## 7. Testing Approach
Prompted the AI to draft an isolated Pytest suite using an in-memory SQLite database (`sqlite:///:memory:`) and FastAPI's `TestClient` to rigorously validate both successful state transitions and rejected invalid transitions.

## 8. Debugging Process
When encountering runtime errors (such as missing database columns or path resolution issues with pytest), I fed the stack trace into Cursor, analyzed the root cause (e.g., SQLite schema drift), and applied clean fixes.

## 9. Code Review
Conducted self-reviews on code structure, ensuring proper database cascade options (`cascade="all, delete-orphan"`) and clean REST conventions.

## 10. Security & Privacy Discipline
Avoided sharing any personal credentials, internal environment variables, or proprietary data with the AI tool.

## 11. Workflow Reusability
This structured workflow—spec-driven prompting, incremental generation, and isolated integration testing—can be reliably reused for future greenfield full-stack applications.
