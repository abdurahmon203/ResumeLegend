export interface User {
  id: string;
  github_id?: string;
  username: string;
  email?: string;
  avatar_url?: string;
  created_at?: string;
  plan?: 'free' | 'pro' | 'ultra';
}

export interface AIAnalysis {
  role: string;
  technologies: string[];
  complexity: 'Low' | 'Medium' | 'High' | 'Expert';
  summary: string;
  achievements: string[];
}

export interface Repository {
  id: string;
  github_repo_id?: number;
  name: string;
  github_url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  is_sync_active: boolean;
  ai_analysis: AIAnalysis | null;
}

export interface PersonalInfo {
  fullName: string;
  desiredPosition: string;
  experienceYears: number;
  location: string;
  email: string;
  phone: string;
  website?: string;
  githubUrl?: string;
  linkedIn?: string;
  instagram?: string;
  telegram?: string;
  twitter?: string;
  facebook?: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  role: string;
  technologies: string[];
  description: string;
  stars?: number;
  githubUrl?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string; // "Present" or date
  description: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface SpokenLanguage {
  id: string;
  language: string;
  proficiency: string; // e.g. "Native / Fully", "Fluent / Normal", "Intermediate (B1-B2)"
}

export interface AchievementItem {
  id?: string;
  title: string;
  certificateUrl?: string;
}

export interface ResumeContent {
  personal_info: PersonalInfo;
  summary: string;
  skills: SkillCategory[];
  experience: WorkExperience[];
  projects: ResumeProject[];
  education: Education[];
  achievements: (string | AchievementItem)[];
  spoken_languages?: SpokenLanguage[];
  pdf_data?: string;
  is_resolved?: boolean;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  template_name: 'developer' | 'minimal' | 'modern' | 'classic';
  share_slug: string;
  is_public: boolean;
  content: ResumeContent;
  created_at: string;
  updated_at: string;
}

export interface AIReviewRecommendation {
  section: string;
  critique: string;
  suggestion: string;
}

export interface AIReviewResponse {
  score: number;
  recommendations: AIReviewRecommendation[];
}

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = rawApiUrl.includes('localhost:8000') 
  ? rawApiUrl 
  : (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`);

// Helper to get JWT headers
const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// Check if backend is running (simple ping)
let backendActive: boolean | null = null;
async function isBackendActive(): Promise<boolean> {
  if (backendActive !== null) return backendActive;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, { method: 'GET', signal: AbortSignal.timeout(1000) });
    backendActive = res.status !== 502 && res.status !== 503;
    return backendActive;
  } catch (e) {
    backendActive = false;
    return false;
  }
}

// ----------------------------------------------------
// Mock Data Generators for Offline Testing
// ----------------------------------------------------
const mockUser: User = {
  id: 'user-uuid-1234',
  github_id: '123456',
  username: 'rivera-dev',
  email: 'arivera.dev@email.com',
  avatar_url: 'https://avatars.githubusercontent.com/u/123456?v=4',
  plan: 'free',
};

const mockRepos: Repository[] = [
  {
    id: 'repo-1',
    name: 'nexus-ui-framework',
    github_url: 'https://github.com/rivera-dev/nexus-ui-framework',
    description: 'A high-performance design system for enterprise applications built with React and Tailwind CSS.',
    language: 'TypeScript',
    stars: 948,
    forks: 142,
    is_sync_active: true,
    ai_analysis: {
      role: 'Lead Architect',
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Radix Primitives'],
      complexity: 'High',
      summary: 'Architected the core framework and layout structures. Reduced render passes by 30% using optimized context structures.',
      achievements: [
        'Created 20+ accessible primitives compliant with WAI-ARIA guidelines.',
        'Documented full API reference which grew adoption to 10k+ active internal developers.'
      ]
    }
  },
  {
    id: 'repo-2',
    name: 'rust-wasm-engine',
    github_url: 'https://github.com/rivera-dev/rust-wasm-engine',
    description: 'Real-time image processing engine built with Rust and compiled to WebAssembly for browser integrations.',
    language: 'Rust',
    stars: 312,
    forks: 34,
    is_sync_active: true,
    ai_analysis: {
      role: 'Core Systems Developer',
      technologies: ['Rust', 'WebAssembly', 'JavaScript', 'Canvas API'],
      complexity: 'Expert',
      summary: 'Engineered high-frequency image editing filters running in-browser using compiled Rust wasm-bindgen structures.',
      achievements: [
        'Achieved sub-16ms render times for full-HD resolution filters.',
        'Wrote custom parallel processing channels using Web Workers.'
      ]
    }
  },
  {
    id: 'repo-3',
    name: 'django-auth-server',
    github_url: 'https://github.com/rivera-dev/django-auth-server',
    description: 'OAuth 2.0 provider and session manager containerized with Docker.',
    language: 'Python',
    stars: 42,
    forks: 12,
    is_sync_active: false,
    ai_analysis: {
      role: 'Backend Developer',
      technologies: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Redis'],
      complexity: 'Medium',
      summary: 'Developed a robust authentication portal serving session states over secure HTTPS interfaces.',
      achievements: [
        'Integrated multi-factor auth schemes via PyOTP.',
        'Built full Docker Compose setup supporting instant dev stack orchestration.'
      ]
    }
  }
];

const mockResumes: Resume[] = [
  {
    id: 'resume-1',
    user_id: 'user-uuid-1234',
    title: 'Senior Frontend Engineer 2024',
    template_name: 'developer',
    share_slug: 'alex-rivera-cv',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    content: {
      personal_info: {
        fullName: 'ALEX RIVERA',
        desiredPosition: 'SENIOR FRONTEND ENGINEER',
        experienceYears: 8,
        location: 'San Francisco, CA',
        email: 'arivera.dev@email.com',
        phone: '+1 (555) 019-2834',
        website: 'arivera.dev',
        githubUrl: typeof window !== 'undefined' ? ('github.com/' + (JSON.parse(localStorage.getItem('user') || '{}').username || 'rivera-dev')) : 'github.com/rivera-dev',
        linkedIn: 'linkedin.com/in/rivera-dev'
      },
      summary: 'Innovative Senior Frontend Engineer with 8+ years of experience building scalable web applications. Expert in React, TypeScript, and modern UI architectures. Proven track record of optimizing performance and leading cross-functional developer teams to deliver high-impact digital products.',
      skills: [
        { category: 'Languages', skills: ['TypeScript', 'JavaScript (ES6+)', 'Rust', 'HTML5/CSS3'] },
        { category: 'Frameworks', skills: ['React', 'Next.js', 'Vue.js', 'Node.js'] },
        { category: 'Libraries & Tools', skills: ['Tailwind CSS', 'GraphQL', 'WebAssembly', 'Webpack', 'Vite', 'Git', 'Docker'] }
      ],
      experience: [
        {
          id: 'exp-1',
          company: 'TECHFLOW SOLUTIONS',
          position: 'Lead Frontend Engineer',
          startDate: '2021',
          endDate: 'Present',
          description: [
            'Architected the migration of a legacy monolithic app to micro-frontends using Module Federation.',
            'Reduced TTI (Time to Interactive) by 45% through aggressive code-splitting and asset optimization.',
            'Mentored a team of 6 engineers, establishing core coding standards and CI/CD best practices.'
          ]
        },
        {
          id: 'exp-2',
          company: 'QUANTUM DATA SYSTEMS',
          position: 'Senior Software Engineer',
          startDate: '2018',
          endDate: '2021',
          description: [
            'Developed a real-time data visualization dashboard handling 100k+ concurrent websocket events.',
            'Engineered a custom internal component library used by 50+ developers across the company.'
          ]
        }
      ],
      projects: [
        {
          id: 'proj-1',
          name: 'nexus-ui-framework',
          role: 'Lead Architect',
          technologies: ['React', 'TypeScript', 'Tailwind CSS'],
          description: 'Enterprise-grade design system and layout repository. Used by 10k+ developers. (948 ★)',
          stars: 948,
          githubUrl: 'https://github.com/rivera-dev/nexus-ui-framework'
        },
        {
          id: 'proj-2',
          name: 'rust-wasm-engine',
          role: 'Core Systems Developer',
          technologies: ['Rust', 'WebAssembly', 'Canvas API'],
          description: 'High performance real-time image processing in modern browsers. (312 ★)',
          stars: 312,
          githubUrl: 'https://github.com/rivera-dev/rust-wasm-engine'
        }
      ],
      education: [
        {
          id: 'edu-1',
          institution: 'University of California, Berkeley',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startDate: '2014',
          endDate: '2018'
        }
      ],
      achievements: [
        {
          id: 'ach-1',
          title: 'Acquired over 1,200 combined stars on GitHub open source contributions.',
          certificateUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'ach-2',
          title: 'Speaker at React Global Summit 2023 on Micro-frontend Architectures.',
          certificateUrl: ''
        }
      ],
      spoken_languages: [
        { id: 'lang-1', language: 'Tajik', proficiency: 'Native / Fully' },
        { id: 'lang-2', language: 'Russian', proficiency: 'Fluent / Normal' },
        { id: 'lang-3', language: 'English', proficiency: 'Intermediate (B1-B2)' }
      ]
    }
  }
];

const mockReview: AIReviewResponse = {
  score: 94,
  recommendations: [
    {
      section: 'Professional Summary',
      critique: 'Very solid, but lacks a metric highlighting leadership scope.',
      suggestion: 'Incorporate reference to the team sizes you led at TechFlow (e.g., "leading cross-functional teams of 6+ engineers").'
    },
    {
      section: 'Experience (TechFlow)',
      critique: 'TTI metric is great, but could mention the stack used for this optimization.',
      suggestion: 'Rephrase to: "Reduced TTI by 45% using Next.js ISR and Edge Middleware."'
    },
    {
      section: 'Skills',
      critique: 'Missing Kubernetes. You have Docker listed but in modern infrastructure, orchestrators are highly searched.',
      suggestion: 'Add "Kubernetes" or "AWS ECS" to your Tools section if you have basic exposure.'
    }
  ]
};

function getRepoDescriptionHelper(name: string, fallbackDesc?: string, lang: string = 'en'): { role: string; technologies: string[]; description: string } {
  const cleanName = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (cleanName.includes("noyer")) {
    if (lang === 'ru') {
      return {
        role: "Ведущий ИИ-инженер и автор",
        technologies: ["Dart", "Flutter", "AI / LLM Integrations", "JWT Auth", "Git"],
        description: "Разработал NoYeR-Ai-Asisstant — кроссплатформенное мобильное ИИ-приложение на Dart & Flutter. Внедрил панели аналитики с интерактивными графиками, обработку запросов в реальном времени и JWT-авторизацию."
      };
    } else if (lang === 'tg') {
      return {
        role: "Муҳандиси пешбари зеҳни сунъӣ",
        technologies: ["Dart", "Flutter", "AI / LLM Integrations", "JWT Auth", "Git"],
        description: "Сохтани NoYeR-Ai-Asisstant — замимаи мобилии кроссплатформавии зеҳни сунъӣ дар Dart & Flutter. Ворид намудани панелҳои таҳлилии клиентӣ бо диаграммаҳои интерактивӣ ва аутентификатсияи амни JWT."
      };
    } else if (lang === 'de') {
      return {
        role: "Leitender KI-Entwickler",
        technologies: ["Dart", "Flutter", "AI / LLM Integrations", "JWT Auth", "Git"],
        description: "Entwicklung von NoYeR-Ai-Asisstant, einer plattformübergreifenden mobilen KI-Assistenten-App mit Dart & Flutter. Implementierung interaktiver Telemetrie-Dashboards und sicherer JWT-Authentifizierung."
      };
    } else {
      return {
        role: "Lead AI Engineer & Author",
        technologies: ["Dart", "Flutter", "AI / LLM Integrations", "JWT Auth", "Git"],
        description: "Engineered NoYeR-Ai-Asisstant, a cross-platform mobile AI assistant app using Dart & Flutter. Implemented client-side analytics dashboards with interactive telemetry charts, real-time prompt response pipelines, and secure JWT authentication."
      };
    }
  }

  if (cleanName.includes("bozorakbackend") || cleanName.includes("bozorakback")) {
    if (lang === 'ru') {
      return {
        role: "Бэкенд-архитектор и API-лид",
        technologies: ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "Redis", "JWT Auth", "Docker"],
        description: "Разработал bozorakbackend — высокопроизводительный RESTful e-commerce сервер. Спроектировал схемы БД для каталогов товаров, управления запасами, OAuth2/JWT и кэширования Redis."
      };
    } else if (lang === 'tg') {
      return {
        role: "Меъмори бэкенд ва роҳбари API",
        technologies: ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "Redis", "JWT Auth", "Docker"],
        description: "Сохтани bozorakbackend — сервери баландсамараи RESTful e-commerce API. Лоиҳакашии схемаҳои пойгоҳи додаҳо барои каталоги маҳсулот, идоракунии захираҳо ва кэшкунии Redis."
      };
    } else if (lang === 'de') {
      return {
        role: "Backend-Architekt",
        technologies: ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "Redis", "JWT Auth", "Docker"],
        description: "Entwicklung von bozorakbackend, einem hochperformanten E-Commerce-REST-Server. Entwurf von Datenbank-Schemas für Produktkataloge, Inventarverwaltung und Redis-Caching."
      };
    } else {
      return {
        role: "Backend Architect & API Lead",
        technologies: ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "Redis", "JWT Auth", "Docker"],
        description: "Developed bozorakbackend, a high-throughput RESTful e-commerce API server. Designed database schemas for multi-vendor product catalogs, inventory management, OAuth2/JWT auth, and Redis query caching."
      };
    }
  }

  if (cleanName.includes("bozorak")) {
    if (lang === 'ru') {
      return {
        role: "Фуллстек-разработчик и UI-лид",
        technologies: ["React", "Next.js", "TypeScript", "TailwindCSS", "REST API", "Payment Gateway"],
        description: "Спроектировал Bozorak — современный маркетплейс электронной коммерции. Внедрил фильтрацию каталогов, интерактивную корзину покупок, отзывы клиентов и отслеживание заказов."
      };
    } else if (lang === 'tg') {
      return {
        role: "Таҳиягари Фуллстек ва роҳбари UI",
        technologies: ["React", "Next.js", "TypeScript", "TailwindCSS", "REST API", "Payment Gateway"],
        description: "Лоиҳакашии Bozorak — маркетплейси муосири тиҷорати электронӣ. Ворид кардани филтркунии каталогҳо, сабади харид, шарҳи мизоҷон ва пайгирии фармоишҳо."
      };
    } else if (lang === 'de') {
      return {
        role: "Fullstack-Entwickler",
        technologies: ["React", "Next.js", "TypeScript", "TailwindCSS", "REST API", "Payment Gateway"],
        description: "Entwicklung von Bozorak, einem modernen E-Commerce-Marktplatz. Implementierung von Produktfiltern, Warenkorb-Flows und Live-Bestellverfolgung."
      };
    } else {
      return {
        role: "Fullstack Developer & UI Lead",
        technologies: ["React", "Next.js", "TypeScript", "TailwindCSS", "REST API", "Payment Gateway"],
        description: "Architected Bozorak, a modern multi-vendor e-commerce marketplace. Implemented responsive product catalog filtering, interactive cart checkout flows, customer reviews, and live order status tracking."
      };
    }
  }

  if (cleanName.includes("ticket") || cleanName.includes("event") || cleanName.includes("booking")) {
    if (lang === 'ru') {
      return {
        role: "Инженер программного обеспечения",
        technologies: ["Node.js", "Express", "PostgreSQL", "Stripe API", "QR Code Engine", "Docker"],
        description: "Создал Event-Ticketing-System — платформу бронирования билетов на мероприятия в реальном времени. Интегрировал платежные шлюзы Stripe, генерацию QR-билетов и календари."
      };
    } else if (lang === 'tg') {
      return {
        role: "Муҳандиси нармафзор",
        technologies: ["Node.js", "Express", "PostgreSQL", "Stripe API", "QR Code Engine", "Docker"],
        description: "Сохтани Event-Ticketing-System — платформаи бронкунии чиптаҳо ва ҷойҳо дар замони воқеӣ. Интегратсияи шлюзҳои Stripe, эҷоди чиптаҳои QR ва тақвими чорабиниҳо."
      };
    } else if (lang === 'de') {
      return {
        role: "Software-Entwickler",
        technologies: ["Node.js", "Express", "PostgreSQL", "Stripe API", "QR Code Engine", "Docker"],
        description: "Entwicklung von Event-Ticketing-System, einer Echtzeit-Event-Buchungsplattform. Integration von Stripe-Zahlungsgateways, QR-Code-Tickets und Event-Kalendern."
      };
    } else {
      return {
        role: "Software Engineer",
        technologies: ["Node.js", "Express", "PostgreSQL", "Stripe API", "QR Code Engine", "Docker"],
        description: "Built Event-Ticketing-System, a real-time event booking and seat reservation platform. Integrated Stripe payment gateways, digital QR ticket generation, seat lock concurrency handlers, and event calendars."
      };
    }
  }

  if (cleanName.includes("resumelegend") || cleanName.includes("resume")) {
    if (lang === 'ru') {
      return {
        role: "Ведущий архитектор ПО",
        technologies: ["Next.js 16", "React 19", "TypeScript", "Python", "FastAPI", "Gemini AI SDK", "TailwindCSS"],
        description: "Создал ResumeLegend — платформу создания резюме на базе ИИ и оптимизации ATS. Интегрировал Google Gemini SDK для автоустранения ошибок, проверки ATS, перевода на 4 языка (EN/RU/DE/TG) и экспорта PDF."
      };
    } else if (lang === 'tg') {
      return {
        role: "Меъмори пешбари нармафзор",
        technologies: ["Next.js 16", "React 19", "TypeScript", "Python", "FastAPI", "Gemini AI SDK", "TailwindCSS"],
        description: "Сохтани ResumeLegend — платформаи сохтани резюме бо зеҳни сунъӣ ва оптимизатсияи ATS. Интегратсияи Google Gemini SDK барои ислоҳи фаврии хатоҳо, тарҷума ба 4 забон (EN/RU/DE/TG) ва содироти PDF."
      };
    } else if (lang === 'de') {
      return {
        role: "Leitender Software-Architekt",
        technologies: ["Next.js 16", "React 19", "TypeScript", "Python", "FastAPI", "Gemini AI SDK", "TailwindCSS"],
        description: "Entwicklung von ResumeLegend, einer KI-gestützten Lebenslauf-Builder-Plattform. Integration von Google Gemini SDK für automatische Korrekturen, Übersetzung in 4 Sprachen (EN/RU/DE/TG) und PDF-Export."
      };
    } else {
      return {
        role: "Lead Software Architect",
        technologies: ["Next.js 16", "React 19", "TypeScript", "Python", "FastAPI", "Gemini AI SDK", "TailwindCSS"],
        description: "Built ResumeLegend, an AI-powered CV builder and ATS optimization platform. Integrated Google Gemini SDK for 1-click flaw resolution, ATS fit auditing, 4-language resume translation (EN/RU/DE/TG), and native A4 PDF spooling."
      };
    }
  }

  return {
    role: lang === 'ru' ? "Разработчик ПО" : lang === 'tg' ? "Таҳиягари нармафзор" : lang === 'de' ? "Softwareentwickler" : "Software Developer",
    technologies: ["TypeScript", "React", "Node.js", "Git"],
    description: fallbackDesc && fallbackDesc !== 'No description provided.' && !fallbackDesc.includes('high-performance') 
      ? fallbackDesc 
      : lang === 'ru'
        ? `Разработал ${name} — модульное веб-приложение с чистой архитектурой и оптимизированными процессами.`
        : lang === 'tg'
          ? `Сохтани ${name} — замимаи мутобиқатшаванда бо меъмории муосир.`
          : lang === 'de'
            ? `Entwicklung von ${name}, einer modularen Webanwendung.`
            : `Engineered ${name}, a modular web application with clean component architecture and responsive user workflows.`
  };
}

// API Service Methods
export const api = {
  // Auth
  githubLoginUrl(): string {
    return `${API_BASE_URL}/auth/github`;
  },
  
  async loginWithGitHubCode(code: string): Promise<{ token: string, user: User }> {
    if (!(await isBackendActive())) {
      console.log('Using mock GitHub login...');
      await new Promise(r => setTimeout(r, 1000));
      return { token: 'mock-jwt-token-xyz', user: mockUser };
    }
    const res = await fetch(`${API_BASE_URL}/auth/github/callback?code=${code}`);
    if (!res.ok) throw new Error('Failed GitHub authentication');
    return res.json();
  },

  async getMe(): Promise<User> {
    if (!(await isBackendActive())) {
      return mockUser;
    }
    const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Unauthenticated');
    return res.json();
  },

  // Repositories
  async getRepos(): Promise<Repository[]> {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const username = userStr ? (JSON.parse(userStr).username || 'rivera-dev') : 'rivera-dev';
    const mappedRepos = mockRepos.map(r => ({
      ...r,
      github_url: r.github_url.replace('rivera-dev', username)
    }));
    if (!(await isBackendActive())) {
      return mappedRepos;
    }
    const res = await fetch(`${API_BASE_URL}/github/repos`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch repositories');
    return res.json();
  },

  async syncRepos(): Promise<Repository[]> {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const username = userStr ? (JSON.parse(userStr).username || 'rivera-dev') : 'rivera-dev';
    const mappedRepos = mockRepos.map(r => ({
      ...r,
      github_url: r.github_url.replace('rivera-dev', username)
    }));
    if (!(await isBackendActive())) {
      await new Promise(r => setTimeout(r, 2000));
      return mappedRepos;
    }
    const res = await fetch(`${API_BASE_URL}/github/sync`, { method: 'POST', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to sync repositories');
    return res.json();
  },

  async toggleRepoActive(repoId: string): Promise<Repository> {
    if (!(await isBackendActive())) {
      const repo = mockRepos.find(r => r.id === repoId);
      if (repo) repo.is_sync_active = !repo.is_sync_active;
      return repo!;
    }
    const res = await fetch(`${API_BASE_URL}/github/repos/${repoId}/toggle`, { method: 'PUT', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to toggle repo status');
    return res.json();
  },

  // Resumes
  async getResumes(): Promise<Resume[]> {
    if (!(await isBackendActive())) {
      const stored = localStorage.getItem('mock_resumes');
      if (stored) return JSON.parse(stored);
      localStorage.setItem('mock_resumes', JSON.stringify(mockResumes));
      return mockResumes;
    }
    const res = await fetch(`${API_BASE_URL}/resumes`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch resumes');
    return res.json();
  },

  async getResumeById(id: string): Promise<Resume> {
    if (!(await isBackendActive())) {
      const resumes = await this.getResumes();
      const match = resumes.find(r => r.id === id);
      if (!match) throw new Error('Resume not found');
      return match;
    }
    const res = await fetch(`${API_BASE_URL}/resumes/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch resume');
    return res.json();
  },

