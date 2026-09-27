# Debugging Notes

## Issue 1: SQLite Schema Mismatch (`OperationalError: no such column`)
### Problem
After modifying the `Ticket` model to include the `assignedTo` field, starting the local server and querying or searching tickets caused an `OperationalError` stating the column did not exist in the SQLite database file.
### How I Investigated
Checked the SQLite database file schema and realized that SQLAlchemy's `create_all` does not automatically alter existing tables when model definitions evolve.
### How AI Helped
Explained that SQLite file-based persistence requires either a migration tool (like Alembic) or a manual database reset during development.
### Final Fix
Deleted the local SQLite file (`database/tickets.db`), re-ran the database seed script, and restarted the FastAPI server to regenerate the schema cleanly.

## Issue 2: Pytest Module Import Resolution
### Problem
Running `pytest` directly from the terminal root threw `ModuleNotFoundError: No module named 'src'`.
### How I Investigated
Recognized that pytest was not automatically recognizing `src` as part of the python path without explicit module execution configuration.
### How AI Helped
Advised running pytest as a Python module (`python -m pytest`) and adding empty `__init__.py` files to the `src` and `src/backend` directories.
### Final Fix
Created the package initialization files and executed tests using `python -m pytest`, which successfully resolved the package import structure.
