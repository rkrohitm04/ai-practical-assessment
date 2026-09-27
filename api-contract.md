# API Contract
## 1. Create Ticket
- **Method:** POST `/tickets/`
- **Request:** `{"title": "string", "description": "string", "priority": "Low|Medium|High", "createdBy": 1}`
- **Response:** 201 Created
## 2. List & Filter Tickets
- **Method:** GET `/tickets/`
- **Query Params:** `status`, `priority`, `search`
- **Response:** 200 OK
## 3. Transition Ticket Status
- **Method:** PATCH `/tickets/{ticket_id}/status`
- **Request:** `{"status": "In Progress"}`
- **Validation:** Enforces state machine (Open -> In Progress -> Resolved -> Closed). 
- **Error:** 400 Bad Request on invalid transition.
## 4. Export Tickets
- **Method:** GET `/tickets/export/{user_id}`
- **Response:** 200 OK (text/csv)