  async generateResume(payload: {
    fullName: string;
    desiredPosition: string;
    experienceYears: number;
    location: string;
    email: string;
    phone: string;
    education: Education[];
    targetLang?: 'en' | 'ru' | 'tg' | 'de';
    employmentStatus?: 'present' | 'past' | 'none';
  }): Promise<Resume> {
    const lang = payload.targetLang || 'en';
    const isNoWorkExp = payload.employmentStatus === 'none';
    const isPresentWork = payload.employmentStatus === 'present';

    if (!(await isBackendActive())) {
      await new Promise(r => setTimeout(r, 2000));
      const activeRepos = mockRepos.filter(r => r.is_sync_active);
      const generatedProjects: ResumeProject[] = activeRepos.map(r => {
        const parsed = getRepoDescriptionHelper(r.name, r.description || undefined, lang);
        return {
          id: `proj-${r.id}`,
          name: r.name,
          role: parsed.role,
          technologies: r.ai_analysis?.technologies || parsed.technologies,
          description: parsed.description,
          stars: r.stars,
          githubUrl: r.github_url
        };
      });
      
      const allSkills: string[] = Array.from(new Set(
        activeRepos.flatMap(r => r.ai_analysis?.technologies || [])
      )).slice(0, 8);

      const isRu = lang === 'ru';
      const isTg = lang === 'tg';
      const isDe = lang === 'de';

      const localizedPos = isRu ? (payload.desiredPosition || "Junior Full-Stack Разработчик") : isTg ? (payload.desiredPosition || "Таҳиягари ҷавони Фулл-Стек") : isDe ? (payload.desiredPosition || "Junior Full-Stack-Entwickler") : payload.desiredPosition;

      let localizedSummary = "";
      if (isNoWorkExp) {
        localizedSummary = isRu 
          ? `Энергичный начинающий ${localizedPos} с крепкой базовой подготовкой в области разработки ПО и практическим опытом создания собственных и открытых проектов. Стремится применить знания и развиваться в профессиональной команде.`
          : isTg 
            ? `Таҳиягари ҷавон ва кӯшишКори ${localizedPos} бо дониши мустаҳкам дар соҳаи технологияҳои муосир ва майли фаъол барои коркарди лоиҳаҳо.`
            : isDe 
              ? `Motivierter Einsteiger-Softwareentwickler (${localizedPos}) mit soliden Kenntnissen in modernen Webtechnologien und starker Lernbereitschaft.`
              : `Enthusiastic entry-level ${localizedPos} with a solid background in computer science fundamentals, modern frameworks, and software engineering. Passionate about delivering clean code and building scalable applications.`;
      } else {
        localizedSummary = isRu 
          ? `Опытный ${localizedPos} с ${payload.experienceYears}+ годами опыта проектирования надежных распределенных веб-систем. Высокая экспертиза в современных технологиях и автоматизированном развертывании.`
          : isTg 
            ? `Таҳиягари ботаҷрибаи ${localizedPos} бо таҷрибаи ${payload.experienceYears}+ сола дар эҷоди меъмориҳои муосир ва амни веб.`
            : isDe 
              ? `Erfahrener ${localizedPos} mit ${payload.experienceYears}+ Jahren Erfahrung in der Entwicklung skalierbarer Webanwendungen.`
              : `Professional ${payload.desiredPosition} with ${payload.experienceYears}+ years of experience. Expert in modern development workflows and automated deployment systems. Specialize in architecting high-performance client applications.`;
      }

      const expCompany = isRu ? "ТЕХФЛОУ СОЛЮШНЗ" : isTg ? "ТЕХФЛОУ СОЛЮШНЗ" : isDe ? "TECHFLOW SOLUTIONS" : "TECHFLOW SOLUTIONS";
      const expPosition = isRu ? "Junior Full Stack Разработчик" : isTg ? "Таҳиягари хурди Full Stack" : isDe ? "Junior Full Stack Entwickler" : payload.desiredPosition;
      const expEnd = isPresentWork ? (isRu ? "По настоящее время" : isTg ? "Ҳоло кор мекунад" : isDe ? "Present" : "Present") : "2023";
      
      const expBullets = isRu ? [
        "Разрабатывал веб-модули и участвовал в проектировании архитектуры приложения.",
        "Оптимизировал скорость загрузки страниц и взаимодействия с сервером."
      ] : isTg ? [
        "Сохтани модулҳои веб ва иштирок дар лоиҳакашии меъмории замимаҳо.",
        "Оптимизатсияи суръати боргирии саҳифаҳо ва пайвастшавӣ бо сервер."
      ] : [
        "Lead core design iterations and optimized API consumption, leading to a 20% speedup in render schedules.",
        "Engineered reusable container images ensuring developer stacks boot in under 5 minutes."
      ];

      const experienceList: WorkExperience[] = isNoWorkExp ? [] : [
        {
          id: 'exp-new-1',
          company: expCompany,
          position: expPosition,
          startDate: '2022',
          endDate: expEnd,
          description: expBullets
        }
      ];

      const newResume: Resume = {
        id: `resume-${Date.now()}`,
        user_id: 'user-uuid-1234',
        title: `${localizedPos} Resume`,
        template_name: 'developer',
        share_slug: `share-${Math.random().toString(36).substring(2, 9)}`,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        content: {
          personal_info: {
            fullName: payload.fullName,
            desiredPosition: localizedPos,
            experienceYears: payload.experienceYears,
            location: payload.location,
            email: payload.email,
            phone: payload.phone,
            githubUrl: typeof window !== 'undefined' ? ('github.com/' + (JSON.parse(localStorage.getItem('user') || '{}').username || 'rivera-dev')) : 'github.com/rivera-dev',
          },
          summary: localizedSummary,
          skills: [
            { category: isRu ? 'Ключевые навыки' : isTg ? 'Маҳоратҳои асосӣ' : 'Extracted Skills', skills: allSkills.length > 0 ? allSkills : ['TypeScript', 'React', 'Node.js'] },
            { category: isRu ? 'Инструменты' : isTg ? 'Воситаҳо' : 'General', skills: ['Docker', 'Git', 'Agile Methodology'] }
          ],
          experience: experienceList,
          projects: generatedProjects,
          education: payload.education,
          achievements: [
            isRu ? "Управление и развитие нескольких популярных репозиториев на GitHub с поддержкой сообщества." : "Managed and scaled multiple repositories on GitHub with active community interest.",
            isRu ? "Проектирование пользовательских компонентных архитектур по корпоративным стандартам." : "Designed custom component architectures matching corporate aesthetic systems."
          ],
          spoken_languages: [
            { id: 'lang-1', language: 'Tajik', proficiency: isRu ? 'Родной / Свободно' : 'Native / Fully' },
            { id: 'lang-2', language: 'Russian', proficiency: isRu ? 'Свободный / Отличный' : 'Fluent / Normal' },
            { id: 'lang-3', language: 'English', proficiency: 'Intermediate (B1-B2)' }
          ]
        }
      };

      const resumes = await this.getResumes();
      resumes.push(newResume);
      localStorage.setItem('mock_resumes', JSON.stringify(resumes));
      return newResume;
    }

    const res = await fetch(`${API_BASE_URL}/resume/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate resume');
    return res.json();
  },

  async updateResume(id: string, resume: Partial<Resume>): Promise<Resume> {
    if (!(await isBackendActive())) {
      const resumes = await this.getResumes();
      const idx = resumes.findIndex(r => r.id === id);
      if (idx === -1) throw new Error('Resume not found');
      
      const updated = { ...resumes[idx], ...resume, updated_at: new Date().toISOString() };
      resumes[idx] = updated;
      try {
        localStorage.setItem('mock_resumes', JSON.stringify(resumes));
      } catch (e) {
        console.warn('LocalStorage quota limit warning:', e);
      }
      return updated;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/resumes/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(resume),
      });
      if (!res.ok) {
        console.warn('Backend PUT resume returned non-OK status. Falling back to local storage.');
        const resumes = await this.getResumes();
        const idx = resumes.findIndex(r => r.id === id);
        if (idx !== -1) {
          const updated = { ...resumes[idx], ...resume, updated_at: new Date().toISOString() };
          resumes[idx] = updated;
          try { localStorage.setItem('mock_resumes', JSON.stringify(resumes)); } catch (e) {}
          return updated;
        }
        throw new Error('Failed to update resume');
      }
      return res.json();
    } catch (err) {
      console.warn('Backend update failed, persisting state locally:', err);
      const resumes = await this.getResumes();
      const idx = resumes.findIndex(r => r.id === id);
      if (idx !== -1) {
        const updated = { ...resumes[idx], ...resume, updated_at: new Date().toISOString() };
        resumes[idx] = updated;
        try { localStorage.setItem('mock_resumes', JSON.stringify(resumes)); } catch (e) {}
        return updated;
      }
      throw err;
    }
  },

  async deleteResume(id: string): Promise<void> {
    if (!(await isBackendActive())) {
      const resumes = await this.getResumes();
      const filtered = resumes.filter(r => r.id !== id);
      localStorage.setItem('mock_resumes', JSON.stringify(filtered));
      return;
    }
    const res = await fetch(`${API_BASE_URL}/resumes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete resume');
  },

  // Review
  async getResumeReview(id: string): Promise<AIReviewResponse> {
    try {
      const resume = await this.getResumeById(id);
      if (resume?.content?.is_resolved) {
        return {
          score: 98,
          recommendations: []
        };
      }
    } catch (e) {
      console.error(e);
    }
    if (!(await isBackendActive())) {
      await new Promise(r => setTimeout(r, 1500));
      return mockReview;
    }
    const res = await fetch(`${API_BASE_URL}/resumes/${id}/review`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch review recommendations');
    return res.json();
  },

  async improveSection(id: string, sectionName: string, instructions: string): Promise<string> {
    if (!(await isBackendActive())) {
      await new Promise(r => setTimeout(r, 2000));
      return `[Optimized by AI] Wrote custom parallel execution protocols based on: "${instructions}". Optimized resource consumption profiles resulting in a 40% reduction in CPU utilization.`;
    }
    const res = await fetch(`${API_BASE_URL}/resumes/${id}/improve-section`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ section: sectionName, instructions }),
    });
    if (!res.ok) throw new Error('Failed to improve section with AI');
    const data = await res.json();
    return data.improved_text;
  },

  // Public Share
  async getPublicResume(slug: string): Promise<Resume> {
    if (!(await isBackendActive())) {
      // Try local storage resumes
      const stored = localStorage.getItem('mock_resumes');
      const resumes: Resume[] = stored ? JSON.parse(stored) : mockResumes;
      const match = resumes.find(r => r.share_slug === slug);
      if (!match) throw new Error('Resume not found');
      return match;
    }
    const res = await fetch(`${API_BASE_URL}/resumes/share/${slug}`);
    if (!res.ok) throw new Error('Failed to fetch public resume');
    return res.json();
  },

  async upgradePlan(plan: 'free' | 'pro' | 'ultra'): Promise<User> {
    if (!(await isBackendActive())) {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userStr ? JSON.parse(userStr) : null;
      if (user) {
        user.plan = plan;
        localStorage.setItem('user', JSON.stringify(user));
      }
      return user || { id: 'mock-uuid', username: 'rivera-dev', plan };
    }
    const res = await fetch(`${API_BASE_URL}/auth/upgrade`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ plan })
    });
    if (!res.ok) throw new Error('Failed to upgrade subscription');
    const updatedUser = await res.json();
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  async createCheckoutSession(plan: 'pro' | 'ultra'): Promise<{ checkout_url: string | null; simulated?: boolean; message?: string }> {
    if (!(await isBackendActive())) {
      return { checkout_url: null, simulated: true };
    }
    const res = await fetch(`${API_BASE_URL}/payment/create-checkout-session`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ plan })
    });
    if (!res.ok) throw new Error('Failed to initialize Stripe checkout');
    return res.json();
  },

  async verifyPaymentSession(sessionId: string): Promise<User> {
    if (!(await isBackendActive())) {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userStr ? JSON.parse(userStr) : null;
      if (user) {
        user.plan = 'pro';
        localStorage.setItem('user', JSON.stringify(user));
      }
      return user || { id: 'mock-uuid', username: 'rivera-dev', plan: 'pro' };
    }
    const res = await fetch(`${API_BASE_URL}/payment/verify-session`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ session_id: sessionId })
    });
    if (!res.ok) throw new Error('Failed to verify payment session');
    const result = await res.json();
    if (result.plan) {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userStr ? JSON.parse(userStr) : { id: result.user_id, username: result.username };
      user.plan = result.plan;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    return result;
  },

  // ----------------------------------------------------
  // Mock Interview API Client Methods
  // ----------------------------------------------------
  async generateMockInterview(
    competencies?: Record<string, string[]>, 
    resumeId?: string,
    resumeContent?: any,
    targetLanguage: string = 'en'
  ): Promise<{ session_id: string; questions: MockInterviewQuestion[] }> {
    if (!(await isBackendActive())) {
      return {
        session_id: `mock-session-${Date.now()}`,
        questions: generateFallbackQuestionsByLang(targetLanguage, resumeContent)
      };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/mock-interview/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          competencies, 
          resume_id: resumeId, 
          resume_content: resumeContent,
          target_language: targetLanguage 
        })
      });
      if (!res.ok) throw new Error('Failed to generate mock interview');
      return res.json();
    } catch (e) {
      console.warn('Backend unavailable for generateMockInterview, using local fallback...', e);
      return {
        session_id: `mock-session-${Date.now()}`,
        questions: generateFallbackQuestionsByLang(targetLanguage, resumeContent)
      };
    }
  },

  async evaluateMockInterview(
    sessionId: string, 
    questions: MockInterviewQuestion[], 
    answers: MockInterviewAnswer[],
    targetLanguage: string = 'en'
  ): Promise<MockInterviewEvaluationResult> {
    if (!(await isBackendActive())) {
      return fallbackEvaluateMockInterview(questions, answers, targetLanguage);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/mock-interview/evaluate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          session_id: sessionId, 
          questions, 
          answers,
          target_language: targetLanguage 
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate mock interview');
      return res.json();
    } catch (e) {
      console.warn('Backend unavailable for evaluateMockInterview, using local fallback...', e);
      return fallbackEvaluateMockInterview(questions, answers, targetLanguage);
    }
  }

};

