import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.mock_interview import MockInterview
from app.services.ai_agents import AIAgentsService
from app.schemas.all_schemas import (
    MockInterviewGenerateRequest,
    MockInterviewGenerateResponse,
    MockInterviewEvaluateRequest,
    MockInterviewEvaluationResponse,
    MockInterviewQuestionItem
)

router = APIRouter(tags=["Mock Interview Assistant"])

DEFAULT_COMPETENCIES = {
    "languages": ["TypeScript"],
    "frameworks": ["React", "Next.js"],
    "tools": ["Docker", "Git", "PostgreSQL", "Redis"]
}

@router.post("/mock-interview/generate", response_model=MockInterviewGenerateResponse)
async def generate_mock_interview(
    payload: MockInterviewGenerateRequest,
    db: Session = Depends(get_db)
):
    """Generates 20 target technical & behavioral interview questions based on CV core competencies and target language."""
    competencies = payload.competencies or DEFAULT_COMPETENCIES
    resume_content = payload.resume_content
    target_lang = payload.target_language or "en"
    
    # If resume_id is provided, fetch resume content from database
    if payload.resume_id:
        resume = db.query(Resume).filter(Resume.id == payload.resume_id).first()
        if resume and resume.content:
            resume_content = resume.content
            if "skills" in resume.content:
                extracted_comp = {}
                for cat in resume.content.get("skills", []):
                    extracted_comp[cat.get("category", "General")] = cat.get("skills", [])
                if extracted_comp:
                    competencies = extracted_comp

    questions_raw = await AIAgentsService.generate_mock_interview_questions(
        competencies=competencies,
        role=payload.role or "Full Stack Engineer",
        resume_content=resume_content,
        target_language=target_lang
    )

    questions = [
        MockInterviewQuestionItem(
            id=q.get("id", idx + 1),
            category=q.get("category", "Technical"),
            technology=q.get("technology", "General"),
            difficulty=q.get("difficulty", "Mid"),
            type=q.get("type", "technical"),
            question=q.get("question", ""),
            hint=q.get("hint", ""),
            key_points=q.get("key_points", [])
        )
        for idx, q in enumerate(questions_raw)
    ]

    session_id = str(uuid.uuid4())

    return MockInterviewGenerateResponse(
        session_id=session_id,
        title=f"20 Questions Mock Interview ({target_lang.upper()})",
        target_language=target_lang,
        competencies=competencies,
        questions=questions
    )

@router.post("/mock-interview/evaluate", response_model=MockInterviewEvaluationResponse)
async def evaluate_mock_interview(
    payload: MockInterviewEvaluateRequest,
    db: Session = Depends(get_db)
):
    """Evaluates candidate responses to 20 interview questions in target language, returning scores, diagnostics, weak spots, and chart metrics."""
    questions_dict = [q.model_dump() for q in payload.questions]
    answers_dict = [a.model_dump() for a in payload.answers]
    target_lang = payload.target_language or "en"

    evaluation = await AIAgentsService.evaluate_mock_interview(
        questions=questions_dict,
        answers=answers_dict,
        competencies=payload.competencies or DEFAULT_COMPETENCIES,
        target_language=target_lang
    )

    return MockInterviewEvaluationResponse(
        session_id=payload.session_id or str(uuid.uuid4()),
        overall_score=evaluation.get("overall_score", 0),
        verdict=evaluation.get("verdict", "Evaluation Complete"),
        total_correct=evaluation.get("total_correct", 0),
        total_partially_correct=evaluation.get("total_partially_correct", 0),
        total_incorrect=evaluation.get("total_incorrect", 0),
        evaluations=evaluation.get("evaluations", []),
        tech_breakdown=evaluation.get("tech_breakdown", {}),
        weaknesses=evaluation.get("weaknesses", []),
        practice_recommendations=evaluation.get("practice_recommendations", []),
        chart_data=evaluation.get("chart_data", {})
    )


@router.get("/mock-interview/history")
async def get_mock_interview_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetches past mock interview sessions for the authenticated user."""
    sessions = db.query(MockInterview).filter(
        MockInterview.user_id == current_user.id
    ).order_by(MockInterview.created_at.desc()).all()
    
    return [
        {
            "id": s.id,
            "title": s.title,
            "overall_score": s.overall_score,
            "status": s.status,
            "created_at": s.created_at
        }
        for s in sessions
    ]
