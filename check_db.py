from database import *
from sqlmodel import Session, select
from database import engine

with Session(engine) as session:
    demo_user = session.exec(select(User).where(User.email == "sreeja@serphawk.com")).first()
    if demo_user:
        tid = demo_user.tenant_id
        clients = session.exec(select(ClientProfile).where(ClientProfile.userId == demo_user.id)).all()
        leads = session.exec(select(Lead).where(Lead.owner_id == demo_user.id)).all()
        print(f"Demo User TID: {tid}")
        for c in clients:
            print(f"Client {c.id}: tenant_id={c.tenant_id}, companyName={c.companyName}")
        for l in leads:
            print(f"Lead {l.id}: tenant_id={l.tenant_id}, company_name={l.company_name}")
    else:
        print("User not found")