// ----------------------------------------------------
// Mock Interview Types & Fallbacks
// ----------------------------------------------------
export interface MockInterviewQuestion {
  id: number;
  category: string;
  technology: string;
  difficulty: 'Junior' | 'Mid' | 'Senior';
  type: 'technical' | 'system_design' | 'behavioral';
  question: string;
  hint: string;
  key_points: string[];
}

export interface MockInterviewAnswer {
  question_id: number;
  candidate_answer: string;
}

export interface MockInterviewEvaluationItem {
  question_id: number;
  question: string;
  category: string;
  technology: string;
  candidate_answer: string;
  status: 'correct' | 'partial' | 'incorrect';
  score: number;
  feedback: string;
  model_answer: string;
}

export interface MockInterviewEvaluationResult {
  session_id: string;
  overall_score: number;
  verdict: string;
  total_correct: number;
  total_partially_correct: number;
  total_incorrect: number;
  evaluations: MockInterviewEvaluationItem[];
  tech_breakdown: Record<string, number>;
  weaknesses: string[];
  practice_recommendations: string[];
  chart_data: {
    accuracy_distribution?: { label: string; count: number; color: string }[];
  };
}

export const defaultMock20Questions: MockInterviewQuestion[] = [
  {
    id: 1,
    category: "TypeScript",
    technology: "TypeScript",
    difficulty: "Mid",
    type: "technical",
    question: "Explain the difference between `interface` and `type` aliases in TypeScript. When would you strictly choose one over the other in a large React/Next.js codebase?",
    hint: "Consider declaration merging, union types, and performance in compiler resolution.",
    key_points: ["Declaration merging in interfaces", "Type aliases support unions/tuples", "Extending interfaces vs intersecting types"]
  },
  {
    id: 2,
    category: "TypeScript",
    technology: "TypeScript",
    difficulty: "Senior",
    type: "technical",
    question: "How does TypeScript perform type narrowing with discriminated unions, and how can custom type predicates (`is` keyword) prevent runtime crashes?",
    hint: "Discuss tag properties and user-defined type guards.",
    key_points: ["Discriminated union property tag", "Custom type predicate syntax val is Type", "Exhaustiveness checking with never"]
  },
  {
    id: 3,
    category: "React",
    technology: "React",
    difficulty: "Mid",
    type: "technical",
    question: "How does React fiber reconciliation work, and what causes unnecessary re-renders when passing inline object or function props?",
    hint: "Think about reference equality (Object.is) and memoization primitives like useCallback / useMemo.",
    key_points: ["Referential equality comparisons", "Virtual DOM diffing algorithm", "useCallback/useMemo usage guidelines"]
  },
  {
    id: 4,
    category: "React",
    technology: "React",
    difficulty: "Senior",
    type: "technical",
    question: "Explain how React Custom Hooks encapsulate stateful logic without introducing hierarchy nesting. How do you prevent stale closures inside useEffect or callbacks?",
    hint: "Focus on dependency arrays, useRef for persistent mutable references, and state updater functions.",
    key_points: ["Custom hooks reusability pattern", "Stale closure phenomenon", "Ref objects vs state setters"]
  },
  {
    id: 5,
    category: "Next.js",
    technology: "Next.js",
    difficulty: "Senior",
    type: "technical",
    question: "Compare Server Components (RSC) and Client Components in Next.js App Router. What serialization rules govern data passing across the server-client boundary?",
    hint: "Remember functions and class instances cannot cross boundary props.",
    key_points: ["Server-side zero bundle size", "'use client' boundary directive", "Serializable props constraint"]
  },
  {
    id: 6,
    category: "Next.js",
    technology: "Next.js",
    difficulty: "Mid",
    type: "technical",
    question: "How does Next.js implement Incremental Static Regeneration (ISR) and On-Demand Revalidation? How does it differ from traditional SSR?",
    hint: "Discuss revalidateTag, revalidatePath, and cache headers.",
    key_points: ["Background page generation", "On-demand revalidation hooks", "CDN edge caching interaction"]
  },
  {
    id: 7,
    category: "PostgreSQL",
    technology: "PostgreSQL",
    difficulty: "Mid",
    type: "technical",
    question: "What is the difference between B-Tree, Hash, and GIN indexes in PostgreSQL, and how do you diagnose slow queries using EXPLAIN ANALYZE?",
    hint: "Look out for Sequential Scans vs Index Scans and Execution Time vs Planning Time.",
    key_points: ["B-Tree for range comparisons", "GIN for JSONB/Full-text search", "Reading Seq Scan vs Index Scan in EXPLAIN"]
  },
  {
    id: 8,
    category: "PostgreSQL",
    technology: "PostgreSQL",
    difficulty: "Senior",
    type: "technical",
    question: "Explain ACID properties in PostgreSQL transactions. How do isolation levels (Read Committed vs Serializable) handle concurrent update anomalies?",
    hint: "Mention Dirty Reads, Non-repeatability, and Phantom Reads.",
    key_points: ["Atomicity, Consistency, Isolation, Durability", "Multiversion Concurrency Control (MVCC)", "Serializable isolation serialization failures"]
  },
  {
    id: 9,
    category: "Redis",
    technology: "Redis",
    difficulty: "Mid",
    type: "technical",
    question: "What caching strategies (Cache-Aside, Write-Through, Write-Behind) can be implemented with Redis, and how do you handle cache invalidation?",
    hint: "Consider TTL (Time-to-Live) settings and race conditions.",
    key_points: ["Cache-Aside pattern read flow", "TTL expiration policies", "Cache stampede mitigation"]
  },
  {
    id: 10,
    category: "Redis",
    technology: "Redis",
    difficulty: "Senior",
    type: "technical",
    question: "How does Redis handle key eviction when memory max limit is reached? Contrast all LRU and LFU eviction policies.",
    hint: "Think volatile-lru, allkeys-lru vs volatile-lfu.",
    key_points: ["Least Recently Used vs Least Frequently Used", "Approximated LRU sampling algorithm", "Maxmemory eviction rules"]
  },
  {
    id: 11,
    category: "Docker",
    technology: "Docker",
    difficulty: "Mid",
    type: "technical",
    question: "Why are Docker Multi-Stage builds essential for Next.js / Node.js production deployments, and how do layer caching rules speed up CI/CD pipelines?",
    hint: "Ordering of COPY package.json before COPY .",
    key_points: ["Separating build environment from production runtime", "Docker image layer caching strategy", "Minimizing attack surface and image size"]
  },
  {
    id: 12,
    category: "Docker",
    technology: "Docker",
    difficulty: "Senior",
    type: "technical",
    question: "How do Docker Compose networks isolate containers? Describe how a Next.js service connects to PostgreSQL and Redis containers securely.",
    hint: "DNS alias service names, private bridge networks, and environment variables.",
    key_points: ["Bridge network DNS resolution", "Container dependency depends_on and health checks", "Exposing ports internally vs externally"]
  },
  {
    id: 13,
    category: "Git",
    technology: "Git",
    difficulty: "Mid",
    type: "technical",
    question: "What is the difference between git rebase and git merge? When is rebasing dangerous for shared feature branches?",
    hint: "Focus on rewriting commit hash history.",
    key_points: ["Rebase creates linear commit graph", "Merge creates explicit merge commits", "Never rebase public shared branches"]
  },
  {
    id: 14,
    category: "Git",
    technology: "Git",
    difficulty: "Senior",
    type: "technical",
    question: "How do you recover lost commits in Git using git reflog and git cherry-pick after an accidental git reset --hard?",
    hint: "Reference log tracking of HEAD movements.",
    key_points: ["Reflog records all local HEAD changes", "Finding detached commit SHA hashes", "Cherry-picking or resetting back to reflog pointer"]
  },
  {
    id: 15,
    category: "Behavioral & System Design",
    technology: "System Design",
    difficulty: "Senior",
    type: "system_design",
    question: "Design a high-throughput notifications system using Next.js, Redis Pub/Sub, and PostgreSQL for 100k concurrent WebSocket connections.",
    hint: "Address connection pooling, pub/sub message fanout, and database write batching.",
    key_points: ["Redis Pub/Sub message broker", "PostgreSQL write buffer batching", "Horizontal scaling of WebSocket state nodes"]
  },
  {
    id: 16,
    category: "Behavioral & System Design",
    technology: "System Design",
    difficulty: "Mid",
    type: "system_design",
    question: "How would you diagnose a memory leak in a Node.js / React server rendering environment causing container out-of-memory (OOM) crashes?",
    hint: "Discuss heap snapshots, event listeners, and global variable leakage.",
    key_points: ["Chrome DevTools heap snapshot comparison", "Uncleaned event listeners or subscriptions", "Monitoring memory growth trends under load"]
  },
  {
    id: 17,
    category: "Behavioral & System Design",
    technology: "Behavioral",
    difficulty: "Mid",
    type: "behavioral",
    question: "Describe a scenario where you disagreed with a team lead or architect regarding technical stack choice (e.g. ORM vs raw PostgreSQL SQL). How did you resolve it?",
    hint: "Use the STAR method (Situation, Task, Action, Result) focusing on benchmarks and objective reasoning.",
    key_points: ["Objective metrics over subjective opinion", "Prototyping proof-of-concepts", "Constructive team compromise"]
  },
  {
    id: 18,
    category: "Behavioral & System Design",
    technology: "Behavioral",
    difficulty: "Senior",
    type: "behavioral",
    question: "Tell me about a critical production issue or outage you responded to. What steps did you take during the incident, and how did you conduct the post-mortem?",
    hint: "Focus on immediate mitigation (rollback/failover) before root-cause analysis.",
    key_points: ["Triage and rapid mitigation", "Blameless post-mortem analysis", "Action items to prevent regression"]
  },
  {
    id: 19,
    category: "Behavioral & System Design",
    technology: "TypeScript & React",
    difficulty: "Mid",
    type: "technical",
    question: "How do you ensure strict type safety when integrating third-party REST/GraphQL APIs with Next.js using Zod schema validation?",
    hint: "Validate unknown JSON data at runtime to infer TypeScript types.",
    key_points: ["Runtime parsing with z.parse()", "TypeScript z.infer<typeof Schema>", "Handling API schema mismatch errors gracefully"]
  },
  {
    id: 20,
    category: "Behavioral & System Design",
    technology: "Full Stack",
    difficulty: "Senior",
    type: "system_design",
    question: "How do you approach refactoring a legacy JavaScript code base to strict TypeScript, Next.js App Router, and Dockerized microservices without stopping feature delivery?",
    hint: "Discuss Strangler Fig pattern, incremental strictness (allowJs), and modular component migration.",
    key_points: ["Strangler Fig migration pattern", "Gradual TypeScript compilation flags", "Automated regression testing during refactoring"]
  }
];

