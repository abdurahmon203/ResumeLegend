import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.repository import Repository
from app.services.ai_agents import AIAgentsService
from app.services.github import GitHubService
from app.schemas.all_schemas import (
    ResumeResponse, 
    ResumeUpdate, 
    ResumeGenerateRequest, 
    SectionImproveRequest,
    AIReviewResponseSchema
)

router = APIRouter(tags=["Resume Management"])

@router.post("/resume/generate", response_model=ResumeResponse)
async def generate_ai_resume(
    payload: ResumeGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Trigger the Resume Writer Agent to compile a developer CV based on synced GitHub repos."""
    # 1. Fetch user's active repositories
    active_repos = db.query(Repository).filter(
        Repository.user_id == current_user.id,
        Repository.is_sync_active == True
    ).all()
    
    # 2. Extract repository analyses
    token = current_user.github_access_token
    repo_analyses = []
    
    for repo in active_repos:
        if not repo.ai_analysis:
            # If missing analysis, run GitHub Analyzer on the fly
            readme = ""
            if token:
                readme = await GitHubService.get_repo_readme(token, current_user.username, repo.name) or ""
                
            analysis = await AIAgentsService.analyze_repository(
                repo_name=repo.name,
                language=repo.language or "Unknown",
                description=repo.description or "",
                readme_content=readme
            )
            repo.ai_analysis = analysis
            db.add(repo)
            
        repo_analyses.append({
            "name": repo.name,
            "github_url": repo.github_url,
            "stars": repo.stars,
            "role": repo.ai_analysis.get("role", "Developer"),
            "technologies": repo.ai_analysis.get("technologies", []),
            "summary": repo.ai_analysis.get("summary", ""),
            "achievements": repo.ai_analysis.get("achievements", [])
        })
        
    db.commit()

    # 3. Compile manual inputs
    personal_info_payload = {
        "fullName": payload.fullName,
        "desiredPosition": payload.desiredPosition,
        "experienceYears": payload.experienceYears,
        "location": payload.location,
        "email": payload.email,
        "phone": payload.phone,
        "githubUrl": f"github.com/{current_user.username}"
    }
    
    education_payload = [
        {
            "id": edu.id,
            "institution": edu.institution,
            "degree": edu.degree,
            "fieldOfStudy": edu.fieldOfStudy,
            "startDate": edu.startDate,
            "endDate": edu.endDate
        } for edu in payload.education
    ]

    # 4. Trigger Resume Writer Agent
    try:
        generated_content = await AIAgentsService.write_resume(
            personal_info=personal_info_payload,
            education=education_payload,
            repo_analyses=repo_analyses
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Resume Writer failed: {e}")

    # 5. Create Resume Record
    resume = Resume(
        user_id=current_user.id,
        title=f"{payload.desiredPosition} Resume",
        template_name="developer",
        share_slug=str(uuid.uuid4())[:8],
        is_public=True,
        content=generated_content
    )
    
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume

@router.get("/resumes", response_model=List[ResumeResponse])
async def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all resumes owned by the current user."""
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    return resumes

@router.get("/resumes/{resume_id}", response_model=ResumeResponse)
async def get_resume_by_id(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full resume details."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume profile not found.")
    return resume

@router.put("/resumes/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: str,
    payload: ResumeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update resume content, template, or public visibility settings."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume profile not found.")
        
    if payload.title is not None:
        resume.title = payload.title
    if payload.template_name is not None:
        resume.template_name = payload.template_name
    if payload.is_public is not None:
        resume.is_public = payload.is_public
    if payload.content is not None:
        resume.content = payload.content.model_dump()

    db.commit()
    db.refresh(resume)
    return resume

@router.delete("/resumes/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a resume profile."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume profile not found.")
        
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully."}

@router.post("/resumes/{resume_id}/review", response_model=AIReviewResponseSchema)
async def review_resume_content(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Trigger the AI Reviewer Agent to score the resume and suggest improvements."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume profile not found.")
        
    review_response = await AIAgentsService.review_resume(resume.content)
    return review_response

@router.post("/resumes/{resume_id}/improve-section")
async def improve_resume_section(
    resume_id: str,
    payload: SectionImproveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Trigger the AI Editor Agent to rewrite a specific section based on user commands."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume profile not found.")
        
    # Find current content in resume dict
    section = payload.section
    current_text = ""
    
    if section == "summary":
        current_text = resume.content.get("summary", "")
    elif section.startswith("experience"):
        # Just grab the general description lines from the first company
        current_text = "\n".join(resume.content.get("experience", [{}])[0].get("description", []))
    else:
        current_text = str(resume.content.get(section, ""))

    improved_text = await AIAgentsService.improve_section(
        section_name=section,
        current_content=current_text,
        instructions=payload.instructions
    )
    
    return {"improved_text": improved_text}

@router.get("/resumes/share/{share_slug}", response_model=ResumeResponse)
async def get_public_resume(
    share_slug: str,
    db: Session = Depends(get_db)
):
    """Retrieve shared public resume details (completely public, no authentication check)."""
    resume = db.query(Resume).filter(
        Resume.share_slug == share_slug,
        Resume.is_public == True
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=404, 
            detail="The requested public resume was not found or is set to private."
        )
    return resume
