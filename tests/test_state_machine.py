import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from src.backend.main import app
from src.backend.database import Base, get_db
from src.backend import models

engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try: yield db
    finally: db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    db.add_all([models.User(name="T1", email="t1@t.com", role="user"), models.User(name="T2", email="t2@t.com", role="support")])
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def create_sample_ticket(status="Open"):
    res = client.post("/tickets/", json={"title": "Test", "description": "Test", "priority": "High", "createdBy": 1})
    t_id = res.json()["id"]
    if status != "Open":
        db = TestingSessionLocal()
        t = db.query(models.Ticket).filter(models.Ticket.id == t_id).first()
        t.status = status
        db.commit()
        db.close()
    return t_id

def test_valid_transitions():
    t_id = create_sample_ticket("Open")
    assert client.patch(f"/tickets/{t_id}/status", json={"status": "In Progress"}).status_code == 200
    assert client.patch(f"/tickets/{t_id}/status", json={"status": "Resolved"}).status_code == 200
    assert client.patch(f"/tickets/{t_id}/status", json={"status": "Closed"}).status_code == 200

def test_valid_cancel():
    t_id = create_sample_ticket("Open")
    assert client.patch(f"/tickets/{t_id}/status", json={"status": "Cancelled"}).status_code == 200

def test_invalid_transition_rejected():
    t_id = create_sample_ticket("Open")
    res = client.patch(f"/tickets/{t_id}/status", json={"status": "Resolved"})
    assert res.status_code == 400
    assert "Invalid transition" in res.json()["detail"]

def test_invalid_closed_transition():
    t_id = create_sample_ticket("Closed")
    res = client.patch(f"/tickets/{t_id}/status", json={"status": "Open"})
    assert res.status_code == 400