export function generateFallbackQuestionsByLang(targetLanguage: string = 'en', resumeContent?: any): MockInterviewQuestion[] {
  const base = [...defaultMock20Questions];
  const lang = (targetLanguage || 'en').toLowerCase();
  
  const projects = resumeContent?.projects || [];
  const projNames = projects.map((p: any) => p.name).join(', ');

  // If language is Russian
  if (lang === 'ru') {
    const ruQuestions = [
      {
        id: 1,
        category: "TypeScript",
        technology: "TypeScript",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Объясните разницу между `interface` и `type` в TypeScript. Когда вы строго выберете одно вместо другого в крупном React/Next.js проекте?",
        hint: "Сфокусируйтесь на объединении объявлений (declaration merging) и типах объединений (unions).",
        key_points: ["Declaration merging в интерфейсах", "Псевдонимы типов для union/tuple", "Extending интерфейсов vs пересечение типов"]
      },
      {
        id: 2,
        category: "TypeScript",
        technology: "TypeScript",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Как работает сужение типов (type narrowing) с дискриминантными объединениями в TypeScript и как предикаты типов (`is`) предотвращают сбои?",
        hint: "Обсудите свойства тегов и пользовательские проверки типов.",
        key_points: ["Свойство тега в дискриминантных объединениях", "Синтаксис предикатов типов val is Type", "Проверка исчерпываемости с помощью never"]
      },
      {
        id: 3,
        category: "React",
        technology: "React",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Как работает виртуальный DOM и Fiber в React 19/18, и почему передача инлайн-объектов вызывают лишние ререндеры?",
        hint: "Подумайте о ссылочном равенстве (Object.is) и хуках useCallback/useMemo.",
        key_points: ["Сравнение ссылочного равенства", "Алгоритм сравнения Virtual DOM", "Рекомендации по useCallback/useMemo"]
      },
      {
        id: 4,
        category: "React",
        technology: "React",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Как пользовательские хуки React инкапсулируют логику состояния без вложенности, и как предотвратить устаревшие замыкания (stale closures) в `useEffect`?",
        hint: "Обратите внимание на массивы зависимостей и useRef.",
        key_points: ["Паттерн повторного использования хуков", "Феномен stale closure", "Объекты Ref против сеттеров состояния"]
      },
      {
        id: 5,
        category: "Next.js",
        technology: "Next.js",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Сравните Server Components (RSC) и Client Components в Next.js App Router. Какие правила сериализации действуют при передаче пропсов?",
        hint: "Функции и экземпляры классов не могут пересекать границу 'use client'.",
        key_points: ["Нулевой размер бандла на сервере", "Директива границы 'use client'", "Ограничение сериализуемых пропсов"]
      },
      {
        id: 6,
        category: "Next.js",
        technology: "Next.js",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Как Next.js реализует инкрементную статическую регенерацию (ISR) и ревалидацию по запросу? Чем это отличается от классического SSR?",
        hint: "Обсудите revalidateTag, revalidatePath и заголовки кэша.",
        key_points: ["Фоновая генерация страниц", "Хуки ревалидации по запросу", "Взаимодействие с кэшем CDN Edge"]
      },
      {
        id: 7,
        category: "PostgreSQL",
        technology: "PostgreSQL",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "В чем разница между индексами B-Tree, Hash и GIN в PostgreSQL, и как анализировать медленные запросы с помощью EXPLAIN ANALYZE?",
        hint: "Сравнивайте Seq Scan и Index Scan.",
        key_points: ["B-Tree для диапазонных сравнений", "GIN для JSONB и полнотекстового поиска", "Анализ Seq Scan против Index Scan"]
      },
      {
        id: 8,
        category: "PostgreSQL",
        technology: "PostgreSQL",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Объясните свойства ACID в транзакциях PostgreSQL. Как уровни изоляции (Read Committed, Serializable) предотвращают аномалии параллельного доступа?",
        hint: "Упомяните грязное чтение, неповторяющееся чтение и фантомные чтения.",
        key_points: ["Атомарность, Согласованность, Изолированность, Дурбельность", "Многоверсионность MVCC", "Ошибки сериализации Serializable"]
      },
      {
        id: 9,
        category: "Redis",
        technology: "Redis",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Какие стратегии кэширования (Cache-Aside, Write-Through) применяются с Redis и как эффективно обрабатывать инвалидацию кэша?",
        hint: "Учитывайте время жизни (TTL) и гонки данных.",
        key_points: ["Паттерн Cache-Aside", "Политики истечения срока TTL", "Предотвращение лавины кэша"]
      },
      {
        id: 10,
        category: "Redis",
        technology: "Redis",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Как Redis обрабатывает вытеснение ключей при достижении лимита памяти? Сравните политики LRU и LFU.",
        hint: "Сравните volatile-lru, allkeys-lru и volatile-lfu.",
        key_points: ["Least Recently Used против Least Frequently Used", "Алгоритм аппроксимированного LRU", "Правила вытеснения maxmemory"]
      },
      {
        id: 11,
        category: "Docker",
        technology: "Docker",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Почему многоэтапная сборка (Multi-stage build) в Docker необходима для деплоя Next.js/Node.js приложений в продакшен?",
        hint: "Порядок COPY package.json перед COPY . критичен для кэша.",
        key_points: ["Разделение среды сборки и продакшен тайма", "Стратегия кэширования слоев Docker", "Минимизация размера образа"]
      },
      {
        id: 12,
        category: "Docker",
        technology: "Docker",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Как сети Docker Compose изолируют контейнеры? Опишите процесс безопасного подключения Next.js к PostgreSQL и Redis.",
        hint: "DNS имена сервисов, приватные bridge сети и переменные окружения.",
        key_points: ["Разрешение DNS в сети Bridge", "Зависимости контейнеров depends_on", "Внутренние и внешние порты"]
      },
      {
        id: 13,
        category: "Git",
        technology: "Git",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "В чем разница между `git rebase` и `git merge`? Когда перемещение (rebase) опасно для публичных веток?",
        hint: "Сфокусируйтесь на перезаписи истории коммитов.",
        key_points: ["Rebase создает линейный граф коммитов", "Merge создает коммит слияния", "Запрет rebase на публичных ветках"]
      },
      {
        id: 14,
        category: "Git",
        technology: "Git",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Как восстановить потерянные коммиты в Git с помощью `git reflog` и `git cherry-pick` после случайного `git reset --hard`?",
        hint: "Журнал reflog отслеживает все перемещения указателя HEAD.",
        key_points: ["Журнал reflog всех локальных изменений HEAD", "Поиск отсоединенных коммитов SHA", "Применение cherry-pick или сброс к указателю"]
      },
      {
        id: 15,
        category: "Behavioral & System Design",
        technology: "System Design",
        difficulty: "Senior" as const,
        type: "system_design" as const,
        question: projNames ? `В вашем проекте (${projNames}): как вы проектировали архитектуру, управление состоянием и обработку ошибок при высокой нагрузке?` : "Спроектируйте архитектуру системы уведомлений с высокой пропускной способностью на Next.js, Redis Pub/Sub и PostgreSQL для 100k WebSocket соединений.",
        hint: "Рассмотрите пулы соединений, рассылку Pub/Sub и пакетную запись в БД.",
        key_points: ["Redis Pub/Sub брокер сообщений", "Пакетная запись в PostgreSQL", "Горизонтальное масштабирование WebSocket"]
      },
      {
        id: 16,
        category: "Behavioral & System Design",
        technology: "System Design",
        difficulty: "Mid" as const,
        type: "system_design" as const,
        question: "Как диагностировать утечку памяти в Node.js / React SSR среде, вызывающую OOM аварии контейнера?",
        hint: "Используйте снимки кучи (heap snapshots) и ищите неотписанные слушатели событий.",
        key_points: ["Сравнение снимок кучи Chrome DevTools", "Утечки незакрытых слушателей событий", "Мониторинг динамики памяти под нагрузкой"]
      },
      {
        id: 17,
        category: "Behavioral & System Design",
        technology: "Behavioral",
        difficulty: "Mid" as const,
        type: "behavioral" as const,
        question: "Опишите ситуацию, когда вы были не согласны с тимлидом по поводу выбора стекa технологий (например, ORM против чистых SQL запросов). Как вы пришли к решению?",
        hint: "Используйте метод STAR (Ситуация, Задача, Действие, Результат).",
        key_points: ["Объективные метрики вместо личных мнений", "Создание прототипов proof-of-concept", "Конструктивный компромисс в команде"]
      },
      {
        id: 18,
        category: "Behavioral & System Design",
        technology: "Behavioral",
        difficulty: "Senior" as const,
        type: "behavioral" as const,
        question: "Расскажите о критическом сбое на продакшене, в ликвидации которого вы участвовали. Какие шаги вы предприняли и как провели разбор полетов (post-mortem)?",
        hint: "Сфокусируйтесь на быстрой ликвидации (откат/failover) перед поиском первопричины.",
        key_points: ["Быстрая ликвидация и откат", "Безразличный пост-мортем разбор", "Список действий для предотвращения регрессий"]
      },
      {
        id: 19,
        category: "Behavioral & System Design",
        technology: "TypeScript & React",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Как обеспечить строгую типизацию при интеграции сторонних REST/GraphQL API в Next.js с помощью валидации Zod?",
        hint: "Проверяйте неизвестный JSON во время выполнения для вывода типов TypeScript.",
        key_points: ["Валидация во время выполнения с z.parse()", "Вывод типов TypeScript z.infer", "Обработка ошибок несоответствия схемы API"]
      },
      {
        id: 20,
        category: "Behavioral & System Design",
        technology: "Full Stack",
        difficulty: "Senior" as const,
        type: "system_design" as const,
        question: "Как вы подходите к рефакторингу унаследованного JavaScript кода на строгий TypeScript, Next.js App Router и контейнеры Docker без остановки разработки фич?",
        hint: "Обсудите паттерн Strangler Fig (удушающее дерево) и инкрементальные флаги компилятора.",
        key_points: ["Паттерн миграции Strangler Fig", "Постепенное включение флагов компиляции TypeScript", "Автоматизированное регрессионное тестирование"]
      }
    ];

    return ruQuestions;
  }


  // If language is Tajik
  if (lang === 'tg') {
    const tgQuestions = [
      {
        id: 1,
        category: "TypeScript",
        technology: "TypeScript",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Фарқи байни `interface` ва `type` дар TypeScript чист? Дар кадом ҳолат шумо якеро нисбат ба дигаре дар лоиҳаи калони Next.js интихоб мекунед?",
        hint: "Ба муттаҳидсозии эълонҳо (declaration merging) ва типҳои union таваҷҷӯҳ кунед.",
        key_points: ["Declaration merging дар интерфейсҳо", "Алиасҳои тип барои union/tuple", "Extending интерфейсҳо vs intersection-и типҳо"]
      },
      {
        id: 2,
        category: "TypeScript",
        technology: "TypeScript",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Тангнамудани типҳо (type narrowing) бо union-ҳои дискриминантӣ дар TypeScript чӣ гуна кор мекунад ва предикатҳои тип (`is`) чӣ гуна аз хатогиҳо пешгирӣ мекунанд?",
        hint: "Дар бораи хусусиятҳои тег ва санҷишҳои фармоишӣ муҳокима кунед.",
        key_points: ["Хусусияти тег дар union-ҳои дискриминантӣ", "Синтаксиси предикати тип val is Type", "Санҷиши пуррагӣ бо калимаи never"]
      },
      {
        id: 3,
        category: "React",
        technology: "React",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Рендеринги Virtual DOM ва Fiber дар React 19/18 чӣ гуна кор мекунад ва чаро интиқоли объектҳои инлайнӣ ба ре-рендерҳои зиёдатӣ оварда мерасонад?",
        hint: "Дар бораи баробарии истинодҳо (Object.is) ва useCallback/useMemo фикр кунед.",
        key_points: ["Муқоисаи баробарии истинодҳо", "Алгоритми муқоисаи Virtual DOM", "Тавсияҳо барои useCallback ва useMemo"]
      },
      {
        id: 4,
        category: "React",
        technology: "React",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Хукҳои фармоишии React логикаи ҳолатро (state) чӣ гуна печонда мегиранд ва чӣ гуна аз басташавиҳои кӯҳнашуда (stale closures) дар `useEffect` пешгирӣ кардан мумкин аст?",
        hint: "Ба массивҳои вобастагӣ ва useRef таваҷҷӯҳ кунед.",
        key_points: ["Паттерни истифодаи муҷаддади хукҳо", "Феномени stale closure", "Объектҳои Ref дар муқобили сеттерҳои state"]
      },
      {
        id: 5,
        category: "Next.js",
        technology: "Next.js",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Фарқи байни Server Components (RSC) ва Client Components дар Next.js App Router чист? Кадом қоидаҳои серилизатсия ҳангоми гузаштани сарҳади 'use client' амал мекунанд?",
        hint: "Функсияҳо ва экземпляри классҳо наметавонанд аз сарҳади 'use client' гузаранд.",
        key_points: ["Ҳаҷми сифрии бандл дар сервер", "Директиваи сарҳадии 'use client'", "Маҳдудияти пропсҳои серилизатсияшаванда"]
      },
      {
        id: 6,
        category: "Next.js",
        technology: "Next.js",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Next.js регенератсияи статикии афзояндаро (ISR) чӣ гуна амалӣ мекунад? Ин аз SSR-и классикӣ чӣ фарқ дорад?",
        hint: "revalidateTag ва revalidatePath-ро муҳокима кунед.",
        key_points: ["Генератсияи заминавии саҳифаҳо", "Хукҳои ревалидатсия бо дархост", "Ҳамкори бо кэши CDN Edge"]
      },
      {
        id: 7,
        category: "PostgreSQL",
        technology: "PostgreSQL",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Фарқи байни индексҳои B-Tree, Hash ва GIN дар PostgreSQL чист ва чӣ гуна дархостҳои оҳистаро бо `EXPLAIN ANALYZE` таҳлил кардан мумкин аст?",
        hint: "Seq Scan ва Index Scan-ро муқоиса кунед.",
        key_points: ["B-Tree барои муқоисаи диапазонҳо", "GIN барои JSONB ва Ҷустуҷӯи матнӣ", "Таҳлили Seq Scan дар муқобили Index Scan"]
      },
      {
        id: 8,
        category: "PostgreSQL",
        technology: "PostgreSQL",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Хусусиятҳои ACID-ро дар транзаксияҳои PostgreSQL шарҳ диҳед. Сатҳҳои изолятсия чӣ гуна аз аномалияҳо пешгирӣ мекунанд?",
        hint: "Хониши ифлос, хониши такрорнашаванда ва фантомҳоро зикр кунед.",
        key_points: ["Атомарӣ, Мувофиқат, Изолятсия, Устуворӣ", "Бисёрверсиягии MVCC", "Хатогиҳои серилизатсияи Serializable"]
      },
      {
        id: 9,
        category: "Redis",
        technology: "Redis",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Кадом стратегияҳои кэшкунӣ (Cache-Aside, Write-Through) бо Redis истифода мешаванд ва кэшро чӣ гуна самаранок беэътибор (invalidate) кардан мумкин аст?",
        hint: "Вақти ҳаёт (TTL)-ро ба назар гиред.",
        key_points: ["Паттерни Cache-Aside", "Сиёсати интиҳои вақти TTL", "Пешгирии тармаи кэш"]
      },
      {
        id: 10,
        category: "Redis",
        technology: "Redis",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Redis ҳангоми расидан ба лимити хотира калидҳоро чӣ гуна хориҷ мекунад? Сиёсатҳои LRU ва LFU-ро муқоиса кунед.",
        hint: "Least Recently Used ва Least Frequently Used-ро муқоиса кунед.",
        key_points: ["Least Recently Used дар муқобили Least Frequently Used", "Алгоритми тахминии LRU", "Қоидаҳои хориҷкунии maxmemory"]
      },
      {
        id: 11,
        category: "Docker",
        technology: "Docker",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Чаро сохтори бисёрмарҳилагӣ (Multi-stage build) дар Docker барои лоиҳаҳои Next.js/Node.js зарур аст?",
        hint: "Тартиби COPY package.json пеш аз COPY .-ро ба назар гиред.",
        key_points: ["Ҷудокунии муҳити сохтмон ва продакшен", "Стратегияи кэшкунии қабатҳои Docker", "Кам кардани ҳаҷми образ"]
      },
      {
        id: 12,
        category: "Docker",
        technology: "Docker",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Шабакаҳои Docker Compose контейнерҳоро чӣ гуна ҷудо мекунанд? Пайвасткунии бехатари Next.js ба PostgreSQL ва Redis-ро шарҳ диҳед.",
        hint: "Номҳои хизматрасонӣ дар DNS ва шабакаҳои bridge.",
        key_points: ["Муайянкунии DNS дар шабакаи Bridge", "Вобастагии контейнерҳо depends_on", "Портҳои дохилӣ ва берунӣ"]
      },
      {
        id: 13,
        category: "Git",
        technology: "Git",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Фарқи байни `git rebase` ва `git merge` чист? Кай rebase барои шохаҳои умумӣ хавфнок аст?",
        hint: "Ба азнавнависии таърихи коммитҳо диққат диҳед.",
        key_points: ["Rebase гракаи хаттии коммитҳоро месозад", "Merge коммити пайвасткуниро месозад", "Манъи rebase дар шохаҳои умумӣ"]
      },
      {
        id: 14,
        category: "Git",
        technology: "Git",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Чӣ тавр коммитҳои гумшударо дар Git бо истифода аз `git reflog` ва `git cherry-pick` пас аз reset --hard барқарор кардан мумкин аст?",
        hint: "Журнали reflog ҳамаи ҳаракатҳои HEAD-ро пайгирӣ мекунад.",
        key_points: ["Журнали reflog барои тағйироти локалӣ", "Ҷустуҷӯи SHA коммитҳои ҷудошуда", "Истифодаи cherry-pick ё reset"]
      },
      {
        id: 15,
        category: "Behavioral & System Design",
        technology: "System Design",
        difficulty: "Senior" as const,
        type: "system_design" as const,
        question: projNames ? `Дар лоиҳаи шумо (${projNames}): Шумо чӣ гуна архитектура, идоракунии ҳолат ва коркарди хатогиҳоро лоиҳакашӣ кардед?` : "Системаи огоҳиномаҳоро барои 100k пайвасти WebSocket бо Next.js, Redis Pub/Sub ва PostgreSQL лоиҳакашӣ кунед.",
        hint: "Усули STAR-ро истифода баред.",
        key_points: ["Брокери паёмҳои Redis Pub/Sub", "Забти дастаҷамъӣ дар PostgreSQL", "Масштабкунии амудии WebSocket"]
      },
      {
        id: 16,
        category: "Behavioral & System Design",
        technology: "System Design",
        difficulty: "Mid" as const,
        type: "system_design" as const,
        question: "Утечкаи хотираро (memory leak) дар муҳити Node.js / React SSR чӣ гуна ташхис кардан мумкин аст?",
        hint: "Снимкаҳои куча (heap snapshots)-ро истифода баред.",
        key_points: ["Муқоисаи снимкаҳои куча дар Chrome DevTools", "Утечка аз слушательҳои пӯшиданашуда", "Мониторинги динамикаи хотира"]
      },
      {
        id: 17,
        category: "Behavioral & System Design",
        technology: "Behavioral",
        difficulty: "Mid" as const,
        type: "behavioral" as const,
        question: "Сатҳе, ки шумо бо тимлид дар бораи интихоби стек (масалан, ORM ва SQL-и тоза) норозигӣ доштед, тавсиф кунед. Ба чӣ хулоса омадед?",
        hint: "Усули STAR-ро истифода баред.",
        key_points: ["Метрикаҳои объективӣ ба ҷои фикрҳои шахсӣ", "Сохтани прототипҳои proof-of-concept", "Компромисси созанда дар команда"]
      },
      {
        id: 18,
        category: "Behavioral & System Design",
        technology: "Behavioral",
        difficulty: "Senior" as const,
        type: "behavioral" as const,
        question: "Дар бораи вайроншавии муҳими продакшен, ки шумо дар бартараф кардани он иштирок доштед, нақл кунед. Кадом қадамҳоро гузоштед?",
        hint: "Ба бартарафкунии зуд (откат) таваҷҷӯҳ кунед.",
        key_points: ["Бартарафкунии зуд ва откат", "Разбори пост-мортем", "Рӯйхати қадамҳо барои пешгирӣ"]
      },
      {
        id: 19,
        category: "Behavioral & System Design",
        technology: "TypeScript & React",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Чӣ тавр типизатсияи қатъиро ҳангоми интеграцияи API-ҳои беруна дар Next.js бо истифода аз валидатсияи Zod таъмин кардан мумкин аст?",
        hint: "JSON-и номаълумро дар вақти иҷро тафтиш кунед.",
        key_points: ["Валидатсия дар вақти иҷро бо z.parse()", "Баровардани типҳои TypeScript z.infer", "Коркарди хатогиҳои API"]
      },
      {
        id: 20,
        category: "Behavioral & System Design",
        technology: "Full Stack",
        difficulty: "Senior" as const,
        type: "system_design" as const,
        question: "Шумо ба рефакторинги коди кӯҳнаи JavaScript ба TypeScript-и қатъӣ ва Next.js App Router чӣ гуна муносибат мекунед?",
        hint: "Паттерни Strangler Fig-ро муҳокима кунед.",
        key_points: ["Паттерни мигратсияи Strangler Fig", "Интихоби тадриҷии флагҳои компилятсия", "Тесткунии автоматии регрессионӣ"]
      }
    ];

    return tgQuestions;
  }

  // If language is German
  if (lang === 'de') {
    const deQuestions = [
      {
        id: 1,
        category: "TypeScript",
        technology: "TypeScript",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Erklären Sie den Unterschied zwischen `interface` und `type` in TypeScript. Wann wählen Sie welches in Next.js?",
        hint: "Fokussieren Sie sich auf Declaration Merging und Union Types.",
        key_points: ["Declaration Merging in Interfaces", "Typ-Aliase für Unions/Tuples", "Extending Interfaces vs Type Intersections"]
      },
      {
        id: 2,
        category: "TypeScript",
        technology: "TypeScript",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Wie funktioniert Type Narrowing mit Discriminated Unions in TypeScript und wie verhindern Type Predicates (`is`) Runtime-Fehler?",
        hint: "Diskutieren Sie Tag-Eigenschaften und benutzerdefinierte Type-Guards.",
        key_points: ["Tag-Eigenschaft in Discriminated Unions", "Type Predicate Syntax val is Type", "Exhaustiveness Checking mit never"]
      },
      {
        id: 3,
        category: "React",
        technology: "React",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Wie funktioniert der Virtuelle DOM und Fiber in React 19/18, und warum verursachen Inline-Objekte unnötige Re-Renderings?",
        hint: "Denken Sie an referenzielle Gleichheit (Object.is) und useCallback/useMemo Hooks.",
        key_points: ["Referenzielle Gleichheit", "Virtual DOM Diffing Algorithmus", "Empfehlungen für useCallback/useMemo"]
      },
      {
        id: 4,
        category: "React",
        technology: "React",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Wie kapseln Custom Hooks React State-Logik ohne Verschachtelung, und wie verhindert man Stale Closures in `useEffect`?",
        hint: "Achten Sie auf Dependency Arrays und useRef.",
        key_points: ["Hook Reusability Pattern", "Stale Closure Phänomen", "Ref Objekte vs State Setters"]
      },
      {
        id: 5,
        category: "Next.js",
        technology: "Next.js",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Vergleichen Sie Server Components (RSC) und Client Components in Next.js App Router. Welche Serialisierungsregeln gelten?",
        hint: "Funktionen können nicht über 'use client' Grenzen hinweg übergeben werden.",
        key_points: ["Zero Bundle Size auf dem Server", "'use client' Boundary Direktive", "Einschränkung serialisierbarer Props"]
      },
      {
        id: 6,
        category: "Next.js",
        technology: "Next.js",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Wie implementiert Next.js Incremental Static Regeneration (ISR) und Revalidierung auf Anfrage? Wie unterscheidet sich das von klassischem SSR?",
        hint: "Diskutieren Sie revalidateTag, revalidatePath und Cache Header.",
        key_points: ["Hintergrund-Seitengenerierung", "On-Demand Revalidation Hooks", "Zusammenspiel mit Edge CDN Cache"]
      },
      {
        id: 7,
        category: "PostgreSQL",
        technology: "PostgreSQL",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Was ist der Unterschied zwischen B-Tree, Hash und GIN Indizes in PostgreSQL, und wie analysiert man langsame Abfragen mit EXPLAIN ANALYZE?",
        hint: "Vergleichen Sie Seq Scan und Index Scan.",
        key_points: ["B-Tree für Bereichsvergleiche", "GIN für JSONB und Volltextsuche", "Seq Scan vs Index Scan Analyse"]
      },
      {
        id: 8,
        category: "PostgreSQL",
        technology: "PostgreSQL",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Erklären Sie die ACID-Eigenschaften in PostgreSQL-Transaktionen. Wie verhindern Isolationsstufen Nebenläufigkeitsanomalien?",
        hint: "Erwähnen Sie Dirty Reads, Non-repeatable Reads und Phantom Reads.",
        key_points: ["Atomarität, Konsistenz, Isolation, Dauerhaftigkeit", "MVCC Mehrversionssteuerung", "Serializable Serialisierungsfehler"]
      },
      {
        id: 9,
        category: "Redis",
        technology: "Redis",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Welche Caching-Strategien (Cache-Aside, Write-Through) werden mit Redis verwendet und wie handhabt man Cache-Invalidierung effektiv?",
        hint: "Berücksichtigen Sie Time-To-Live (TTL) und Race Conditions.",
        key_points: ["Cache-Aside Pattern", "TTL Ablauf-Policies", "Vermeidung von Cache Avalanche"]
      },
      {
        id: 10,
        category: "Redis",
        technology: "Redis",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Wie handhabt Redis Schlüssel-Räumungen bei Erreichen des Speicherlimits? Vergleichen Sie LRU und LFU Policies.",
        hint: "Vergleichen Sie volatile-lru, allkeys-lru und volatile-lfu.",
        key_points: ["Least Recently Used vs Least Frequently Used", "Approximierter LRU Algorithmus", "maxmemory Räumungsregeln"]
      },
      {
        id: 11,
        category: "Docker",
        technology: "Docker",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Warum sind Multi-Stage Builds in Docker für die Bereitstellung von Next.js/Node.js Anwendungen in der Produktion erforderlich?",
        hint: "Die Reihenfolge von COPY package.json vor COPY . ist entscheidend für den Cache.",
        key_points: ["Trennung von Build- und Runtime-Umgebung", "Docker Layer Caching Strategie", "Minimierung der Image-Größe"]
      },
      {
        id: 12,
        category: "Docker",
        technology: "Docker",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Wie isolieren Docker Compose Netzwerke Container? Beschreiben Sie die sichere Verbindung von Next.js mit PostgreSQL und Redis.",
        hint: "DNS-Dienstnamen, private Bridge-Netzwerke und Umgebungsvariablen.",
        key_points: ["DNS-Auflösung im Bridge-Netzwerk", "Container-Abhängigkeiten depends_on", "Interne und externe Ports"]
      },
      {
        id: 13,
        category: "Git",
        technology: "Git",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Was ist der Unterschied zwischen `git rebase` und `git merge`? Wann ist Rebase für öffentliche Branches gefährlich?",
        hint: "Fokussieren Sie sich auf das Überschreiben der Commit-Historie.",
        key_points: ["Rebase erzeugt einen linearen Commit-Graph", "Merge erzeugt einen Merge-Commit", "Rebase-Verbot auf öffentlichen Branches"]
      },
      {
        id: 14,
        category: "Git",
        technology: "Git",
        difficulty: "Senior" as const,
        type: "technical" as const,
        question: "Wie stellt man verlorene Commits in Git mit `git reflog` und `git cherry-pick` nach einem versehentlichen reset --hard wieder her?",
        hint: "Das Reflog protokolliert alle HEAD-Zeigerbewegungen.",
        key_points: ["Reflog-Protokoll aller lokalen HEAD-Änderungen", "Finden losgelöster SHA-Commits", "Anwenden von cherry-pick oder reset"]
      },
      {
        id: 15,
        category: "Behavioral & System Design",
        technology: "System Design",
        difficulty: "Senior" as const,
        type: "system_design" as const,
        question: projNames ? `In Ihrem Projekt (${projNames}): Wie haben Sie die Architektur, das State Management und die Fehlerbehandlung entworfen?` : "Entwerfen Sie eine Benachrichtigungssystem-Architektur für 100k WebSocket-Verbindungen mit Next.js, Redis Pub/Sub und PostgreSQL.",
        hint: "Verwenden Sie die STAR-Methode.",
        key_points: ["Redis Pub/Sub Message Broker", "Batch-Verarbeitung in PostgreSQL", "Horizontale WebSocket-Skalierung"]
      },
      {
        id: 16,
        category: "Behavioral & System Design",
        technology: "System Design",
        difficulty: "Mid" as const,
        type: "system_design" as const,
        question: "Wie diagnostizieren Sie ein Speicherleck in einer Node.js / React SSR Umgebung, das OOM-Abstürze verursacht?",
        hint: "Verwenden Sie Heap Snapshots in Chrome DevTools.",
        key_points: ["Vergleich von Heap Snapshots", "Speicherlecks durch offene Event-Listener", "Speicherprofilierung unter Last"]
      },
      {
        id: 17,
        category: "Behavioral & System Design",
        technology: "Behavioral",
        difficulty: "Mid" as const,
        type: "behavioral" as const,
        question: "Beschreiben Sie eine Situation, in der Sie uneinig mit dem Teamlead bezüglich des Tech-Stacks waren. Wie haben Sie eine Lösung gefunden?",
        hint: "Verwenden Sie die STAR-Methode.",
        key_points: ["Objektive Metriken statt persönlicher Meinungen", "Erstellung von Proof-of-Concept Prototypen", "Konstruktiver Kompromiss im Team"]
      },
      {
        id: 18,
        category: "Behavioral & System Design",
        technology: "Behavioral",
        difficulty: "Senior" as const,
        type: "behavioral" as const,
        question: "Erzählen Sie von einem kritischen Produktionsausfall, an dessen Behebung Sie beteiligt waren. Welche Schritte haben Sie unternommen?",
        hint: "Fokussieren Sie sich auf schnelle Behebung (Rollback) vor der Ursachenanalyse.",
        key_points: ["Schnelle Behebung und Rollback", "Blameless Post-Mortem Analyse", "Maßnahmenkatalog zur Vermeidung von Regressions"]
      },
      {
        id: 19,
        category: "Behavioral & System Design",
        technology: "TypeScript & React",
        difficulty: "Mid" as const,
        type: "technical" as const,
        question: "Wie stellen Sie eine strikte Typisierung bei der Integration externer REST/GraphQL APIs in Next.js mithilfe von Zod sicher?",
        hint: "Überprüfen Sie unbekanntes JSON zur Laufzeit für TypeScript Type-Inference.",
        key_points: ["Laufzeitvalidierung mit z.parse()", "TypeScript Typableitung z.infer", "Behandlung von API-Schema-Fehlern"]
      },
      {
        id: 20,
        category: "Behavioral & System Design",
        technology: "Full Stack",
        difficulty: "Senior" as const,
        type: "system_design" as const,
        question: "Wie gehen Sie bei der Refaktorisierung von Legacy-JavaScript-Code zu striktem TypeScript, Next.js App Router und Docker vor?",
        hint: "Diskutieren Sie das Strangler Fig Migrationsmuster.",
        key_points: ["Strangler Fig Migrationsmuster", "Schrittweise Aktivierung von TypeScript-Flags", "Automatisierte Regressionstests"]
      }
    ];

    return deQuestions;
  }

  // Default English (with project names injected if available)
  if (projNames) {
    return base.map((q, idx) => {
      if (idx === 14) {
        return {
          ...q,
          question: `In your CV project (${projNames}): How did you architect the state management, API integration, and performance optimization?`,
          hint: "Use the STAR method (Situation, Task, Action, Result) with quantitative metrics."
        };
      }
      return q;
    });
  }

  return base;
}

