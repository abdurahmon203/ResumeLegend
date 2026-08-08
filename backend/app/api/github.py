from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.repository import Repository
from app.services.github import GitHubService
from app.services.ai_agents import AIAgentsService
from app.schemas.all_schemas import RepositoryResponse

router = APIRouter(prefix="/github", tags=["GitHub Integration"])

@router.post("/sync", response_model=List[RepositoryResponse])
async def sync_user_repositories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sync repositories from GitHub and run AI analysis on top projects."""
    token = current_user.github_access_token
    if not token:
        # If user registered via email, return empty list or mock list
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub access token missing. Please authenticate via GitHub."
        )

    try:
        # 1. Fetch repositories from GitHub
        raw_repos = await GitHubService.get_user_repos(token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    synced_repos = []
    # 2. Iterate and upsert database
    for raw in raw_repos:
        repo_id = str(raw["id"])
        name = raw["name"]
        url = raw["html_url"]
        desc = raw.get("description")
        lang = raw.get("language")
        stars = raw.get("stargazers_count", 0)
        forks = raw.get("forks_count", 0)

        repo = db.query(Repository).filter(
            Repository.user_id == current_user.id,
            Repository.github_repo_id == repo_id
        ).first()

        if not repo:
            repo = Repository(
                user_id=current_user.id,
                github_repo_id=repo_id,
                name=name,
                github_url=url,
                description=desc,
                language=lang,
                stars=stars,
                forks=forks,
                is_sync_active=True
            )
            db.add(repo)
        else:
            repo.name = name
            repo.github_url = url
            repo.description = desc
            repo.language = lang
            repo.stars = stars
            repo.forks = forks

        synced_repos.append(repo)
    
    db.commit()

    # 3. Analyze the top 3 repos (by star count) if they haven't been analyzed yet
    top_repos = sorted(synced_repos, key=lambda r: r.stars, reverse=True)[:3]
    for repo in top_repos:
        if not repo.ai_analysis:
            # Fetch README
            readme = await GitHubService.get_repo_readme(token, current_user.username, repo.name)
            # Run AI analysis
            analysis = await AIAgentsService.analyze_repository(
                repo_name=repo.name,
                language=repo.language or "Unknown",
                description=repo.description or "",
                readme_content=readme or ""
            )
            repo.ai_analysis = analysis
            
    db.commit()
    
    # Reload all repos from DB to return complete profiles
    db_repos = db.query(Repository).filter(Repository.user_id == current_user.id).all()
    return db_repos

@router.get("/repos", response_model=List[RepositoryResponse])
async def list_repositories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all synchronized repositories for the user."""
    repos = db.query(Repository).filter(Repository.user_id == current_user.id).all()
    return repos

@router.put("/repos/{repo_id}/toggle", response_model=RepositoryResponse)
async def toggle_repository(
    repo_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle repository active status. Runs AI analysis if activated and not already analyzed."""
    repo = db.query(Repository).filter(
        Repository.id == repo_id,
        Repository.user_id == current_user.id
    ).first()

    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found.")

    repo.is_sync_active = not repo.is_sync_active
    
    # If toggled active and has no analysis, analyze it on the fly
    if repo.is_sync_active and not repo.ai_analysis:
        token = current_user.github_access_token
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

    db.commit()
    db.refresh(repo)
    return repo
