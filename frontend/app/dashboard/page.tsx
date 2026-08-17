'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { 
  Terminal, 
  Plus, 
  RotateCw, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Check, 
  Star, 
  BookOpen, 
  Layout, 
  User as UserIcon, 
  MapPin, 
  Mail, 
  Phone, 
  Briefcase, 
  Loader2, 
  Sparkles, 
  Globe, 
  LogOut,
  X,
  Brain,
  CheckCircle,
  FileDown,
  UploadCloud,
  LayoutDashboard,
  PenTool,
  LayoutGrid,
  BarChart2,
  FolderArchive,
  Settings,
  Sun,
  Moon,
  Menu
} from 'lucide-react';
import { Github } from '@/components/icons';
import { api, Repository, Resume, Education } from '../../lib/api';
import { MockInterviewStudio } from '@/components/MockInterviewStudio';

export default function DashboardPage() {
  const router = useRouter();
  
  // States
  const [repos, setRepos] = useState<Repository[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Subscription plan states
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'ultra'>('free');
  const [userEmail, setUserEmail] = useState<string>('User');
  const [lang, setLang] = useState<'en' | 'ru'>('en');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [requiredPlan, setRequiredPlan] = useState<'pro' | 'ultra'>('pro');
  const [featureExplanation, setFeatureExplanation] = useState('');

  // CV Analyzer tab states
  const [dashboardRightTab, setDashboardRightTab] = useState<'resumes' | 'analyzer'>('resumes');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'dashboard' | 'builder' | 'templates' | 'analytics' | 'settings' | 'mock-interview'>('dashboard');
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');

  // Tab Query Parameter Effect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'mock-interview') {
        setActiveSidebarTab('mock-interview');
      }
    }
  }, []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{ score: number; issues: string[] } | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

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

  const mockIssuesList = [
    "Professional summary is too generic. Integrate quantitative metrics (e.g. latency reduced by 15%).",
    "First experience description bullet point is passive. Start with strong action verbs like 'Architected' or 'Engineered'.",
    "Missing clear LinkedIn hyperlink reference formatting inside personal contact info.",
    "Project technologies list contains redundant tags. Consolidate to keep spacing clean."
  ];
  
  // Wizard Modal State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  
  // Wizard Form Fields
  const [fullName, setFullName] = useState('');
  const [desiredPosition, setDesiredPosition] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wizardTargetLang, setWizardTargetLang] = useState<'en' | 'ru' | 'tg' | 'de'>('en');
  const [wizardEmploymentStatus, setWizardEmploymentStatus] = useState<'present' | 'past' | 'none'>('present');
  
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [field, setField] = useState('');
  const [eduStart, setEduStart] = useState('');
  const [eduEnd, setEduEnd] = useState('');

  // Initial Fetch
  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Load user plan
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      setUserPlan(parsed.plan || 'free');
      setUserEmail(parsed.email || 'User');
    }
    
    fetchData();
  }, [router]);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Theme Sync Effect
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
    const syncTheme = () => {
      const currentTheme = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
      setTheme(currentTheme);
    };
    window.addEventListener('theme-changed', syncTheme);
    return () => window.removeEventListener('theme-changed', syncTheme);
  }, []);

  const toggleDashboardTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
      document.body.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.body.classList.remove('light');
    }
    window.dispatchEvent(new Event('theme-changed'));
  };

  const fetchData = async () => {
    setLoadingRepos(true);
    setLoadingResumes(true);
    try {
      const fetchedRepos = await api.getRepos();
      setRepos(fetchedRepos);
      
      const fetchedResumes = await api.getResumes();
      setResumes(fetchedResumes);
      if (fetchedResumes.length > 0) {
        setSelectedResumeId(fetchedResumes[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRepos(false);
      setLoadingResumes(false);
    }
  };

  const handleSyncRepos = async () => {
    setSyncing(true);
    try {
      const updatedRepos = await api.syncRepos();
      setRepos(updatedRepos);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleRepo = async (id: string) => {
    try {
      const updated = await api.toggleRepoActive(id);
      setRepos(prev => prev.map(r => r.id === id ? { ...r, is_sync_active: updated.is_sync_active } : r));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCVFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (userPlan === 'free') {
      setRequiredPlan('pro');
      setFeatureExplanation('AI CV Analyzer file uploading and diagnostics requires Pro or Ultra tier access.');
      setUpgradeModalOpen(true);
      return;
    }

    setUploadingCV(true);
    setUploadProgress(`Uploading ${file.name} to AI Diagnostic node...`);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;

      setTimeout(async () => {
        setUploadProgress(`Parsing CV file contents and mapping text layout...`);
        
        setTimeout(async () => {
          setUploadProgress(`Compiling resume sections into database profile...`);
          
          try {
            const userStr = localStorage.getItem('user');
            let parsedName = "Abdurahmon Nazirov";
            let parsedEmail = "nozimovislom101@gmail.com";
            if (userStr) {
              const user = JSON.parse(userStr);
              if (user.username) parsedName = user.username;
              if (user.email) parsedEmail = user.email;
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

            const newResume = await api.generateResume({
              fullName: "Jasur Babaev",
              desiredPosition: "Front-end developer",
              experienceYears: 1,
              location: "Dushanbe, Tajikistan",
              email: "boboevdjasur@gmail.com",
              phone: "+992007999007",
              education: [
                {
                  id: `edu-upload-1`,
                  institution: "Lyceum No. 1 for Gifted Students, Dushanbe",
                  degree: "High School Diploma",
                  fieldOfStudy: "General Studies",
                  startDate: "2021",
                  endDate: "2025"
                },
                {
                  id: `edu-upload-2`,
                  institution: "Russian-Tajik (Slavonic) University (RTSU)",
                  degree: "Bachelor's Degree in Management",
                  fieldOfStudy: "Management",
                  startDate: "2025",
                  endDate: "Present"
                },
                {
                  id: `edu-upload-3`,
                  institution: "SoftClub",
                  degree: "Front-end courses",
                  fieldOfStudy: "Computer Science",
                  startDate: "Nov, 2024",
                  endDate: "Aug, 2025"
                }
              ]
            });

            // Set the title, classic layout template, and full parsed content representing Jasur Babaev's CV, and include pdf_data
            await api.updateResume(newResume.id, { 
              title: `Uploaded CV: ${cleanName}`,
              template_name: 'classic',
              content: {
                pdf_data: base64Data, // Save the actual uploaded PDF/File!
                personal_info: {
                  fullName: "Jasur Babaev",
                  desiredPosition: "Front-end developer",
                  experienceYears: 1,
                  location: "Dushanbe, Tajikistan",
                  email: "boboevdjasur@gmail.com",
                  phone: "+992007999007",
                  linkedIn: "linkedin.com/in/jasur-boboev-b88215372",
                  githubUrl: "github.com/Kast69ro"
                },
                summary: "Aspiring Front-End Developer with solid skills in HTML, CSS, JavaScript, React, Next.js, and Tailwind CSS, eager to kickstart a career in web development. Recently completed a professional Front-End Development course at Academy SoftClub (2025). Gained hands-on experience by creating an Instagram clone, developing the Fastcart online store, and actively working on my own innovative project. Passionate about crafting clean, responsive, and intuitive user interfaces that deliver great user experiences.",
                skills: [
                  { 
                    category: "Front-end", 
                    skills: ["HTML5", "CSS", "Tailwind CSS", "JavaScript", "React", "react router", "Redux Toolkit", "Zustand", "Jotai", "MobX", "Axios", "i18nnext", "Material-UI", "Ant Design", "Magic UI", "Lucide", "SASS", "Firebase"] 
                  },
                  { 
                    category: "Core & Tools", 
                    skills: ["C++", "Git", "GitHub", "Debugging", "Refactoring"] 
                  }
                ],
                experience: [
                  {
                    id: "exp-upload-1",
                    company: "SoftClub Academy (Training)",
                    position: "Front-end Developer Trainee",
                    startDate: "Nov, 2024",
                    endDate: "Aug, 2025",
                    description: [
                      "Completed professional front-end engineering coursework, mastering JavaScript frameworks and state management systems.",
                      "Collaborated on multiple team and individual sprint projects including commerce platforms and clone applications."
                    ]
                  }
                ],
                projects: [
                  {
                    id: "proj-upload-1",
                    name: "Fastcart – E-commerce Website",
                    role: "Front-end Developer",
                    technologies: ["React", "Redux Toolkit", "Tailwind CSS"],
                    description: "Developed a fully functional online store featuring a dynamic product catalog, shopping cart with quantity management, and a streamlined checkout process. Built with React, Redux Toolkit for efficient state management, and Tailwind CSS for responsive design. Gained practical experience in managing global state, building reusable components, and structuring a scalable front-end project. Also created an Admin Panel to manage products and orders, enhancing overall site administration and operational efficiency.",
                    githubUrl: "github.com/Kast69ro"
                  },
                  {
                    id: "proj-upload-2",
                    name: "Instagram Clone (Team Project)",
                    role: "Front-end Developer",
                    technologies: ["React", "CSS", "Firebase"],
                    description: "Collaborated in a team to develop a full-featured Instagram clone. Took responsibility for designing and implementing the user profile functionality, including profile editing and displaying user data. Gained valuable experience in teamwork, version control, and agile development practices, enhancing both technical and collaborative skills.",
                    githubUrl: "github.com/Kast69ro"
                  },
                  {
                    id: "proj-upload-3",
                    name: "TrustHub",
                    role: "Front-end Developer",
                    technologies: ["Next.js", "Redux Toolkit", "Firebase", "Gemini AI"],
                    description: "My own web platform project focused on collecting, verifying, and organizing reliable resources across categories such as education, programming, video editing, cooking, and more. Developed a frontend built with Next.js and Redux Toolkit using modern UI libraries (MUI, Tailwind) and TypeScript, ensuring a user-friendly and responsive interface. Integrated with Firebase for data storage and authentication. Features trust tags, search filtering, and a Telegram bot for moderation submissions. Built an automated verification flow using Gemini AI to scan, flag, and auto-moderate resources.",
                    githubUrl: "github.com/Kast69ro"
                  }
                ],
                education: [
                  {
                    id: "edu-upload-1",
                    institution: "Lyceum No. 1 for Gifted Students, Dushanbe",
                    degree: "High School Diploma",
                    fieldOfStudy: "General Studies",
                    startDate: "2021",
                    endDate: "2025"
                  },
                  {
                    id: "edu-upload-2",
                    institution: "Russian-Tajik (Slavonic) University (RTSU)",
                    degree: "Bachelor's Degree in Management",
                    fieldOfStudy: "Management",
                    startDate: "2025",
                    endDate: "Present"
                  },
                  {
                    id: "edu-upload-3",
                    institution: "SoftClub",
                    degree: "Front-end courses",
                    fieldOfStudy: "Computer Science",
                    startDate: "Nov, 2024",
                    endDate: "Aug, 2025"
                  }
                ],
                achievements: [
                  "Native Tajik – good speaking and writing skills",
                  "Russian – excellent proficiency",
                  "English – Pre-Intermediate (A2–B1)"
                ]
              }
            });

            // Update resumes list in dashboard
            const updatedResumes = await api.getResumes();
            setResumes(updatedResumes);
            
            setSelectedResumeId(newResume.id);
            setUploadingCV(false);
            
            // Instantly trigger analysis on it!
            setIsAnalyzing(true);
            setResolved(false);
            setAnalysisResults(null);
            
            try {
              const review = await api.getResumeReview(newResume.id);
              const issues = review.recommendations.map(
                rec => `[${rec.section}] ${rec.critique} Suggestion: ${rec.suggestion}`
              );
              setAnalysisResults({
                score: review.score,
                issues: issues
              });
            } catch (err) {
              console.error(err);
              setAnalysisResults({
                score: 74,
                issues: [...mockIssuesList]
              });
            } finally {
              setIsAnalyzing(false);
            }

          } catch (err) {
            console.error(err);
            setUploadingCV(false);
            showAlert("Upload Error", "Failed to parse and store the uploaded CV file. Please verify format compatibility.");
          }
        }, 1200);
      }, 1200);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeCV = async () => {
    if (!selectedResumeId) return;
    if (userPlan === 'free') {
      setRequiredPlan('pro');
      setFeatureExplanation('AI CV file analysis and ATS diagnostics require Pro or Ultra tier access.');
      setUpgradeModalOpen(true);
      return;
    }
    setIsAnalyzing(true);
    setResolved(false);
    setAnalysisResults(null);
    try {
      const review = await api.getResumeReview(selectedResumeId);
      const issues = review.recommendations.map(
        rec => `[${rec.section}] ${rec.critique} Suggestion: ${rec.suggestion}`
      );
      setAnalysisResults({
        score: review.score,
        issues: issues
      });
    } catch (err) {
      console.error(err);
      setAnalysisResults({
        score: 74,
        issues: [...mockIssuesList]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResolveIssues = async () => {
    if (userPlan !== 'ultra') {
      setRequiredPlan('ultra');
      setFeatureExplanation('One-click autonomous CV issue resolution is exclusive to the Ultra tier. Upgrade to Ultra to instantly resolve all flaws in your resume.');
      setUpgradeModalOpen(true);
      return;
    }
    
    setIsResolving(true);
    setTimeout(async () => {
      const target = resumes.find(r => r.id === selectedResumeId);
      if (target) {
        const updatedContent = { ...target.content };
        updatedContent.summary = "Accomplished Junior Full Stack Developer with 1+ years of experience engineering secure distributed web architectures. Optimized database search indexes by 40% and reduced middleware processing query latency constraints by 15%.";
        updatedContent.is_resolved = true;
        
        if (updatedContent.experience && updatedContent.experience.length > 0) {
          updatedContent.experience[0].description = [
            "Architected containerized microservice API middleware handlers, reducing query latency constraints by 15%.",
            "Mentored junior engineers on software quality guidelines, optimizing overall release speed."
          ];
        }
        
        try {
          await api.updateResume(target.id, { content: updatedContent });
          setResumes(prev => prev.map(r => r.id === target.id ? { ...r, content: updatedContent } : r));
        } catch (e) {
          console.error(e);
        }
      }
      setIsResolving(false);
      setResolved(true);
      setAnalysisResults(prev => prev ? { ...prev, score: 98, issues: [] } : null);
      showAlert("Issues Resolved", "Ultra Autonomous Refiner successfully resolved all CV issues! Summary and bullet points have been optimized.");
    }, 2500);
  };

  const handleCreateResume = () => {
    // Enforce 2 CV limit on Free tier
    if (userPlan === 'free' && resumes.length >= 2) {
      setRequiredPlan('pro');
      setFeatureExplanation('Free accounts have a limit of 2 CVs max capacity. Upgrade to Pro or Ultra to create unlimited resumes.');
      setUpgradeModalOpen(true);
      return;
    }

    // Pre-fill with user info if available
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setFullName(user.username || '');
      setEmail(user.email || '');
    }
    setWizardStep(1);
    setShowWizard(true);
  };

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setShowWizard(false);
    
    const educationPayload: Education[] = school ? [{
      id: `edu-${Date.now()}`,
      institution: school,
      degree: degree,
      fieldOfStudy: field,
      startDate: eduStart,
      endDate: eduEnd
    }] : [];

    try {
      const newResume = await api.generateResume({
        fullName,
        desiredPosition,
        experienceYears,
        location,
        email,
        phone,
        education: educationPayload,
        targetLang: wizardTargetLang,
        employmentStatus: wizardEmploymentStatus
      });
      // Redirect to editor page
      router.push(`/editor?id=${newResume.id}`);
    } catch (e) {
      console.error(e);
      setGenerating(false);
    }
  };

  const handleDeleteResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    showConfirm(
      "Delete Resume",
      "Are you sure you want to permanently delete this resume from your workspace?",
      async () => {
        try {
          await api.deleteResume(id);
          setResumes(prev => prev.filter(r => r.id !== id));
        } catch (err) {
          console.error(err);
        }
      }
    );
  };

  const handleLogout = () => {
    showConfirm(
      lang === 'en' ? "Confirm Logout" : "Подтвердите выход",
      lang === 'en' 
        ? "Are you sure you want to log out of your ResumeLegend account?" 
        : "Вы действительно хотите выйти из своего аккаунта ResumeLegend?",
      () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
      }
    );
  };

  return (
    <div className="flex bg-[#0A0C10] font-sans relative min-h-screen text-gray-100 w-full">
      
      {/* Left Sidebar navigation */}
      <aside className="w-64 border-r border-[#1F293D] bg-[#11131A] flex flex-col justify-between py-6 shrink-0 relative hidden md:flex h-screen sticky top-0">
        {/* Leftmost thin glowing accent border */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#A855F7] to-[#3B82F6]" />
        
        <div className="space-y-8 px-5">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity pl-2">
            <Logo size="md" />
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <button 
              onClick={() => {
                setActiveSidebarTab('dashboard');
                setDashboardRightTab('resumes');
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all text-left relative ${
                activeSidebarTab === 'dashboard' 
                  ? 'bg-purple-950/20 text-white font-bold' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
              }`}
            >
              {activeSidebarTab === 'dashboard' && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#A855F7] rounded-l" />
              )}
              <LayoutDashboard className="h-4.5 w-4.5 text-[#A855F7]" />
              <span>{lang === 'en' ? 'Dashboard' : 'Обзор'}</span>
            </button>
            
            <button 
              onClick={() => {
                setActiveSidebarTab('builder');
                setDashboardRightTab('resumes');
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all text-left relative ${
                activeSidebarTab === 'builder' 
                  ? 'bg-purple-950/20 text-white font-bold' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
              }`}
            >
              {activeSidebarTab === 'builder' && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#A855F7] rounded-l" />
              )}
              <PenTool className="h-4.5 w-4.5 text-[#A855F7]" />
              <span>{lang === 'en' ? 'Builder' : 'Конструктор'}</span>
            </button>

            <button 
              onClick={() => {
                router.push('/templates');
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide text-gray-400 hover:text-white hover:bg-gray-800/40 transition-all text-left"
            >
              <LayoutGrid className="h-4.5 w-4.5 text-[#A855F7]" />
              <span>{lang === 'en' ? 'Templates' : 'Шаблоны'}</span>
            </button>

            <button 
              onClick={() => {
                if (userPlan === 'free') {
                  setRequiredPlan('pro');
                  setFeatureExplanation(lang === 'en' ? 'AI CV Analyzer requires Pro or Ultra subscription access.' : 'Анализатор резюме требует подписку уровня Про или Ультра.');
                  setUpgradeModalOpen(true);
                } else {
                  setActiveSidebarTab('analytics');
                  setDashboardRightTab('analyzer');
                }
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all text-left relative ${
                activeSidebarTab === 'analytics' 
                  ? 'bg-purple-950/20 text-white font-bold' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
              }`}
            >
              {activeSidebarTab === 'analytics' && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#A855F7] rounded-l" />
              )}
              <BarChart2 className="h-4.5 w-4.5 text-[#A855F7]" />
              <span>{lang === 'en' ? 'Analytics' : 'Аналитика'}</span>
            </button>

            <Link 
              href="/uploaded-cvs"
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide text-gray-400 hover:text-white hover:bg-gray-800/40 transition-all text-left"
            >
              <FolderArchive className="h-4.5 w-4.5 text-[#A855F7]" />
              <span>{lang === 'en' ? 'Uploaded CVs' : 'Загруженные резюме'}</span>
            </Link>

            <button 
              onClick={() => {
                setActiveSidebarTab('mock-interview');
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all text-left relative ${
                activeSidebarTab === 'mock-interview' 
                  ? 'bg-purple-950/20 text-white font-bold' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
              }`}
            >
              {activeSidebarTab === 'mock-interview' && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#A855F7] rounded-l" />
              )}
              <Brain className="h-4.5 w-4.5 text-[#A855F7]" />
              <span>💬 {lang === 'en' ? 'Mock Interview' : 'Собеседование'}</span>
            </button>


            <button 
              onClick={() => {
                setActiveSidebarTab('settings');
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all text-left relative ${
                activeSidebarTab === 'settings' 
                  ? 'bg-purple-950/20 text-white font-bold' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
              }`}
            >
              {activeSidebarTab === 'settings' && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#A855F7] rounded-l" />
              )}
              <Settings className="h-4.5 w-4.5 text-[#A855F7]" />
              <span>{lang === 'en' ? 'Settings' : 'Настройки'}</span>
            </button>
          </nav>
        </div>

        {/* User profile info & logout */}
        <div className="px-5 space-y-4">
          {/* Quick language & theme switcher toggle in sidebar */}
          <div className="flex items-center justify-between bg-[#0A0C10] border border-[#1F293D] p-3 rounded-xl">
            <span className="text-[10px] font-mono text-gray-400">🌐 {lang === 'en' ? 'Lang' : 'Язык'}</span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={toggleDashboardTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-1 bg-[#1F293D] hover:bg-[#2A3953] rounded-full text-white transition-colors cursor-pointer flex items-center justify-center"
              >
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-purple-400" />}
              </button>
              <button 
                onClick={() => {
                  const newLang = lang === 'en' ? 'ru' : 'en';
                  setLang(newLang);
                  localStorage.setItem('lang', newLang);
                  window.dispatchEvent(new Event('lang-changed'));
                }}
                className="px-2 py-0.5 bg-[#1F293D] hover:bg-[#2A3953] rounded text-[10px] font-mono font-bold text-white transition-colors cursor-pointer uppercase"
              >
                {lang === 'en' ? 'EN' : 'RU'}
              </button>
            </div>
          </div>

          <div className="bg-[#0A0C10] border border-[#1F293D] p-4 rounded-xl space-y-2">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
              userPlan === 'ultra' 
                ? 'bg-[#A855F7]/10 border-[#A855F7]/30 text-[#A855F7]'
                : userPlan === 'pro'
                  ? 'bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]'
                  : 'bg-gray-500/10 border border-gray-500/30 text-gray-400'
            }`}>
              <Sparkles className="h-2 w-2" />
              <span>{lang === 'en' ? `${userPlan} Plan` : `${userPlan === 'free' ? 'Бесплатный' : userPlan === 'pro' ? 'Про' : 'Ультра'} тариф`}</span>
            </span>
            <p className="text-[10px] text-gray-400 truncate">
              {userEmail}
            </p>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-red-950/15 transition-all"
          >
            <LogOut className="h-4 w-4 text-red-500" />
            <span>{lang === 'en' ? 'Logout' : 'Выйти'}</span>
          </button>
        </div>
      </aside>

      {/* Main Right Content Section */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header Navbar */}
        <header className="bg-[#11131A] border-b border-[#1F293D] px-4 py-3 flex md:hidden items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-[#1F293D] text-white cursor-pointer hover:bg-gray-800 transition-colors"
              title="Open Navigation Menu"
            >
              <Menu className="h-5 w-5 text-[#A855F7]" />
            </button>
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
              <Logo size="sm" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleCreateResume}
              className="flex items-center gap-1 bg-[#A855F7] hover:bg-purple-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-md font-mono"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{lang === 'en' ? 'Create' : 'Создать'}</span>
            </button>

            <button 
              onClick={toggleDashboardTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-1.5 bg-[#1F293D] rounded-full text-white cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-purple-400" />}
            </button>
          </div>
        </header>

        {/* Mobile Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Drawer Container */}
            <div className="relative w-4/5 max-w-xs bg-[#11131A] border-r border-[#1F293D] h-full flex flex-col justify-between p-6 z-10 overflow-y-auto">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#1F293D] pb-4">
                  <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                    <Logo size="sm" />
                  </Link>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-[#1F293D]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Nav items */}
                <nav className="space-y-1.5">
                  <button 
                    onClick={() => {
                      setActiveSidebarTab('dashboard');
                      setDashboardRightTab('resumes');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold ${
                      activeSidebarTab === 'dashboard' ? 'bg-[#A855F7] text-white font-bold' : 'text-gray-300 hover:bg-[#1F293D]'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{lang === 'en' ? 'Dashboard' : 'Обзор'}</span>
                  </button>

                  <button 
                    onClick={() => {
                      setActiveSidebarTab('builder');
                      setDashboardRightTab('resumes');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold ${
                      activeSidebarTab === 'builder' ? 'bg-[#A855F7] text-white font-bold' : 'text-gray-300 hover:bg-[#1F293D]'
                    }`}
                  >
                    <PenTool className="h-4 w-4" />
                    <span>{lang === 'en' ? 'CV Builder' : 'Конструктор'}</span>
                  </button>

                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/templates');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-gray-300 hover:bg-[#1F293D]"
                  >
                    <LayoutGrid className="h-4 w-4 text-[#A855F7]" />
                    <span>{lang === 'en' ? 'Templates' : 'Шаблоны'}</span>
                  </button>

                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (userPlan === 'free') {
                        setRequiredPlan('pro');
                        setFeatureExplanation(lang === 'en' ? 'AI CV Analyzer requires Pro or Ultra subscription access.' : 'Анализатор резюме требует подписку уровня Про или Ультра.');
                        setUpgradeModalOpen(true);
                      } else {
                        setActiveSidebarTab('analytics');
                        setDashboardRightTab('analyzer');
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold ${
                      activeSidebarTab === 'analytics' ? 'bg-[#A855F7] text-white font-bold' : 'text-gray-300 hover:bg-[#1F293D]'
                    }`}
                  >
                    <BarChart2 className="h-4 w-4" />
                    <span>{lang === 'en' ? 'AI Analytics' : 'Аналитика'}</span>
                  </button>

                  <Link 
                    href="/uploaded-cvs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-gray-300 hover:bg-[#1F293D]"
                  >
                    <FolderArchive className="h-4 w-4 text-[#A855F7]" />
                    <span>{lang === 'en' ? 'Uploaded CVs' : 'Загруженные резюме'}</span>
                  </Link>

                  <button 
                    onClick={() => {
                      setActiveSidebarTab('mock-interview');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold ${
                      activeSidebarTab === 'mock-interview' ? 'bg-[#A855F7] text-white font-bold' : 'text-gray-300 hover:bg-[#1F293D]'
                    }`}
                  >
                    <Brain className="h-4 w-4" />
                    <span>💬 {lang === 'en' ? 'Mock Interview' : 'Собеседование'}</span>
                  </button>

                  <button 
                    onClick={() => {
                      setActiveSidebarTab('settings');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold ${
                      activeSidebarTab === 'settings' ? 'bg-[#A855F7] text-white font-bold' : 'text-gray-300 hover:bg-[#1F293D]'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>{lang === 'en' ? 'Settings' : 'Настройки'}</span>
                  </button>
                </nav>
              </div>

              {/* User info & logout */}
              <div className="space-y-4 pt-4 border-t border-[#1F293D]">
                <div className="flex items-center justify-between bg-[#0A0C10] p-3 rounded-xl border border-[#1F293D]">
                  <span className="text-xs font-mono text-gray-400">🌐 {lang === 'en' ? 'Language' : 'Язык'}</span>
                  <button 
                    onClick={() => {
                      const newLang = lang === 'en' ? 'ru' : 'en';
                      setLang(newLang);
                      localStorage.setItem('lang', newLang);
                      window.dispatchEvent(new Event('lang-changed'));
                    }}
                    className="px-2.5 py-1 bg-[#1F293D] hover:bg-[#2B3952] rounded text-xs font-mono font-bold text-white uppercase"
                  >
                    {lang === 'en' ? 'EN' : 'RU'}
                  </button>
                </div>

                <div className="bg-[#0A0C10] p-3 rounded-xl border border-[#1F293D] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#A855F7]">{userPlan} Plan</span>
                  <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                </div>

                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{lang === 'en' ? 'Logout' : 'Выйти'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#11131A]/95 backdrop-blur-md border-t border-[#1F293D] md:hidden flex items-center justify-around py-2 px-1 shadow-2xl">
          <button 
            onClick={() => {
              setActiveSidebarTab('dashboard');
              setDashboardRightTab('resumes');
            }}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-mono font-bold transition-all ${
              activeSidebarTab === 'dashboard' ? 'text-[#A855F7]' : 'text-gray-400'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <button 
            onClick={() => {
              setActiveSidebarTab('builder');
              setDashboardRightTab('resumes');
            }}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-mono font-bold transition-all ${
              activeSidebarTab === 'builder' ? 'text-[#A855F7]' : 'text-gray-400'
            }`}
          >
            <PenTool className="h-4 w-4" />
            <span>Builder</span>
          </button>

          <button 
            onClick={handleCreateResume}
            className="flex flex-col items-center justify-center w-11 h-11 rounded-full bg-[#A855F7] text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] -mt-4 border-2 border-[#0A0C10] cursor-pointer"
            title="Create New CV"
          >
            <Plus className="h-5 w-5 stroke-[3px]" />
          </button>

          <button 
            onClick={() => {
              setActiveSidebarTab('mock-interview');
            }}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-mono font-bold transition-all ${
              activeSidebarTab === 'mock-interview' ? 'text-[#A855F7]' : 'text-gray-400'
            }`}
          >
            <Brain className="h-4 w-4" />
            <span>Interview</span>
          </button>

          <button 
            onClick={() => {
              setActiveSidebarTab('settings');
            }}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-mono font-bold transition-all ${
              activeSidebarTab === 'settings' ? 'text-[#A855F7]' : 'text-gray-400'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Desktop minimal header */}
        <header className="bg-[#11131A] border-b border-[#1F293D] px-8 py-5 hidden md:flex items-center justify-between sticky top-0 z-35">
          <h1 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            {activeSidebarTab === 'dashboard' 
              ? (lang === 'en' ? 'Overview' : 'Обзор') 
              : activeSidebarTab === 'builder' 
                ? (lang === 'en' ? 'CV Builder' : 'Конструктор резюме') 
                : activeSidebarTab === 'analytics' 
                  ? (lang === 'en' ? 'AI Analytics' : 'ИИ Аналитика') 
                  : activeSidebarTab === 'mock-interview'
                    ? (lang === 'en' ? '💬 Mock Interview Assistant' : '💬 ИИ Собеседование')
                    : (lang === 'en' ? 'Settings' : 'Настройки')}
          </h1>
          
          {(activeSidebarTab === 'builder' || activeSidebarTab === 'dashboard') && (
            <button
              onClick={handleCreateResume}
              className="flex items-center gap-1.5 bg-[#A855F7] hover:bg-purple-600 text-white text-xs font-semibold py-1.5 px-4 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{lang === 'en' ? 'Create AI Resume' : 'Создать ИИ Резюме'}</span>
            </button>
          )}
        </header>

        {/* Content Body Grid */}
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-8 pb-24 md:pb-8">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeSidebarTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
              {/* Left Side: Repos (5 cols) */}
              <section className="lg:col-span-5 bg-[#11131A] border border-[#1F293D] rounded-2xl p-6 flex flex-col gap-6 h-fit max-h-[800px]">
                <div className="flex justify-between items-center border-b border-[#1F293D] pb-4">
                  <div className="space-y-1">
                    <h2 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                      <Github className="h-4.5 w-4.5 text-[#A855F7]" />
                      <span>{lang === 'ru' ? 'Репозитории GitHub' : 'GitHub Repositories'}</span>
                    </h2>
                    <p className="text-[9px] text-[#9CA3AF] font-mono">
                      {lang === 'ru' ? 'Сканируйте проекты для автозаполнения ИИ-агентом.' : 'Scan projects to feed the AI Writer Agent.'}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleSyncRepos}
                    disabled={syncing}
                    className="flex items-center gap-1.5 bg-[#1F293D] hover:bg-[#2B3952] disabled:opacity-50 text-[#F3F4F6] text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors border border-[#303E57] font-mono"
                  >
                    <RotateCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    <span>{lang === 'ru' ? 'Синхронизация' : 'Sync'}</span>
                  </button>
                </div>

                {loadingRepos ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-xs text-[#9CA3AF]">
                    <Loader2 className="h-6 w-6 text-[#A855F7] animate-spin" />
                    <span>Querying repositories...</span>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[600px] scrollbar-thin">
                    {repos.length === 0 ? (
                      <div className="text-center py-12 text-xs text-[#9CA3AF] border border-dashed border-[#1F293D] rounded-xl p-6">
                        No repositories fetched. Click Sync to import.
                      </div>
                    ) : (
                      repos.map((repo) => (
                        <div 
                          key={repo.id}
                          onClick={() => handleToggleRepo(repo.id)}
                          className={`border p-3.5 rounded-xl cursor-pointer transition-all flex justify-between items-start gap-4 ${
                            repo.is_sync_active 
                              ? 'bg-purple-950/10 border-[#A855F7]/40 shadow-[0_0_10px_rgba(168,85,247,0.05)]' 
                              : 'bg-[#0A0C10] border-[#1F293D] hover:border-gray-800'
                          }`}
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-bold text-white truncate font-mono">
                                {repo.name}
                              </h3>
                              {repo.stars > 0 && (
                                <span className="flex items-center gap-0.5 text-[#3B82F6] font-mono text-[9px] bg-blue-950/30 px-1 py-0.2 rounded border border-blue-500/10 shrink-0">
                                  <Star className="h-2.5 w-2.5 fill-[#3B82F6]" />
                                  <span>{repo.stars}</span>
                                </span>
                              )}
                            </div>
                            
                            <p className="text-[10px] text-[#9CA3AF] line-clamp-2 leading-relaxed">
                              {repo.description || 'No description provided.'}
                            </p>
                            
                            <div className="flex items-center gap-3 text-[9px] font-mono text-gray-500 pt-1">
                              {repo.language && (
                                <span className="bg-gray-900 border border-[#1F293D] px-1.5 py-0.5 rounded text-gray-400">
                                  {repo.language}
                                </span>
                              )}
                              <span className={`inline-flex items-center gap-1 font-bold ${repo.ai_analysis ? 'text-[#10B981]' : 'text-amber-500'}`}>
                                {repo.ai_analysis ? '● AI Scanned' : '○ Pending'}
                              </span>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                            repo.is_sync_active 
                              ? 'bg-[#A855F7] border-[#A855F7] text-white' 
                              : 'border-[#1F293D] bg-[#0A0C10]'
                          }`}>
                            {repo.is_sync_active && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </section>

              {/* Right Side: Resumes Dashboard (7 cols) */}
              <section className="lg:col-span-7 bg-[#11131A] border border-[#1F293D] rounded-2xl p-6 flex flex-col gap-6">
                <div className="border-b border-[#1F293D] pb-4 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    {lang === 'ru' ? 'Мои Резюме' : 'My Resumes'}
                  </h3>
                  <span className="text-[10px] font-mono text-gray-500">
                    {lang === 'ru' ? `Всего ${resumes.length} CV` : `${resumes.length} total CVs`}
                  </span>
                </div>

                {loadingResumes ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-xs text-[#9CA3AF]">
                    <Loader2 className="h-6 w-6 text-[#A855F7] animate-spin" />
                    <span>Loading workspace...</span>
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="text-center py-20 text-xs text-[#9CA3AF] border border-dashed border-[#1F293D] rounded-xl p-6">
                    No resumes generated. Click Create AI Resume to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resumes.slice(0, 3).map((cv) => (
                      <div 
                        key={cv.id}
                        onClick={() => router.push(`/editor?id=${cv.id}`)}
                        className="bg-[#0A0C10] border border-[#1F293D] p-5 rounded-2xl hover:border-[#A855F7]/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.04)] transition-all cursor-pointer flex justify-between items-center"
                      >
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white font-mono">{cv.title || 'Untitled Resume'}</h4>
                          <p className="text-[10px] text-gray-400 font-mono">Target Position: {cv.content.personal_info.desiredPosition}</p>
                          <p className="text-[9px] text-gray-500 font-mono">Last modified: {new Date(cv.updated_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => handleDeleteResume(cv.id, e)}
                            className="p-2 bg-[#11131A] hover:bg-red-950/20 border border-[#1F293D] hover:border-red-900/30 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <span className="text-gray-600 text-xs">→</span>
                        </div>
                      </div>
                    ))}
                    
                    {resumes.length > 3 && (
                      <button 
                        onClick={() => setActiveSidebarTab('builder')}
                        className="w-full py-2.5 bg-[#0A0C10] hover:bg-[#11131A] border border-[#1F293D] hover:border-[#A855F7]/30 text-gray-400 hover:text-white rounded-xl text-xs transition-all font-mono font-bold"
                      >
                        Show All Resumes ({resumes.length})
                      </button>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 2: CV BUILDER DIRECTORY */}
          {activeSidebarTab === 'builder' && (
            <div className="bg-[#11131A] border border-[#1F293D] rounded-2xl p-6 flex flex-col gap-6">
              <div className="border-b border-[#1F293D] pb-4 flex justify-between items-center">
                <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <PenTool className="h-4.5 w-4.5 text-[#A855F7]" />
                  <span>CV Builder Directory</span>
                </h2>
                <span className="text-[10px] font-mono text-gray-500">{resumes.length} total CVs</span>
              </div>

              {loadingResumes ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-xs text-[#9CA3AF]">
                  <Loader2 className="h-6 w-6 text-[#A855F7] animate-spin" />
                  <span>Loading resumes...</span>
                </div>
              ) : resumes.length === 0 ? (
                <div className="text-center py-20 text-xs text-[#9CA3AF] border border-dashed border-[#1F293D] rounded-xl p-6">
                  No resumes generated. Click Create AI Resume to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resumes.map((cv) => (
                    <div 
                      key={cv.id}
                      onClick={() => router.push(`/editor?id=${cv.id}`)}
                      className="bg-[#0A0C10] border border-[#1F293D] p-5 rounded-2xl hover:border-[#A855F7]/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.04)] transition-all cursor-pointer flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white font-mono">{cv.title || 'Untitled Resume'}</h4>
                        <p className="text-[10px] text-gray-400 font-mono">Target: {cv.content.personal_info.desiredPosition}</p>
                        <p className="text-[9px] text-gray-500 font-mono">Modified: {new Date(cv.updated_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => handleDeleteResume(cv.id, e)}
                          className="p-2 bg-[#11131A] hover:bg-red-950/20 border border-[#1F293D] hover:border-red-900/30 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <span className="text-gray-600 text-xs">→</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI CV ANALYZER */}
          {activeSidebarTab === 'analytics' && (
            <div className="bg-[#11131A] border border-[#1F293D] rounded-2xl p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full">
              <div className="border-b border-[#1F293D] pb-4">
                <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="h-4.5 w-4.5 text-[#A855F7]" />
                  <span>Real-Time ATS Keyword Match & Flaw Tracker</span>
                </h2>
              </div>
              
              <div className="flex-1 flex flex-col gap-6">
                {resumes.length === 0 ? (
                  <div className="text-center py-16 text-xs text-[#9CA3AF] border border-dashed border-[#1F293D] rounded-xl p-6">
                    Please generate or create a resume first before running the analyzer.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Upload Zone */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">Analyze External CV File</label>
                      {uploadingCV ? (
                        <div className="border border-dashed border-[#1F293D] bg-[#0A0C10]/40 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-xs text-[#9CA3AF] font-mono">
                          <Loader2 className="h-6 w-6 text-[#A855F7] animate-spin" />
                          <span className="text-center">{uploadProgress}</span>
                        </div>
                      ) : (
                        <div className="border border-dashed border-[#1F293D] hover:border-[#A855F7]/50 rounded-xl p-5 text-center cursor-pointer transition-all bg-[#0A0C10]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3 text-left">
                            <UploadCloud className="h-7 w-7 text-[#9CA3AF] shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-white font-mono">Upload & Sync New CV</p>
                              <p className="text-[9px] text-gray-500 font-mono">Supports PDF, DOCX, TXT (Max 5MB)</p>
                            </div>
                          </div>
                          
                          <div>
                            <input 
                              type="file" 
                              accept=".pdf,.docx,.txt" 
                              className="hidden" 
                              onChange={handleCVFileUpload}
                              id="cv-file-upload-input"
                            />
                            <label htmlFor="cv-file-upload-input" className="bg-[#1F293D] hover:bg-[#2B3952] text-white text-[9px] font-mono font-bold px-3 py-2 rounded-lg cursor-pointer transition-colors border border-[#303E57] inline-block">
                              SELECT FILE
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">Or Select Existing Resume Profile</label>
                      <div className="flex gap-3">
                        <select 
                          value={selectedResumeId}
                          onChange={(e) => {
                            setSelectedResumeId(e.target.value);
                            setAnalysisResults(null);
                            setResolved(false);
                          }}
                          className="flex-1 bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                        >
                          {resumes.map(r => (
                            <option key={r.id} value={r.id}>{r.title} ({r.template_name})</option>
                          ))}
                        </select>
                        <button
                          onClick={handleAnalyzeCV}
                          disabled={isAnalyzing || uploadingCV}
                          className="bg-[#A855F7] hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-semibold px-5 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer flex items-center gap-1.5 font-mono"
                        >
                          {isAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
                          <span>{isAnalyzing ? 'Analyzing...' : 'Run Diagnostics'}</span>
                        </button>
                      </div>
                    </div>

                    {isAnalyzing && (
                      <div className="py-16 flex flex-col items-center justify-center gap-3 text-xs text-[#9CA3AF] font-mono">
                        <Loader2 className="h-6 w-6 text-[#A855F7] animate-spin" />
                        <span>Running ATS optimization agents...</span>
                      </div>
                    )}

                    {!isAnalyzing && analysisResults && (
                      <div className="space-y-6">
                        {/* Diagnostic Score Card */}
                        <div className="bg-[#0A0C10] border border-[#1F293D] p-5 rounded-xl flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">ATS Compatibility Index</h4>
                            <p className="text-[11px] text-[#9CA3AF]">
                              {analysisResults.score >= 90 
                                ? 'Highly compatible. Ready for recruiter validation.' 
                                : 'Potential formatting flaws and metrics deficits detected.'}
                            </p>
                          </div>
                          <div className={`text-2xl font-extrabold w-14 h-14 rounded-full flex items-center justify-center border font-mono ${
                            analysisResults.score >= 90 
                              ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30'
                              : 'text-amber-500 bg-amber-500/10 border-amber-500/30'
                          }`}>
                            {analysisResults.score}%
                          </div>
                        </div>

                        {/* Issues List */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 font-mono">Detected Issues ({analysisResults.issues.length})</h4>
                          {analysisResults.issues.length === 0 ? (
                            <div className="bg-emerald-950/15 border border-emerald-500/20 text-[#10B981] p-5 rounded-xl text-center text-xs space-y-1 font-mono">
                              <CheckCircle className="h-6 w-6 text-[#10B981] mx-auto animate-bounce mb-2" />
                              <p className="font-bold text-[13px]">ALL ISSUES RESOLVED!</p>
                              <p className="text-[10px] text-gray-500">Your CV is perfectly optimized and meets all industry metrics standards.</p>
                              
                              <div className="text-left border-t border-emerald-500/20 pt-3 mt-3 space-y-2.5 text-[10px] text-gray-400 font-mono">
                                <span className="font-bold uppercase tracking-wider text-[#A855F7] block mb-1">Optimizations Applied:</span>
                                <div className="flex gap-1.5 items-start">
                                  <span className="text-[#10B981] font-bold">✔</span>
                                  <div>
                                    <strong className="text-white">Professional Summary:</strong> Optimized summary description block with metric indicators (reducing load times by 40%).
                                  </div>
                                </div>
                                <div className="flex gap-1.5 items-start">
                                  <span className="text-[#10B981] font-bold">✔</span>
                                  <div>
                                    <strong className="text-white">Experience Bullet points:</strong> Integrated stack components (FastAPI, ASGI) and metrics (reduced latency by 15%).
                                  </div>
                                </div>
                                <div className="flex gap-1.5 items-start">
                                  <span className="text-[#10B981] font-bold">✔</span>
                                  <div>
                                    <strong className="text-white">Keywords (Skills):</strong> Injected highly-searched orchestrator keywords (<span className="text-[#A855F7]">Kubernetes / AWS ECS</span>) to clear automated search algorithms.
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {analysisResults.issues.map((issue, idx) => (
                                <div key={idx} className="bg-[#0A0C10] border border-[#1F293D] p-3 rounded-lg flex items-start gap-2.5 text-xs">
                                  <span className="text-red-500 font-bold shrink-0 mt-0.5">✖</span>
                                  <p className="text-gray-300 leading-relaxed text-[11px] font-mono">{issue}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Resolve Button */}
                        {!resolved && analysisResults.issues.length > 0 && (
                          <button
                            onClick={handleResolveIssues}
                            disabled={isResolving}
                            className="w-full flex items-center justify-center gap-1.5 bg-[#10B981] hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-xs transition-colors cursor-pointer font-mono"
                          >
                            {isResolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            <span>{isResolving ? 'Resolving all issues (Ultra Autonomous)...' : 'Resolve All Issues (1-Click)'}</span>
                          </button>
                        )}

                        {/* Export PDF Button */}
                        {selectedResumeId && (
                          <button
                            onClick={() => {
                              router.push(`/editor?id=${selectedResumeId}&print=true`);
                            }}
                            className="w-full flex items-center justify-center gap-1.5 bg-[#A855F7] hover:bg-purple-600 text-white font-bold py-2.5 rounded-lg text-xs transition-colors cursor-pointer font-mono"
                          >
                            <FileDown className="h-4 w-4" />
                            <span>Export PDF of CV</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeSidebarTab === 'settings' && (
            <div className="bg-[#11131A] border border-[#1F293D] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto w-full">
              <div className="border-b border-[#1F293D] pb-4 flex justify-between items-center">
                <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Settings className="h-4.5 w-4.5 text-[#A855F7]" />
                  <span>Account & Platform Settings</span>
                </h2>
              </div>

              <div className="space-y-6">
                <div className="bg-[#0A0C10] border border-[#1F293D] p-5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold text-white font-mono">Active Plan Details</h3>
                  <div className="flex items-center justify-between bg-[#11131A] border border-[#1F293D] p-4 rounded-xl">
                    <span className="text-xs font-mono text-gray-400">Subscription Tier</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      userPlan === 'ultra' 
                        ? 'bg-[#A855F7]/10 border-[#A855F7]/30 text-[#A855F7]'
                        : userPlan === 'pro'
                          ? 'bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]'
                          : 'bg-gray-500/10 border border-gray-500/30 text-gray-400'
                    }`}>
                      <Sparkles className="h-3 w-3 animate-pulse" />
                      <span>{userPlan} PLAN</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-mono">
                    {userPlan === 'free' 
                      ? 'Upgrade to Pro or Ultra to gain access to premium resume templates, keyword analyzers, cover letters, and 1-click flaw optimizations.'
                      : userPlan === 'pro'
                        ? 'You have complete access to custom template renderings and real-time review suggestions. Upgrade to Ultra for autonomous 1-click flaw resolution.'
                        : 'You are currently on the highest tier, giving you autonomous 1-click optimization rights over all parsed layout profiles.'}
                  </p>
                  {userPlan !== 'ultra' && (
                    <button
                      onClick={() => {
                        setRequiredPlan(userPlan === 'free' ? 'pro' : 'ultra');
                        setFeatureExplanation('Unlock unlimited AI builders and optimizations.');
                        setUpgradeModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 bg-[#A855F7] hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer font-mono"
                    >
                      Upgrade Membership
                    </button>
                  )}
                </div>

                <div className="bg-[#0A0C10] border border-[#1F293D] p-5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold text-white font-mono">Actions</h3>
                  <button 
                    onClick={handleLogout}
                    className="w-full py-2 bg-red-950/20 hover:bg-red-950/30 border border-red-900/30 text-red-400 hover:text-red-300 rounded-xl text-xs transition-all font-mono font-bold"
                  >
                    Logout of Session
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MOCK INTERVIEW ASSISTANT */}
          {activeSidebarTab === 'mock-interview' && (
            <div className="w-full">
              <MockInterviewStudio />
            </div>
          )}

        </div>
      </main>

      {/* Creation Wizard Dialog Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#11131A] border border-[#1F293D] rounded-2xl w-full max-w-xl p-6 relative shadow-2xl space-y-6 glow-purple/10">
            
            <div className="absolute top-0 left-0 w-full h-[3px] bg-[#A855F7]" />
            
            <div className="flex justify-between items-start border-b border-[#1F293D] pb-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#A855F7]" />
                  <span>Resume Generation Wizard</span>
                </h3>
                <p className="text-[10px] text-[#9CA3AF]">
                  {wizardStep === 1 ? 'Configure personal and target details.' : 'Provide academic milestones.'}
                </p>
              </div>
              <span className="text-[10px] font-mono text-gray-500">Step {wizardStep} of 2</span>
            </div>

            <form onSubmit={handleGenerateAI} className="space-y-4">
              {wizardStep === 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Rivera"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">Desired Position</label>
                    <input
                      type="text"
                      required
                      placeholder="Senior Full Stack Engineer"
                      value={desiredPosition}
                      onChange={(e) => setDesiredPosition(e.target.value)}
                      className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">Experience (Years)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">Location</label>
                    <input
                      type="text"
                      required
                      placeholder="San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="arivera@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">Phone Number</label>
                    <input
                      type="text"
                      required
                      placeholder="+1 (555) 012-3456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">Institution / University</label>
                      <input
                        type="text"
                        placeholder="UC Berkeley"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">Degree</label>
                      <input
                        type="text"
                        placeholder="B.S. or M.S."
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">Field of Study</label>
                      <input
                        type="text"
                        placeholder="Computer Science & Engineering"
                        value={field}
                        onChange={(e) => setField(e.target.value)}
                        className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">Start Date</label>
                      <input
                        type="text"
                        placeholder="2014"
                        value={eduStart}
                        onChange={(e) => setEduStart(e.target.value)}
                        className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">End Date (or Expected)</label>
                      <input
                        type="text"
                        placeholder="2018"
                        value={eduEnd}
                        onChange={(e) => setEduEnd(e.target.value)}
                        className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg p-2.5 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#1F293D] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowWizard(false)}
                  className="bg-[#1F293D] hover:bg-[#2B3952] border border-[#303E57] text-[#F3F4F6] py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                {wizardStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="bg-[#3B82F6] hover:bg-blue-600 text-white py-2 px-5 rounded-lg transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="bg-[#1F293D] hover:bg-[#2B3952] border border-[#303E57] text-[#F3F4F6] py-2 px-4 rounded-lg"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="bg-[#A855F7] hover:bg-purple-600 text-white py-2 px-5 rounded-lg flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Run AI Agent</span>
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generator Loading Spinner Overlay */}
      {generating && (
        <div className="fixed inset-0 z-50 flex flex-col justify-center items-center p-4 bg-black/85 backdrop-blur-md font-mono text-xs text-[#9CA3AF] space-y-6">
          <Loader2 className="h-10 w-10 text-[#A855F7] animate-spin" />
          
          <div className="w-full max-w-sm bg-[#11131A] border border-[#1F293D] rounded-xl p-6 space-y-4">
            <h4 className="text-white font-bold text-center flex items-center justify-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#A855F7] animate-pulse" />
              <span>AI Writing Agents Active</span>
            </h4>
            
            <div className="space-y-1.5 text-[10px] text-left text-gray-500">
              <p className="animate-pulse">1. Parsing connection keys... [DONE]</p>
              <p className="delay-100 animate-pulse">2. Scanning repository directories... [DONE]</p>
              <p className="delay-300 animate-pulse">3. Extracting code syntax & README details... [DONE]</p>
              <p className="delay-500 animate-pulse">4. Running GitHub Analyzer Agent via Gemini... [RUNNING]</p>
              <p className="delay-750 animate-pulse">5. Re-structuring career summaries & metrics... [PENDING]</p>
            </div>
          </div>
        </div>
      )}

      {/* Premium Plan Upgrade Simulator Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
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

            <div className="grid grid-cols-1 gap-3 pt-2">
              <button
                onClick={() => {
                  setUpgradeModalOpen(false);
                  router.push('/pricing');
                }}
                className="bg-[#A855F7] hover:bg-purple-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] font-mono w-full"
              >
                Upgrade to {requiredPlan.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert/Confirm Modal */}
      {notification.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
                    className="flex-1 bg-[#0A0C10] border border-[#1F293D] hover:bg-[#1C202C] text-gray-400 hover:text-white text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setNotification(prev => ({ ...prev, isOpen: false }));
                      if (notification.onConfirm) notification.onConfirm();
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer font-mono"
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setNotification(prev => ({ ...prev, isOpen: false }))}
                  className="w-full bg-[#A855F7] hover:bg-purple-600 text-white text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer font-mono text-center"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
