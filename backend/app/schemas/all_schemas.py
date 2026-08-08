from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# ----------------------------------------------------
# Token & Auth Schemas
# ----------------------------------------------------
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    username: str
    plan: str = "free"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

# ----------------------------------------------------
# User Schemas
# ----------------------------------------------------
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None
    plan: Optional[str] = "free"

class UserCreate(UserBase):
    github_id: str
    github_access_token: str

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------------------------------------------
# Repository & AI Analysis Schemas
# ----------------------------------------------------
class AIAnalysisSchema(BaseModel):
    role: str
    technologies: List[str]
    complexity: str
    summary: str
    achievements: List[str]

class RepositoryResponse(BaseModel):
    id: str
    name: str
    github_url: str
    description: Optional[str] = None
    language: Optional[str] = None
    stars: int
    forks: int
    is_sync_active: bool
    ai_analysis: Optional[AIAnalysisSchema] = None

    class Config:
        from_attributes = True

# ----------------------------------------------------
# Resume Segment Schemas
# ----------------------------------------------------
class PersonalInfoSchema(BaseModel):
    fullName: str
    desiredPosition: str
    experienceYears: int
    location: str
    email: str
    phone: str
    website: Optional[str] = None
    githubUrl: Optional[str] = None
    linkedIn: Optional[str] = None
    instagram: Optional[str] = None
    telegram: Optional[str] = None
    twitter: Optional[str] = None
    facebook: Optional[str] = None

class ResumeProjectSchema(BaseModel):
    id: str
    name: str
    role: str
    technologies: List[str]
    description: str
    stars: Optional[int] = 0
    githubUrl: Optional[str] = None

class WorkExperienceSchema(BaseModel):
    id: str
    company: str
    position: str
    startDate: str
    endDate: str
    description: List[str]

class EducationSchema(BaseModel):
    id: str
    institution: str
    degree: str
    fieldOfStudy: str
    startDate: str
    endDate: str

class SkillCategorySchema(BaseModel):
    category: str
    skills: List[str]

class ResumeContentSchema(BaseModel):
    personal_info: PersonalInfoSchema
    summary: str
    skills: List[SkillCategorySchema]
    experience: List[WorkExperienceSchema]
    projects: List[ResumeProjectSchema]
    education: List[EducationSchema]
    achievements: List[str]
    pdf_data: Optional[str] = None
    is_resolved: Optional[bool] = None

# ----------------------------------------------------
# Resume CRUD Schemas
# ----------------------------------------------------
class ResumeResponse(BaseModel):
    id: str
    user_id: str
    title: str
    template_name: str
    share_slug: str
    is_public: bool
    content: ResumeContentSchema
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    template_name: Optional[str] = None
    is_public: Optional[bool] = None
    content: Optional[ResumeContentSchema] = None

class ResumeGenerateRequest(BaseModel):
    fullName: str
    desiredPosition: str
    experienceYears: int
    location: str
    email: str
    phone: str
    education: List[EducationSchema]

class SectionImproveRequest(BaseModel):
    section: str
    instructions: str

# ----------------------------------------------------
# AI Feedback Review Schemas
# ----------------------------------------------------
class AIReviewRecommendationSchema(BaseModel):
    section: str
    critique: str
    suggestion: str

class AIReviewResponseSchema(BaseModel):
    score: int
    recommendations: List[AIReviewRecommendationSchema]

# ----------------------------------------------------
# Mock Interview Schemas
# ----------------------------------------------------
class MockInterviewQuestionItem(BaseModel):
    id: int
    category: str
    technology: str
    difficulty: str  # "Junior" | "Mid" | "Senior"
    type: str        # "technical" | "system_design" | "behavioral"
    question: str
    hint: str
    key_points: List[str]

class MockInterviewGenerateRequest(BaseModel):
    resume_id: Optional[str] = None
    resume_content: Optional[Dict[str, Any]] = None
    target_language: Optional[str] = "en" # "en" | "ru" | "tg" | "de"
    competencies: Optional[Dict[str, List[str]]] = None
    role: Optional[str] = "Full Stack Engineer"
    num_questions: int = 20

class MockInterviewGenerateResponse(BaseModel):
    session_id: str
    title: str
    target_language: str
    competencies: Dict[str, List[str]]
    questions: List[MockInterviewQuestionItem]

class MockInterviewAnswerItem(BaseModel):
    question_id: int
    candidate_answer: str

class MockInterviewEvaluateRequest(BaseModel):
    session_id: Optional[str] = None
    target_language: Optional[str] = "en"
    questions: List[MockInterviewQuestionItem]
    answers: List[MockInterviewAnswerItem]
    competencies: Optional[Dict[str, List[str]]] = None


class MockInterviewEvaluationItem(BaseModel):
    question_id: int
    question: str
    category: str
    technology: str
    candidate_answer: str
    status: str       # "correct", "partial", "incorrect"
    score: int        # 0 to 10
    feedback: str
    model_answer: str

class MockInterviewEvaluationResponse(BaseModel):
    session_id: Optional[str] = None
    overall_score: int
    verdict: str
    total_correct: int
    total_partially_correct: int
    total_incorrect: int
    evaluations: List[MockInterviewEvaluationItem]
    tech_breakdown: Dict[str, int]
    weaknesses: List[str]
    practice_recommendations: List[str]
    chart_data: Dict[str, Any]

