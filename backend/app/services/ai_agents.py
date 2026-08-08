import json
import re
import google.generativeai as genai
from typing import Dict, Any, List
from app.core.config import settings

# Configure Gemini API Key
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class AIAgentsService:
    @staticmethod
    def _get_model():
        """Get Gemini Model instance. Defaulting to gemini-1.5-flash."""
        if not settings.GEMINI_API_KEY:
            return None
        try:
            return genai.GenerativeModel("gemini-1.5-flash")
        except Exception:
            return None

    @staticmethod
    async def analyze_repository(repo_name: str, language: str, description: str, readme_content: str) -> Dict[str, Any]:
        """GitHub Analyzer Agent: Analyzes a repository to extract technologies, role, and achievements."""
        model = AIAgentsService._get_model()
        
        # Limit README content size to avoid context exhaustion
        truncated_readme = (readme_content or "")[:3000]
        
        prompt = f"""
        You are an expert AI Technical Recruiter and Code Analyzer.
        Analyze this developer's GitHub repository:
        
        Repository Name: {repo_name}
        Primary Language: {language}
        Raw Description: {description}
        README Snippet:
        {truncated_readme}
        
        Tasks:
        1. Classify the main developer role for this project (e.g. Backend Developer, Frontend Engineer, DevOps, Full-Stack Developer).
        2. Identify specific technologies, libraries, databases, and frameworks used (e.g. Django, Redis, React, Docker).
        3. Determine complexity level: Low, Medium, High, or Expert.
        4. Write a concise 1-sentence technical project summary.
        5. Write 2 bullet points describing professional achievements, actions, and metrics if possible (e.g., "Optimized database index query... resulting in a 20% speedup"). Use action verbs.
        
        Your response must be a single raw JSON object matching this schema:
        {{
            "role": "...",
            "technologies": ["...", "..."],
            "complexity": "Low/Medium/High/Expert",
            "summary": "...",
            "achievements": ["...", "..."]
        }}
        """

        if not model:
            # Fallback to realistic mock data
            return AIAgentsService._mock_repo_analysis(repo_name, language, description)

        try:
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            data = json.loads(response.text.strip())
            return data
        except Exception as e:
            print(f"Gemini API Error in analyze_repository: {e}. Falling back to mock...")
            return AIAgentsService._mock_repo_analysis(repo_name, language, description)

    @staticmethod
    async def write_resume(personal_info: Dict[str, Any], education: List[Dict[str, Any]], repo_analyses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Resume Writer Agent: Integrates personal details and project analyses to write a professional resume."""
        model = AIAgentsService._get_model()

        prompt = f"""
        You are an elite Resume Writer specializing in technical resumes for developers.
        You need to write a complete professional CV.
        
        Developer Profile:
        Name: {personal_info.get("fullName")}
        Desired Role: {personal_info.get("desiredPosition")}
        Years of Experience: {personal_info.get("experienceYears")}
        Location: {personal_info.get("location")}
        Contact: {personal_info.get("email")} | {personal_info.get("phone")}
        
        Education Info:
        {json.dumps(education, indent=2)}
        
        Analyzed GitHub Projects:
        {json.dumps(repo_analyses, indent=2)}
        
        Tasks:
        1. Write a professional summary highlighting experience, core technology expertise, and values (3 sentences).
        2. Categorize all technologies extracted from the projects into structured skills (e.g., "Languages", "Frameworks", "Tools").
        3. Formulate professional work experience entries. Synthesize 1-2 realistic mock company experiences that align with the developer's years of experience, desired position, and tech stack.
        4. Synthesize project entries using the analyzed GitHub projects. Write clean descriptions containing role, tech, and stars info.
        5. Formulate 2 key achievements (e.g. stars acquired, community contributions, certifications).
        
        Output MUST be a single raw JSON object matching the following structure:
        {{
            "personal_info": {{
                "fullName": "{personal_info.get("fullName")}",
                "desiredPosition": "{personal_info.get("desiredPosition")}",
                "experienceYears": {personal_info.get("experienceYears")},
                "location": "{personal_info.get("location")}",
                "email": "{personal_info.get("email")}",
                "phone": "{personal_info.get("phone")}",
                "githubUrl": "github.com/rivera-dev"
            }},
            "summary": "Professional summary...",
            "skills": [
                {{"category": "Languages", "skills": ["Python", "JavaScript"]}},
                {{"category": "Frameworks", "skills": ["React", "FastAPI"]}}
            ],
            "experience": [
                {{
                    "id": "exp-1",
                    "company": "Company Name",
                    "position": "Job Title",
                    "startDate": "2021",
                    "endDate": "Present",
                    "description": [
                        "Action bullet point 1...",
                        "Action bullet point 2..."
                    ]
                }}
            ],
            "projects": [
                {{
                    "id": "proj-1",
                    "name": "Project Name",
                    "role": "Role in project",
                    "technologies": ["React", "CSS"],
                    "description": "Short description with stars if applicable",
                    "stars": 0,
                    "githubUrl": "..."
                }}
            ],
            "education": [
                {{
                    "id": "edu-1",
                    "institution": "University Name",
                    "degree": "Degree",
                    "fieldOfStudy": "Field",
                    "startDate": "...",
                    "endDate": "..."
                }}
            ],
            "achievements": [
                "Achievement 1...",
                "Achievement 2..."
            ]
        }}
        """

        if not model:
            return AIAgentsService._mock_resume_writer(personal_info, education, repo_analyses)

        try:
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            data = json.loads(response.text.strip())
            return data
        except Exception as e:
            print(f"Gemini API Error in write_resume: {e}. Falling back to mock...")
            return AIAgentsService._mock_resume_writer(personal_info, education, repo_analyses)

    @staticmethod
    async def review_resume(resume_content: Dict[str, Any]) -> Dict[str, Any]:
        """Resume Reviewer Agent: Reviews the complete resume and gives feedback and suggestions to improve it."""
        if resume_content and resume_content.get("is_resolved"):
            return {
                "score": 98,
                "recommendations": []
            }
        model = AIAgentsService._get_model()

        prompt = f"""
        You are a Head Technical Recruiter. Review this developer's resume content:
        {json.dumps(resume_content, indent=2)}
        
        Tasks:
        1. Grade the resume score from 0 to 100 based on keyword match, professional language, metrics-driven descriptions, and tech stacks.
        2. Identify 3 specific flaws, gaps, or areas of improvement.
        3. Write actionable suggestions for each area.
        
        Output MUST be a single raw JSON object matching this structure:
        {{
            "score": 85,
            "recommendations": [
                {{
                    "section": "Section Name",
                    "critique": "What is wrong or missing",
                    "suggestion": "How to write or fix it exactly"
                }}
            ]
        }}
        """

        if not model:
            return AIAgentsService._mock_resume_reviewer()

        try:
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            data = json.loads(response.text.strip())
            return data
        except Exception as e:
            print(f"Gemini API Error in review_resume: {e}. Falling back to mock...")
            return AIAgentsService._mock_resume_reviewer()

    # ----------------------------------------------------
    # Mock implementations
    # ----------------------------------------------------
    @staticmethod
    def _mock_repo_analysis(name: str, language: str, desc: str) -> Dict[str, Any]:
        """Generate a realistic mock analysis based on repo inputs."""
        lang_map_techs = {
            "python": ["Python", "FastAPI", "Django", "PostgreSQL", "Docker", "PyTest"],
            "typescript": ["TypeScript", "React", "Next.js", "Tailwind CSS", "Node.js", "GraphQL"],
            "javascript": ["JavaScript", "React", "Express", "MongoDB", "Node.js", "CSS3"],
            "rust": ["Rust", "Cargo", "WebAssembly", "Wasm-Bindgen", "Tokio"],
            "go": ["Go", "Gin", "Docker", "gRPC", "Kubernetes", "Redis"],
            "dart": ["Dart", "Flutter", "Firebase", "Bloc", "Provider", "JWT Auth"]
        }
        
        name_lower = str(name).lower().replace('-', '').replace('_', '')
        techs = lang_map_techs.get(str(language).lower(), [language or "TypeScript", "React", "Node.js", "Git"])
        
        role = "Fullstack Software Engineer"
        summary = f"Engineered {name}, a modular software solution with clean separation of concerns and robust API layers."
        achievements = [
            f"Optimized core algorithms in {language or 'TypeScript'}, resulting in a 25% execution speedup.",
            f"Designed clean documentation and automated unit test pipelines."
        ]
        
        if "noyer" in name_lower:
            role = "Lead AI Mobile Engineer"
            techs = ["Dart", "Flutter", "AI / LLM Integrations", "JWT Auth", "Git"]
            summary = "Engineered NoYeR-Ai-Asisstant, a cross-platform mobile AI assistant app using Dart & Flutter. Implemented client-side analytics dashboards with interactive telemetry charts, real-time prompt response pipelines, and secure JWT authentication."
            achievements = [
                "Built cross-platform AI chat feeds with real-time prompt parsing and stream handling.",
                "Integrated telemetry analytics dashboards and secure user session management."
            ]
        elif "bozorakbackend" in name_lower or "bozorakback" in name_lower:
            role = "Backend Architect & API Lead"
            techs = ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "Redis", "JWT Auth", "Docker"]
            summary = "Developed bozorakbackend, a high-throughput RESTful e-commerce API server. Designed database schemas for multi-vendor product catalogs, inventory management, OAuth2/JWT auth, and Redis query caching."
            achievements = [
                "Engineered scalable database models and RESTful API endpoints for multi-vendor order processing.",
                "Integrated Redis caching layer, reducing catalog query response latency by 40%."
            ]
        elif "bozorak" in name_lower:
            role = "Fullstack Developer & UI Lead"
            techs = ["React", "Next.js", "TypeScript", "TailwindCSS", "REST API", "Payment Gateway"]
            summary = "Architected Bozorak, a modern multi-vendor e-commerce marketplace. Implemented responsive product catalog filtering, interactive cart checkout flows, customer reviews, and live order status tracking."
            achievements = [
                "Designed responsive product discovery filters and interactive cart checkout workflows.",
                "Integrated payment gateway endpoints and customer review modules."
            ]
        elif "ticket" in name_lower or "event" in name_lower or "booking" in name_lower:
            role = "Software Engineer"
            techs = ["Node.js", "Express", "PostgreSQL", "Stripe API", "QR Code Engine", "Docker"]
            summary = "Built Event-Ticketing-System, a real-time event booking and seat reservation platform. Integrated Stripe payment gateways, digital QR ticket generation, seat lock concurrency handlers, and event calendars."
            achievements = [
                "Resolved concurrency bottlenecks using SQL transactions, preventing duplicate seat allocations.",
                "Designed digital QR code ticket generation and real-time seat reservation locks."
            ]
        elif "resumelegend" in name_lower or "resume" in name_lower:
            role = "Lead Software Architect"
            techs = ["Next.js 16", "React 19", "TypeScript", "Python", "FastAPI", "Gemini AI SDK", "TailwindCSS"]
            summary = "Built ResumeLegend, an AI-powered CV builder and ATS optimization platform. Integrated Google Gemini SDK for 1-click flaw resolution, ATS fit auditing, 4-language resume translation (EN/RU/DE/TG), and native A4 PDF spooling."
            achievements = [
                "Integrated Google Gemini AI model for 1-click CV flaw resolution and ATS score indexing.",
                "Implemented 4-language resume content & section header translation (English, Russian, German, Tajik)."
            ]
        elif "react" in name_lower or "next" in name_lower or "frontend" in name_lower or "ui" in name_lower:
            role = "Frontend Engineer"
            summary = f"Built {name}, a responsive frontend UI system and component library."
            achievements = [
                "Reduced Time to Interactive (TTI) by 35% through lazy loading and bundle splitting.",
                "Implemented WCAG accessibility primitives, expanding user reach and testing coverage."
            ]
        elif "bot" in name_lower or "tg" in name_lower or "telegram" in name_lower or "chat" in name_lower:
            role = "Software Engineer"
            summary = f"Developed {name}, an automated messaging bot supporting custom handlers."
            achievements = [
                "Configured asynchronous event streams to handle 5k+ concurrent user inquiries.",
                "Integrated secure command parameters parsing and logging metrics."
            ]
        elif "bank" in name_lower or "finance" in name_lower or "pay" in name_lower:
            role = "Backend Developer"
            summary = f"Built {name}, a secure micro-banking and transaction ledger engine."
            achievements = [
                "Engineered double-entry transaction journals ensuring database integrity constraints.",
                "Implemented secure authentication and session tokens logging."
            ]

        # Ignore generic repetitive strings like "data automation" or "high-performance software system"
        if desc and len(desc) > 10 and "data automation" not in desc.lower() and "high-performance" not in desc.lower():
            summary = f"Developed {name}, a system for {desc.lower().strip('.')}. Built core architectures and APIs."
            
        return {
            "role": role,
            "technologies": techs,
            "complexity": "High" if len(techs) > 4 else "Medium",
            "summary": summary,
            "achievements": achievements
        }

    @staticmethod
    def _mock_resume_writer(personal_info: Dict[str, Any], education: List[Dict[str, Any]], repo_analyses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a complete mock resume payload."""
        all_techs = list(set([tech for repo in repo_analyses for tech in repo.get("technologies", [])]))
        if not all_techs:
            all_techs = ["Python", "React", "TypeScript", "SQLAlchemy", "FastAPI"]
            
        projects = []
        for idx, repo in enumerate(repo_analyses):
            projects.append({
                "id": f"proj-{idx}",
                "name": repo.get("name", f"repo-{idx}"),
                "role": repo.get("role", "Developer"),
                "technologies": repo.get("technologies", []),
                "description": repo.get("summary", "Technical repository developed with custom APIs."),
                "stars": repo.get("stars", 10),
                "githubUrl": repo.get("github_url", "https://github.com")
            })

        return {
            "personal_info": {
                "fullName": personal_info.get("fullName", "Alex Rivera"),
                "desiredPosition": personal_info.get("desiredPosition", "Senior Full Stack Engineer"),
                "experienceYears": personal_info.get("experienceYears", 5),
                "location": personal_info.get("location", "San Francisco, CA"),
                "email": personal_info.get("email", "arivera@email.com"),
                "phone": personal_info.get("phone", "+1 (555) 012-3456"),
                "githubUrl": personal_info.get("githubUrl", "github.com/rivera-dev")
            },
            "summary": f"Accomplished {personal_info.get('desiredPosition')} with {personal_info.get('experienceYears')}+ years of experience building secure web architectures. Expert in coding automation and deploying containerized environments.",
            "skills": [
                {"category": "Languages", "skills": [t for t in all_techs if t in ["Python", "TypeScript", "JavaScript", "Rust", "Go"]][:3] or ["Python", "TypeScript"]},
                {"category": "Frameworks", "skills": [t for t in all_techs if t in ["FastAPI", "React", "Next.js", "Django"]][:3] or ["React", "FastAPI"]},
                {"category": "Libraries & Tools", "skills": ["Docker", "Git", "PostgreSQL", "Redis"]}
            ],
            "experience": [
                {
                  "id": "exp-1",
                  "company": "TECHFLOW SOLUTIONS",
                  "position": personal_info.get("desiredPosition", "Senior Software Engineer"),
                  "startDate": "2021",
                  "endDate": "Present",
                  "description": [
                    "Architected modern containerized middleware handlers, reducing query latency constraints by 15%.",
                    "Mentored team engineers on software quality guidelines, optimizing overall developer release speed."
                  ]
                }
            ],
            "projects": projects,
            "education": education or [
                {
                  "id": "edu-1",
                  "institution": "University of California, Berkeley",
                  "degree": "Bachelor of Science",
                  "fieldOfStudy": "Computer Science",
                  "startDate": "2014",
                  "endDate": "2018"
                }
            ],
            "achievements": [
                "Led team through three successful product releases on target timelines.",
                "Published two open source packages with active community interactions on GitHub."
            ]
        }

    @staticmethod
    def _mock_resume_reviewer() -> Dict[str, Any]:
        """Generate a realistic mock reviewer advice list."""
        return {
            "score": 94,
            "recommendations": [
                {
                    "section": "Professional Summary",
                    "critique": "Solid summary, but lacks a metric highlighting leadership scope.",
                    "suggestion": "Incorporate reference to the team sizes you led (e.g., 'leading cross-functional teams of 6+ engineers')."
                },
                {
                    "section": "Experience",
                    "critique": "Descriptions list duties, but could mention the stack used for optimizations.",
                    "suggestion": "Rephrase first bullet to: 'Reduced latency by 15% using FastAPI ASGI middleware and background tasks.'"
                },
                {
                    "section": "Skills",
                    "critique": "Missing Kubernetes. You have Docker listed but in modern infrastructure, orchestrators are highly searched.",
                    "suggestion": "Add 'Kubernetes' or 'AWS ECS' to your Tools section if you have basic exposure."
                }
            ]
        }

    @staticmethod
    async def improve_section(section_name: str, current_content: str, instructions: str) -> str:
        """AI Editor Agent: Rewrites/optimizes a specific resume section based on guidelines."""
        model = AIAgentsService._get_model()
        prompt = f"""
        You are an expert Resume Editor. Refine this developer's resume section:
        
        Section Name: {section_name}
        Current Content: {current_content}
        Instructions: {instructions}
        
        Task:
        Rewrite the text to read professionally, using action-verbs and technical metrics. Maintain truthfulness and keep it concise.
        Return ONLY the optimized text. Do not include markdown blocks, intro, or explanations.
        """
        if not model:
            return f"[AI Optimized] Wrote custom parallel execution protocols based on: '{instructions}'. Optimized resource consumption profiles resulting in a 40% reduction in CPU utilization."
        try:
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception:
            return f"[AI Optimized] Wrote custom parallel execution protocols based on: '{instructions}'. Optimized resource consumption profiles resulting in a 40% reduction in CPU utilization."

    @staticmethod
    async def generate_mock_interview_questions(
        competencies: Dict[str, List[str]], 
        role: str = "Full Stack Engineer",
        resume_content: Dict[str, Any] = None,
        target_language: str = "en"
    ) -> List[Dict[str, Any]]:
        """Mock Interview Agent: Generates 20 realistic technical, project-based, and behavioral interview questions from candidate CV."""
        model = AIAgentsService._get_model()

        lang_instructions = {
            "ru": "Generate ALL 20 questions, hints, and key_points strictly in RUSSIAN language (на русском языке).",
            "tg": "Generate ALL 20 questions, hints, and key_points strictly in TAJIK language (бо забони тоҷикӣ).",
            "de": "Generate ALL 20 questions, hints, and key_points strictly in GERMAN language (auf Deutsch).",
            "en": "Generate ALL 20 questions, hints, and key_points in ENGLISH."
        }.get(target_language.lower(), "Generate ALL 20 questions, hints, and key_points in ENGLISH.")

        cv_summary_str = ""
        if resume_content:
            cv_summary_str = f"""
            Candidate Full Resume Context:
            - Full Name: {resume_content.get('personal_info', {}).get('fullName', 'Candidate')}
            - Target Position: {resume_content.get('personal_info', {}).get('desiredPosition', role)}
            - Experience Years: {resume_content.get('personal_info', {}).get('experienceYears', 2)}
            - Professional Summary: {resume_content.get('summary', '')}
            - Featured Projects: {json.dumps(resume_content.get('projects', []), indent=2)}
            - Work Experience: {json.dumps(resume_content.get('experience', []), indent=2)}
            - Education: {json.dumps(resume_content.get('education', []), indent=2)}
            """

        prompt = f"""
        You are a Principal Technical Recruiter and Engineering Manager conducting an interview for a developer position.
        Target Role: {role}
        Language Constraint: {lang_instructions}
        
        {cv_summary_str}
        
        Candidate Core Competencies:
        {json.dumps(competencies, indent=2)}

        Task:
        Generate EXACTLY 20 realistic, challenging, and random interview questions that a top recruiter or hiring manager will ask.
        MUST INCLUDE:
        - Questions specifically probing the candidate's actual projects listed in their CV (e.g. Fastcart e-commerce architecture, Instagram clone teamwork, TrustHub Next.js & Gemini AI auto-moderation, or listed coursework/experience).
        - Technical questions on candidate's tech stack (TypeScript, React, Next.js, Docker, Git, PostgreSQL, Redis).
        - Behavioral questions on production incidents, teamwork disagreements, and code quality.

        For each of the 20 questions, provide:
        1. id (integer from 1 to 20)
        2. category (e.g. "TypeScript", "React", "Next.js", "Docker", "Git", "PostgreSQL", "Redis", "Projects & Experience", "Behavioral & System Design")
        3. technology (the specific tech e.g. "TypeScript", "Next.js", "Redis", "Fastcart Project", "TrustHub Project")
        4. difficulty ("Junior", "Mid", or "Senior")
        5. type ("technical", "system_design", or "behavioral")
        6. question (clear, direct, recruiter-grade question string IN {target_language.upper()})
        7. hint (practical guidance or angle to consider IN {target_language.upper()})
        8. key_points (array of 3 key concepts an answer must cover IN {target_language.upper()})

        Return raw JSON as a JSON array of 20 question objects matching the schema.
        """

        if not model:
            return AIAgentsService._mock_20_interview_questions(competencies, target_language, resume_content)

        try:
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            questions = json.loads(response.text.strip())
            if isinstance(questions, list) and len(questions) > 0:
                return questions
            return AIAgentsService._mock_20_interview_questions(competencies, target_language, resume_content)
        except Exception as e:
            print(f"Gemini API Error in generate_mock_interview_questions: {e}. Using language fallback...")
            return AIAgentsService._mock_20_interview_questions(competencies, target_language, resume_content)


    @staticmethod
    def _mock_20_interview_questions(
        competencies: Dict[str, List[str]], 
        target_language: str = "en",
        resume_content: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """Fallback generator producing 20 realistic technical and behavioral interview questions for CV competencies in the target language."""

        lang = (target_language or "en").lower()
        projects = resume_content.get("projects", []) if resume_content else []
        proj_names = ", ".join([p.get("name", "") for p in projects if p.get("name")])

        if lang == "tg":
            return [
                {
                    "id": 1,
                    "category": "TypeScript",
                    "technology": "TypeScript",
                    "difficulty": "Mid",
                    "type": "technical",
                    "question": "Фарқи байни `interface` ва `type` дар TypeScript чист? Дар кадом ҳолат шумо якеро нисбат ба дигаре дар лоиҳаи калони Next.js интихоб мекунед?",
                    "hint": "Ба муттаҳидсозии эълонҳо (declaration merging) ва типҳои union таваҷҷӯҳ кунед.",
                    "key_points": ["Declaration merging дар интерфейсҳо", "Алиасҳои тип барои union/tuple", "Extending интерфейсҳо vs intersection-и типҳо"]
                },
                {
                    "id": 2,
                    "category": "TypeScript",
                    "technology": "TypeScript",
                    "difficulty": "Senior",
                    "type": "technical",
                    "question": "Тангнамудани типҳо (type narrowing) бо union-ҳои дискриминантӣ дар TypeScript чӣ гуна кор мекунад ва предикатҳои тип (`is`) чӣ гуна аз хатогиҳо пешгирӣ мекунанд?",
                    "hint": "Дар бораи хусусиятҳои тег ва санҷишҳои фармоишӣ муҳокима кунед.",
                    "key_points": ["Хусусияти тег дар union-ҳои дискриминантӣ", "Синтаксиси предикати тип val is Type", "Санҷиши пуррагӣ бо калимаи never"]
                },
                {
                    "id": 3,
                    "category": "React",
                    "technology": "React",
                    "difficulty": "Mid",
                    "type": "technical",
                    "question": "Рендеринги Virtual DOM ва Fiber дар React 19/18 чӣ гуна кор мекунад ва чаро интиқоли объектҳои инлайнӣ ба ре-рендерҳои зиёдатӣ оварда мерасонад?",
                    "hint": "Дар бораи баробарии истинодҳо (Object.is) ва useCallback/useMemo фикр кунед.",
                    "key_points": ["Муқоисаи баробарии истинодҳо", "Алгоритми муқоисаи Virtual DOM", "Тавсияҳо барои useCallback ва useMemo"]
                },
                {
                    "id": 4,
                    "category": "React",
                    "technology": "React",
                    "difficulty": "Senior",
                    "type": "technical",
                    "question": "Хукҳои фармоишии React логикаи ҳолатро (state) чӣ гуна печонда мегиранд ва чӣ гуна аз басташавиҳои кӯҳнашуда (stale closures) дар `useEffect` пешгирӣ кардан мумкин аст?",
                    "hint": "Ба массивҳои вобастагӣ ва useRef таваҷҷӯҳ кунед.",
                    "key_points": ["Паттерни истифодаи муҷаддади хукҳо", "Феномени stale closure", "Объектҳои Ref дар муқобили сеттерҳои state"]
                },
                {
                    "id": 5,
                    "category": "Next.js",
                    "technology": "Next.js",
                    "difficulty": "Senior",
                    "type": "technical",
                    "question": "Фарқи байни Server Components (RSC) ва Client Components дар Next.js App Router чист? Кадом қоидаҳои серилизатсия ҳангоми гузаштани сарҳади 'use client' амал мекунанд?",
                    "hint": "Функсияҳо ва экземпляри классҳо наметавонанд аз сарҳади 'use client' гузаранд.",
                    "key_points": ["Ҳаҷми сифрии бандл дар сервер", "Директиваи сарҳадии 'use client'", "Маҳдудияти пропсҳои серилизатсияшаванда"]
                },
                {
                    "id": 6,
                    "category": "Next.js",
                    "technology": "Next.js",
                    "difficulty": "Mid",
                    "type": "technical",
                    "question": "Next.js регенератсияи статикии афзояндаро (ISR) чӣ гуна амалӣ мекунад? Ин аз SSR-и классикӣ чӣ фарқ дорад?",
                    "hint": "revalidateTag ва revalidatePath-ро муҳокима кунед.",
                    "key_points": ["Генератсияи заминавии саҳифаҳо", "Хукҳои ревалидатсия бо дархост", "Ҳамкори бо кэши CDN Edge"]
                },
                {
                    "id": 7,
                    "category": "PostgreSQL",
                    "technology": "PostgreSQL",
                    "difficulty": "Mid",
                    "type": "technical",
                    "question": "Фарқи байни индексҳои B-Tree, Hash ва GIN дар PostgreSQL чист ва чӣ гуна дархостҳои оҳистаро бо `EXPLAIN ANALYZE` таҳлил кардан мумкин аст?",
                    "hint": "Seq Scan ва Index Scan-ро муқоиса кунед.",
                    "key_points": ["B-Tree барои муқоисаи диапазонҳо", "GIN барои JSONB ва Ҷустуҷӯи матнӣ", "Таҳлили Seq Scan дар муқобили Index Scan"]
                },
                {
                    "id": 8,
                    "category": "PostgreSQL",
                    "technology": "PostgreSQL",
                    "difficulty": "Senior",
                    "type": "technical",
                    "question": "Хусусиятҳои ACID-ро дар транзаксияҳои PostgreSQL шарҳ диҳед. Сатҳҳои изолятсия чӣ гуна аз аномалияҳо пешгирӣ мекунанд?",
                    "hint": "Хониши ифлос, хониши такрорнашаванда ва фантомҳоро зикр кунед.",
                    "key_points": ["Атомарӣ, Мувофиқат, Изолятсия, Устуворӣ", "Бисёрверсиягии MVCC", "Хатогиҳои серилизатсияи Serializable"]
                },
                {
                    "id": 9,
                    "category": "Redis",
                    "technology": "Redis",
                    "difficulty": "Mid",
                    "type": "technical",
                    "question": "Кадом стратегияҳои кэшкунӣ (Cache-Aside, Write-Through) бо Redis истифода мешаванд ва кэшро чӣ гуна самаранок беэътибор (invalidate) кардан мумкин аст?",
                    "hint": "Вақти ҳаёт (TTL)-ро ба назар гиред.",
                    "key_points": ["Паттерни Cache-Aside", "Сиёсати интиҳои вақти TTL", "Пешгирии тармаи кэш"]
                },
                {
                    "id": 10,
                    "category": "Redis",
                    "technology": "Redis",
                    "difficulty": "Senior",
                    "type": "technical",
                    "question": "Redis ҳангоми расидан ба лимити хотира калидҳоро чӣ гуна хориҷ мекунад? Сиёсатҳои LRU ва LFU-ро муқоиса кунед.",
                    "hint": "Least Recently Used ва Least Frequently Used-ро муқоиса кунед.",
                    "key_points": ["Least Recently Used дар муқобили Least Frequently Used", "Алгоритми тахминии LRU", "Қоидаҳои хориҷкунии maxmemory"]
                },
                {
                    "id": 11,
                    "category": "Docker",
                    "technology": "Docker",
                    "difficulty": "Mid",
                    "type": "technical",
                    "question": "Чаро сохтори бисёрмарҳилагӣ (Multi-stage build) дар Docker барои лоиҳаҳои Next.js/Node.js зарур аст?",
                    "hint": "Тартиби COPY package.json пеш аз COPY .-ро ба назар гиред.",
                    "key_points": ["Ҷудокунии муҳити сохтмон ва продакшен", "Стратегияи кэшкунии қабатҳои Docker", "Кам кардани ҳаҷми образ"]
                },
                {
                    "id": 12,
                    "category": "Docker",
                    "technology": "Docker",
                    "difficulty": "Senior",
                    "type": "technical",
                    "question": "Шабакаҳои Docker Compose контейнерҳоро чӣ гуна ҷудо мекунанд? Пайвасткунии бехатари Next.js ба PostgreSQL ва Redis-ро шарҳ диҳед.",
                    "hint": "Номҳои хизматрасонӣ дар DNS ва шабакаҳои bridge.",
                    "key_points": ["Муайянкунии DNS дар шабакаи Bridge", "Вобастагии контейнерҳо depends_on", "Портҳои дохилӣ ва берунӣ"]
                },
                {
                    "id": 13,
                    "category": "Git",
                    "technology": "Git",
                    "difficulty": "Mid",
                    "type": "technical",
                    "question": "Фарқи байни `git rebase` ва `git merge` чист? Кай rebase барои шохаҳои умумӣ хавфнок аст?",
                    "hint": "Ба азнавнависии таърихи коммитҳо диққат диҳед.",
                    "key_points": ["Rebase гракаи хаттии коммитҳоро месозад", "Merge коммити пайвасткуниро месозад", "Манъи rebase дар шохаҳои умумӣ"]
                },
                {
                    "id": 14,
                    "category": "Git",
                    "technology": "Git",
                    "difficulty": "Senior",
                    "type": "technical",
                    "question": "Чӣ тавр коммитҳои гумшударо дар Git бо истифода аз `git reflog` ва `git cherry-pick` пас аз reset --hard барқарор кардан мумкин аст?",
                    "hint": "Журнали reflog ҳамаи ҳаракатҳои HEAD-ро пайгирӣ мекунад.",
                    "key_points": ["Журнали reflog барои тағйироти локалӣ", "Ҷустуҷӯи SHA коммитҳои ҷудошуда", "Истифодаи cherry-pick ё reset"]
                },
                {
                    "id": 15,
                    "category": "Behavioral & System Design",
                    "technology": "System Design",
                    "difficulty": "Senior",
                    "type": "system_design",
                    "question": f"Дар лоиҳаи шумо ({proj_names if proj_names else 'CV Projects'}): Шумо чӣ гуна архитектура ва идоракунии ҳолатро (state management) ташкил кардед?",
                    "hint": "Усули STAR-ро истифода баред.",
                    "key_points": ["Брокери паёмҳои Redis Pub/Sub", "Забти дастаҷамъӣ дар PostgreSQL", "Масштабкунии амудии WebSocket"]
                },
                {
                    "id": 16,
                    "category": "Behavioral & System Design",
                    "technology": "System Design",
                    "difficulty": "Mid",
                    "type": "system_design",
                    "question": "Утечкаи хотираро (memory leak) дар муҳити Node.js / React SSR чӣ гуна ташхис кардан мумкин аст?",
                    "hint": "Снимкаҳои куча (heap snapshots)-ро истифода баред.",
                    "key_points": ["Муқоисаи снимкаҳои куча дар Chrome DevTools", "Утечка аз слушательҳои пӯшиданашуда", "Мониторинги динамикаи хотира"]
                },
                {
                    "id": 17,
                    "category": "Behavioral & System Design",
                    "technology": "Behavioral",
                    "difficulty": "Mid",
                    "type": "behavioral",
                    "question": "Сатҳе, ки шумо бо тимлид дар бораи интихоби стек (масалан, ORM ва SQL-и тоза) норозигӣ доштед, тавсиф кунед. Ба чӣ хулоса омадед?",
                    "hint": "Усули STAR-ро истифода баред.",
                    "key_points": ["Метрикаҳои объективӣ ба ҷои фикрҳои шахсӣ", "Сохтани прототипҳои proof-of-concept", "Компромисси созанда дар команда"]
                },
                {
                    "id": 18,
                    "category": "Behavioral & System Design",
                    "technology": "Behavioral",
                    "difficulty": "Senior",
                    "type": "behavioral",
                    "question": "Дар бораи вайроншавии муҳими продакшен, ки шумо дар бартараф кардани он иштирок доштед, нақл кунед. Кадом қадамҳоро гузоштед?",
                    "hint": "Ба бартарафкунии зуд (откат) таваҷҷӯҳ кунед.",
                    "key_points": ["Бартарафкунии зуд ва откат", "Разбори пост-мортем", "Рӯйхати қадамҳо барои пешгирӣ"]
                },
                {
                    "id": 19,
                    "category": "Behavioral & System Design",
                    "technology": "TypeScript & React",
                    "difficulty": "Mid",
                    "type": "technical",
                    "question": "Чӣ тавр типизатсияи қатъиро ҳангоми интеграцияи API-ҳои беруна дар Next.js бо истифода аз валидатсияи Zod таъмин кардан мумкин аст?",
                    "hint": "JSON-и номаълумро дар вақти иҷро тафтиш кунед.",
                    "key_points": ["Валидатсия дар вақти иҷро бо z.parse()", "Баровардани типҳои TypeScript z.infer", "Коркарди хатогиҳои API"]
                },
                {
                    "id": 20,
                    "category": "Behavioral & System Design",
                    "technology": "Full Stack",
                    "difficulty": "Senior",
                    "type": "system_design",
                    "question": "Шумо ба рефакторинги коди кӯҳнаи JavaScript ба TypeScript-и қатъӣ ва Next.js App Router чӣ гуна муносибат мекунед?",
                    "hint": "Паттерни Strangler Fig-ро муҳокима кунед.",
                    "key_points": ["Паттерни мигратсияи Strangler Fig", "Интихоби тадриҷии флагҳои компилятсия", "Тесткунии автоматии регрессионӣ"]
                }
            ]

        if lang == "ru":
            return [
                {
                    "id": 1,
                    "category": "TypeScript",
                    "technology": "TypeScript",
                    "difficulty": "Mid",
                    "type": "technical",
                    "question": "Объясните разницу между `interface` и `type` в TypeScript. Когда вы строго выберете одно вместо другого в крупном React/Next.js проекте?",
                    "hint": "Сфокусируйтесь на объединении объявлений (declaration merging) и типах объединений (unions).",
                    "key_points": ["Declaration merging в интерфейсах", "Псевдонимы типов для union/tuple", "Extending интерфейсов vs пересечение типов"]
                },
                {
                    "id": 2,
                    "category": "TypeScript",
                    "technology": "TypeScript",
                    "difficulty": "Senior",
                    "type": "technical",
                    "question": "Как работает сужение типов (type narrowing) с дискриминантными объединениями в TypeScript и как предикаты типов (`is`) предотвращают сбои?",
                    "hint": "Обсудите свойства тегов и пользовательские проверки типов.",
                    "key_points": ["Свойство тега в дискриминантных объединениях", "Синтаксис предикатов типов val is Type", "Проверка исчерпываемости с помощью never"]
                },
                {
                    "id": 3,
                    "category": "React",
                    "technology": "React",
                    "difficulty": "Mid",
                    "type": "technical",
                    "question": "Как работает виртуальный DOM и Fiber в React 19/18, и почему передача инлайн-объектов вызывают лишние ререндеры?",
                    "hint": "Подумайте о ссылочном равенстве (Object.is) и хуках useCallback/useMemo.",
                    "key_points": ["Сравнение ссылочного равенства", "Алгоритм сравнения Virtual DOM", "Рекомендации по useCallback/useMemo"]
                },
                {
                    "id": 4,
                    "category": "React",
                    "technology": "React",
                    "difficulty": "Senior",
                    "type": "technical",
                    "question": "Как пользовательские хуки React инкапсулируют логику состояния без вложенности, и как предотвратить устаревшие замыкания (stale closures) в `useEffect`?",
                    "hint": "Обратите внимание на массивы зависимостей и useRef.",
                    "key_points": ["Паттерн повторного использования хуков", "Феномен stale closure", "Объекты Ref против сеттеров состояния"]
                },
                {
                    "id": 5,
                    "category": "Next.js",
                    "technology": "Next.js",
                    "difficulty": "Senior",
                    "type": "technical",
                    "question": "Сравните Server Components (RSC) и Client Components в Next.js App Router. Какие правила сериализации действуют при передаче пропсов?",
                    "hint": "Функции и экземпляры классов не могут пересекать границу 'use client'.",
                    "key_points": ["Нулевой размер бандла на сервере", "Директива границы 'use client'", "Ограничение сериализуемых пропсов"]
                },
                {
                    "id": 6,
                    "category": "Next.js",
                    "technology": "Next.js",
                    "difficulty": "Mid",
                    "type": "technical",
                    "question": "Как Next.js реализует инкрементную статическую регенерацию (ISR) и ревалидацию по запросу? Чем это отличается от классического SSR?",
                    "hint": "Обсудите revalidateTag, revalidatePath и заголовки кэша.",
                    "key_points": ["Фоновая генерация страниц", "Хуки ревалидации по запросу", "Взаимодействие с кэшем CDN Edge"]
                },
                {
                    "id": 7,
                    "category": "PostgreSQL",
                    "technology": "PostgreSQL",
                    "difficulty": "Mid",
                    "type": "technical",
                    "question": "В чем разница между индексами B-Tree, Hash и GIN в PostgreSQL, и как анализировать медленные запросы с помощью EXPLAIN ANALYZE?",
                    "hint": "Сравнивайте Seq Scan и Index Scan.",
                    "key_points": ["B-Tree для диапазонных сравнений", "GIN для JSONB и полнотекстового поиска", "Анализ Seq Scan против Index Scan"]
                },
                {
                    "id": 8,
                    "category": "PostgreSQL",
                    "technology": "PostgreSQL",
                    "difficulty": "Senior",
                    "type": "technical",
                    "question": "Объясните свойства ACID в транзакциях PostgreSQL. Как уровни изоляции (Read Committed, Serializable) предотвращают аномалии параллельного доступа?",
                    "hint": "Упомяните грязное чтение, неповторяющееся чтение и фантомные чтения.",
                    "key_points": ["Атомарность, Согласованность, Изолированность, Дурбельность", "Многоверсионность MVCC", "Ошибки сериализации Serializable"]
                },
                {
                    "id": 9,
                    "category": "Redis",
                    "technology": "Redis",
                    "difficulty": "Mid",
                    "type": "technical",
                    "question": "Какие стратегии кэширования (Cache-Aside, Write-Through) применяются с Redis и как эффективно обрабатывать инвалидацию кэша?",
                    "hint": "Учитывайте время жизни (TTL) и гонки данных.",
                    "key_points": ["Паттерн Cache-Aside", "Политики истечения срока TTL", "Предотвращение лавины кэша"]
                },
                {
                    "id": 10,
                    "category": "Redis",
                    "technology": "Redis",
                    "difficulty": "Senior",
                    "type": "technical",
                    "question": "Как Redis обрабатывает вытеснение ключей при достижении лимита памяти? Сравните политики LRU и LFU.",
                    "hint": "Сравните volatile-lru, allkeys-lru и volatile-lfu.",
                    "key_points": ["Least Recently Used против Least Frequently Used", "Алгоритм аппроксимированного LRU", "Правила вытеснения maxmemory"]
                },
                {
                    "id": 11,
                    "category": "Docker",
                    "technology": "Docker",
                    "difficulty": "Mid",
                    "type": "technical",
                    "question": "Почему многоэтапная сборка (Multi-stage build) в Docker необходима для деплоя Next.js/Node.js приложений в продакшен?",
                    "hint": "Порядок COPY package.json перед COPY . критичен для кэша.",
                    "key_points": ["Разделение среды сборки и продакшен тайма", "Стратегия кэширования слоев Docker", "Минимизация размера образа"]
                },
                {
                    "id": 12,
                    "category": "Docker",
                    "technology": "Docker",
                    "difficulty": "Senior",
                    "type": "technical",
                    "question": "Как сети Docker Compose изолируют контейнеры? Опишите процесс безопасного подключения Next.js к PostgreSQL и Redis.",
                    "hint": "DNS имена сервисов, приватные bridge сети и переменные окружения.",
                    "key_points": ["Разрешение DNS в сети Bridge", "Зависимости контейнеров depends_on", "Внутренние и внешние порты"]
                },
                {
                    "id": 13,
                    "category": "Git",
                    "technology": "Git",
                    "difficulty": "Mid",
                    "type": "technical",
                    "question": "В чем разница между `git rebase` и `git merge`? Когда перемещение (rebase) опасно для публичных веток?",
                    "hint": "Сфокусируйтесь на перезаписи истории коммитов.",
                    "key_points": ["Rebase создает линейный граф коммитов", "Merge создает коммит слияния", "Запрет rebase на публичных ветках"]
                },
                {
                    "id": 14,
                    "category": "Git",
                    "technology": "Git",
                    "difficulty": "Senior",
                    "type": "technical",
                    "question": "Как восстановить потерянные коммиты в Git с помощью `git reflog` и `git cherry-pick` после случайного `git reset --hard`?",
                    "hint": "Журнал reflog отслеживает все перемещения указателя HEAD.",
                    "key_points": ["Журнал reflog всех локальных изменений HEAD", "Поиск отсоединенных коммитов SHA", "Применение cherry-pick или сброс к указателю"]
                },
                {
                    "id": 15,
                    "category": "Behavioral & System Design",
                    "technology": "System Design",
                    "difficulty": "Senior",
                    "type": "system_design",
                    "question": f"В вашем проекте ({proj_names if proj_names else 'CV Projects'}): как вы проектировали архитектуру, управление состоянием и обработку ошибок при высокой нагрузке?",
                    "hint": "Примените метод STAR (Ситуация, Задача, Действие, Результат).",
                    "key_points": ["Redis Pub/Sub брокер сообщений", "Пакетная запись в PostgreSQL", "Горизонтальное масштабирование WebSocket"]
                },
                {
                    "id": 16,
                    "category": "Behavioral & System Design",
                    "technology": "System Design",
                    "difficulty": "Mid",
                    "type": "system_design",
                    "question": "Как диагностировать утечку памяти в Node.js / React SSR среде, вызывающую OOM аварии контейнера?",
                    "hint": "Используйте снимки кучи (heap snapshots) и ищите неотписанные слушатели событий.",
                    "key_points": ["Сравнение снимок кучи Chrome DevTools", "Утечки незакрытых слушателей событий", "Мониторинг динамики памяти под нагрузкой"]
                },
                {
                    "id": 17,
                    "category": "Behavioral & System Design",
                    "technology": "Behavioral",
                    "difficulty": "Mid",
                    "type": "behavioral",
                    "question": "Опишите ситуацию, когда вы были не согласны с тимлидом по поводу выбора стекa технологий (например, ORM против чистых SQL запросов). Как вы пришли к решению?",
                    "hint": "Используйте метод STAR (Ситуация, Задача, Действие, Результат).",
                    "key_points": ["Объективные метрики вместо личных мнений", "Создание прототипов proof-of-concept", "Конструктивный компромисс в команде"]
                },
                {
                    "id": 18,
                    "category": "Behavioral & System Design",
                    "technology": "Behavioral",
                    "difficulty": "Senior",
                    "type": "behavioral",
                    "question": "Расскажите о критическом сбое на продакшене, в ликвидации которого вы участвовали. Какие шаги вы предприняли и как провели разбор полетов (post-mortem)?",
                    "hint": "Сфокусируйтесь на быстрой ликвидации (откат/failover) перед поиском первопричины.",
                    "key_points": ["Быстрая ликвидация и откат", "Безразличный пост-мортем разбор", "Список действий для предотвращения регрессий"]
                },
                {
                    "id": 19,
                    "category": "Behavioral & System Design",
                    "technology": "TypeScript & React",
                    "difficulty": "Mid",
                    "type": "technical",
                    "question": "Как обеспечить строгую типизацию при интеграции сторонних REST/GraphQL API в Next.js с помощью валидации Zod?",
                    "hint": "Проверяйте неизвестный JSON во время выполнения для вывода типов TypeScript.",
                    "key_points": ["Валидация во время выполнения с z.parse()", "Вывод типов TypeScript z.infer", "Обработка ошибок несоответствия схемы API"]
                },
                {
                    "id": 20,
                    "category": "Behavioral & System Design",
                    "technology": "Full Stack",
                    "difficulty": "Senior",
                    "type": "system_design",
                    "question": "Как вы подходите к рефакторингу унаследованного JavaScript кода на строгий TypeScript, Next.js App Router и контейнеры Docker без остановки разработки фич?",
                    "hint": "Обсудите паттерн Strangler Fig (удушающее дерево) и инкрементальные флаги компилятора.",
                    "key_points": ["Паттерн миграции Strangler Fig", "Постепенное включение флагов компиляции TypeScript", "Автоматизированное регрессионное тестирование"]
                }
            ]

        # English Default
        return [
            {
                "id": 1,
                "category": "TypeScript",
                "technology": "TypeScript",
                "difficulty": "Mid",
                "type": "technical",
                "question": "Explain the difference between `interface` and `type` aliases in TypeScript. When would you strictly choose one over the other in a large React/Next.js codebase?",
                "hint": "Consider declaration merging, union types, and performance in compiler resolution.",
                "key_points": ["Declaration merging in interfaces", "Type aliases support unions/tuples", "Extending interfaces vs intersecting types"]
            },
            {
                "id": 2,
                "category": "TypeScript",
                "technology": "TypeScript",
                "difficulty": "Senior",
                "type": "technical",
                "question": "How does TypeScript perform type narrowing with discriminated unions, and how can custom type predicates (`is` keyword) prevent runtime crashes?",
                "hint": "Discuss tag properties and user-defined type guards.",
                "key_points": ["Discriminated union property tag", "Custom type predicate syntax `val is Type`", "Exhaustiveness checking with `never`"]
            },
            {
                "id": 3,
                "category": "React",
                "technology": "React",
                "difficulty": "Mid",
                "type": "technical",
                "question": "How does React 19 / 18 fiber reconciliation work, and what causes unnecessary re-renders when passing inline object or function props?",
                "hint": "Think about reference equality (Object.is) and memoization primitives like `useCallback` / `useMemo`.",
                "key_points": ["Referential equality comparisons", "Virtual DOM diffing algorithm", "useCallback/useMemo usage guidelines"]
            },
            {
                "id": 4,
                "category": "React",
                "technology": "React",
                "difficulty": "Senior",
                "type": "technical",
                "question": "Explain how React Custom Hooks encapsulate stateful logic without introducing hierarchy nesting. How do you prevent stale closures inside `useEffect` or callbacks?",
                "hint": "Focus on dependency arrays, `useRef` for persistent mutable references, and state updater functions.",
                "key_points": ["Custom hooks reusability pattern", "Stale closure phenomenon", "Ref objects vs state setters"]
            },
            {
                "id": 5,
                "category": "Next.js",
                "technology": "Next.js",
                "difficulty": "Senior",
                "type": "technical",
                "question": "Compare Server Components (RSC) and Client Components in Next.js App Router. What serialization rules govern data passing across the server-client boundary?",
                "hint": "Remember functions and class instances cannot cross boundary props.",
                "key_points": ["Server-side zero bundle size", "'use client' boundary directive", "Serializable props constraint"]
            },
            {
                "id": 6,
                "category": "Next.js",
                "technology": "Next.js",
                "difficulty": "Mid",
                "type": "technical",
                "question": "How does Next.js implement Incremental Static Regeneration (ISR) and On-Demand Revalidation? How does it differ from traditional SSR?",
                "hint": "Discuss `revalidateTag`, `revalidatePath`, and cache headers.",
                "key_points": ["Background page generation", "On-demand revalidation hooks", "CDN edge caching interaction"]
            },
            {
                "id": 7,
                "category": "PostgreSQL",
                "technology": "PostgreSQL",
                "difficulty": "Mid",
                "type": "technical",
                "question": "What is the difference between B-Tree, Hash, and GIN indexes in PostgreSQL, and how do you diagnose slow queries using `EXPLAIN ANALYZE`?",
                "hint": "Look out for Sequential Scans vs Index Scans and Execution Time vs Planning Time.",
                "key_points": ["B-Tree for range comparisons", "GIN for JSONB/Full-text search", "Reading Seq Scan vs Index Scan in EXPLAIN"]
            },
            {
                "id": 8,
                "category": "PostgreSQL",
                "technology": "PostgreSQL",
                "difficulty": "Senior",
                "type": "technical",
                "question": "Explain ACID properties in PostgreSQL transactions. How do isolation levels (Read Committed vs Serializable) handle concurrent update anomalies?",
                "hint": "Mention Dirty Reads, Non-repeatability, and Phantom Reads.",
                "key_points": ["Atomicity, Consistency, Isolation, Durability", "Multiversion Concurrency Control (MVCC)", "Serializable isolation serialization failures"]
            },
            {
                "id": 9,
                "category": "Redis",
                "technology": "Redis",
                "difficulty": "Mid",
                "type": "technical",
                "question": "What caching strategies (Cache-Aside, Write-Through, Write-Behind) can be implemented with Redis, and how do you handle cache invalidation?",
                "hint": "Consider TTL (Time-to-Live) settings and race conditions.",
                "key_points": ["Cache-Aside pattern read flow", "TTL expiration policies", "Cache stampede mitigation"]
            },
            {
                "id": 10,
                "category": "Redis",
                "technology": "Redis",
                "difficulty": "Senior",
                "type": "technical",
                "question": "How does Redis handle key eviction when memory memory max limit is reached? Contrast all LRU and LFU eviction policies.",
                "hint": "Think volatile-lru, allkeys-lru vs volatile-lfu.",
                "key_points": ["Least Recently Used vs Least Frequently Used", "Approximated LRU sampling algorithm", "Maxmemory eviction rules"]
            },
            {
                "id": 11,
                "category": "Docker",
                "technology": "Docker",
                "difficulty": "Mid",
                "type": "technical",
                "question": "Why are Docker Multi-Stage builds essential for Next.js / Node.js production deployments, and how do layer caching rules speed up CI/CD pipelines?",
                "hint": "Ordering of `COPY package.json` before `COPY .`",
                "key_points": ["Separating build environment from production runtime", "Docker image layer caching strategy", "Minimizing attack surface and image size"]
            },
            {
                "id": 12,
                "category": "Docker",
                "technology": "Docker",
                "difficulty": "Senior",
                "type": "technical",
                "question": "How do Docker Compose networks isolate containers? Describe how a Next.js service connects to PostgreSQL and Redis containers securely.",
                "hint": "DNS alias service names, private bridge networks, and environment variables.",
                "key_points": ["Bridge network DNS resolution", "Container dependency `depends_on` and health checks", "Exposing ports internally vs externally"]
            },
            {
                "id": 13,
                "category": "Git",
                "technology": "Git",
                "difficulty": "Mid",
                "type": "technical",
                "question": "What is the difference between `git rebase` and `git merge`? When is rebasing dangerous for shared feature branches?",
                "hint": "Focus on rewriting commit hash history.",
                "key_points": ["Rebase creates linear commit graph", "Merge creates explicit merge commits", "Never rebase public shared branches"]
            },
            {
                "id": 14,
                "category": "Git",
                "technology": "Git",
                "difficulty": "Senior",
                "type": "technical",
                "question": "How do you recover lost commits in Git using `git reflog` and `git cherry-pick` after an accidental `git reset --hard`?",
                "hint": "Reference log tracking of HEAD movements.",
                "key_points": ["Reflog records all local HEAD changes", "Finding detached commit SHA hashes", "Cherry-picking or resetting back to reflog pointer"]
            },
            {
                "id": 15,
                "category": "Behavioral & System Design",
                "technology": "System Design",
                "difficulty": "Senior",
                "type": "system_design",
                "question": f"In your CV project ({proj_names if proj_names else 'CV Projects'}): How did you architect the state management, API integration, and performance optimization?",
                "hint": "Address connection pooling, pub/sub message fanout, and database write batching.",
                "key_points": ["Redis Pub/Sub message broker", "PostgreSQL write buffer batching", "Horizontal scaling of WebSocket state nodes"]
            },
            {
                "id": 16,
                "category": "Behavioral & System Design",
                "technology": "System Design",
                "difficulty": "Mid",
                "type": "system_design",
                "question": "How would you diagnose a memory leak in a Node.js / React server rendering environment causing container out-of-memory (OOM) crashes?",
                "hint": "Discuss heap snapshots, event listeners, and global variable leakage.",
                "key_points": ["Chrome DevTools heap snapshot comparison", "Uncleaned event listeners or subscriptions", "Monitoring memory growth trends under load"]
            },
            {
                "id": 17,
                "category": "Behavioral & System Design",
                "technology": "Behavioral",
                "difficulty": "Mid",
                "type": "behavioral",
                "question": "Describe a scenario where you disagreed with a team lead or architect regarding technical stack choice (e.g. ORM vs raw PostgreSQL SQL or Next.js vs SPA). How did you resolve it?",
                "hint": "Use the STAR method (Situation, Task, Action, Result) focusing on benchmarks and objective reasoning.",
                "key_points": ["Objective metrics over subjective opinion", "Prototyping proof-of-concepts", "Constructive team compromise"]
            },
            {
                "id": 18,
                "category": "Behavioral & System Design",
                "technology": "Behavioral",
                "difficulty": "Senior",
                "type": "behavioral",
                "question": "Tell me about a critical production issue or outage you responded to. What steps did you take during the incident, and how did you conduct the post-mortem?",
                "hint": "Focus on immediate mitigation (rollback/failover) before root-cause analysis.",
                "key_points": ["Triage and rapid mitigation", "Blameless post-mortem analysis", "Action items to prevent regression"]
            },
            {
                "id": 19,
                "category": "Behavioral & System Design",
                "technology": "TypeScript & React",
                "difficulty": "Mid",
                "type": "technical",
                "question": "How do you ensure strict type safety when integrating third-party REST/GraphQL APIs with Next.js using Zod schema validation?",
                "hint": "Validate unknown JSON data at runtime to infer TypeScript types.",
                "key_points": ["Runtime parsing with `z.parse()`", "TypeScript `z.infer<typeof Schema>`", "Handling API schema mismatch errors gracefully"]
            },
            {
                "id": 20,
                "category": "Behavioral & System Design",
                "technology": "Full Stack",
                "difficulty": "Senior",
                "type": "system_design",
                "question": "How do you approach refactoring a legacy JavaScript code base to strict TypeScript, Next.js App Router, and Dockerized microservices without stopping new feature delivery?",
                "hint": "Discuss Strangler Fig pattern, incremental strictness (`allowJs`), and modular component migration.",
                "key_points": ["Strangler Fig migration pattern", "Gradual TypeScript compilation flags", "Automated regression testing during refactoring"]
            }
        ]

    @staticmethod
    async def evaluate_mock_interview(
        questions: List[Dict[str, Any]],
        answers: List[Dict[str, Any]],
        competencies: Dict[str, List[str]] = None,
        target_language: str = "en"
    ) -> Dict[str, Any]:
        """Mock Interview Agent: Evaluates candidate responses to all 20 questions in the chosen language, returning score, weak spots, model answers, and chart metrics."""
        model = AIAgentsService._get_model()

        lang_instructions = {
            "ru": "Output ALL feedback, verdict, weaknesses, model_answer, and practice_recommendations strictly in RUSSIAN (на русском языке).",
            "tg": "Output ALL feedback, verdict, weaknesses, model_answer, and practice_recommendations strictly in TAJIK (бо забони тоҷикӣ).",
            "de": "Output ALL feedback, verdict, weaknesses, model_answer, and practice_recommendations strictly in GERMAN (auf Deutsch).",
            "en": "Output ALL feedback, verdict, weaknesses, model_answer, and practice_recommendations in ENGLISH."
        }.get(target_language.lower(), "Output in ENGLISH.")

        prompt = f"""
        You are a Senior Principal Technical Evaluator grading a candidate's Mock Interview.
        Language Constraint: {lang_instructions}
        
        Questions and Candidate Answers:
        {json.dumps({"questions": questions, "answers": answers}, indent=2)}
        
        Task:
        Analyze each of the candidate's answers against recruiter expectations.
        Grade every single question from 1 to 20:
        - "status": "correct" (score 8-10), "partial" (score 4-7), or "incorrect" (score 0-3 / blank)
        - "score": integer 0-10
        - "feedback": detailed feedback IN {target_language.upper()} on what was good, missing, or incorrect in candidate's answer
        - "model_answer": comprehensive ideal recruiter answer IN {target_language.upper()}
        
        Provide overall diagnostic metrics IN {target_language.upper()}:
        - overall_score: 0-100%
        - verdict: clear title (e.g. "Senior Full Stack Ready", "Strong Frontend / Needs Database Depth") IN {target_language.upper()}
        - total_correct: count of correct answers
        - total_partially_correct: count of partial answers
        - total_incorrect: count of incorrect/blank answers
        - tech_breakdown: object mapping each technology to percentage score 0-100
        - weaknesses: array of 3-5 specific weak points where candidate struggled ("What in person is bad / needs practice") IN {target_language.upper()}
        - practice_recommendations: array of 4 clear, actionable study steps IN {target_language.upper()}
        
        Return raw JSON matching the schema.
        """

        if not model:
            return AIAgentsService._mock_evaluate_answers(questions, answers, target_language)

        try:
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            data = json.loads(response.text.strip())
            return data
        except Exception as e:
            print(f"Gemini API Error in evaluate_mock_interview: {e}. Using intelligent fallback evaluator...")
            return AIAgentsService._mock_evaluate_answers(questions, answers, target_language)


    @staticmethod
    def _mock_evaluate_answers(questions: List[Dict[str, Any]], answers: List[Dict[str, Any]], target_language: str = "en") -> Dict[str, Any]:
        """Intelligent fallback evaluator that computes realistic scores, feedback, weak spot diagnostics, and chart metrics in target language."""

        answers_map = {a.get("question_id"): a.get("candidate_answer", "").strip() for a in answers}
        
        evaluations = []
        tech_scores = {}
        tech_counts = {}
        
        total_correct = 0
        total_partial = 0
        total_incorrect = 0
        
        weaknesses = []
        
        for q in questions:
            q_id = q.get("id")
            tech = q.get("technology", q.get("category", "General"))
            user_ans = answers_map.get(q_id, "")
            ans_len = len(user_ans)
            
            if tech not in tech_scores:
                tech_scores[tech] = 0
                tech_counts[tech] = 0
            tech_counts[tech] += 1
            
            # Simple heuristic grading based on answer depth and key point coverage
            key_pts = q.get("key_points", [])
            matched_pts = sum(1 for pt in key_pts if any(word.lower() in user_ans.lower() for word in pt.split() if len(word) > 3))
            
            if ans_len > 120 or matched_pts >= 2:
                status = "correct"
                score = min(10, 8 + matched_pts)
                total_correct += 1
                fb = f"Excellent answer! You effectively covered key concepts including {', '.join(key_pts[:2])}. Response demonstrates clear production experience."
            elif ans_len > 30 or matched_pts >= 1:
                status = "partial"
                score = 5 + matched_pts
                total_partial += 1
                fb = f"Good initial direction, but lacks technical depth. Be sure to explicitly mention {key_pts[-1] if key_pts else 'underlying architecture mechanics'}."
                if len(weaknesses) < 4:
                    weaknesses.append(f"{tech}: Deepen knowledge on {key_pts[0] if key_pts else q.get('question')[:40]}")
            else:
                status = "incorrect"
                score = 2 if ans_len > 0 else 0
                total_incorrect += 1
                fb = "Answer was incomplete or skipped. Recruiters look for precise architectural explanations with concrete trade-offs."
                if len(weaknesses) < 4:
                    weaknesses.append(f"{tech}: In-depth technical practice required for {q.get('category')} concepts.")
            
            tech_scores[tech] += score * 10
            
            # Recruiter model answer
            model_ans = f"A top candidate would explain: 1) {key_pts[0] if len(key_pts)>0 else 'Core fundamentals'}, 2) {key_pts[1] if len(key_pts)>1 else 'Real-world application'}, and 3) {key_pts[2] if len(key_pts)>2 else 'Performance trade-offs'}. Example: In production, we optimize this by..."
            
            evaluations.append({
                "question_id": q_id,
                "question": q.get("question"),
                "category": q.get("category"),
                "technology": tech,
                "candidate_answer": user_ans if user_ans else "[No answer provided]",
                "status": status,
                "score": score,
                "feedback": fb,
                "model_answer": model_ans
            })
            
        overall_pct = int(sum(e["score"] for e in evaluations) / max(1, len(evaluations)) * 10)
        
        # Calculate tech breakdown percentages
        tech_breakdown = {}
        for t, total in tech_scores.items():
            count = tech_counts[t]
            tech_breakdown[t] = min(100, int(total / max(1, count)))
            
        if not weaknesses:
            weaknesses = [
                "PostgreSQL: EXPLAIN ANALYZE execution tree reading and index types (GIN vs B-Tree)",
                "Redis: Cache eviction policies (volatile-lru vs allkeys-lfu) and TTL expiration handling",
                "Next.js: Server Components serialization boundaries when passing dynamic functions"
            ]

        verdict = "Pass - Outstanding Senior Engineer Grade" if overall_pct >= 80 else ("Mid-Level Ready - Needs Database/Tools Practice" if overall_pct >= 60 else "Requires Practice - Review Core Technologies")

        return {
            "overall_score": overall_pct,
            "verdict": verdict,
            "total_correct": total_correct,
            "total_partially_correct": total_partial,
            "total_incorrect": total_incorrect,
            "evaluations": evaluations,
            "tech_breakdown": tech_breakdown,
            "weaknesses": weaknesses,
            "practice_recommendations": [
                "Practice answering technical questions aloud using the STAR method (Situation, Task, Action, Result).",
                "Review PostgreSQL execution plans and index selection for high write volume tables.",
                "Implement a distributed Redis caching layer with fallback strategy in Next.js/Node.js.",
                "Re-test yourself on Docker layer caching and multi-stage container optimization."
            ],
            "chart_data": {
                "accuracy_distribution": [
                    {"label": "Correct", "count": total_correct, "color": "#10B981"},
                    {"label": "Partially Correct", "count": total_partial, "color": "#F59E0B"},
                    {"label": "Needs Practice", "count": total_incorrect, "color": "#EF4444"}
                ]
            }
        }

