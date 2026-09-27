import sys
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from src.backend.database import SessionLocal, engine, Base
from src.backend import models

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.User).count() == 0:
            users = [
                models.User(name="Alice Admin", email="alice@test.com", role="admin"),
                models.User(name="Bob Support", email="bob@test.com", role="support"),
                models.User(name="Charlie User", email="charlie@test.com", role="user")
            ]
            db.add_all(users)
            db.commit()
            print("Users seeded successfully.")

        if db.query(models.Ticket).count() == 0:
            charlie = db.query(models.User).filter_by(email="charlie@test.com").first()
            bob = db.query(models.User).filter_by(email="bob@test.com").first()
            tickets = [
                models.Ticket(title="Database Connection Timeout", description="Intermittent timeouts.", priority="High", status="Open", createdBy=charlie.id, assignedTo=bob.id),
                models.Ticket(title="Update Profile Picture", description="Cannot upload avatars.", priority="Low", status="In Progress", createdBy=charlie.id, assignedTo=bob.id)
            ]
            db.add_all(tickets)
            db.commit()

            t1 = db.query(models.Ticket).filter_by(title="Database Connection Timeout").first()
            comment = models.Comment(ticketId=t1.id, message="Investigating...", createdBy=bob.id)
            db.add(comment)
            db.commit()
            print("Tickets and comments seeded successfully.")
        else:
            print("Sample data already present.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
