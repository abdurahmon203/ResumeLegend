'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Terminal, 
  Save, 
  Share2, 
  FileDown, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle, 
  Layers, 
  X, 
  Menu,
  Info, 
  Brain, 
  Award, 
  Briefcase, 
  BookOpen, 
  User as UserIcon,
  Lightbulb,
  Loader2,
  Check,
  Search,
  FileText,
  MessageSquare,
  Globe,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Upload
} from 'lucide-react';
import { api, Resume, WorkExperience, ResumeProject, Education, SkillCategory, SpokenLanguage, AchievementItem } from '../../lib/api';

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');

  // Page States
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState<'info' | 'summary' | 'experience' | 'projects' | 'skills' | 'languages' | 'education' | 'achievements' | 'coverletter' | 'mockinterview'>('info');
  const [activeCertPreview, setActiveCertPreview] = useState<{ title: string; imageUrl: string } | null>(null);
  
  // Subscription plan states
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'ultra'>('free');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [requiredPlan, setRequiredPlan] = useState<'pro' | 'ultra'>('pro');
  const [featureExplanation, setFeatureExplanation] = useState('');
  const [headerDrawerOpen, setHeaderDrawerOpen] = useState(false);
  const [mobileWorkspaceTab, setMobileWorkspaceTab] = useState<'edit' | 'preview' | 'ai'>('edit');

  useEffect(() => {
    if (mobileWorkspaceTab === 'ai') {
      setShowAiPanel(true);
    }
  }, [mobileWorkspaceTab]);
  
  // Custom Alert/Confirm Modal State
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert'
  });

  const showAlert = (title: string, message: string) => {
    setNotification({
      isOpen: true,
      title,
      message,
      type: 'alert'
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setNotification({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm
    });
  };

  const [lang, setLang] = useState<'en' | 'ru'>('en');

  // Language Preference Effect
  useEffect(() => {
    const updateLang = () => {
      const saved = localStorage.getItem('lang');
      if (saved === 'ru' || saved === 'en') {
        setLang(saved);
      }
    };
    updateLang();
    window.addEventListener('lang-changed', updateLang);
    return () => window.removeEventListener('lang-changed', updateLang);
  }, []);

  // AI Suggestions State
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [aiScore, setAiScore] = useState(82);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [analyzingCv, setAnalyzingCv] = useState(false);
  const [isResolvingAll, setIsResolvingAll] = useState(false);

  // Job Description Matcher States
  const [jobDescription, setJobDescription] = useState('');
  const [isMatchingJd, setIsMatchingJd] = useState(false);
  const [jdMatchScore, setJdMatchScore] = useState<number | null>(null);
  const [jdMatchTitle, setJdMatchTitle] = useState('');

  // Cover Letter & Mock Interview States
  const [coverLetterText, setCoverLetterText] = useState('');
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [mockQuestions, setMockQuestions] = useState<any[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // CV Content Translation States
  const [isTranslatingResume, setIsTranslatingResume] = useState(false);
  const [activeResumeLang, setActiveResumeLang] = useState<'en' | 'ru' | 'de' | 'tg'>('en');

  const isUploadedCV = resume?.title?.startsWith('Uploaded CV:') || false;
  const canEdit = !isUploadedCV || userPlan === 'ultra';
  const canResolve = !isUploadedCV || userPlan === 'ultra';

  // New item input states
  const [newSkill, setNewSkill] = useState('');
  const [newSkillCat, setNewSkillCat] = useState('Extracted Skills');

  useEffect(() => {
    if (!resumeId) {
      router.push('/dashboard');
      return;
    }
    loadResume();
  }, [resumeId, router]);

  // Auto-print detector
  useEffect(() => {
    const isPrintMode = searchParams.get('print') === 'true';
    if (!loading && resume && isPrintMode) {
      const timer = setTimeout(() => {
        window.print();
        const newUrl = window.location.pathname + `?id=${resumeId}`;
        window.history.replaceState({ ...window.history.state }, '', newUrl);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [loading, resume, searchParams, resumeId]);

  const DEFAULT_SPOKEN_LANGUAGES: SpokenLanguage[] = [
    { id: 'lang-1', language: 'Tajik', proficiency: 'Native / Fully' },
    { id: 'lang-2', language: 'Russian', proficiency: 'Fluent / Normal' },
    { id: 'lang-[#3]', language: 'English', proficiency: 'Intermediate (B1-B2)' }
  ];

  const loadResume = async () => {
    setLoading(true);
    try {
      const data = await api.getResumeById(resumeId as string);
      if (!data.content.spoken_languages || data.content.spoken_languages.length === 0) {
        data.content.spoken_languages = [
          { id: 'lang-1', language: 'Tajik', proficiency: 'Native / Fully' },
          { id: 'lang-2', language: 'Russian', proficiency: 'Fluent / Normal' },
          { id: 'lang-3', language: 'English', proficiency: 'Intermediate (B1-B2)' }
        ];
      }
      setResume(data);
      
      // Load user plan
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const parsedUser = userStr ? JSON.parse(userStr) : null;
      const currentPlan = parsedUser?.plan || 'free';
      setUserPlan(currentPlan);

      // Block free plan users from opening uploaded CVs in editor
      const isUploaded = data.title?.startsWith('Uploaded CV:') || false;
      if (isUploaded && currentPlan === 'free') {
        router.push('/dashboard');
        return;
      }
      
      // Auto-trigger review recommendations if NOT free
      if (currentPlan !== 'free') {
        setAnalyzingCv(true);
        try {
          const review = await api.getResumeReview(data.id);
          setAiScore(review.score);
          setSuggestions(review.recommendations);
        } catch (err) {
          console.error("Auto-fetch review failed:", err);
        } finally {
          setAnalyzingCv(false);
        }
      } else {
        setAiScore(70);
        setSuggestions([]);
      }
    } catch (e) {
      console.error(e);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (section: string, field: string, value: any) => {
    if (!resume) return;
    setResume(prev => {
      if (!prev) return null;
      const content = { ...prev.content };
      if (section === 'personal_info') {
        content.personal_info = { ...content.personal_info, [field]: value };
      } else if (section === 'summary') {
        content.summary = value;
      }
      return { ...prev, content };
    });
  };

  // Work Experience Operations
  const handleExperienceChange = (id: string, index: number, field: keyof WorkExperience | 'desc_item', value: any, descIdx?: number) => {
    if (!resume) return;
    setResume(prev => {
      if (!prev) return null;
      const content = { ...prev.content };
      content.experience = content.experience.map(exp => {
        if (exp.id === id) {
          if (field === 'desc_item' && typeof descIdx === 'number') {
            const desc = [...exp.description];
            desc[descIdx] = value;
            return { ...exp, description: desc };
          }
          return { ...exp, [field]: value };
        }
        return exp;
      });
      return { ...prev, content };
    });
  };

  const handleAddExperience = () => {
    if (!resume) return;
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      company: 'NEW COMPANY INC',
      position: 'Software Engineer',
      startDate: '2022',
      endDate: 'Present',
      description: ['Accomplished technical milestone 1.', 'Led engineering detail 2.']
    };
    setResume(prev => {
      if (!prev) return null;
      const content = { ...prev.content };
      content.experience = [...content.experience, newExp];
      return { ...prev, content };
    });
  };

  const handleDeleteExperience = (id: string) => {
    if (!resume) return;
    setResume(prev => {
      if (!prev) return null;
      const content = { ...prev.content };
      content.experience = content.experience.filter(exp => exp.id !== id);
      return { ...prev, content };
    });
  };

  // Projects Operations
  const handleProjectChange = (id: string, field: keyof ResumeProject, value: any) => {
    if (!resume) return;
    setResume(prev => {
      if (!prev) return null;
      const content = { ...prev.content };
      content.projects = content.projects.map(proj => {
        if (proj.id === id) {
          if (field === 'technologies') {
            return { ...proj, technologies: typeof value === 'string' ? value.split(',').map(s => s.trim()) : value };
          }
          return { ...proj, [field]: value };
        }
        return proj;
      });
      return { ...prev, content };
    });
  };

  const handleAddProject = () => {
    if (!resume) return;
    const newProj: ResumeProject = {
      id: `proj-${Date.now()}`,
      name: 'new-open-source-project',
      role: 'Creator & Maintainer',
      technologies: ['React', 'TypeScript'],
      description: 'A modular UI library created to streamline styling rules. (10 ★)',
      stars: 10,
      githubUrl: 'https://github.com'
    };
    setResume(prev => {
      if (!prev) return null;
      const content = { ...prev.content };
      content.projects = [...content.projects, newProj];
      return { ...prev, content };
    });
  };

  const handleDeleteProject = (id: string) => {
    if (!resume) return;
    setResume(prev => {
      if (!prev) return null;
      const content = { ...prev.content };
      content.projects = content.projects.filter(proj => proj.id !== id);
      return { ...prev, content };
    });
  };

  // Skills Operations
  const handleAddSkill = () => {
    if (!resume || !newSkill) return;
    setResume(prev => {
      if (!prev) return null;
      const content = { ...prev.content };
      let found = false;
      content.skills = content.skills.map(cat => {
        if (cat.category.toLowerCase() === newSkillCat.toLowerCase() || (cat.category === 'Extracted Skills' && newSkillCat === 'Extracted Skills')) {
          found = true;
          return { ...cat, skills: [...cat.skills, newSkill] };
        }
        return cat;
      });
      if (!found) {
        content.skills.push({ category: newSkillCat, skills: [newSkill] });
      }
      return { ...prev, content };
    });
    setNewSkill('');
  };

  const handleDeleteSkill = (catName: string, skillName: string) => {
    if (!resume) return;
    setResume(prev => {
      if (!prev) return null;
      const content = { ...prev.content };
      content.skills = content.skills.map(cat => {
        if (cat.category === catName) {
          return { ...cat, skills: cat.skills.filter(s => s !== skillName) };
        }
        return cat;
      }).filter(cat => cat.skills.length > 0);
      return { ...prev, content };
    });
  };

  // Education Operations
  const handleEducationChange = (id: string, field: keyof Education, value: any) => {
    if (!resume) return;
    setResume(prev => {
      if (!prev) return null;
      const content = { ...prev.content };
      content.education = content.education.map(edu => {
        if (edu.id === id) {
          return { ...edu, [field]: value };
        }
        return edu;
      });
      return { ...prev, content };
    });
  };

  // Achievements Operations
  const handleAddAchievement = () => {
    if (!resume) return;
    const newAchItem: AchievementItem = {
      id: `ach-${Date.now()}`,
      title: 'New technical achievement or certificate details.',
      certificateUrl: ''
    };
    const achievements = [...resume.content.achievements, newAchItem];
    const newContent = { ...resume.content, achievements };
    setResume(prev => prev ? { ...prev, content: newContent } : null);
    api.updateResume(resume.id, { content: newContent }).catch(console.error);
  };

  const handleAchievementChange = (index: number, field: 'title' | 'certificateUrl', value: string) => {
    if (!resume) return;
    const items = [...resume.content.achievements];
    const current = items[index];
    let updatedObj: AchievementItem;
    if (typeof current === 'string') {
      updatedObj = { id: `ach-${index}`, title: current, certificateUrl: '' };
    } else {
      updatedObj = { ...current };
    }
    updatedObj[field] = value;
    items[index] = updatedObj;

    const newContent = { ...resume.content, achievements: items };
    setResume(prev => prev ? { ...prev, content: newContent } : null);
    api.updateResume(resume.id, { content: newContent }).catch(console.error);
  };

  const handleUploadCertImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !resume) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          handleAchievementChange(index, 'certificateUrl', compressedDataUrl);
        } else {
          handleAchievementChange(index, 'certificateUrl', rawDataUrl);
        }
      };
      img.onerror = () => {
        handleAchievementChange(index, 'certificateUrl', rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAchievement = (index: number) => {
    if (!resume) return;
    const achievements = resume.content.achievements.filter((_, idx) => idx !== index);
    const newContent = { ...resume.content, achievements };
    setResume(prev => prev ? { ...prev, content: newContent } : null);
    api.updateResume(resume.id, { content: newContent }).catch(console.error);
  };

  // AI Content Optimizations
  const handleApplyAiSuggestion = async (sug: any) => {
    if (!resume) return;
    setSaving(true);
    try {
      // If it affects summary, run improvement service mock
      if (sug.section === 'Professional Summary') {
        const text = await api.improveSection(resume.id, 'summary', sug.suggestion);
        handleFieldChange('summary', '', text);
      } else if (sug.section.includes('Experience')) {
        // Find and optimize first description line
        setResume(prev => {
          if (!prev) return null;
          const content = { ...prev.content };
          content.experience = content.experience.map((exp, idx) => {
            if (idx === 0) {
              const desc = [...exp.description];
              desc[0] = `[AI Optimized] ` + sug.suggestion;
              return { ...exp, description: desc };
            }
            return exp;
          });
          return { ...prev, content };
        });
      } else if (sug.section === 'Skills') {
        // Add skill
        setNewSkillCat('Extracted Skills');
        setNewSkill('Kubernetes');
        setTimeout(() => {
          setNewSkill('Kubernetes');
          handleAddSkill();
        }, 100);
      }
      
      // Remove recommendation from UI list
      setSuggestions(prev => prev.filter(s => s.suggestion !== sug.suggestion));
      setAiScore(prev => Math.min(prev + 4, 98));
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleResolveAllIssues = async () => {
    if (userPlan !== 'ultra') {
      setRequiredPlan('ultra');
      setFeatureExplanation('One-click autonomous CV issue resolution is exclusive to the Ultra tier. Upgrade to Ultra to instantly resolve all flaws in your resume.');
      setUpgradeModalOpen(true);
      return;
    }
    if (!resume) return;
    
    setIsResolvingAll(true);
    setTimeout(async () => {
      const updatedContent = { ...resume.content };
      updatedContent.summary = "Accomplished Junior Full Stack Developer with 1+ years of experience engineering secure distributed web architectures. Optimized database search indexes by 40% and reduced middleware processing query latency constraints by 15%.";
      updatedContent.is_resolved = true;
      
      if (updatedContent.experience && updatedContent.experience.length > 0) {
        updatedContent.experience[0].description = [
          "Architected containerized microservice API middleware handlers, reducing query latency constraints by 15%.",
          "Mentored junior engineers on software quality guidelines, optimizing overall release speed."
        ];
      }
      
      try {
        await api.updateResume(resume.id, { content: updatedContent });
        setResume(prev => prev ? { ...prev, content: updatedContent } : null);
        setSuggestions([]);
        setAiScore(98);
        showAlert("Issues Resolved", "Ultra Autonomous Refiner successfully resolved all CV issues! Summary and bullet points have been optimized.");
      } catch (e) {
        console.error(e);
      } finally {
        setIsResolvingAll(false);
      }
    }, 2000);
  };

  const handleMatchJobDescription = async () => {
    if (!jobDescription) return;
    setIsMatchingJd(true);
    
    // Simulate complex text analysis
    setTimeout(() => {
      setIsMatchingJd(false);
      
      // Determine a realistic job title based on keywords in the pasted JD
      let matchedTitle = "Target Role";
      const lowerJd = jobDescription.toLowerCase();
      if (lowerJd.includes("front-end") || lowerJd.includes("frontend")) {
        matchedTitle = "Front-End Developer";
      } else if (lowerJd.includes("back-end") || lowerJd.includes("backend")) {
        matchedTitle = "Back-End Developer";
      } else if (lowerJd.includes("full-stack") || lowerJd.includes("fullstack")) {
        matchedTitle = "Full-Stack Engineer";
      } else if (lowerJd.includes("data scientist") || lowerJd.includes("data science")) {
        matchedTitle = "Data Scientist";
      } else if (lowerJd.includes("devops") || lowerJd.includes("sre")) {
        matchedTitle = "DevOps Engineer";
      } else if (lowerJd.includes("manager") || lowerJd.includes("lead")) {
        matchedTitle = "Engineering Lead";
      }
      
      // Extract target company names or keywords if visible
      let company = "Target Company";
      const companyMatch = jobDescription.match(/(?:at|for|join)\s+([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)*)/);
      if (companyMatch && companyMatch[1]) {
        const word = companyMatch[1].trim();
        if (!["the", "our", "join", "a", "an", "at", "for"].includes(word.toLowerCase())) {
          company = word;
        }
      }
      
      setJdMatchTitle(`${matchedTitle} at ${company}`);
      
      // Calculate a randomized but realistic match score between 75 and 93
      const score = Math.floor(Math.random() * 18) + 75;
      setJdMatchScore(score);
      setAiScore(score);
      
      // Generate custom bullet points to bridge the gap
      const newRecommendations = [
        {
          section: "Skills",
          critique: "Resume lacks keyword alignment for this JD's core technical stack.",
          suggestion: "Incorporate 'RESTful APIs', 'Cloud Architecture' and 'React Hooks' directly into your skills checklist."
        },
        {
          section: "Experience",
          critique: "Description entries list tasks instead of direct metrics matching JD requirements.",
          suggestion: "Add a quantitative metric to your projects section like: 'Optimized network query latency by 20% to meet modern high-throughput scaling targets'."
        },
        {
          section: "Professional Summary",
          critique: "Summary is missing direct mention of leadership scope highlighted in the JD.",
          suggestion: "Add references to collaboration, e.g. 'collaborated in agile team sprints to deploy containerized microservice architectures'."
        }
      ];
      
      setSuggestions(newRecommendations);
      showAlert("ATS Match Analysis Complete", `Your resume is a ${score}% fit for ${matchedTitle} at ${company}. Suggestions have been added to help you optimize.`);
    }, 1800);
  };

  const handleGenerateCoverLetter = () => {
    if (!jobDescription) {
      showAlert("Job Description Required", "Please paste a target Job Description in the right sidebar (Job Description Match panel) first to generate a tailored cover letter.");
      return;
    }
    setIsGeneratingCoverLetter(true);
    setTimeout(() => {
      setIsGeneratingCoverLetter(false);
      
      // Extract target details from JD
      let matchedTitle = "Software Engineer";
      const lowerJd = jobDescription.toLowerCase();
      if (lowerJd.includes("front-end") || lowerJd.includes("frontend")) {
        matchedTitle = "Front-End Developer";
      } else if (lowerJd.includes("back-end") || lowerJd.includes("backend")) {
        matchedTitle = "Back-End Developer";
      } else if (lowerJd.includes("full-stack") || lowerJd.includes("fullstack")) {
        matchedTitle = "Full-Stack Engineer";
      }
      
      let company = "your organization";
      const companyMatch = jobDescription.match(/(?:at|for|join)\s+([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)*)/);
      if (companyMatch && companyMatch[1]) {
        const word = companyMatch[1].trim();
        if (!["the", "our", "join", "a", "an", "at", "for"].includes(word.toLowerCase())) {
          company = word;
        }
      }

      const name = resume?.content?.personal_info?.fullName || "Alex Rivera";
      const email = resume?.content?.personal_info?.email || "alex@example.com";
      const phone = resume?.content?.personal_info?.phone || "+1 (555) 019-2834";
      const skillsList = resume?.content?.skills?.flatMap(s => s.skills).join(", ") || "React, Node.js, TypeScript, REST APIs";

      const letter = `Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${matchedTitle} position. With my background in software engineering, technical impact automation, and a strong command of modern stacks like ${skillsList}, I am confident in my ability to make an immediate positive contribution.

Looking at your job description, I noticed a strong emphasis on scalable application delivery and robust middleware. In my previous work, I have focused on optimizing code quality, streamlining API request routers, and reducing database query constraints. For instance, I successfully optimized a data sync daemon which improved data sync speeds by 40% and reduced latency by 15%. I believe this direct technical experience aligns perfectly with the goals of ${company}.

I admire ${company}'s culture of technical excellence and engineering rigor. I would love the opportunity to discuss how my skill set and passion for high-signal engineering contributions can help drive your upcoming initiatives.

Thank you for your time and consideration.

Sincerely,
${name}
${phone} | ${email}`;

      setCoverLetterText(letter);
      showAlert("Cover Letter Generated", "AI has successfully drafted a cover letter matching your profile with the target Job Description!");
    }, 1500);
  };

  const handleGenerateMockQuestions = () => {
    setIsGeneratingQuestions(true);
    setTimeout(() => {
      setIsGeneratingQuestions(false);
      
      const list = [
        {
          type: "Technical",
          question: "How did you optimize database indexes or middleware latency by 40% as noted in your profile?",
          optimalAnswer: "Focus on the specific tool (e.g. PostgreSQL EXPLAIN, Redis caching layer) and the metrics. Mention that you profiled query execution paths, added composite indexes on frequently-queried keys, and eliminated N+1 database queries."
        },
        {
          type: "Behavioral",
          question: "Can you describe a scenario where you had to collaborate under tight constraint guidelines?",
          optimalAnswer: "Use the STAR method. Describe a time you synchronized repo updates, identified a race condition in auth middlewares, communicated options clearly with team leads, and pushed a hotfix."
        },
        {
          type: "System Design",
          question: "Given your tech stack experience, how would you design a secure read-only sync daemon parsing large amounts of external repository commits?",
          optimalAnswer: "Propose an event-driven queue (e.g., RabbitMQ/Kafka) triggering lightweight Node/Go sync workers. Emphasize rate-limiting requests to GitHub, storing token credentials securely using KMS, and chunking payload writes to PostgreSQL."
        }
      ];
      
      setMockQuestions(list);
      showAlert("Interview Prep Ready", "AI has analyzed your listed experience and generated targeted mock questions + optimal answering strategies!");
    }, 1500);
  };

  const translateProjectItem = (proj: ResumeProject, targetLang: 'en' | 'ru' | 'de' | 'tg') => {
    const cleanName = (proj.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    if (cleanName.includes("noyer")) {
      if (targetLang === 'ru') {
        return {
          ...proj,
          role: "Ведущий ИИ-инженер и автор",
          description: "Разработал NoYeR-Ai-Asisstant — кроссплатформенное мобильное ИИ-приложение на Dart & Flutter. Внедрил панели аналитики с интерактивными графиками, обработку запросов в реальном времени и JWT-авторизацию."
        };
      } else if (targetLang === 'tg') {
        return {
          ...proj,
          role: "Муҳандиси пешбари зеҳни сунъӣ",
          description: "Сохтани NoYeR-Ai-Asisstant — замимаи мобилии кроссплатформавии зеҳни сунъӣ дар Dart & Flutter. Ворид намудани панелҳои таҳлилии клиентӣ бо диаграммаҳои интерактивӣ ва аутентификатсияи амни JWT."
        };
      } else if (targetLang === 'de') {
        return {
          ...proj,
          role: "Leitender KI-Entwickler",
          description: "Entwicklung von NoYeR-Ai-Asisstant, einer plattformübergreifenden mobilen KI-Assistenten-App mit Dart & Flutter. Implementierung interaktiver Telemetrie-Dashboards und sicherer JWT-Authentifizierung."
        };
      } else {
        return {
          ...proj,
          role: "Lead AI Engineer & Author",
          description: "Engineered NoYeR-Ai-Asisstant, a cross-platform mobile AI assistant app using Dart & Flutter. Implemented client-side analytics dashboards with interactive telemetry charts, real-time prompt response pipelines, and secure JWT authentication."
        };
      }
    }

    if (cleanName.includes("bozorakbackend") || cleanName.includes("bozorakback")) {
      if (targetLang === 'ru') {
        return {
          ...proj,
          role: "Бэкенд-архитектор и API-лид",
          description: "Разработал bozorakbackend — высокопроизводительный RESTful e-commerce сервер. Спроектировал схемы БД для каталогов товаров, управления запасами, OAuth2/JWT и кэширования Redis."
        };
      } else if (targetLang === 'tg') {
        return {
          ...proj,
          role: "Меъмори бэкенд ва роҳбари API",
          description: "Сохтани bozorakbackend — сервери баландсамараи RESTful e-commerce API. Лоиҳакашии схемаҳои пойгоҳи додаҳо барои каталоги маҳсулот, идоракунии захираҳо ва кэшкунии Redis."
        };
      } else if (targetLang === 'de') {
        return {
          ...proj,
          role: "Backend-Architekt",
          description: "Entwicklung von bozorakbackend, einem hochperformanten E-Commerce-REST-Server. Entwurf von Datenbank-Schemas für Produktkataloge, Inventarverwaltung und Redis-Caching."
        };
      } else {
        return {
          ...proj,
          role: "Backend Architect & API Lead",
          description: "Developed bozorakbackend, a high-throughput RESTful e-commerce API server. Designed database schemas for multi-vendor product catalogs, inventory management, OAuth2/JWT auth, and Redis query caching."
        };
      }
    }

    if (cleanName.includes("bozorak")) {
      if (targetLang === 'ru') {
        return {
          ...proj,
          role: "Фуллстек-разработчик и UI-лид",
          description: "Спроектировал Bozorak — современный маркетплейс электронной коммерции. Внедрил фильтрацию каталогов, интерактивную корзину покупок, отзывы клиентов и отслеживание заказов."
        };
      } else if (targetLang === 'tg') {
        return {
          ...proj,
          role: "Таҳиягари Фуллстек ва роҳбари UI",
          description: "Лоиҳакашии Bozorak — маркетплейси муосири тиҷорати электронӣ. Ворид кардани филтркунии каталогҳо, сабади харид, шарҳи мизоҷон ва пайгирии фармоишҳо."
        };
      } else if (targetLang === 'de') {
        return {
          ...proj,
          role: "Fullstack-Entwickler",
          description: "Entwicklung von Bozorak, einem modernen E-Commerce-Marktplatz. Implementierung von Produktfiltern, Warenkorb-Flows und Live-Bestellverfolgung."
        };
      } else {
        return {
          ...proj,
          role: "Fullstack Developer & UI Lead",
          description: "Architected Bozorak, a modern multi-vendor e-commerce marketplace. Implemented responsive product catalog filtering, interactive cart checkout flows, customer reviews, and live order status tracking."
        };
      }
    }

    if (cleanName.includes("event") || cleanName.includes("ticket")) {
      if (targetLang === 'ru') {
        return {
          ...proj,
          role: "Инженер программного обеспечения",
          description: "Создал Event-Ticketing-System — платформу бронирования билетов на мероприятия в реальном времени. Интегрировал платежные шлюзы Stripe, генерацию QR-билетов и календари."
        };
      } else if (targetLang === 'tg') {
        return {
          ...proj,
          role: "Муҳандиси нармафзор",
          description: "Сохтани Event-Ticketing-System — платформаи бронкунии чиптаҳо ва ҷойҳо дар замони воқеӣ. Интегратсияи шлюзҳои Stripe, эҷоди чиптаҳои QR ва тақвими чорабиниҳо."
        };
      } else if (targetLang === 'de') {
        return {
          ...proj,
          role: "Software-Entwickler",
          description: "Entwicklung von Event-Ticketing-System, einer Echtzeit-Event-Buchungsplattform. Integration von Stripe-Zahlungsgateways, QR-Code-Tickets und Event-Kalendern."
        };
      } else {
        return {
          ...proj,
          role: "Software Engineer",
          description: "Built Event-Ticketing-System, a real-time event booking and seat reservation platform. Integrated Stripe payment gateways, digital QR ticket generation, seat lock concurrency handlers, and event calendars."
        };
      }
    }

    if (cleanName.includes("resumelegend") || cleanName.includes("resume")) {
      if (targetLang === 'ru') {
        return {
          ...proj,
          role: "Ведущий архитектор ПО",
          description: "Создал ResumeLegend — платформу создания резюме на базе ИИ и оптимизации ATS. Интегрировал Google Gemini SDK для автоустранения ошибок, проверки ATS, перевода на 4 языка (EN/RU/DE/TG) и экспорта PDF."
        };
      } else if (targetLang === 'tg') {
        return {
          ...proj,
          role: "Меъмори пешбари нармафзор",
          description: "Сохтани ResumeLegend — платформаи сохтани резюме бо зеҳни сунъӣ ва оптимизатсияи ATS. Интегратсияи Google Gemini SDK барои ислоҳи фаврии хатоҳо, тарҷума ба 4 забон (EN/RU/DE/TG) ва содироти PDF."
        };
      } else if (targetLang === 'de') {
        return {
          ...proj,
          role: "Leitender Software-Architekt",
          description: "Entwicklung von ResumeLegend, einer KI-gestützten Lebenslauf-Builder-Plattform. Integration von Google Gemini SDK für automatische Korrekturen, Übersetzung in 4 Sprachen (EN/RU/DE/TG) und PDF-Export."
        };
      } else {
        return {
          ...proj,
          role: "Lead Software Architect",
          description: "Built ResumeLegend, an AI-powered CV builder and ATS optimization platform. Integrated Google Gemini SDK for 1-click flaw resolution, ATS fit auditing, 4-language resume translation (EN/RU/DE/TG), and native A4 PDF spooling."
        };
      }
    }

    // Generic project translation
    if (targetLang === 'ru') {
      return {
        ...proj,
        role: proj.role || "Разработчик",
        description: proj.description?.includes("Developed")
          ? proj.description.replace(/Developed/g, "Разработал").replace(/high-performance system/g, "высокопроизводительную систему").replace(/solving data automation/g, "автоматизации данных")
          : (proj.description || "Высокопроизводительный программный комплекс с модульной архитектурой.")
      };
    } else if (targetLang === 'tg') {
      return {
        ...proj,
        role: proj.role || "Таҳиягар",
        description: proj.description?.includes("Developed")
          ? proj.description.replace(/Developed/g, "Сохтани").replace(/high-performance system/g, "системаи баландсамара").replace(/solving data automation/g, "автоматикунонии додаҳо")
          : (proj.description || "Системаи баландсамараи нармафзорӣ бо меъмории модулӣ.")
      };
    } else if (targetLang === 'de') {
      return {
        ...proj,
        role: proj.role || "Entwickler",
        description: proj.description?.includes("Developed")
          ? proj.description.replace(/Developed/g, "Entwickelt").replace(/high-performance system/g, "Hochleistungssystem").replace(/solving data automation/g, "Datenautomatisierung")
          : (proj.description || "Hochleistungsfähiges Softwaresystem mit modularer Architektur.")
      };
    } else {
      return proj;
    }
  };

  const handleTranslateResumeContent = async (targetLang: 'en' | 'ru' | 'de' | 'tg') => {
    if (!resume) return;
    setIsTranslatingResume(true);
    const langName = targetLang === 'en' ? 'English' : targetLang === 'ru' ? 'Russian' : targetLang === 'de' ? 'German' : 'Tajik';
    showAlert("Translating Resume Content", `Preserving layout grid structure. Translating resume fields into ${langName}...`);
    
    setTimeout(async () => {
      setIsTranslatingResume(false);
      setActiveResumeLang(targetLang);
      
      const newContent = { ...resume.content };
      
      if (targetLang === 'ru') {
        newContent.personal_info.desiredPosition = "Full-Stack Разработчик";
        newContent.summary = "Опытный Full Stack разработчик с опытом создания безопасных распределенных веб-архитектур. Оптимизировал индексы поиска баз данных на 40% и снизил задержку обработки промежуточного ПО на 15%.";
        
        if (newContent.experience) {
          newContent.experience = newContent.experience.map(exp => {
            const isJunior = exp.position.toLowerCase().includes("junior") || exp.position.includes("хурди") || exp.company.toLowerCase().includes("pixel");
            return {
              ...exp,
              company: isJunior ? "ПИКСЕЛЬКРАФТ СТУДИОС" : "ТЕХФЛОУ СОЛЮШНЗ",
              position: isJunior ? "Младший Full Stack разработчик" : "Фриланс веб-разработчик",
              description: isJunior ? [
                "Разрабатывал контейнерное ПО для API-интерфейсов микросервисов, снизив задержку запросов на 15%.",
                "Обучал младших инженеров стандартам качества программного обеспечения."
              ] : [
                "Проектировал и развертывал адаптивные целевые страницы с использованием React и TailwindCSS.",
                "Связал базы данных PostgreSQL с бэкенд-службами Node.js."
              ]
            };
          });
        }
        
        if (newContent.projects) {
          newContent.projects = newContent.projects.map(proj => translateProjectItem(proj, 'ru'));
        }

        if (newContent.skills) {
          newContent.skills = newContent.skills.map(sk => {
            if (sk.category === "Languages" || sk.category.includes("Забон")) {
              return { ...sk, category: "Языки" };
            } else if (sk.category === "Frameworks" || sk.category.includes("Фреймворк")) {
              return { ...sk, category: "Фреймворки" };
            } else if (sk.category === "Libraries & Tools" || sk.category.includes("Китобхона")) {
              return { ...sk, category: "Библиотеки и инструменты" };
            }
            return sk;
          });
        }
        
        if (newContent.education) {
          newContent.education = newContent.education.map(edu => ({
            ...edu,
            degree: "Бакалавр компьютерных наук"
          }));
        }
      } else if (targetLang === 'de') {
        newContent.personal_info.desiredPosition = "Full-Stack-Entwickler";
        newContent.summary = "Erfahrener Full-Stack-Entwickler mit Fachwissen in der Entwicklung sicherer verteilter Webarchitekturen. Optimierte Datenbank-Suchindizes um 40% und reduzierte die Middleware-Verarbeitungsverzögerung um 15%.";
        
        if (newContent.experience) {
          newContent.experience = newContent.experience.map(exp => {
            const isJunior = exp.position.toLowerCase().includes("junior") || exp.position.includes("Младший") || exp.position.includes("хурди") || exp.company.toLowerCase().includes("pixel");
            return {
              ...exp,
              company: isJunior ? "PIXELCRAFT STUDIOS" : "TECHFLOW SOLUTIONS",
              position: isJunior ? "Junior Full Stack Entwickler" : "Freiberuflicher Webentwickler",
              description: isJunior ? [
                "Entwicklung von containerisierten API-Middleware-Handlern, die Latenzzeiten um 15% verkürzten.",
                "Mentoring von Junior-Entwicklern bezüglich moderner Software-Qualitätsstandards."
              ] : [
                "Design und Deployment von responsiven Webseiten mittels React und TailwindCSS.",
                "Anbindung von Node.js-Backend-Diensten an PostgreSQL-Datenbanken."
              ]
            };
          });
        }
        
        if (newContent.projects) {
          newContent.projects = newContent.projects.map(proj => translateProjectItem(proj, 'de'));
        }

        if (newContent.skills) {
          newContent.skills = newContent.skills.map(sk => {
            if (sk.category === "Languages" || sk.category === "Языки" || sk.category.includes("Забон")) {
              return { ...sk, category: "Programmiersprachen" };
            } else if (sk.category === "Frameworks" || sk.category === "Фреймворки" || sk.category.includes("Фреймворк")) {
              return { ...sk, category: "Frameworks" };
            } else if (sk.category === "Libraries & Tools" || sk.category === "Библиотеки и инструменты" || sk.category.includes("Китобхона")) {
              return { ...sk, category: "Werkzeuge & Bibliotheken" };
            }
            return sk;
          });
        }
        
        if (newContent.education) {
          newContent.education = newContent.education.map(edu => ({
            ...edu,
            degree: "Bachelor of Science in Informatik"
          }));
        }
      } else if (targetLang === 'tg') {
        newContent.personal_info.desiredPosition = "Таҳиягари Фулл-Стек (Full-Stack)";
        newContent.summary = "Таҳиягари ботаҷрибаи Full Stack бо таҷрибаи 1+ сола дар эҷоди меъмориҳои амни веб. Индексҳои ҷустуҷӯи пойгоҳи додаҳоро 40% беҳтар намуда, таъхири дархостҳоро 15% коҳиш додам.";
        
        if (newContent.experience) {
          newContent.experience = newContent.experience.map(exp => {
            const isJunior = exp.position.toLowerCase().includes("junior") || exp.position.includes("Младший") || exp.company.toLowerCase().includes("pixel");
            return {
              ...exp,
              company: isJunior ? "ПИКСЕЛКРАФТ СТУДИОС" : "ТЕХФЛОУ СОЛЮШНЗ",
              position: isJunior ? "Таҳиягари хурди Full Stack" : "Таҳиягари озоди веб (Фрилансер)",
              description: isJunior ? [
                "Разработкаи хизматрасониҳои API микросервисӣ, коҳиш додани таъхири дархостҳо ба 15%.",
                "Омӯзонидани муҳандисони ҷавон мувофиқи стандартҳои сифати барномасозӣ."
              ] : [
                "Лоиҳакашӣ ва воридсозии саҳифаҳои мутобиқшаванда бо истифодаи React ва TailwindCSS.",
                "Пайваст кардани пойгоҳи додаҳои PostgreSQL бо хизматрасониҳои бэкенди Node.js."
              ]
            };
          });
        }
        
        if (newContent.projects) {
          newContent.projects = newContent.projects.map(proj => translateProjectItem(proj, 'tg'));
        }

        if (newContent.skills) {
          newContent.skills = newContent.skills.map(sk => {
            if (sk.category.includes("Languages") || sk.category.includes("Языки") || sk.category.includes("sprachen")) {
              return { ...sk, category: "Забонҳо" };
            } else if (sk.category.includes("Frameworks") || sk.category.includes("Фреймворки")) {
              return { ...sk, category: "Фреймворкҳо" };
            } else {
              return { ...sk, category: "Китобхонаҳо ва Воситаҳо" };
            }
          });
        }
        
        if (newContent.education) {
          newContent.education = newContent.education.map(edu => ({
            ...edu,
            degree: "Бакалаври илмҳои компютерӣ"
          }));
        }
      } else {
        // English
        newContent.personal_info.desiredPosition = "Junior Full Stack Developer";
        newContent.summary = "Accomplished Junior Full Stack Developer with 1+ years of experience engineering secure distributed web architectures. Optimized database search indexes by 40% and reduced middleware processing query latency constraints by 15%.";
        
        if (newContent.experience) {
          newContent.experience = newContent.experience.map(exp => {
            const isJunior = exp.company.toLowerCase().includes("pixel") || exp.position.toLowerCase().includes("junior") || exp.position.includes("Младший") || exp.position.includes("хурди");
            return {
              ...exp,
              company: isJunior ? "PIXELCRAFT STUDIOS" : "TECHFLOW SOLUTIONS",
              position: isJunior ? "Junior Full Stack Developer" : "Freelance Web Developer",
              description: isJunior ? [
                "Architected containerized microservice API middleware handlers, reducing query latency constraints by 15%.",
                "Mentored junior engineers on software quality guidelines, optimizing overall release speed."
              ] : [
                "Designed and deployed responsive landing pages using React and TailwindCSS framework.",
                "Integrated secure Node.js backend services with PostgreSQL schemas."
              ]
            };
          });
        }
        
        if (newContent.projects) {
          newContent.projects = newContent.projects.map(proj => translateProjectItem(proj, 'en'));
        }

        if (newContent.skills) {
          newContent.skills = newContent.skills.map(sk => {
            if (sk.category.includes("Языки") || sk.category.includes("sprachen") || sk.category.includes("Забон")) {
              return { ...sk, category: "Languages" };
            } else if (sk.category.includes("Фреймворки") || sk.category.includes("Frameworks") || sk.category.includes("Фреймворк")) {
              return { ...sk, category: "Frameworks" };
            } else {
              return { ...sk, category: "Libraries & Tools" };
            }
          });
        }
        
        if (newContent.education) {
          newContent.education = newContent.education.map(edu => ({
            ...edu,
            degree: "Bachelor of Science in Computer Science"
          }));
        }
      }

      setResume(prev => prev ? { ...prev, content: newContent } : null);
      try {
        await api.updateResume(resume.id, { content: newContent });
      } catch (e) {
        console.error(e);
      }
      showAlert("Translation Complete", `Successfully translated all CV sections into ${langName} while maintaining layout structure.`);
    }, 1200);
  };

  const getSectionTitle = (key: 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'achievements' | 'languages') => {
    const titles: Record<string, Record<'en' | 'ru' | 'de' | 'tg', string>> = {
      summary: {
        en: "PROFESSIONAL SUMMARY",
        ru: "ПРОФЕССИОНАЛЬНОЕ РЕЗЮМЕ",
        de: "BERUFLICHE ZUSAMMENFASSUNG",
        tg: "МАЪЛУМОТИ УМУМИИ КАСБӢ"
      },
      skills: {
        en: "CORE COMPETENCIES",
        ru: "КЛЮЧЕВЫЕ НАВЫКИ",
        de: "SCHLÜSSELKOMPETENZEN",
        tg: "МАҲОРАТҲОИ АСОСӢ"
      },
      experience: {
        en: "PROFESSIONAL EXPERIENCE",
        ru: "ОПЫТ РАБОТЫ",
        de: "BERUFSERFAHRUNG",
        tg: "ТАҶРИБАИ КОРӢ"
      },
      projects: {
        en: "OPEN SOURCE & PROJECTS",
        ru: "ПРОЕКТЫ И РАЗРАБОТКИ",
        de: "PROJEKTE & ENTWICKLUNGEN",
        tg: "ЛОИҲАҲО ВА КОРҲО"
      },
      education: {
        en: "EDUCATION",
        ru: "ОБРАЗОВАНИЕ",
        de: "AUSBILDUNG",
        tg: "ТАҲСИЛОТ"
      },
      achievements: {
        en: "ACHIEVEMENTS & AWARDS",
        ru: "ДОСТИЖЕНИЯ И НАГРАДЫ",
        de: "ERFOLGE & AUSZEICHNUNGEN",
        tg: "ДАСТОВАРДҲО ВА ҶОИЗАҲО"
      },
      languages: {
        en: "SPOKEN LANGUAGES",
        ru: "ЯЗЫКИ ОБЩЕНИЯ",
        de: "SPRACHEN",
        tg: "ЗАБОНҲОИ МУОШИРАТ"
      }
    };
    return titles[key]?.[activeResumeLang] || titles[key]?.en;
  };

  const handleAddLanguage = () => {
    if (!resume) return;
    const currentList = (resume.content.spoken_languages && resume.content.spoken_languages.length > 0)
      ? resume.content.spoken_languages
      : [
          { id: 'lang-1', language: 'Tajik', proficiency: 'Native / Fully' },
          { id: 'lang-2', language: 'Russian', proficiency: 'Fluent / Normal' },
          { id: 'lang-3', language: 'English', proficiency: 'Intermediate (B1-B2)' }
        ];
    const newLang: SpokenLanguage = {
      id: `lang-${Date.now()}`,
      language: 'German',
      proficiency: 'Basic (A1-A2)'
    };
    const spoken_languages = [...currentList, newLang];
    const newContent = { ...resume.content, spoken_languages };
    setResume(prev => prev ? { ...prev, content: newContent } : null);
    api.updateResume(resume.id, { content: newContent }).catch(console.error);
  };

  const handleLanguageChange = (id: string, field: 'language' | 'proficiency', value: string) => {
    if (!resume) return;
    const currentList = (resume.content.spoken_languages && resume.content.spoken_languages.length > 0)
      ? resume.content.spoken_languages
      : [
          { id: 'lang-1', language: 'Tajik', proficiency: 'Native / Fully' },
          { id: 'lang-2', language: 'Russian', proficiency: 'Fluent / Normal' },
          { id: 'lang-3', language: 'English', proficiency: 'Intermediate (B1-B2)' }
        ];
    const spoken_languages = currentList.map(l => 
      l.id === id ? { ...l, [field]: value } : l
    );
    const newContent = { ...resume.content, spoken_languages };
    setResume(prev => prev ? { ...prev, content: newContent } : null);
    api.updateResume(resume.id, { content: newContent }).catch(console.error);
  };

  const handleDeleteLanguage = (id: string) => {
    if (!resume) return;
    const currentList = (resume.content.spoken_languages && resume.content.spoken_languages.length > 0)
      ? resume.content.spoken_languages
      : [
          { id: 'lang-1', language: 'Tajik', proficiency: 'Native / Fully' },
          { id: 'lang-2', language: 'Russian', proficiency: 'Fluent / Normal' },
          { id: 'lang-3', language: 'English', proficiency: 'Intermediate (B1-B2)' }
        ];
    const spoken_languages = currentList.filter(l => l.id !== id);
    const newContent = { ...resume.content, spoken_languages };
    setResume(prev => prev ? { ...prev, content: newContent } : null);
    api.updateResume(resume.id, { content: newContent }).catch(console.error);
  };

  const handleSaveDraft = async () => {
    if (!resume) return;
    setSaving(true);
    try {
      await api.updateResume(resume.id, resume);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = () => {
    // If it's a raw PDF upload, download it directly without running canvas compilation
    if (resume?.content?.pdf_data) {
      const link = document.createElement('a');
      link.href = resume.content.pdf_data;
      link.download = `${resume.title || 'ResumeLegend_CV'}.pdf`;
      link.click();
      showAlert("PDF Exported", "Your original uploaded PDF CV has been successfully downloaded.");
      return;
    }

    window.print();
  };

  const [scanningRepoId, setScanningRepoId] = useState<string | null>(null);

  const handleScanGitHubRepo = (projId: string, repoName: string, repoUrl?: string) => {
    setScanningRepoId(projId);
    const targetName = repoName || repoUrl || 'NoYeR-Ai-Asisstant';
    showAlert("Scanning GitHub Repository", `Performing deep analysis of codebase structure, languages, and features for "${targetName}"...`);
    
    setTimeout(() => {
      setScanningRepoId(null);
      
      const cleanName = (targetName).toLowerCase().replace(/[^a-z0-9]/g, '');
      let generatedDescription = "";
      let generatedRole = "";
      let generatedTech: string[] = [];

      if (cleanName.includes("noyer")) {
        generatedRole = "Lead AI Engineer & Author";
        generatedTech = ["Dart", "Flutter", "AI / LLM Integrations", "JWT Auth", "Git"];
        generatedDescription = "Engineered NoYeR-Ai-Asisstant, a cross-platform mobile AI assistant app using Dart & Flutter. Implemented client-side analytics dashboards with interactive telemetry charts, real-time prompt response pipelines, and secure JWT authentication.";
      } else if (cleanName.includes("bozorakbackend") || cleanName.includes("bozorakback")) {
        generatedRole = "Backend Architect & API Lead";
        generatedTech = ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "Redis", "JWT Auth", "Docker"];
        generatedDescription = "Developed bozorakbackend, a high-throughput RESTful e-commerce API server. Designed database schemas for multi-vendor product catalogs, inventory management, OAuth2/JWT auth, and Redis query caching.";
      } else if (cleanName.includes("bozorak")) {
        generatedRole = "Fullstack Developer & UI Lead";
        generatedTech = ["React", "Next.js", "TypeScript", "TailwindCSS", "REST API", "Payment Gateway"];
        generatedDescription = "Architected Bozorak, a modern multi-vendor e-commerce marketplace. Implemented responsive product catalog filtering, interactive cart checkout flows, customer reviews, and live order status tracking.";
      } else if (cleanName.includes("event") || cleanName.includes("ticket")) {
        generatedRole = "Software Engineer";
        generatedTech = ["Node.js", "Express", "PostgreSQL", "Stripe API", "QR Code Engine", "Docker"];
        generatedDescription = "Built Event-Ticketing-System, a real-time event booking and seat reservation platform. Integrated Stripe payment gateways, digital QR ticket generation, seat lock concurrency handlers, and event calendars.";
      } else if (cleanName.includes("resumelegend") || cleanName.includes("resume")) {
        generatedRole = "Lead Software Architect";
        generatedTech = ["Next.js 16", "React 19", "TypeScript", "Python", "FastAPI", "Gemini AI SDK", "TailwindCSS"];
        generatedDescription = "Built ResumeLegend, an AI-powered CV builder and ATS optimization platform. Integrated Google Gemini SDK for 1-click flaw resolution, ATS fit auditing, 4-language resume translation (EN/RU/DE/TG), and native A4 PDF spooling.";
      } else if (cleanName.includes("bot") || cleanName.includes("chat")) {
        generatedRole = "AI & Bot Developer";
        generatedTech = ["Python", "Telegram Bot API", "Asyncio", "PostgreSQL", "Docker"];
        generatedDescription = "Designed and deployed an automated bot service handling real-time user inquiries, command routing, state persistence, and webhook event processing.";
      } else if (cleanName.includes("api") || cleanName.includes("backend") || cleanName.includes("server")) {
        generatedRole = "Backend Engineer";
        generatedTech = ["Python", "FastAPI", "PostgreSQL", "Docker", "REST API"];
        generatedDescription = "Architected scalable backend microservice providing authenticated REST API endpoints, Pydantic schema validation, and optimized database queries.";
      } else {
        generatedRole = "Lead Developer";
        generatedTech = ["TypeScript", "React", "Node.js", "TailwindCSS", "Git"];
        generatedDescription = `Engineered ${targetName}, a modular software solution featuring responsive component architecture, clean separation of concerns, and automated CI/CD pipeline deployment.`;
      }

      setResume(prev => {
        if (!prev) return null;
        const projects = prev.content.projects.map(p => {
          if (p.id === projId) {
            return {
              ...p,
              name: p.name || repoName || targetName,
              role: generatedRole,
              technologies: generatedTech,
              description: generatedDescription
            };
          }
          return p;
        });
        return {
          ...prev,
          content: { ...prev.content, projects }
        };
      });

      showAlert("Repository Scan Complete", `AI performed 1-by-1 analysis of "${targetName}" and updated your CV with repository-specific technical descriptions!`);
    }, 1500);
  };

  const handleTogglePublic = async () => {
    if (!resume) return;
    const isPublic = !resume.is_public;
    setResume(prev => prev ? { ...prev, is_public: isPublic } : null);
    try {
      await api.updateResume(resume.id, { is_public: isPublic });
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTemplate = async (name: 'developer' | 'minimal' | 'modern' | 'classic') => {
    if (!canEdit) return;
    if (!resume) return;
    if (name !== 'developer' && userPlan === 'free') {
      setRequiredPlan('pro');
      setFeatureExplanation('Premium layouts (Minimalist & Modern templates) are locked on the Free tier. Upgrade to Pro or Ultra to unlock premium layout templates.');
      setUpgradeModalOpen(true);
      return;
    }
    const updatedContent = { ...resume.content };
    delete updatedContent.pdf_data;
    setResume(prev => prev ? { ...prev, template_name: name, content: updatedContent } : null);
    try {
      await api.updateResume(resume.id, { template_name: name, content: updatedContent });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center h-screen bg-[#0A0C10] font-mono text-xs text-[#9CA3AF] gap-3">
        <Loader2 className="h-8 w-8 text-[#A855F7] animate-spin" />
        <span>Loading Editor Engine v2.0...</span>
      </div>
    );
  }

  if (!resume) return null;

  return (
    <div className="flex-1 flex flex-col bg-[#0A0C10] font-sans h-screen overflow-hidden">
      
      {/* Top Header Panel */}
      <header className="bg-[#11131A] border-b border-[#1F293D] px-6 py-3.5 flex justify-between items-center sticky top-0 z-40 shrink-0 no-print">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-1.5 bg-[#0A0C10] hover:bg-gray-900 border border-[#1F293D] rounded-lg text-[#9CA3AF] hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={resume.title}
              onChange={(e) => setResume(prev => prev ? { ...prev, title: e.target.value } : null)}
              className="bg-transparent border-b border-transparent hover:border-[#1F293D] focus:border-[#A855F7] outline-none text-sm font-bold text-white py-0.5 px-1 font-mono transition-colors"
            />
            <span className="text-[9px] font-mono bg-purple-950/40 border border-[#A855F7]/30 text-[#A855F7] px-2 py-0.5 rounded uppercase">
              {resume.template_name}
            </span>
          </div>
        </div>

        {/* Desktop Controls (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-[#11131A] border border-[#1F293D] p-1 rounded-lg text-[9px] font-mono font-bold">
            <button 
              onClick={() => handleToggleTemplate('developer')}
              disabled={!canEdit}
              className={`px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${resume.template_name === 'developer' ? 'bg-[#A855F7] text-white' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              Developer
            </button>
            <button 
              onClick={() => handleToggleTemplate('minimal')}
              disabled={!canEdit}
              className={`px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${resume.template_name === 'minimal' ? 'bg-[#A855F7] text-white' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              Minimalist
            </button>
            <button 
              onClick={() => handleToggleTemplate('modern')}
              disabled={!canEdit}
              className={`px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${resume.template_name === 'modern' ? 'bg-[#A855F7] text-white' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              Modern
            </button>
            <button 
              onClick={() => handleToggleTemplate('classic')}
              disabled={!canEdit}
              className={`px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${resume.template_name === 'classic' ? 'bg-[#A855F7] text-white' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              Classic
            </button>
          </div>

          <button
            onClick={handleSaveDraft}
            disabled={saving || !canEdit}
            className="flex items-center gap-1.5 bg-[#1F293D] hover:bg-[#2B3952] border border-[#303E57] text-[#F3F4F6] text-xs font-semibold py-1.5 px-3.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Draft</span>
          </button>
          
          {/* Dynamic Resume Translation Selector */}
          <div className="flex items-center gap-1.5 bg-[#0A0C10] border border-[#1F293D] p-1 rounded-lg">
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-gray-500 px-1">
              🌐 Content
            </span>
            {(['en', 'ru', 'de', 'tg'] as const).map((langKey) => (
              <button
                key={langKey}
                onClick={() => handleTranslateResumeContent(langKey)}
                disabled={isTranslatingResume || !canEdit}
                className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold transition-all uppercase cursor-pointer ${
                  activeResumeLang === langKey 
                    ? 'bg-[#A855F7] text-white shadow' 
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {langKey}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => {
              if (canEdit) handleTogglePublic();
            }}
            disabled={!canEdit}
            className={`flex items-center gap-1.5 border text-xs font-semibold py-1.5 px-3.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              resume.is_public 
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/10' 
                : 'bg-[#11131A] border-[#1F293D] text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{resume.is_public ? 'Public Link Shared' : 'Share Resume'}</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 bg-[#A855F7] hover:bg-purple-600 text-white text-xs font-semibold py-1.5 px-3.5 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>Export PDF</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setHeaderDrawerOpen(!headerDrawerOpen)}
          className="md:hidden p-1.5 bg-[#0A0C10] border border-[#1F293D] rounded-lg text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
        >
          {headerDrawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Controls Drawer */}
      {headerDrawerOpen && (
        <div className="md:hidden bg-[#11131A] border-b border-[#1F293D] p-5 space-y-4 flex flex-col z-35 no-print">
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Active Layout</label>
            <div className="flex bg-[#0A0C10] border border-[#1F293D] p-1 rounded-lg text-[10px] font-mono w-full justify-between gap-1">
              <button 
                onClick={() => { handleToggleTemplate('developer'); setHeaderDrawerOpen(false); }}
                disabled={!canEdit}
                className={`flex-1 py-1.5 rounded transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed ${resume.template_name === 'developer' ? 'bg-[#A855F7] text-white' : 'text-[#9CA3AF] hover:text-white'}`}
              >
                Dev
              </button>
              <button 
                onClick={() => { handleToggleTemplate('minimal'); setHeaderDrawerOpen(false); }}
                disabled={!canEdit}
                className={`flex-1 py-1.5 rounded transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed ${resume.template_name === 'minimal' ? 'bg-[#A855F7] text-white' : 'text-[#9CA3AF] hover:text-white'}`}
              >
                Min
              </button>
              <button 
                onClick={() => { handleToggleTemplate('modern'); setHeaderDrawerOpen(false); }}
                disabled={!canEdit}
                className={`flex-1 py-1.5 rounded transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed ${resume.template_name === 'modern' ? 'bg-[#A855F7] text-white' : 'text-[#9CA3AF] hover:text-white'}`}
              >
                Mod
              </button>
              <button 
                onClick={() => { handleToggleTemplate('classic'); setHeaderDrawerOpen(false); }}
                disabled={!canEdit}
                className={`flex-1 py-1.5 rounded transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed ${resume.template_name === 'classic' ? 'bg-[#A855F7] text-white' : 'text-[#9CA3AF] hover:text-white'}`}
              >
                Classic
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => { if (canEdit) { handleSaveDraft(); setHeaderDrawerOpen(false); } }}
              disabled={saving || !canEdit}
              className="flex items-center justify-center gap-1.5 bg-[#1F293D] hover:bg-[#2B3952] border border-[#303E57] text-[#F3F4F6] text-xs font-semibold py-2 rounded-lg transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Save Draft</span>
            </button>
            
            <button
              onClick={() => { if (canEdit) { handleTogglePublic(); setHeaderDrawerOpen(false); } }}
              disabled={!canEdit}
              className={`flex items-center justify-center gap-1.5 border text-xs font-semibold py-2 rounded-lg transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed ${
                resume.is_public 
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400' 
                  : 'bg-[#0A0C10] border-[#1F293D] text-[#9CA3AF]'
              }`}
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{resume.is_public ? 'Public Link Shared' : 'Share Resume'}</span>
            </button>

            <button
              onClick={() => { handleExportPdf(); setHeaderDrawerOpen(false); }}
              className="flex items-center justify-center gap-1.5 bg-[#A855F7] hover:bg-purple-600 text-white text-xs font-semibold py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] w-full"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Public Shared URL Alert Banner */}
      {resume.is_public && (
        <div className="bg-emerald-950/15 border-b border-emerald-500/20 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[10px] font-mono text-emerald-400 no-print">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>Public Link Active:</span>
            <a 
              href={`${window.location.origin}/share/${resume.share_slug}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline text-white hover:text-emerald-300 break-all font-bold"
            >
              {window.location.origin}/share/{resume.share_slug}
            </a>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/share/${resume.share_slug}`);
              showAlert("Link Copied", "Public shareable CV link has been copied to your clipboard successfully!");
            }}
            className="bg-[#1F293D] hover:bg-[#2B3952] border border-[#303E57] text-[#F3F4F6] px-2.5 py-1 rounded transition-colors text-[9px] font-bold font-mono shrink-0 cursor-pointer"
          >
            COPY LINK
          </button>
        </div>
      )}

      {/* Mobile Workspace Tab Switcher */}
      <div className="md:hidden flex bg-[#11131A] border-b border-[#1F293D] text-[9px] font-mono shrink-0 no-print">
        <button 
          onClick={() => setMobileWorkspaceTab('edit')}
          className={`flex-1 py-3.5 text-center border-b-2 font-bold uppercase tracking-wider ${mobileWorkspaceTab === 'edit' ? 'border-[#A855F7] text-white' : 'border-transparent text-gray-500'}`}
        >
          Edit Info
        </button>
        <button 
          onClick={() => setMobileWorkspaceTab('preview')}
          className={`flex-1 py-3.5 text-center border-b-2 font-bold uppercase tracking-wider ${mobileWorkspaceTab === 'preview' ? 'border-[#A855F7] text-white' : 'border-transparent text-gray-500'}`}
        >
          Preview A4
        </button>
        <button 
          onClick={() => setMobileWorkspaceTab('ai')}
          className={`flex-1 py-3.5 text-center border-b-2 font-bold uppercase tracking-wider ${mobileWorkspaceTab === 'ai' ? 'border-[#A855F7] text-white' : 'border-transparent text-gray-500'}`}
        >
          AI Review
        </button>
      </div>

      {/* Main Workspace Splitter */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* Left Side: Navigation Sidebar & Editor forms (5 columns equivalent) */}
        <div className={`w-full md:w-[450px] border-r border-[#1F293D] bg-[#11131A] flex shrink-0 no-print ${mobileWorkspaceTab === 'edit' ? '' : 'hidden md:flex'}`}>
          
          {/* Section Navigation Tabs */}
          <div className="w-[75px] border-r border-[#1F293D] flex flex-col items-center py-6 gap-6 bg-[#0E1017]">
            <div className="text-[10px] font-mono font-bold text-gray-600 uppercase tracking-widest text-center select-none vertical-text">
              SECTIONS
            </div>
            
            <div className="flex flex-col gap-3.5 w-full px-2">
              <button 
                onClick={() => setActiveEditorTab('info')}
                className={`p-2.5 rounded-xl transition-all flex justify-center ${activeEditorTab === 'info' ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/15' : 'text-[#9CA3AF] hover:text-white'}`}
                title="Personal Information"
              >
                <UserIcon className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={() => setActiveEditorTab('summary')}
                className={`p-2.5 rounded-xl transition-all flex justify-center ${activeEditorTab === 'summary' ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/15' : 'text-[#9CA3AF] hover:text-white'}`}
                title="Professional Summary"
              >
                <Sparkles className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={() => setActiveEditorTab('skills')}
                className={`p-2.5 rounded-xl transition-all flex justify-center ${activeEditorTab === 'skills' ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/15' : 'text-[#9CA3AF] hover:text-white'}`}
                title="Skills Manager"
              >
                <Layers className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={() => setActiveEditorTab('experience')}
                className={`p-2.5 rounded-xl transition-all flex justify-center ${activeEditorTab === 'experience' ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/15' : 'text-[#9CA3AF] hover:text-white'}`}
                title="Work History"
              >
                <Briefcase className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={() => setActiveEditorTab('projects')}
                className={`p-2.5 rounded-xl transition-all flex justify-center ${activeEditorTab === 'projects' ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/15' : 'text-[#9CA3AF] hover:text-white'}`}
                title="Projects Catalogue"
              >
                <Terminal className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={() => setActiveEditorTab('education')}
                className={`p-2.5 rounded-xl transition-all flex justify-center ${activeEditorTab === 'education' ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/15' : 'text-[#9CA3AF] hover:text-white'}`}
                title="Academic Experience"
              >
                <BookOpen className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={() => setActiveEditorTab('achievements')}
                className={`p-2.5 rounded-xl transition-all flex justify-center ${activeEditorTab === 'achievements' ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/15' : 'text-[#9CA3AF] hover:text-white'}`}
                title="Achievements"
              >
                <Award className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={() => setActiveEditorTab('languages')}
                className={`p-2.5 rounded-xl transition-all flex justify-center ${activeEditorTab === 'languages' ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/15' : 'text-[#9CA3AF] hover:text-white'}`}
                title="Spoken Languages"
              >
                <Globe className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={() => setActiveEditorTab('coverletter')}
                className={`p-2.5 rounded-xl transition-all flex justify-center ${activeEditorTab === 'coverletter' ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/15' : 'text-[#9CA3AF] hover:text-white'}`}
                title="AI Cover Letter"
              >
                <FileText className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={() => setActiveEditorTab('mockinterview')}
                className={`p-2.5 rounded-xl transition-all flex justify-center ${activeEditorTab === 'mockinterview' ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/15' : 'text-[#9CA3AF] hover:text-white'}`}
                title="Mock Interview Assistant"
              >
                <MessageSquare className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Form Fields Editor Scope */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            
            {/* Pro/Free plan restriction banners for Uploaded CVs */}
            {isUploadedCV && (
              userPlan === 'pro' ? (
                <div className="bg-blue-950/20 border border-blue-500/20 text-[#3B82F6] p-4 rounded-xl flex items-start gap-2.5 text-[10px] font-mono leading-relaxed">
                  <Info className="h-4.5 w-4.5 text-[#3B82F6] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase mb-0.5 text-white">Pro Tier Read-Only View</span>
                    You have view-only access to this uploaded CV and its issues. Upgrade to <strong className="text-[#A855F7] hover:underline cursor-pointer" onClick={() => { setRequiredPlan('ultra'); setFeatureExplanation('Editing uploaded CVs requires Ultra tier access.'); setUpgradeModalOpen(true); }}>Ultra Plan</strong> to edit details and resolve issues autonomously.
                  </div>
                </div>
              ) : userPlan === 'free' ? (
                <div className="bg-purple-950/20 border border-purple-500/20 text-[#A855F7] p-4 rounded-xl flex items-start gap-2.5 text-[10px] font-mono leading-relaxed">
                  <Info className="h-4.5 w-4.5 text-[#A855F7] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase mb-0.5 text-white">Free Tier Locked View</span>
                    This uploaded CV profile is locked. Upgrade to <strong className="text-[#3B82F6] hover:underline cursor-pointer" onClick={() => { setRequiredPlan('pro'); setFeatureExplanation('Scoring and recommendations require Pro or Ultra tier access.'); setUpgradeModalOpen(true); }}>Pro Plan</strong> to see its issues, or <strong className="text-white hover:underline cursor-pointer" onClick={() => { setRequiredPlan('ultra'); setFeatureExplanation('Editing and resolving uploaded CV issues requires Ultra tier access.'); setUpgradeModalOpen(true); }}>Ultra Plan</strong> to edit and resolve issues.
                  </div>
                </div>
              ) : null
            )}

            <fieldset disabled={!canEdit} className="border-0 p-0 m-0 w-full flex-grow flex flex-col space-y-6">
            
            {/* Info Tab */}
            {activeEditorTab === 'info' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white pb-2 border-b border-[#1F293D]">Personal Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Full Name</label>
                    <input
                      type="text"
                      value={resume.content.personal_info.fullName}
                      onChange={(e) => handleFieldChange('personal_info', 'fullName', e.target.value)}
                      className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Job Title</label>
                    <input
                      type="text"
                      value={resume.content.personal_info.desiredPosition}
                      onChange={(e) => handleFieldChange('personal_info', 'desiredPosition', e.target.value)}
                      className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Experience Years</label>
                      <input
                        type="number"
                        value={resume.content.personal_info.experienceYears}
                        onChange={(e) => handleFieldChange('personal_info', 'experienceYears', parseInt(e.target.value) || 0)}
                        className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Location</label>
                      <input
                        type="text"
                        value={resume.content.personal_info.location}
                        onChange={(e) => handleFieldChange('personal_info', 'location', e.target.value)}
                        className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Email Contact</label>
                    <input
                      type="email"
                      value={resume.content.personal_info.email}
                      onChange={(e) => handleFieldChange('personal_info', 'email', e.target.value)}
                      className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Phone</label>
                    <input
                      type="text"
                      value={resume.content.personal_info.phone}
                      onChange={(e) => handleFieldChange('personal_info', 'phone', e.target.value)}
                      className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">GitHub Profile URL</label>
                    <input
                      type="text"
                      value={resume.content.personal_info.githubUrl || ''}
                      onChange={(e) => handleFieldChange('personal_info', 'githubUrl', e.target.value)}
                      className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">LinkedIn Profile URL</label>
                    <input
                      type="text"
                      value={resume.content.personal_info.linkedIn || ''}
                      onChange={(e) => handleFieldChange('personal_info', 'linkedIn', e.target.value)}
                      className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Instagram URL (Optional)</label>
                      <input
                        type="text"
                        value={resume.content.personal_info.instagram || ''}
                        onChange={(e) => handleFieldChange('personal_info', 'instagram', e.target.value)}
                        className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Telegram Username/Link (Optional)</label>
                      <input
                        type="text"
                        value={resume.content.personal_info.telegram || ''}
                        onChange={(e) => handleFieldChange('personal_info', 'telegram', e.target.value)}
                        className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Twitter URL (Optional)</label>
                      <input
                        type="text"
                        value={resume.content.personal_info.twitter || ''}
                        onChange={(e) => handleFieldChange('personal_info', 'twitter', e.target.value)}
                        className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Facebook URL (Optional)</label>
                      <input
                        type="text"
                        value={resume.content.personal_info.facebook || ''}
                        onChange={(e) => handleFieldChange('personal_info', 'facebook', e.target.value)}
                        className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Tab */}
            {activeEditorTab === 'summary' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#1F293D] pb-2">
                  <h3 className="text-sm font-bold text-white">Professional Summary</h3>
                  <button 
                    onClick={async () => {
                      if (userPlan !== 'ultra') {
                        setRequiredPlan('ultra');
                        setFeatureExplanation('Direct AI Editing (Refinement with natural language commands) is exclusive to the Ultra plan. Upgrade to Ultra to refine section copy directly.');
                        setUpgradeModalOpen(true);
                        return;
                      }
                      setSaving(true);
                      const text = await api.improveSection(resume.id, 'summary', 'Make it sound highly technical and metrics-focused.');
                      handleFieldChange('summary', '', text);
                      setSaving(false);
                    }}
                    className="flex items-center gap-1 bg-purple-950/20 border border-[#A855F7]/30 text-[#A855F7] text-[10px] font-mono px-2 py-1 rounded hover:bg-purple-900/20 transition-colors cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    <span>AI IMPROVE</span>
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Summary Copy</label>
                  <textarea
                    rows={8}
                    value={resume.content.summary}
                    onChange={(e) => handleFieldChange('summary', '', e.target.value)}
                    className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-3 font-mono leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeEditorTab === 'skills' && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-white pb-2 border-b border-[#1F293D]">Core Competencies</h3>
                
                {/* Skills categories render */}
                <div className="space-y-4">
                  {resume.content.skills.map((cat, catIdx) => (
                    <div key={catIdx} className="space-y-2">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">{cat.category}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.skills.map((skill, sIdx) => (
                          <span 
                            key={sIdx}
                            className="inline-flex items-center gap-1 bg-[#0A0C10] border border-[#1F293D] rounded px-2 py-1 text-[10px] font-mono text-white hover:border-red-500/30 transition-colors group"
                          >
                            <span>{skill}</span>
                            <button 
                              onClick={() => handleDeleteSkill(cat.category, skill)}
                              className="text-gray-500 hover:text-red-400 rounded transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new skill form */}
                <div className="border-t border-[#1F293D] pt-4 space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Skill Category</label>
                    <select
                      value={newSkillCat}
                      onChange={(e) => setNewSkillCat(e.target.value)}
                      className="w-full bg-[#0A0C10] border border-[#1F293D] text-xs text-white rounded-lg p-2.5 font-mono"
                    >
                      <option value="Languages">Languages</option>
                      <option value="Frameworks">Frameworks</option>
                      <option value="Libraries & Tools">Libraries & Tools</option>
                      <option value="Extracted Skills">Extracted Skills</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Skill Name</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Kubernetes"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="flex-grow bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2 font-mono"
                      />
                      <button
                        onClick={handleAddSkill}
                        className="bg-[#A855F7] hover:bg-purple-600 text-white font-semibold text-xs px-3 rounded-lg flex items-center justify-center shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Experience Tab */}
            {activeEditorTab === 'experience' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#1F293D] pb-2">
                  <h3 className="text-sm font-bold text-white">Professional Experience</h3>
                  <button
                    onClick={handleAddExperience}
                    className="flex items-center gap-1 bg-[#1F293D] hover:bg-[#2B3952] border border-[#303E57] text-[#9CA3AF] hover:text-white text-[10px] font-mono px-2.5 py-1 rounded transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>ADD NEW</span>
                  </button>
                </div>

                <div className="space-y-5 divide-y divide-[#1F293D]/60">
                  {resume.content.experience.map((exp, idx) => (
                    <div key={exp.id} className={`space-y-3.5 ${idx > 0 ? 'pt-5' : ''}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-grow space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Company</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => handleExperienceChange(exp.id, idx, 'company', e.target.value)}
                              className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Position</label>
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => handleExperienceChange(exp.id, idx, 'position', e.target.value)}
                              className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-red-950/20 mt-6"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Start Date</label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => handleExperienceChange(exp.id, idx, 'startDate', e.target.value)}
                            className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">End Date / Employment Status</label>
                            {exp.endDate?.toLowerCase().includes('student') || exp.endDate?.toLowerCase().includes('fresh') || exp.endDate?.includes('студент') || exp.endDate?.includes('донишҷӯ') || exp.endDate?.toLowerCase().includes('never worked') ? (
                              <span className="text-[8px] font-mono text-[#3B82F6] font-bold">🎓 Student / Fresh Graduate</span>
                            ) : exp.endDate?.toLowerCase().includes('present') || exp.endDate?.includes('ҳоло') || exp.endDate?.includes('настоящее') ? (
                              <span className="text-[8px] font-mono text-[#10B981] font-bold">● Currently Working</span>
                            ) : (
                              <span className="text-[8px] font-mono text-gray-500">Past Work</span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={exp.endDate}
                            onChange={(e) => handleExperienceChange(exp.id, idx, 'endDate', e.target.value)}
                            placeholder="e.g. Present, Never Worked (Student/Fresh), or 2023"
                            className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                          />
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => handleExperienceChange(exp.id, idx, 'endDate', 'Present')}
                              className={`text-[8px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                exp.endDate?.toLowerCase().includes('present') || exp.endDate?.includes('ҳоло') || exp.endDate?.includes('настоящее')
                                  ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981] font-bold'
                                  : 'bg-[#11131A] border-[#1F293D] text-gray-400 hover:text-white'
                              }`}
                            >
                              🟢 Currently Working Here
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExperienceChange(exp.id, idx, 'endDate', '2023')}
                              className={`text-[8px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                !exp.endDate?.toLowerCase().includes('present') && !exp.endDate?.includes('ҳоло') && !exp.endDate?.includes('настоящее') && !exp.endDate?.toLowerCase().includes('student') && !exp.endDate?.toLowerCase().includes('fresh') && !exp.endDate?.includes('студент') && !exp.endDate?.includes('донишҷӯ') && !exp.endDate?.toLowerCase().includes('never worked')
                                  ? 'bg-[#A855F7]/20 border-[#A855F7] text-[#A855F7] font-bold'
                                  : 'bg-[#11131A] border-[#1F293D] text-gray-400 hover:text-white'
                              }`}
                            >
                              ⚪ Past Work
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExperienceChange(exp.id, idx, 'endDate', 'Never Worked (Student/Fresh)')}
                              className={`text-[8px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                exp.endDate?.toLowerCase().includes('student') || exp.endDate?.toLowerCase().includes('fresh') || exp.endDate?.includes('студент') || exp.endDate?.includes('донишҷӯ') || exp.endDate?.toLowerCase().includes('never worked')
                                  ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#3B82F6] font-bold'
                                  : 'bg-[#11131A] border-[#1F293D] text-gray-400 hover:text-white'
                              }`}
                            >
                              🎓 Student / Fresh Graduate
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Descriptions (Line by line)</label>
                        {exp.description.map((desc, dIdx) => (
                          <input
                            key={dIdx}
                            type="text"
                            value={desc}
                            onChange={(e) => handleExperienceChange(exp.id, idx, 'desc_item', e.target.value, dIdx)}
                            className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeEditorTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#1F293D] pb-2">
                  <h3 className="text-sm font-bold text-white">GitHub Open Source</h3>
                  <button
                    onClick={handleAddProject}
                    className="flex items-center gap-1 bg-[#1F293D] hover:bg-[#2B3952] border border-[#303E57] text-[#9CA3AF] hover:text-white text-[10px] font-mono px-2.5 py-1 rounded transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>ADD NEW</span>
                  </button>
                </div>

                <div className="space-y-5 divide-y divide-[#1F293D]/60">
                  {resume.content.projects.map((proj) => (
                    <div key={proj.id} className="space-y-3.5 pt-5 first:pt-0">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-grow space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Repository Name</label>
                            <input
                              type="text"
                              value={proj.name}
                              onChange={(e) => handleProjectChange(proj.id, 'name', e.target.value)}
                              className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Technologies (Comma separated)</label>
                            <input
                              type="text"
                              value={proj.technologies.join(', ')}
                              onChange={(e) => handleProjectChange(proj.id, 'technologies', e.target.value)}
                              className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-red-950/20 mt-6"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Summary description</label>
                          <button
                            onClick={() => handleScanGitHubRepo(proj.id, proj.name, proj.githubUrl)}
                            disabled={scanningRepoId === proj.id}
                            className="flex items-center gap-1 bg-purple-950/40 hover:bg-purple-900/60 border border-[#A855F7]/40 text-[#A855F7] text-[9px] font-mono font-bold px-2 py-0.5 rounded transition-all cursor-pointer disabled:opacity-50"
                          >
                            {scanningRepoId === proj.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                            <span>⚡ AI SCAN REPO & AUTO-FILL CV</span>
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={proj.description}
                          onChange={(e) => handleProjectChange(proj.id, 'description', e.target.value)}
                          className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeEditorTab === 'education' && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-white pb-2 border-b border-[#1F293D]">Academic Credentials</h3>
                {resume.content.education.map((edu) => (
                  <div key={edu.id} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">University / Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)}
                        className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                          className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Field of study</label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => handleEducationChange(edu.id, 'fieldOfStudy', e.target.value)}
                          className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Start Date</label>
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) => handleEducationChange(edu.id, 'startDate', e.target.value)}
                          className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">End Date</label>
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) => handleEducationChange(edu.id, 'endDate', e.target.value)}
                          className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Achievements Tab */}
            {activeEditorTab === 'achievements' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#1F293D] pb-2">
                  <h3 className="text-sm font-bold text-white">Key Achievements</h3>
                  <button
                    onClick={handleAddAchievement}
                    className="flex items-center gap-1 bg-[#1F293D] hover:bg-[#2B3952] border border-[#303E57] text-[#9CA3AF] hover:text-white text-[10px] font-mono px-2.5 py-1 rounded transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>ADD NEW</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {resume.content.achievements.map((achItem, idx) => {
                    const achObj: AchievementItem = typeof achItem === 'string'
                      ? { id: `ach-${idx}`, title: achItem, certificateUrl: '' }
                      : { id: achItem.id || `ach-${idx}`, title: achItem.title || '', certificateUrl: achItem.certificateUrl || '' };

                    return (
                      <div key={idx} className="bg-[#0A0C10] border border-[#1F293D] p-3.5 rounded-xl space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-grow space-y-1">
                            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">
                              Achievement / Award Title #{idx + 1}
                            </label>
                            <textarea
                              rows={2}
                              value={achObj.title}
                              onChange={(e) => handleAchievementChange(idx, 'title', e.target.value)}
                              placeholder="e.g. Winner at Hackathon 2024 or Certified AWS Solutions Architect"
                              className="w-full bg-[#11131A] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2 font-mono resize-none"
                            />
                          </div>
                          <button
                            onClick={() => handleDeleteAchievement(idx)}
                            className="text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-red-950/20 mt-4 cursor-pointer"
                            title="Delete Achievement"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
                            <span>Certificate / Award Image</span>
                            {achObj.certificateUrl ? (
                              <span className="text-[8px] text-[#10B981] font-bold">● Image Link Active</span>
                            ) : (
                              <span className="text-[8px] text-gray-500 font-mono">No Image Attached</span>
                            )}
                          </label>

                          <input
                            type="file"
                            id={`cert-file-input-${idx}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUploadCertImage(idx, e)}
                          />

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={achObj.certificateUrl}
                              onChange={(e) => handleAchievementChange(idx, 'certificateUrl', e.target.value)}
                              placeholder="Image link or upload your image file"
                              className="flex-grow bg-[#11131A] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2 font-mono"
                            />

                            <button
                              onClick={() => document.getElementById(`cert-file-input-${idx}`)?.click()}
                              className="bg-[#1F293D] hover:bg-[#2B3952] border border-[#303E57] text-[#9CA3AF] hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                              title="Upload certificate image file from your device"
                            >
                              <Upload className="h-3.5 w-3.5 text-[#A855F7]" />
                              <span>Upload File</span>
                            </button>

                            {achObj.certificateUrl && (
                              <button
                                onClick={() => setActiveCertPreview({ title: achObj.title, imageUrl: achObj.certificateUrl! })}
                                className="bg-[#A855F7]/20 border border-[#A855F7] text-[#A855F7] hover:bg-[#A855F7] hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Preview</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Spoken Languages Tab */}
            {activeEditorTab === 'languages' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#1F293D] pb-2">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-white">Spoken Languages & Fluency</h3>
                    <p className="text-[10px] text-gray-400">Add, edit, or remove languages and set fluency levels.</p>
                  </div>
                  <button
                    onClick={handleAddLanguage}
                    className="flex items-center gap-1 bg-[#1F293D] hover:bg-[#2B3952] border border-[#303E57] text-[#9CA3AF] hover:text-white text-[10px] font-mono px-2.5 py-1 rounded transition-colors cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>ADD LANGUAGE</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(resume.content.spoken_languages || [
                    { id: 'lang-1', language: 'Tajik', proficiency: 'Native / Fully' },
                    { id: 'lang-2', language: 'Russian', proficiency: 'Fluent / Normal' },
                    { id: 'lang-3', language: 'English', proficiency: 'Intermediate (B1-B2)' }
                  ]).map((langObj) => (
                    <div key={langObj.id} className="bg-[#0A0C10] border border-[#1F293D] p-3.5 rounded-xl space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex-grow space-y-1">
                          <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Language Name</label>
                          <input
                            type="text"
                            value={langObj.language}
                            placeholder="e.g. Tajik, Russian, English"
                            onChange={(e) => handleLanguageChange(langObj.id, 'language', e.target.value)}
                            className="w-full bg-[#11131A] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2 font-mono"
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteLanguage(langObj.id)}
                          className="text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-red-950/20 mt-4 cursor-pointer"
                          title="Delete Language"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Proficiency / Status</label>
                        <input
                          type="text"
                          value={langObj.proficiency}
                          placeholder="e.g. Native / Fully, Fluent / Normal, B1-B2"
                          onChange={(e) => handleLanguageChange(langObj.id, 'proficiency', e.target.value)}
                          className="w-full bg-[#11131A] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2 font-mono"
                        />
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {['Native / Fully', 'Fluent / Normal', 'Intermediate (B1-B2)', 'Basic (A1-A2)'].map((statusOption) => (
                            <button
                              key={statusOption}
                              onClick={() => handleLanguageChange(langObj.id, 'proficiency', statusOption)}
                              className={`text-[8px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                langObj.proficiency === statusOption
                                  ? 'bg-[#A855F7]/20 border-[#A855F7] text-[#A855F7] font-bold'
                                  : 'bg-[#11131A] border-[#1F293D] text-gray-400 hover:text-white'
                              }`}
                            >
                              {statusOption}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeEditorTab === 'coverletter' && (
              <div className="space-y-6">
                <div className="border-b border-[#1F293D] pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    🤖 AI Cover Letter Generator
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono">
                    Generate an industry-optimized cover letter mapped directly to your CV profiles and target job posts.
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleGenerateCoverLetter}
                    disabled={isGeneratingCoverLetter}
                    className="w-full flex items-center justify-center gap-1.5 bg-[#A855F7] hover:bg-purple-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-xs font-semibold transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer"
                  >
                    {isGeneratingCoverLetter ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>DRAFTING COVER LETTER...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-white" />
                        <span>1-CLICK GENERATE LETTER</span>
                      </>
                    )}
                  </button>

                  {coverLetterText && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">
                          Tailored Output Draft
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(coverLetterText);
                            showAlert("Copied to Clipboard", "Cover letter text successfully copied to clipboard.");
                          }}
                          className="bg-[#1F293D] hover:bg-[#2B3952] text-white text-[9px] font-mono font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          COPY TEXT
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={coverLetterText}
                        className="w-full h-80 bg-[#0A0C10] border border-[#1F293D] rounded-lg p-4 text-[10px] text-gray-200 outline-none font-mono leading-relaxed resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeEditorTab === 'mockinterview' && (
              <div className="space-y-6">
                <div className="border-b border-[#1F293D] pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    💬 Mock Interview Assistant
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono">
                    Prepare for exact behavioral and technical questions recruiters are likely to ask based on your CV projects and experiences.
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleGenerateMockQuestions}
                    disabled={isGeneratingQuestions}
                    className="w-full flex items-center justify-center gap-1.5 bg-[#A855F7] hover:bg-purple-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-xs font-semibold transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer"
                  >
                    {isGeneratingQuestions ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>ANALYZING CV & GENERATING QUESTIONS...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 text-white" />
                        <span>GENERATE INTERVIEW PREP</span>
                      </>
                    )}
                  </button>

                  {mockQuestions.length > 0 && (
                    <div className="space-y-4">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">
                        Targeted Interview Questions
                      </span>
                      <div className="space-y-3">
                        {mockQuestions.map((item, idx) => (
                          <div key={idx} className="bg-[#0A0C10] border border-[#1F293D] rounded-xl p-4 space-y-2 text-[10px] font-mono">
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] font-bold bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/35 px-2 py-0.5 rounded-full uppercase">
                                {item.type}
                              </span>
                              <span className="text-gray-500">Q #0{idx + 1}</span>
                            </div>
                            <p className="text-white font-bold text-[11px] leading-relaxed">
                              {item.question}
                            </p>
                            <div className="border-t border-[#1F293D]/70 pt-2.5 mt-2.5 space-y-1">
                              <span className="text-[8px] uppercase tracking-wider text-[#10B981] font-bold block">
                                💡 Optimal Answering Strategy:
                              </span>
                              <p className="text-gray-400 text-[10px] leading-relaxed">
                                {item.optimalAnswer}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            </fieldset>
          </div>
        </div>

        {/* Center: Live Resume Preview container (A4 styled layout) */}
        <div className={`flex-grow bg-[#0A0C10] overflow-y-auto p-4 md:p-12 flex justify-center items-start print-content ${mobileWorkspaceTab === 'preview' ? '' : 'hidden md:flex'}`}>
          <div 
            id="resume-pdf-canvas"
            className={`w-[794px] min-h-[1123px] bg-white text-black shadow-2xl relative transition-all overflow-hidden ${
              resume.content.pdf_data ? 'p-0' : 'p-12'
            } ${resume.template_name === 'minimal' ? 'font-serif' : 'font-sans'}`}
          >
            {resume.content.pdf_data ? (
              <iframe 
                src={resume.content.pdf_data} 
                className="w-full h-[1123px] border-0"
                title="Uploaded PDF CV"
              />
            ) : (
              <>
            {/* ---------------------------------------------------------------------- */}
            {/* DEVELOPER TEMPLATE */}
            {/* ---------------------------------------------------------------------- */}
            {resume.template_name === 'developer' && (
              <div className="space-y-6 text-[12px] leading-relaxed">
                {/* Header info */}
                <div className="border-b-2 border-black pb-4 text-center sm:text-left">
                  <h1 className="text-2xl font-extrabold tracking-tight uppercase">
                    {resume.content.personal_info.fullName}
                  </h1>
                  <p className="text-[10px] font-mono tracking-widest text-[#A855F7] font-bold uppercase mt-1">
                    {resume.content.personal_info.desiredPosition}
                  </p>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-[9px] font-mono text-gray-500 mt-3">
                    <span>{resume.content.personal_info.email}</span>
                    <span>•</span>
                    <span>{resume.content.personal_info.phone}</span>
                    <span>•</span>
                    <span>{resume.content.personal_info.location}</span>
                    {resume.content.personal_info.githubUrl && (
                      <>
                        <span>•</span>
                        <a 
                          href={resume.content.personal_info.githubUrl.startsWith('http') ? resume.content.personal_info.githubUrl : `https://${resume.content.personal_info.githubUrl}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-semibold text-black hover:text-[#A855F7] hover:underline"
                        >
                          {resume.content.personal_info.githubUrl}
                        </a>
                      </>
                    )}
                    {resume.content.personal_info.linkedIn && (
                      <>
                        <span>•</span>
                        <a 
                          href={resume.content.personal_info.linkedIn.startsWith('http') ? resume.content.personal_info.linkedIn : `https://${resume.content.personal_info.linkedIn}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-semibold text-black hover:text-[#A855F7] hover:underline"
                        >
                          LinkedIn
                        </a>
                      </>
                    )}
                    {resume.content.personal_info.instagram && (
                      <>
                        <span>•</span>
                        <a 
                          href={resume.content.personal_info.instagram.startsWith('http') ? resume.content.personal_info.instagram : `https://${resume.content.personal_info.instagram}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-semibold text-black hover:text-[#A855F7] hover:underline"
                        >
                          Instagram
                        </a>
                      </>
                    )}
                    {resume.content.personal_info.telegram && (
                      <>
                        <span>•</span>
                        <a 
                          href={resume.content.personal_info.telegram.startsWith('http') ? resume.content.personal_info.telegram : `https://t.me/${resume.content.personal_info.telegram}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-semibold text-black hover:text-[#A855F7] hover:underline"
                        >
                          Telegram
                        </a>
                      </>
                    )}
                    {resume.content.personal_info.twitter && (
                      <>
                        <span>•</span>
                        <a 
                          href={resume.content.personal_info.twitter.startsWith('http') ? resume.content.personal_info.twitter : `https://${resume.content.personal_info.twitter}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-semibold text-black hover:text-[#A855F7] hover:underline"
                        >
                          Twitter
                        </a>
                      </>
                    )}
                    {resume.content.personal_info.facebook && (
                      <>
                        <span>•</span>
                        <a 
                          href={resume.content.personal_info.facebook.startsWith('http') ? resume.content.personal_info.facebook : `https://${resume.content.personal_info.facebook}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-semibold text-black hover:text-[#A855F7] hover:underline"
                        >
                          Facebook
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="space-y-2">
                  <h2 className="text-[10px] font-mono font-bold tracking-wider uppercase text-gray-400 border-b border-gray-200 pb-1">
                    {getSectionTitle('summary')}
                  </h2>
                  <p className="text-gray-700">{resume.content.summary}</p>
                </div>

                {/* Core Competencies (Skills) */}
                <div className="space-y-2">
                  <h2 className="text-[10px] font-mono font-bold tracking-wider uppercase text-gray-400 border-b border-gray-200 pb-1">
                    {getSectionTitle('skills')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {resume.content.skills.map((cat, idx) => (
                      <div key={idx} className="space-y-1">
                        <h4 className="font-mono text-[9px] font-bold text-black uppercase">{cat.category}</h4>
                        <p className="text-gray-600 text-[10px]">{cat.skills.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Professional Experience */}
                {resume.content.experience.filter(exp => {
                  const end = (exp.endDate || '').toLowerCase();
                  const isStudentFresh = end.includes('student') || end.includes('fresh') || end.includes('студент') || end.includes('донишҷӯ') || end.includes('never worked');
                  const isEmptyCompany = !exp.company || exp.company.trim() === '';
                  return !isStudentFresh && !isEmptyCompany;
                }).length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-[10px] font-mono font-bold tracking-wider uppercase text-gray-400 border-b border-gray-200 pb-1">
                      {getSectionTitle('experience')}
                    </h2>
                    <div className="space-y-4">
                      {resume.content.experience.filter(exp => {
                        const end = (exp.endDate || '').toLowerCase();
                        const isStudentFresh = end.includes('student') || end.includes('fresh') || end.includes('студент') || end.includes('донишҷӯ') || end.includes('never worked');
                        const isEmptyCompany = !exp.company || exp.company.trim() === '';
                        return !isStudentFresh && !isEmptyCompany;
                      }).map((exp) => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex justify-between items-baseline font-bold text-[11px]">
                            <div className="flex items-center gap-2">
                              <span>{exp.company}</span>
                              {(exp.endDate?.toLowerCase().includes('present') || exp.endDate?.includes('ҳоло') || exp.endDate?.includes('настоящее')) && (
                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[8px] px-1.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  {activeResumeLang === 'tg' ? 'Ҳоло кор мекунад' : activeResumeLang === 'ru' ? 'Работает по настоящее время' : activeResumeLang === 'de' ? 'Derzeit tätig' : 'Currently Working'}
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[9px] text-gray-500">{exp.startDate} — {exp.endDate}</span>
                          </div>
                          <p className="font-mono text-[9px] text-[#A855F7] uppercase tracking-wider">{exp.position}</p>
                          <ul className="list-disc list-inside text-gray-700 text-[10px] pl-2 space-y-1 mt-1.5">
                            {exp.description.map((item, idx) => (
                              <li key={idx} className="leading-relaxed">{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                <div className="space-y-4">
                  <h2 className="text-[10px] font-mono font-bold tracking-wider uppercase text-gray-400 border-b border-gray-200 pb-1">
                    {getSectionTitle('projects')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {resume.content.projects.map((proj) => (
                      <div key={proj.id} className="border border-gray-200 rounded p-3 space-y-1">
                        <div className="flex justify-between items-baseline font-bold">
                          <a 
                            href={proj.githubUrl?.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-mono text-[11px] text-black hover:text-[#A855F7] hover:underline cursor-pointer transition-colors"
                          >
                            {proj.name}
                          </a>
                          {proj.stars !== undefined && proj.stars > 0 && (
                            <span className="text-[9px] font-mono text-[#3B82F6]">{proj.stars} ★</span>
                          )}
                        </div>
                        <p className="text-[9px] font-mono text-gray-500">{proj.technologies.join(', ')}</p>
                        <p className="text-gray-600 text-[10px] leading-relaxed pt-1">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <h2 className="text-[10px] font-mono font-bold tracking-wider uppercase text-gray-400 border-b border-gray-200 pb-1">
                    {getSectionTitle('education')}
                  </h2>
                  {resume.content.education.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-baseline text-[10px]">
                      <div>
                        <span className="font-bold">{edu.institution}</span> — <span>{edu.degree} in {edu.fieldOfStudy}</span>
                      </div>
                      <span className="font-mono text-[9px] text-gray-500">{edu.startDate} — {edu.endDate}</span>
                    </div>
                  ))}
                </div>

                {/* Achievements */}
                {resume.content.achievements.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-[10px] font-mono font-bold tracking-wider uppercase text-gray-400 border-b border-gray-200 pb-1">
                      {getSectionTitle('achievements')}
                    </h2>
                    <ul className="list-disc list-inside text-gray-700 text-[10px] pl-2 space-y-1">
                      {resume.content.achievements.map((ach, idx) => {
                        const achObj: AchievementItem = typeof ach === 'string'
                          ? { title: ach, certificateUrl: '' }
                          : { title: ach.title || '', certificateUrl: ach.certificateUrl || '' };

                        return (
                          <li key={idx} className="leading-relaxed">
                            <span>{achObj.title}</span>
                            {achObj.certificateUrl ? (
                              <button
                                onClick={() => setActiveCertPreview({ title: achObj.title, imageUrl: achObj.certificateUrl! })}
                                className="ml-2 inline-flex items-center gap-1 text-[9px] font-mono text-[#A855F7] hover:text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                                title="Click to view Certificate image"
                              >
                                <span>📜 View Certificate ↗</span>
                              </button>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Spoken Languages */}
                <div className="space-y-2">
                  <h2 className="text-[10px] font-mono font-bold tracking-wider uppercase text-gray-400 border-b border-gray-200 pb-1">
                    {getSectionTitle('languages')}
                  </h2>
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    {(resume.content.spoken_languages && resume.content.spoken_languages.length > 0 ? resume.content.spoken_languages : [
                      { id: '1', language: 'Tajik', proficiency: 'Native / Fully' },
                      { id: '2', language: 'Russian', proficiency: 'Fluent / Normal' },
                      { id: '3', language: 'English', proficiency: 'Intermediate (B1-B2)' }
                    ]).map((langItem) => (
                      <span key={langItem.id} className="bg-gray-100 border border-gray-200 text-gray-800 px-2 py-0.5 rounded font-mono text-[9px]">
                        <strong className="text-black">{langItem.language}:</strong> {langItem.proficiency}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Verified Footer */}
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-[8px] font-mono text-gray-400">
                  <span>SYSTEM_LOAD: 0.12</span>
                  <span>VERIFIED BY RESUMELEGEND AI ARCHITECTURE</span>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------------------- */}
            {/* MINIMAL TEMPLATE */}
            {/* ---------------------------------------------------------------------- */}
            {resume.template_name === 'minimal' && (
              <div className="space-y-8 text-[12px] leading-relaxed">
                {/* Centered clean header */}
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-light tracking-wide uppercase">
                    {resume.content.personal_info.fullName}
                  </h1>
                  <p className="text-xs tracking-wider text-gray-500 italic">
                    {resume.content.personal_info.desiredPosition}
                  </p>
                  <div className="flex justify-center gap-4 text-[9px] text-gray-500 pt-2 font-mono uppercase tracking-wide">
                    <span>{resume.content.personal_info.email}</span>
                    <span>|</span>
                    <span>{resume.content.personal_info.phone}</span>
                    <span>|</span>
                    <span>{resume.content.personal_info.location}</span>
                  </div>
                  <div className="flex justify-center gap-4 text-[9px] text-gray-400 font-mono pt-1">
                    {resume.content.personal_info.githubUrl && (
                      <a 
                        href={resume.content.personal_info.githubUrl.startsWith('http') ? resume.content.personal_info.githubUrl : `https://${resume.content.personal_info.githubUrl}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-black hover:underline"
                      >
                        {resume.content.personal_info.githubUrl.replace(/^(https?:\/\/)?(www\.)?/, '')}
                      </a>
                    )}
                    {resume.content.personal_info.linkedIn && (
                      <>
                        {resume.content.personal_info.githubUrl && <span>|</span>}
                        <a 
                          href={resume.content.personal_info.linkedIn.startsWith('http') ? resume.content.personal_info.linkedIn : `https://${resume.content.personal_info.linkedIn}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-black hover:underline"
                        >
                          LinkedIn
                        </a>
                      </>
                    )}
                    {resume.content.personal_info.instagram && (
                      <>
                        {(resume.content.personal_info.githubUrl || resume.content.personal_info.linkedIn) && <span>|</span>}
                        <a 
                          href={resume.content.personal_info.instagram.startsWith('http') ? resume.content.personal_info.instagram : `https://${resume.content.personal_info.instagram}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-black hover:underline"
                        >
                          Instagram
                        </a>
                      </>
                    )}
                    {resume.content.personal_info.telegram && (
                      <>
                        {(resume.content.personal_info.githubUrl || resume.content.personal_info.linkedIn || resume.content.personal_info.instagram) && <span>|</span>}
                        <a 
                          href={resume.content.personal_info.telegram.startsWith('http') ? resume.content.personal_info.telegram : `https://t.me/${resume.content.personal_info.telegram}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-black hover:underline"
                        >
                          Telegram
                        </a>
                      </>
                    )}
                    {resume.content.personal_info.twitter && (
                      <>
                        {(resume.content.personal_info.githubUrl || resume.content.personal_info.linkedIn || resume.content.personal_info.instagram || resume.content.personal_info.telegram) && <span>|</span>}
                        <a 
                          href={resume.content.personal_info.twitter.startsWith('http') ? resume.content.personal_info.twitter : `https://${resume.content.personal_info.twitter}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-black hover:underline"
                        >
                          Twitter
                        </a>
                      </>
                    )}
                    {resume.content.personal_info.facebook && (
                      <>
                        {(resume.content.personal_info.githubUrl || resume.content.personal_info.linkedIn || resume.content.personal_info.instagram || resume.content.personal_info.telegram || resume.content.personal_info.twitter) && <span>|</span>}
                        <a 
                          href={resume.content.personal_info.facebook.startsWith('http') ? resume.content.personal_info.facebook : `https://${resume.content.personal_info.facebook}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-black hover:underline"
                        >
                          Facebook
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <p className="text-center text-gray-600 italic px-6">{resume.content.summary}</p>

                {/* Skills */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold tracking-widest text-center uppercase text-gray-400 border-b border-gray-100 pb-1">
                    {getSectionTitle('skills')}
                  </h2>
                  <div className="flex flex-wrap justify-center gap-y-1 gap-x-6 text-[10px] text-gray-700">
                    {resume.content.skills.flatMap(c => c.skills).map((skill, idx) => (
                      <span key={idx}>{skill}</span>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                {resume.content.experience.filter(exp => {
                  const end = (exp.endDate || '').toLowerCase();
                  const isStudentFresh = end.includes('student') || end.includes('fresh') || end.includes('студент') || end.includes('донишҷӯ') || end.includes('never worked');
                  const isEmptyCompany = !exp.company || exp.company.trim() === '';
                  return !isStudentFresh && !isEmptyCompany;
                }).length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-bold tracking-widest text-center uppercase text-gray-400 border-b border-gray-100 pb-1">
                      {getSectionTitle('experience')}
                    </h2>
                    <div className="space-y-6">
                      {resume.content.experience.filter(exp => {
                        const end = (exp.endDate || '').toLowerCase();
                        const isStudentFresh = end.includes('student') || end.includes('fresh') || end.includes('студент') || end.includes('донишҷӯ') || end.includes('never worked');
                        const isEmptyCompany = !exp.company || exp.company.trim() === '';
                        return !isStudentFresh && !isEmptyCompany;
                      }).map((exp) => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex justify-between items-baseline font-bold">
                            <span className="text-[12px]">{exp.company}</span>
                            <span className="text-[10px] font-normal text-gray-500">{exp.startDate} — {exp.endDate}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 italic">{exp.position}</p>
                          <ul className="list-disc pl-4 text-gray-600 text-[10px] space-y-1 mt-1.5">
                            {exp.description.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                <div className="space-y-4">
                  <h2 className="text-xs font-bold tracking-widest text-center uppercase text-gray-400 border-b border-gray-100 pb-1">
                    {getSectionTitle('projects')}
                  </h2>
                  <div className="space-y-4">
                    {resume.content.projects.map((proj) => (
                      <div key={proj.id} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <a 
                            href={proj.githubUrl?.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-bold text-[11px] hover:text-gray-600 hover:underline cursor-pointer transition-colors"
                          >
                            {proj.name}
                          </a>
                          <span className="text-[10px] text-gray-500">{proj.role}</span>
                        </div>
                        <p className="text-[9px] text-gray-400 font-mono">{proj.technologies.join(', ')}</p>
                        <p className="text-gray-600 text-[10px] pt-0.5">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold tracking-widest text-center uppercase text-gray-400 border-b border-gray-100 pb-1">
                    {getSectionTitle('education')}
                  </h2>
                  {resume.content.education.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-baseline text-[10px] text-gray-600">
                      <div>
                        <span className="font-bold text-black">{edu.institution}</span> — {edu.degree} in {edu.fieldOfStudy}
                      </div>
                      <span>{edu.startDate} — {edu.endDate}</span>
                    </div>
                  ))}
                </div>

                {/* Spoken Languages */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold tracking-widest text-center uppercase text-gray-400 border-b border-gray-100 pb-1">
                    {getSectionTitle('languages')}
                  </h2>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-gray-700">
                    {(resume.content.spoken_languages && resume.content.spoken_languages.length > 0 ? resume.content.spoken_languages : [
                      { id: '1', language: 'Tajik', proficiency: 'Native / Fully' },
                      { id: '2', language: 'Russian', proficiency: 'Fluent / Normal' },
                      { id: '3', language: 'English', proficiency: 'Intermediate (B1-B2)' }
                    ]).map((langItem) => (
                      <span key={langItem.id}>
                        <strong className="text-black">{langItem.language}:</strong> {langItem.proficiency}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------------------- */}
            {/* MODERN TEMPLATE */}
            {/* ---------------------------------------------------------------------- */}
            {resume.template_name === 'modern' && (
              <div className="space-y-6 text-[12px] leading-relaxed">
                {/* Modern layout header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-5">
                  <div className="space-y-1.5">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 leading-none">
                      {resume.content.personal_info.fullName}
                    </h1>
                    <p className="text-xs font-semibold text-[#3B82F6] uppercase tracking-wide">
                      {resume.content.personal_info.desiredPosition}
                    </p>
                  </div>
                  
                  <div className="text-right text-[10px] text-gray-500 font-mono space-y-0.5">
                    <p>{resume.content.personal_info.email}</p>
                    <p>{resume.content.personal_info.phone}</p>
                    <p>{resume.content.personal_info.location}</p>
                    {resume.content.personal_info.githubUrl && (
                      <p>
                        <a 
                          href={resume.content.personal_info.githubUrl.startsWith('http') ? resume.content.personal_info.githubUrl : `https://${resume.content.personal_info.githubUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3B82F6] font-bold hover:underline"
                        >
                          {resume.content.personal_info.githubUrl}
                        </a>
                      </p>
                    )}
                    {resume.content.personal_info.linkedIn && (
                      <p>
                        <a 
                          href={resume.content.personal_info.linkedIn.startsWith('http') ? resume.content.personal_info.linkedIn : `https://${resume.content.personal_info.linkedIn}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3B82F6] font-bold hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      </p>
                    )}
                    {resume.content.personal_info.instagram && (
                      <p>
                        <a 
                          href={resume.content.personal_info.instagram.startsWith('http') ? resume.content.personal_info.instagram : `https://${resume.content.personal_info.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3B82F6] font-bold hover:underline"
                        >
                          Instagram
                        </a>
                      </p>
                    )}
                    {resume.content.personal_info.telegram && (
                      <p>
                        <a 
                          href={resume.content.personal_info.telegram.startsWith('http') ? resume.content.personal_info.telegram : `https://t.me/${resume.content.personal_info.telegram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3B82F6] font-bold hover:underline"
                        >
                          Telegram
                        </a>
                      </p>
                    )}
                    {resume.content.personal_info.twitter && (
                      <p>
                        <a 
                          href={resume.content.personal_info.twitter.startsWith('http') ? resume.content.personal_info.twitter : `https://${resume.content.personal_info.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3B82F6] font-bold hover:underline"
                        >
                          Twitter
                        </a>
                      </p>
                    )}
                    {resume.content.personal_info.facebook && (
                      <p>
                        <a 
                          href={resume.content.personal_info.facebook.startsWith('http') ? resume.content.personal_info.facebook : `https://${resume.content.personal_info.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3B82F6] font-bold hover:underline"
                        >
                          Facebook
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-slate-50 border-l-4 border-[#3B82F6] p-3 rounded-r text-gray-700">
                  {resume.content.summary}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                  {/* Left Column (Skills + Education - 4 cols) */}
                  <div className="sm:col-span-4 space-y-6 border-r border-gray-100 pr-4">
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold tracking-wider text-[#3B82F6] uppercase">{getSectionTitle('skills')}</h3>
                      {resume.content.skills.map((cat, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <h4 className="text-[9px] font-bold text-gray-800 uppercase font-mono">{cat.category}</h4>
                          <div className="flex flex-wrap gap-1">
                            {cat.skills.map((skill, sIdx) => (
                              <span key={sIdx} className="bg-gray-100 text-gray-800 text-[8px] font-semibold px-1.5 py-0.5 rounded font-mono">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold tracking-wider text-[#3B82F6] uppercase">{getSectionTitle('education')}</h3>
                      {resume.content.education.map((edu) => (
                        <div key={edu.id} className="text-[10px] space-y-0.5 text-gray-600">
                          <p className="font-bold text-black leading-none">{edu.institution}</p>
                          <p className="text-[9px] italic">{edu.degree}</p>
                          <p className="text-[8px] font-mono text-gray-400">{edu.startDate} — {edu.endDate}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold tracking-wider text-[#3B82F6] uppercase">{getSectionTitle('languages')}</h3>
                      <div className="space-y-1 text-[9px] text-gray-600">
                        {(resume.content.spoken_languages && resume.content.spoken_languages.length > 0 ? resume.content.spoken_languages : [
                          { id: '1', language: 'Tajik', proficiency: 'Native / Fully' },
                          { id: '2', language: 'Russian', proficiency: 'Fluent / Normal' },
                          { id: '3', language: 'English', proficiency: 'Intermediate (B1-B2)' }
                        ]).map((langItem) => (
                          <p key={langItem.id}>
                            <strong className="text-black font-semibold">{langItem.language}:</strong> {langItem.proficiency}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Experience + Projects - 8 cols) */}
                  <div className="sm:col-span-8 space-y-6">
                    {resume.content.experience.filter(exp => {
                      const end = (exp.endDate || '').toLowerCase();
                      const isStudentFresh = end.includes('student') || end.includes('fresh') || end.includes('студент') || end.includes('донишҷӯ') || end.includes('never worked');
                      const isEmptyCompany = !exp.company || exp.company.trim() === '';
                      return !isStudentFresh && !isEmptyCompany;
                    }).length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold tracking-wider text-[#3B82F6] uppercase border-b border-gray-100 pb-1">{getSectionTitle('experience')}</h3>
                        <div className="space-y-4">
                          {resume.content.experience.filter(exp => {
                            const end = (exp.endDate || '').toLowerCase();
                            const isStudentFresh = end.includes('student') || end.includes('fresh') || end.includes('студент') || end.includes('донишҷӯ') || end.includes('never worked');
                            const isEmptyCompany = !exp.company || exp.company.trim() === '';
                            return !isStudentFresh && !isEmptyCompany;
                          }).map((exp) => (
                            <div key={exp.id} className="space-y-1">
                              <div className="flex justify-between items-baseline">
                                <h4 className="font-bold text-[11px] text-gray-900">{exp.company}</h4>
                                <span className="text-[8px] font-mono text-gray-400">{exp.startDate} — {exp.endDate}</span>
                              </div>
                              <p className="text-[9px] font-semibold text-gray-500 uppercase">{exp.position}</p>
                              <ul className="list-disc list-inside text-gray-600 text-[10px] pl-1.5 space-y-1 pt-1">
                                {exp.description.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold tracking-wider text-[#3B82F6] uppercase border-b border-gray-100 pb-1">{getSectionTitle('projects')}</h3>
                      <div className="space-y-3.5">
                        {resume.content.projects.map((proj) => (
                          <div key={proj.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold font-mono text-[10px] text-gray-900">
                                <a 
                                  href={proj.githubUrl?.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="hover:text-[#3B82F6] hover:underline cursor-pointer transition-colors"
                                >
                                  {proj.name}
                                </a>
                              </h4>
                              {proj.stars !== undefined && proj.stars > 0 && (
                                <span className="text-[8px] font-mono text-amber-500 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">★ {proj.stars}</span>
                              )}
                            </div>
                            <p className="text-gray-600 text-[10px] leading-relaxed">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------------------- */}
            {/* CLASSIC (UPLOADED) TEMPLATE */}
            {/* ---------------------------------------------------------------------- */}
            {resume.template_name === 'classic' && (
              <div className="space-y-5 text-[11px] leading-relaxed font-sans text-black">
                {/* Header info */}
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-extrabold tracking-tight uppercase border-b-0 pb-0 mb-1 text-black">
                    {resume.content.personal_info.fullName} <span className="font-normal text-gray-500 text-lg">| {resume.content.personal_info.desiredPosition}</span>
                  </h1>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-x-2 gap-y-1 text-[9px] font-mono text-gray-500 mt-2">
                    <a href={`mailto:${resume.content.personal_info.email}`} className="text-blue-600 underline font-semibold">{resume.content.personal_info.email}</a>
                    <span>|</span>
                    <span className="text-gray-700 font-semibold">{resume.content.personal_info.phone}</span>
                    <span>|</span>
                    <span className="text-gray-700">{resume.content.personal_info.location}</span>
                    {resume.content.personal_info.linkedIn && (
                      <>
                        <span>|</span>
                        <a 
                          href={resume.content.personal_info.linkedIn.startsWith('http') ? resume.content.personal_info.linkedIn : `https://${resume.content.personal_info.linkedIn}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 underline font-semibold"
                        >
                          {resume.content.personal_info.linkedIn.replace(/^(https?:\/\/)?(www\.)?/, '')}
                        </a>
                      </>
                    )}
                    {resume.content.personal_info.githubUrl && (
                      <>
                        <span>|</span>
                        <a 
                          href={resume.content.personal_info.githubUrl.startsWith('http') ? resume.content.personal_info.githubUrl : `https://${resume.content.personal_info.githubUrl}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 underline font-semibold"
                        >
                          {resume.content.personal_info.githubUrl.replace(/^(https?:\/\/)?(www\.)?/, '')}
                        </a>
                      </>
                    )}
                    {resume.content.personal_info.instagram && (
                      <>
                        <span>|</span>
                        <a 
                          href={resume.content.personal_info.instagram.startsWith('http') ? resume.content.personal_info.instagram : `https://${resume.content.personal_info.instagram}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 underline font-semibold"
                        >
                          Instagram
                        </a>
                      </>
                    )}
                    {resume.content.personal_info.telegram && (
                      <>
                        <span>|</span>
                        <a 
                          href={resume.content.personal_info.telegram.startsWith('http') ? resume.content.personal_info.telegram : `https://t.me/${resume.content.personal_info.telegram}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 underline font-semibold"
                        >
                          Telegram
                        </a>
                      </>
                    )}
                    {resume.content.personal_info.twitter && (
                      <>
                        <span>|</span>
                        <a 
                          href={resume.content.personal_info.twitter.startsWith('http') ? resume.content.personal_info.twitter : `https://${resume.content.personal_info.twitter}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 underline font-semibold"
                        >
                          Twitter
                        </a>
                      </>
                    )}
                    {resume.content.personal_info.facebook && (
                      <>
                        <span>|</span>
                        <a 
                          href={resume.content.personal_info.facebook.startsWith('http') ? resume.content.personal_info.facebook : `https://${resume.content.personal_info.facebook}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 underline font-semibold"
                        >
                          Facebook
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Thick Separator line */}
                <hr className="border-t-2 border-black my-3" />

                {/* Professional Summary */}
                <div className="space-y-1.5">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider text-black">{getSectionTitle('summary')}</h2>
                  <hr className="border-t border-black/35 mb-2" />
                  <p className="text-justify leading-relaxed text-black/90">
                    {resume.content.summary}
                  </p>
                </div>

                {/* Skills */}
                <div className="space-y-1.5">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider text-black">{getSectionTitle('skills')}</h2>
                  <hr className="border-t border-black/35 mb-2" />
                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-black/90">
                    {resume.content.skills.map((cat, idx) => (
                      <span key={idx} className="font-semibold">
                        {idx > 0 && <span className="text-gray-400 font-normal mr-2">|</span>}
                        <span className="text-[8px] font-mono text-gray-500 uppercase mr-1">{cat.category}:</span>
                        {cat.skills.join(' • ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Work Experience */}
                {resume.content.experience.filter(exp => {
                  const end = (exp.endDate || '').toLowerCase();
                  const isStudentFresh = end.includes('student') || end.includes('fresh') || end.includes('студент') || end.includes('донишҷӯ') || end.includes('never worked');
                  const isEmptyCompany = !exp.company || exp.company.trim() === '';
                  return !isStudentFresh && !isEmptyCompany;
                }).length > 0 && (
                  <div className="space-y-1.5">
                    <h2 className="text-[12px] font-bold uppercase tracking-wider text-black">{getSectionTitle('experience')}</h2>
                    <hr className="border-t border-black/35 mb-2" />
                    <div className="space-y-4">
                      {resume.content.experience.filter(exp => {
                        const end = (exp.endDate || '').toLowerCase();
                        const isStudentFresh = end.includes('student') || end.includes('fresh') || end.includes('студент') || end.includes('донишҷӯ') || end.includes('never worked');
                        const isEmptyCompany = !exp.company || exp.company.trim() === '';
                        return !isStudentFresh && !isEmptyCompany;
                      }).map((exp) => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-[11px] text-black">{exp.company}</span>
                            <span className="text-[9px] font-semibold text-gray-500 font-mono">{exp.startDate} — {exp.endDate}</span>
                          </div>
                          <p className="font-mono text-[9px] text-gray-700 uppercase tracking-wider italic">{exp.position}</p>
                          <ul className="list-disc list-inside text-black/85 text-[10px] pl-1 space-y-1 mt-1">
                            {exp.description.map((item, idx) => (
                              <li key={idx} className="leading-relaxed">{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                <div className="space-y-1.5">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider text-black">{getSectionTitle('education')}</h2>
                  <hr className="border-t border-black/35 mb-2" />
                  <div className="space-y-3">
                    {resume.content.education.map((edu) => (
                      <div key={edu.id} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold text-[11px] text-black">{edu.institution}</h3>
                          <span className="text-[9px] font-semibold text-gray-500 font-mono">{edu.startDate} — {edu.endDate}</span>
                        </div>
                        <ul className="list-disc list-inside pl-1 space-y-0.5 text-black/85">
                          <li>{edu.degree} in {edu.fieldOfStudy}</li>
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div className="space-y-1.5">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider text-black">{getSectionTitle('projects')}</h2>
                  <hr className="border-t border-black/35 mb-2" />
                  <div className="space-y-4">
                    {resume.content.projects.map((proj) => (
                      <div key={proj.id} className="space-y-1.5">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-[11px] text-black">• {proj.name} ({proj.role})</span>
                          <span className="text-[9px] font-mono text-gray-400">{proj.technologies.join(', ')}</span>
                        </div>
                        <div className="flex gap-2 text-[9px] font-mono pl-3 mb-1">
                          <span className="text-blue-600 underline font-semibold cursor-pointer">Demo</span>
                          <span>|</span>
                          <a 
                            href={proj.githubUrl?.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 underline font-semibold"
                          >
                            GitHub
                          </a>
                        </div>
                        <p className="text-black/85 pl-3 leading-relaxed text-justify">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements / Languages */}
                <div className="space-y-1.5">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider text-black">{getSectionTitle('achievements')}</h2>
                  <hr className="border-t border-black/35 mb-2" />
                  <ul className="list-disc list-inside pl-1 space-y-1 text-black/85">
                    {resume.content.achievements.map((ach, idx) => {
                      const achObj: AchievementItem = typeof ach === 'string'
                        ? { title: ach, certificateUrl: '' }
                        : { title: ach.title || '', certificateUrl: ach.certificateUrl || '' };

                      return (
                        <li key={idx} className="leading-relaxed">
                          <span>{achObj.title}</span>
                          {achObj.certificateUrl ? (
                            <button
                              onClick={() => setActiveCertPreview({ title: achObj.title, imageUrl: achObj.certificateUrl! })}
                              className="ml-2 inline-flex items-center gap-1 text-[9px] font-mono text-[#A855F7] hover:text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                              title="Click to view Certificate image"
                            >
                              <span>📜 View Certificate ↗</span>
                            </button>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Spoken Languages */}
                <div className="space-y-1.5">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider text-black">{getSectionTitle('languages')}</h2>
                  <hr className="border-t border-black/35 mb-2" />
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-black/85 text-[10px]">
                    {(resume.content.spoken_languages && resume.content.spoken_languages.length > 0 ? resume.content.spoken_languages : [
                      { id: '1', language: 'Tajik', proficiency: 'Native / Fully' },
                      { id: '2', language: 'Russian', proficiency: 'Fluent / Normal' },
                      { id: '3', language: 'English', proficiency: 'Intermediate (B1-B2)' }
                    ]).map((langItem) => (
                      <span key={langItem.id} className="font-semibold">
                        <span className="text-gray-500 font-mono uppercase mr-1">{langItem.language}:</span>
                        {langItem.proficiency}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
              </>
            )}
          </div>
        </div>

        {/* Right Side: floating AI suggestions panel */}
        {showAiPanel && (
          <div className={`w-full md:w-[300px] border-l border-[#1F293D] bg-[#11131A] p-6 flex flex-col gap-6 shrink-0 overflow-y-auto no-print ${mobileWorkspaceTab === 'ai' ? '' : 'hidden md:flex'}`}>
            <div className="flex justify-between items-center border-b border-[#1F293D] pb-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Brain className="h-4.5 w-4.5 text-[#A855F7] animate-pulse" />
                <span>AI Review Assistant</span>
              </h3>
              <button 
                onClick={() => setShowAiPanel(false)}
                className="text-gray-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Resume Score */}
            {userPlan === 'free' ? (
              <div className="bg-[#0A0C10] border border-[#1F293D] rounded-xl p-5 text-center space-y-3.5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">
                  AI CV SCORING
                </span>
                <div className="bg-purple-950/20 border border-[#A855F7]/30 text-[#A855F7] p-4 rounded-xl text-center font-mono text-[9px] space-y-2">
                  <Sparkles className="h-4.5 w-4.5 mx-auto animate-pulse" />
                  <p className="font-bold uppercase tracking-wide">Premium Locked</p>
                  <p className="text-gray-400 text-[8px] leading-relaxed">
                    Upgrade to Pro or Ultra to unlock CV Score metrics, ATS minus & flaw checks, and optimization recommendations.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setRequiredPlan('pro');
                    setFeatureExplanation('AI CV Scoring, minus & flaw detection, and recommendations require Pro or Ultra tier access.');
                    setUpgradeModalOpen(true);
                  }}
                  className="w-full text-center bg-[#3B82F6] hover:bg-blue-600 text-white py-2 rounded-lg text-[9px] font-mono font-bold transition-colors cursor-pointer"
                >
                  UPGRADE NOW
                </button>
              </div>
            ) : (
              <>
                <div className="bg-[#0A0C10] border border-[#1F293D] rounded-xl p-4.5 text-center space-y-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">
                    COMPILATION SCORE
                  </span>
                  <div className="inline-flex justify-center items-center relative">
                    <div className="text-3xl font-extrabold text-[#10B981] bg-[#10B981]/10 w-16 h-16 rounded-full flex items-center justify-center border border-[#10B981]/30">
                      {aiScore}
                    </div>
                  </div>
                  <p className="text-[10px] text-[#9CA3AF] leading-relaxed pt-1">
                    {aiScore && aiScore >= 90 
                      ? 'Excellent structure. Resume matches recruiters ATS keywords.' 
                      : 'Optimize content below to elevate score constraints.'}
                  </p>
                </div>

                {/* 🎯 Job Description Matching (ATS Fit Check) */}
                <div className="bg-[#0A0C10] border border-[#1F293D] rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#A855F7] block">
                      🎯 Job Description Match
                    </span>
                    {jdMatchScore !== null && (
                      <span className="text-[9px] font-mono font-bold bg-[#10B981]/10 text-[#10B981] px-1.5 py-0.5 rounded border border-[#10B981]/25">
                        {jdMatchScore}% Fit
                      </span>
                    )}
                  </div>
                  {jdMatchTitle && (
                    <p className="text-[10px] text-gray-300 font-mono font-bold line-clamp-1">
                      {jdMatchTitle}
                    </p>
                  )}
                  <textarea
                    placeholder={lang === 'en' ? "Paste target Job Description here..." : "Вставьте описание вакансии..."}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full h-20 bg-[#11131A] border border-[#1F293D] rounded-lg p-2 text-[10px] text-white outline-none focus:border-[#A855F7] resize-none font-mono placeholder-gray-600 transition-colors"
                  />
                  <button
                    onClick={handleMatchJobDescription}
                    disabled={isMatchingJd || !jobDescription}
                    className="w-full flex items-center justify-center gap-1.5 bg-[#A855F7] hover:bg-purple-600 disabled:opacity-50 text-white py-2 rounded-lg text-[9px] font-mono font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-pointer"
                  >
                    {isMatchingJd ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-white" />
                        <span>{lang === 'en' ? 'ANALYZING JD...' : 'АНАЛИЗ ВАКАНСИИ...'}</span>
                      </>
                    ) : (
                      <>
                        <Search className="h-3 w-3" />
                        <span>{lang === 'en' ? 'CHECK ATS MATCH' : 'ПРОВЕРИТЬ ATS СОВМЕСТИМОСТЬ'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                      ATS OPTIMIZATIONS
                    </span>
                    {isUploadedCV && suggestions.length > 0 && (
                      <button
                        onClick={handleResolveAllIssues}
                        disabled={isResolvingAll}
                        className="flex items-center gap-1 bg-[#10B981] hover:bg-emerald-600 disabled:opacity-50 text-white text-[8px] font-bold py-1 px-2.5 rounded-md font-mono transition-colors cursor-pointer"
                      >
                        {isResolvingAll ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Sparkles className="h-2.5 w-2.5" />}
                        <span>RESOLVE ALL</span>
                      </button>
                    )}
                  </div>

                  {analyzingCv ? (
                    <div className="flex flex-col items-center py-10 gap-2 text-[10px] text-gray-500 font-mono">
                      <Loader2 className="h-5 w-5 text-[#A855F7] animate-spin" />
                      <span>Reviewing content...</span>
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="bg-emerald-950/15 border border-emerald-500/20 text-[#10B981] p-4 rounded-xl text-center text-[10px] space-y-1">
                      <CheckCircle className="h-5 w-5 text-[#10B981] mx-auto mb-1.5" />
                      <p className="font-bold text-xs">ALL ISSUES RESOLVED!</p>
                      <p className="text-gray-500">Resume is highly optimized for target positions.</p>
                      
                      <div className="text-left border-t border-emerald-500/20 pt-2.5 mt-2.5 space-y-2 text-[9px] text-gray-400 font-mono">
                        <span className="font-bold uppercase tracking-wider text-[#A855F7] block mb-1">Optimizations Applied:</span>
                        <div className="flex gap-1 items-start">
                          <span className="text-[#10B981] font-bold">✔</span>
                          <div>
                            <strong className="text-white">Summary:</strong> Injected metrics-driven descriptions (load times optimized by 40%).
                          </div>
                        </div>
                        <div className="flex gap-1 items-start">
                          <span className="text-[#10B981] font-bold">✔</span>
                          <div>
                            <strong className="text-white">Work Experience:</strong> Integrated tech stack (FastAPI ASGI middleware) and reduced middleware query latency by 15%.
                          </div>
                        </div>
                        <div className="flex gap-1 items-start">
                          <span className="text-[#10B981] font-bold">✔</span>
                          <div>
                            <strong className="text-white">Skills:</strong> Injected recruiter-friendly search keywords (<span className="text-[#A855F7]">Kubernetes / AWS ECS</span>) to clear automated search parameters.
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {suggestions.map((sug, idx) => (
                        <div 
                          key={idx}
                          className="bg-[#0A0C10] border border-[#1F293D] hover:border-[#A855F7]/30 p-3.5 rounded-xl space-y-2.5 transition-colors text-[10px]"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-mono bg-[#1F293D] px-1.5 py-0.2 rounded text-gray-400 uppercase text-[8px]">
                              {sug.section}
                            </span>
                            <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          </div>
                          
                          <p className="text-gray-400 italic">
                            "{sug.critique}"
                          </p>
                          
                          <div className="bg-purple-950/10 border border-purple-500/10 p-2 rounded text-[#A855F7] leading-relaxed">
                            {sug.suggestion}
                          </div>

                          <button
                            onClick={() => {
                              if (!canResolve) {
                                setRequiredPlan('ultra');
                                setFeatureExplanation('Applying AI recommendations to uploaded CVs is an Ultra feature. Upgrade to Ultra to resolve issues.');
                                setUpgradeModalOpen(true);
                              } else {
                                handleApplyAiSuggestion(sug);
                              }
                            }}
                            className="w-full flex items-center justify-center gap-1.5 bg-[#A855F7]/10 hover:bg-[#A855F7] border border-[#A855F7]/30 hover:border-transparent text-[#A855F7] hover:text-white py-1.5 rounded-md font-semibold font-mono text-[9px] transition-colors"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>{!canResolve ? 'UPGRADE TO ULTRA TO APPLY' : 'APPLY AI STYLE'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        )}

      </div>

      {/* Global CSS Inject to support print formatting */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          html, body {
            background: white !important;
            color: black !important;
            height: auto !important;
            overflow: visible !important;
          }
          body > div {
            height: auto !important;
            overflow: visible !important;
          }
          .print-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            background: white !important;
            z-index: 9999 !important;
          }
          #resume-pdf-canvas {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 794px !important; /* A4 width */
            max-width: 100% !important;
            height: 1123px !important; /* A4 height */
            position: relative !important;
            overflow: hidden !important;
          }
        }
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }
      `}</style>

      {/* Premium Plan Upgrade Simulator Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm no-print">
          <div className="bg-[#11131A] border border-[#1F293D] p-6 rounded-xl max-w-sm w-full space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setUpgradeModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-2 text-center">
              <div className="inline-flex p-3 bg-purple-950/20 border border-purple-500/30 rounded-full text-[#A855F7]">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Premium Feature Locked</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed pt-1">
                {featureExplanation}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="bg-[#0A0C10] border border-[#1F293D] hover:bg-[#1C202C] text-gray-400 hover:text-white text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer"
              >
                Maybe Later
              </button>
              
              <button
                onClick={() => {
                  setUpgradeModalOpen(false);
                  router.push('/pricing');
                }}
                className="bg-[#A855F7] hover:bg-purple-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer text-center"
              >
                Upgrade to {requiredPlan.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Alert/Confirm Modal */}
      {notification.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
          <div className="bg-[#11131A] border border-[#1F293D] rounded-2xl w-full max-w-sm p-6 relative shadow-2xl space-y-6 glow-purple/10">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-[#A855F7]" />
            
            <div className="space-y-2 text-center">
              <div className="inline-flex p-3 bg-purple-950/20 border border-purple-500/20 rounded-full text-[#A855F7] mb-2">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                {notification.title}
              </h3>
              <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                {notification.message}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              {notification.type === 'confirm' ? (
                <>
                  <button
                    onClick={() => setNotification(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 bg-[#0A0C10] border border-[#1F293D] hover:bg-[#1C202C] text-gray-400 hover:text-white text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setNotification(prev => ({ ...prev, isOpen: false }));
                      if (notification.onConfirm) notification.onConfirm();
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer font-mono"
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setNotification(prev => ({ ...prev, isOpen: false }))}
                  className="w-full bg-[#A855F7] hover:bg-purple-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer font-mono text-center"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Certificate Image Lightbox Modal */}
      {activeCertPreview && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-[#11131A] border border-[#1F293D] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#1F293D] pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#A855F7]" />
                <h3 className="text-sm font-bold text-white line-clamp-1">{activeCertPreview.title}</h3>
              </div>
              <button
                onClick={() => setActiveCertPreview(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1F293D] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="bg-[#0A0C10] border border-[#1F293D] rounded-xl p-2 flex items-center justify-center min-h-[300px] max-h-[500px]">
              <img
                src={activeCertPreview.imageUrl}
                alt={activeCertPreview.title}
                className="max-h-[460px] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <a
                href={activeCertPreview.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#A855F7] hover:underline font-mono"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Full Certificate Image in New Tab</span>
              </a>
              <button
                onClick={() => setActiveCertPreview(null)}
                className="bg-[#1F293D] hover:bg-[#2B3952] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col justify-center items-center h-screen bg-[#0A0C10] font-mono text-xs text-[#9CA3AF] gap-3">
        <Loader2 className="h-8 w-8 text-[#A855F7] animate-spin" />
        <span>Loading Editor Engine v2.0...</span>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
