# Support Ticket Management System

This is a full-stack application built for the AI Practical Assessment. It features a FastAPI backend, a React frontend, and a local SQLite database.

## Architecture & Database
- **Backend Framework:** FastAPI (Python)
- **Frontend Library:** React (Vite)
- **Database:** SQLite (Relational). Chosen for zero-configuration local testing. 

## Local Setup Instructions

### 1. Backend Setup & Database Initialization
Run all backend commands from the **root** of the project folder:

```bash
# Ensure your virtual environment is active
source src/backend/venv/bin/activate

# Install requirements
pip install fastapi uvicorn sqlalchemy pydantic pytest httpx

# Seed the database
python -m database.seed_data

# Run the FastAPI server
uvicorn src.backend.main:app --reload --port 8000