function fallbackEvaluateMockInterview(questions: MockInterviewQuestion[], answers: MockInterviewAnswer[], targetLanguage: string = 'en'): MockInterviewEvaluationResult {
  const ansMap = new Map(answers.map(a => [a.question_id, a.candidate_answer.trim()]));
  const evaluations: MockInterviewEvaluationItem[] = [];
  const lang = (targetLanguage || 'en').toLowerCase();
  
  let totalCorrect = 0;
  let totalPartial = 0;
  let totalIncorrect = 0;
  
  const techScores: Record<string, { sum: number; count: number }> = {};
  const weaknesses: string[] = [];
  
  questions.forEach(q => {
    const userAns = ansMap.get(q.id) || '';
    const len = userAns.length;
    const keyPts = q.key_points || [];
    
    const matchedCount = keyPts.filter(pt => 
      pt.split(' ').some(w => w.length > 3 && userAns.toLowerCase().includes(w.toLowerCase()))
    ).length;

    let status: 'correct' | 'partial' | 'incorrect' = 'incorrect';
    let score = 0;
    let fb = '';

    if (len > 100 || matchedCount >= 2) {
      status = 'correct';
      score = Math.min(10, 8 + matchedCount);
      totalCorrect++;
      fb = lang === 'ru'
        ? `Отличный ответ! Вы успешно раскрыли ключевые понятия: ${keyPts.slice(0, 2).join(', ')}. Продемонстрирован практический опыт.`
        : lang === 'tg'
          ? `Ҷавоби олӣ! Шумо мафҳумҳои асосиро фаро гирифтед: ${keyPts.slice(0, 2).join(', ')}.`
          : `Great answer! You covered key concepts: ${keyPts.slice(0, 2).join(', ')}. Demonstrates solid experience.`;
    } else if (len > 25 || matchedCount >= 1) {
      status = 'partial';
      score = 5 + matchedCount;
      totalPartial++;
      fb = lang === 'ru'
        ? `Хорошее направление, но не хватает архитектурной глубины. Обязательно подкрепите отсылкой к ${keyPts[keyPts.length - 1] || 'практическим ограничениям'}.`
        : lang === 'tg'
          ? `Ҷавоби хуб, аммо ба тафсилоти архитектурӣ ниёз дорад.`
          : `Decent explanation, but missing architectural depth. Make sure to elaborate on ${keyPts[keyPts.length - 1] || 'production constraints'}.`;
      if (weaknesses.length < 4) {
        weaknesses.push(`${q.technology}: ${lang === 'ru' ? 'Практикуйте объяснение' : 'Practice explaining'} ${keyPts[0] || q.category}`);
      }
    } else {
      status = 'incorrect';
      score = len > 0 ? 2 : 0;
      totalIncorrect++;
      fb = lang === 'ru'
        ? `Неполный или пропущенный ответ. Рекрутеры ожидают развернутые объяснения архитектуры и компромиссов.`
        : lang === 'tg'
          ? `Ҷавоби нопурра. Рекрутерҳо тафсилоти пурраро интизоранд.`
          : `Incomplete or skipped answer. Recruiters expect detailed explanations of ${keyPts[0] || 'core concepts'} and trade-offs.`;
      if (weaknesses.length < 4) {
        weaknesses.push(`${q.technology}: ${lang === 'ru' ? 'Требуется глубокая практика по' : 'Key focus area'} ${q.category}`);
      }
    }

    if (!techScores[q.technology]) {
      techScores[q.technology] = { sum: 0, count: 0 };
    }
    techScores[q.technology].sum += score * 10;
    techScores[q.technology].count += 1;

    evaluations.push({
      question_id: q.id,
      question: q.question,
      category: q.category,
      technology: q.technology,
      candidate_answer: userAns || (lang === 'ru' ? '[Ответ не предоставлен]' : '[No answer provided]'),
      status,
      score,
      feedback: fb,
      model_answer: lang === 'ru' 
        ? `Идеальный ответ рекрутеру: 1) ${keyPts[0] || 'Основы'}, 2) ${keyPts[1] || 'Детали реализации'}, 3) ${keyPts[2] || 'Архитектурные компромиссы'}.`
        : `Ideal answer covers: 1) ${keyPts[0] || 'Fundamentals'}, 2) ${keyPts[1] || 'Implementation details'}, and 3) ${keyPts[2] || 'Production trade-offs'}.`
    });
  });

  const overallScore = Math.round(evaluations.reduce((acc, e) => acc + e.score, 0) / Math.max(1, evaluations.length) * 10);
  const techBreakdown: Record<string, number> = {};

  Object.entries(techScores).forEach(([tech, val]) => {
    techBreakdown[tech] = Math.min(100, Math.round(val.sum / Math.max(1, val.count)));
  });

  if (weaknesses.length === 0) {
    weaknesses.push(lang === 'ru' ? 'PostgreSQL: Чтение планов запросов EXPLAIN ANALYZE' : 'PostgreSQL: Reading EXPLAIN ANALYZE query trees under high write load');
    weaknesses.push(lang === 'ru' ? 'Redis: Политики вытеснения ключей (LRU vs LFU)' : 'Redis: Memory eviction policies (LRU vs LFU) under maxmemory limits');
    weaknesses.push(lang === 'ru' ? 'Next.js: Границы сериализации Server Components' : 'Next.js: Server Components serialization boundaries');
  }

  const verdict = overallScore >= 80 
    ? (lang === 'ru' ? 'Сдано - Высокий уровень Senior разработчика' : 'Pass - Outstanding Senior Engineer Grade')
    : overallScore >= 60 
      ? (lang === 'ru' ? 'Уровень Mid - Требуется углубление в базы данных и кэширование' : 'Mid-Level Grade - Database & Caching Depth Suggested') 
      : (lang === 'ru' ? 'Требуется практика - Повторите основные технологии' : 'Needs Practice - Review Core Competencies');

  return {
    session_id: `session-${Date.now()}`,
    overall_score: overallScore,
    verdict,
    total_correct: totalCorrect,
    total_partially_correct: totalPartial,
    total_incorrect: totalIncorrect,
    evaluations,
    tech_breakdown: techBreakdown,
    weaknesses,
    practice_recommendations: lang === 'ru' ? [
      'Практикуйте устные ответы с использованием метода STAR (Ситуация, Задача, Действие, Результат).',
      'Изучите стратегии индексации PostgreSQL (B-Tree и GIN) и EXPLAIN ANALYZE.',
      'Настройте локальный Redis и попрактикуйтесь с политиками вытеснения LRU и LFU.',
      'Повторите кэширование слоев Docker и развертывание контейнеров Next.js.'
    ] : [
      'Practice technical speaking using the STAR method (Situation, Task, Action, Result).',
      'Study PostgreSQL B-Tree and GIN indexing strategies with EXPLAIN ANALYZE queries.',
      'Configure a local Redis instance and experiment with LRU vs LFU eviction policies.',
      'Review Docker layer caching and Next.js multi-stage container deployments.'
    ],
    chart_data: {
      accuracy_distribution: [
        { label: lang === 'ru' ? 'Верно' : 'Correct', count: totalCorrect, color: '#10B981' },
        { label: lang === 'ru' ? 'Частично' : 'Partially Correct', count: totalPartial, color: '#F59E0B' },
        { label: lang === 'ru' ? 'Требует работы' : 'Needs Practice', count: totalIncorrect, color: '#EF4444' }
      ]
    }
  };
}


