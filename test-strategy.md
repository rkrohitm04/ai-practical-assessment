# Test Strategy
## Test Scope
- Integration tests targeting the Ticket state machine transitions using an isolated in-memory SQLite engine and FastAPI TestClient.
## Test Scenarios Covered
1. All valid transitions (`Open -> In Progress`, `In Progress -> Resolved`, `Resolved -> Closed`, `Open -> Cancelled`, `In Progress -> Cancelled`).
2. Invalid transitions returning HTTP 400 (e.g., `Open -> Closed`, `Closed -> Open`).
3. Payload input validation failures (HTTP 422).
