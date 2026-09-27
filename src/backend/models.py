from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="user")

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=False)
    priority = Column(String, default="Low", nullable=False)
    status = Column(String, default="Open", nullable=False)
    assignedTo = Column(Integer, ForeignKey("users.id"), nullable=True)
    createdBy = Column(Integer, ForeignKey("users.id"), nullable=False)
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    comments = relationship("Comment", back_populates="ticket", cascade="all, delete-orphan")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    ticketId = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    message = Column(String, nullable=False)
    createdBy = Column(Integer, ForeignKey("users.id"), nullable=False)
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    ticket = relationship("Ticket", back_populates="comments")
