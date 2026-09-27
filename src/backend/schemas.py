from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CommentBase(BaseModel):
    message: str = Field(..., min_length=1)
    createdBy: int

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    ticketId: int
    createdAt: datetime
    class Config:
        from_attributes = True

class TicketBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    priority: str = Field(default="Low")
    assignedTo: Optional[int] = None

class TicketCreate(TicketBase):
    createdBy: int

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    assignedTo: Optional[int] = None

class TicketStatusUpdate(BaseModel):
    status: str

class TicketResponse(TicketBase):
    id: int
    status: str
    createdBy: int
    createdAt: datetime
    updatedAt: datetime
    comments: List[CommentResponse] = []
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    class Config:
        from_attributes = True
