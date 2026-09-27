# Reflection

## What I Built
I built a complete Support Ticket Management System from scratch. The application supports creating, searching, filtering, and updating tickets, posting comments, downloading self-generated tickets as CSVs, and strictly enforcing a support ticket lifecycle state machine.

## How I Used AI
I used Cursor as an active pair programmer across the entire development lifecycle. Rather than generating the entire project in one go, I worked iteratively: designing the database schema, building validation layers, writing integration tests, and constructing the UI component by component.

## What AI Helped With Most
AI excelled at generating repetitive boilerplate code (such as SQLAlchemy relationship mappings, Pydantic validation schemas, and standard React form handling), which significantly accelerated development time.

## What AI Got Wrong
Initially, the AI suggested running tests without adjusting Python module paths, which led to `ModuleNotFoundError`. I had to guide it to run pytest as a module (`python -m pytest`) and establish proper package initialization files (`__init__.py`). I also had to manually fix SQLite schema migration quirks when columns were updated.

## How I Validated AI Output
I manually inspected the generated logic, ran FastAPI locally to verify endpoints against live HTTP requests, and executed the Pytest integration suite to ensure the state machine rules were unbreakable.

## What I Would Improve Next
If given more time, I would implement JWT-based authentication, role-based access control (support vs. admin vs. standard user), and Docker containerization for seamless deployment.
