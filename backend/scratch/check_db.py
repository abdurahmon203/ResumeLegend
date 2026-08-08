import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.repository import Repository
from app.models.resume import Resume

db = SessionLocal()
try:
    print("--- USERS ---")
    users = db.query(User).all()
    for u in users:
        print(f"ID: {u.id}, Username: {u.username}, Email: {u.email}, Plan: {getattr(u, 'plan', 'N/A')}")
        
    print("\n--- REPOSITORIES ---")
    repos = db.query(Repository).all()
    for r in repos:
        print(f"ID: {r.id}, Name: {r.name}, Stars: {r.stars}, UserID: {r.user_id}, AI Analysis: {r.ai_analysis is not None}")
        if r.ai_analysis:
            print(f"  Summary: {r.ai_analysis.get('summary')}")
            
    print("\n--- RESUMES ---")
    resumes = db.query(Resume).all()
    for res in resumes:
        print(f"ID: {res.id}, Title: {res.title}, Template: {res.template_name}, UserID: {res.user_id}")
        print(f"  Content Projects: {[p.get('name') for p in res.content.get('projects', [])]}")
        print(f"  Content GitHub URL: {res.content.get('personal_info', {}).get('githubUrl')}")
finally:
    db.close()
