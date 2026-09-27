from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import csv
import io

from . import models, schemas
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Support Ticket Management System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_TRANSITIONS = {
    "Open": ["In Progress", "Cancelled"],
    "In Progress": ["Resolved", "Cancelled"],
    "Resolved": ["Closed"],
    "Closed": [],
    "Cancelled": []
}

@app.get("/users/", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.post("/tickets/", response_model=schemas.TicketResponse, status_code=201)
def create_ticket(ticket: schemas.TicketCreate, db: Session = Depends(get_db)):
    creator = db.query(models.User).filter(models.User.id == ticket.createdBy).first()
    if not creator:
        raise HTTPException(status_code=400, detail="Creator user does not exist")
    db_ticket = models.Ticket(**ticket.model_dump())
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@app.get("/tickets/", response_model=List[schemas.TicketResponse])
def list_tickets(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Ticket)
    if status:
        query = query.filter(models.Ticket.status == status)
    if priority:
        query = query.filter(models.Ticket.priority == priority)
    if search:
        query = query.filter(
            or_(
                models.Ticket.title.ilike(f"%{search}%"),
                models.Ticket.description.ilike(f"%{search}%")
            )
        )
    return query.order_by(models.Ticket.createdAt.desc()).all()

@app.get("/tickets/export/{user_id}", response_class=PlainTextResponse)
def export_user_tickets_path(user_id: int, db: Session = Depends(get_db)):
    tickets = db.query(models.Ticket).filter(models.Ticket.createdBy == user_id).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Title", "Description", "Priority", "Status", "Created At"])
    for t in tickets:
        writer.writerow([t.id, t.title, t.description, t.priority, t.status, t.createdAt.isoformat() if t.createdAt else ""])
    return PlainTextResponse(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=user_{user_id}_tickets.csv"}
    )

@app.get("/tickets/{ticket_id}", response_model=schemas.TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@app.put("/tickets/{ticket_id}", response_model=schemas.TicketResponse)
def update_ticket(ticket_id: int, updates: schemas.TicketUpdate, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ticket, key, value)
    db.commit()
    db.refresh(ticket)
    return ticket

@app.patch("/tickets/{ticket_id}/status", response_model=schemas.TicketResponse)
def update_ticket_status(ticket_id: int, status_update: schemas.TicketStatusUpdate, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    current_status = ticket.status
    new_status = status_update.status
    if new_status not in VALID_TRANSITIONS.get(current_status, []):
        raise HTTPException(status_code=400, detail=f"Invalid transition")
    ticket.status = new_status
    db.commit()
    db.refresh(ticket)
    return ticket

@app.post("/tickets/{ticket_id}/comments", response_model=schemas.CommentResponse, status_code=201)
def add_comment(ticket_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db_comment = models.Comment(**comment.model_dump(), ticketId=ticket_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment
