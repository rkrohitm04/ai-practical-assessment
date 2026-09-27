import csv
import io
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from backend.database import get_db
from backend.models import Comment, Ticket, User
from backend.schemas import (
    CommentCreate,
    CommentRead,
    TicketCreate,
    TicketDetailRead,
    TicketRead,
    TicketStatusUpdate,
    TicketUpdate,
)
from backend.status import validate_status_transition

router = APIRouter(prefix="/tickets", tags=["tickets"])


def _get_user_or_404(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found.")
    return user


def _get_ticket_or_404(db: Session, ticket_id: int) -> Ticket:
    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found.")
    return ticket


@router.post("", response_model=TicketRead, status_code=201)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    _get_user_or_404(db, payload.created_by)
    if payload.assigned_to is not None:
        _get_user_or_404(db, payload.assigned_to)

    ticket = Ticket(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        status="Open",
        assigned_to=payload.assigned_to,
        created_by=payload.created_by,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("", response_model=list[TicketRead])
def list_tickets(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None, description="Search title and description"),
    status: str | None = Query(default=None),
    priority: str | None = Query(default=None),
    assigned_to: int | None = Query(default=None),
    created_by: int | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
):
    query = db.query(Ticket)
    if q:
        pattern = f"%{q}%"
        query = query.filter(
            or_(Ticket.title.ilike(pattern), Ticket.description.ilike(pattern))
        )
    if status is not None:
        query = query.filter(Ticket.status == status)
    if priority is not None:
        query = query.filter(Ticket.priority == priority)
    if assigned_to is not None:
        query = query.filter(Ticket.assigned_to == assigned_to)
    if created_by is not None:
        query = query.filter(Ticket.created_by == created_by)

    return query.order_by(Ticket.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/export/{user_id}")
def export_tickets_csv(user_id: int, db: Session = Depends(get_db)):
    _get_user_or_404(db, user_id)
    tickets = (
        db.query(Ticket)
        .filter(Ticket.created_by == user_id)
        .order_by(Ticket.created_at.asc())
        .all()
    )

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "id",
            "title",
            "description",
            "priority",
            "status",
            "assigned_to",
            "created_by",
            "created_at",
            "updated_at",
        ]
    )
    for t in tickets:
        writer.writerow(
            [
                t.id,
                t.title,
                t.description,
                t.priority,
                t.status,
                t.assigned_to if t.assigned_to is not None else "",
                t.created_by,
                t.created_at.isoformat(),
                t.updated_at.isoformat(),
            ]
        )

    filename = f"tickets_user_{user_id}.csv"
    return Response(
        content=buffer.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{ticket_id}", response_model=TicketDetailRead)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = (
        db.query(Ticket)
        .options(joinedload(Ticket.comments))
        .filter(Ticket.id == ticket_id)
        .first()
    )
    if ticket is None:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found.")
    return ticket


@router.patch("/{ticket_id}", response_model=TicketRead)
def update_ticket(
    ticket_id: int, payload: TicketUpdate, db: Session = Depends(get_db)
):
    ticket = _get_ticket_or_404(db, ticket_id)
    data = payload.model_dump(exclude_unset=True)

    if "assigned_to" in data and data["assigned_to"] is not None:
        _get_user_or_404(db, data["assigned_to"])

    for field, value in data.items():
        setattr(ticket, field, value)

    ticket.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.patch("/{ticket_id}/status", response_model=TicketRead)
def update_ticket_status(
    ticket_id: int, payload: TicketStatusUpdate, db: Session = Depends(get_db)
):
    ticket = _get_ticket_or_404(db, ticket_id)
    validate_status_transition(ticket.status, payload.status)
    ticket.status = payload.status
    ticket.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/comments", response_model=CommentRead, status_code=201)
def add_comment(
    ticket_id: int, payload: CommentCreate, db: Session = Depends(get_db)
):
    _get_ticket_or_404(db, ticket_id)
    _get_user_or_404(db, payload.created_by)

    comment = Comment(
        ticket_id=ticket_id,
        message=payload.message,
        created_by=payload.created_by,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
