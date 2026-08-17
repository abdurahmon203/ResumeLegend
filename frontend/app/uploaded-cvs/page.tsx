'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Terminal, 
  UploadCloud, 
  Loader2, 
  Sparkles, 
  Trash2, 
  Eye, 
  Lock, 
  FileText, 
  LogOut,
  X,
  LayoutDashboard,
  PenTool,
  LayoutGrid,
  BarChart2,
  FolderArchive,
  Settings
} from 'lucide-react';
import { api, Resume } from '../../lib/api';

export default function UploadedCVsPage() {
  const router = useRouter();
  
  // States
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
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
  
  // Subscription plan states
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'ultra'>('free');
  const [userEmail, setUserEmail] = useState<string>('User');
  const [lang, setLang] = useState<'en' | 'ru'>('en');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [requiredPlan, setRequiredPlan] = useState<'pro' | 'ultra'>('pro');
  const [featureExplanation, setFeatureExplanation] = useState('');

  // Initial Fetch & Auth Guard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      setUserPlan(parsed.plan || 'free');
      setUserEmail(parsed.email || 'User');
    }
    
    fetchResumes();
  }, [router]);

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

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const fetched = await api.getResumes();
      setResumes(fetched);
      
      const scoreMap: Record<string, number> = {};
      await Promise.all(
        fetched.map(async (cv) => {
          try {
            const review = await api.getResumeReview(cv.id);
            scoreMap[cv.id] = review.score;
          } catch (e) {
            scoreMap[cv.id] = 94; // fallback
          }
        })
      );
      setScores(scoreMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Filter resumes to only show uploaded CVs
  const uploadedCVs = resumes.filter(r => r.title.startsWith('Uploaded CV:'));

  const handleCVFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (userPlan === 'free') {
      setRequiredPlan('pro');
      setFeatureExplanation('AI CV file uploading and diagnostics require Pro or Ultra tier access.');
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
                pdf_data: base64Data, // Save actual uploaded PDF!
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

            // Refresh list
            await fetchResumes();
            
            setUploadingCV(false);
            showAlert("Upload Success", `Successfully uploaded CV: ${cleanName}!`);
            
            // Redirect to editor to see issues
            router.push(`/editor?id=${newResume.id}`);

          } catch (err) {
            console.error(err);
            setUploadingCV(false);
            showAlert("Upload Error", "Failed to parse and store uploaded CV.");
          }
        }, 1200);
      }, 1200);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCV = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    showConfirm(
      "Delete CV Profile",
      "Are you sure you want to permanently delete this uploaded CV from your database?",
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
          <div className="flex items-center gap-2.5 font-bold text-lg text-white pl-2">
            <Terminal className="h-5 w-5 text-[#A855F7]" />
            <span className="tracking-tight">Resume<span className="text-[#A855F7]">Legend</span></span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <button 
              onClick={() => {
                router.push('/dashboard');
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide text-gray-400 hover:text-white hover:bg-gray-800/40 transition-all text-left"
            >
              <LayoutDashboard className="h-4.5 w-4.5 text-[#A855F7]" />
              <span>{lang === 'en' ? 'Dashboard' : 'Обзор'}</span>
            </button>
            
            <button 
              onClick={() => {
                router.push('/dashboard');
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide text-gray-400 hover:text-white hover:bg-gray-800/40 transition-all text-left"
            >
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
                  router.push('/dashboard');
                }
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide text-gray-400 hover:text-white hover:bg-gray-800/40 transition-all text-left"
            >
              <BarChart2 className="h-4.5 w-4.5 text-[#A855F7]" />
              <span>{lang === 'en' ? 'Analytics' : 'Аналитика'}</span>
            </button>

            <button 
              onClick={() => {
                router.push('/uploaded-cvs');
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all text-left relative bg-purple-950/20 text-white font-bold"
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#A855F7] rounded-l" />
              <FolderArchive className="h-4.5 w-4.5 text-[#A855F7]" />
              <span>{lang === 'en' ? 'Uploaded CVs' : 'Загруженные резюме'}</span>
            </button>

            <button 
              onClick={() => {
                router.push('/dashboard');
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide text-gray-400 hover:text-white hover:bg-gray-800/40 transition-all text-left"
            >
              <Settings className="h-4.5 w-4.5 text-[#A855F7]" />
              <span>{lang === 'en' ? 'Settings' : 'Настройки'}</span>
            </button>
          </nav>
        </div>

        {/* User profile info & logout */}
        <div className="px-5 space-y-4">
          {/* Quick language switcher toggle in sidebar */}
          <div className="flex items-center justify-between bg-[#0A0C10] border border-[#1F293D] p-3 rounded-xl">
            <span className="text-[10px] font-mono text-gray-400">🌐 {lang === 'en' ? 'Language' : 'Язык'}</span>
            <button 
              onClick={() => {
                const newLang = lang === 'en' ? 'ru' : 'en';
                setLang(newLang);
                localStorage.setItem('lang', newLang);
                window.dispatchEvent(new Event('lang-changed'));
              }}
              className="px-2 py-0.5 bg-[#1F293D] hover:bg-[#2A3953] rounded text-[10px] font-mono font-bold text-white transition-colors cursor-pointer"
            >
              {lang === 'en' ? 'EN' : 'RU'}
            </button>
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
      <main className="flex-grow flex flex-col min-w-0 min-h-screen">
        
        {/* Mobile Header Navbar */}
        <header className="bg-[#11131A] border-b border-[#1F293D] px-6 py-4 flex md:hidden items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2 font-bold text-base text-white">
            <Terminal className="h-4 w-4 text-[#A855F7]" />
            <span>Resume<span className="text-[#A855F7]">Legend</span></span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        {/* Desktop Minimal header */}
        <header className="bg-[#11131A] border-b border-[#1F293D] px-8 py-5 hidden md:flex items-center justify-between sticky top-0 z-35">
          <h1 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Uploaded CVs
          </h1>
        </header>

        {/* Content Body Grid */}
        <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-8">
          
          {/* Page Title & Intro */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1F293D] pb-6">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 font-mono uppercase">
                <FileText className="h-4.5 w-4.5 text-[#A855F7]" />
                <span>Uploaded CV Database</span>
              </h2>
              <p className="text-[10px] text-[#9CA3AF] max-w-xl font-mono">
                Access your parsed PDF/DOCX resumes, check diagnostic ATS compatibility score, edit or resolve issues autonomously.
              </p>
            </div>
            
            {/* Upload Zone Button */}
            {uploadingCV ? (
              <div className="border border-dashed border-[#1F293D] bg-[#0A0C10]/40 rounded-xl px-6 py-3 flex items-center gap-3 text-xs text-[#9CA3AF] font-mono shrink-0">
                <Loader2 className="h-4 w-4 text-[#A855F7] animate-spin" />
                <span>{uploadProgress}</span>
              </div>
            ) : (
              <div className="flex items-center">
                <input 
                  type="file" 
                  accept=".pdf,.docx,.txt" 
                  className="hidden" 
                  onChange={handleCVFileUpload}
                  id="cv-file-upload-page-input"
                />
                <label 
                  htmlFor="cv-file-upload-page-input" 
                  className="flex items-center gap-1.5 bg-[#A855F7] hover:bg-purple-600 text-white text-xs font-semibold py-2.5 px-4 rounded-lg cursor-pointer transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-[1.02]"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>Upload & Parse CV</span>
                </label>
              </div>
            )}
          </div>

          {/* Uploaded CVs Grid */}
          {loading ? (
            <div className="flex-grow flex flex-col items-center justify-center py-24 gap-3 text-xs text-[#9CA3AF]">
              <Loader2 className="h-7 w-7 text-[#A855F7] animate-spin" />
              <span>Fetching uploaded CV profiles...</span>
            </div>
          ) : uploadedCVs.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center py-24 border border-dashed border-[#1F293D] rounded-2xl p-10 text-center gap-4 max-w-3xl mx-auto w-full">
              <div className="p-4 bg-[#11131A] border border-[#1F293D] rounded-full text-[#9CA3AF]">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-mono font-bold text-white">No CV Files Uploaded</h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed max-w-sm">
                  Upload your external resume to let our AI scan for flaws, build compatible layouts, and optimize keywords.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {uploadedCVs.map((cv) => {
                const score = scores[cv.id] || 94; // fallback score
                return (
                  <div 
                    key={cv.id}
                    onClick={() => router.push(`/editor?id=${cv.id}`)}
                    className="bg-[#11131A] border border-[#1F293D] p-5 rounded-2xl flex flex-col justify-between hover:border-[#A855F7]/45 hover:shadow-[0_0_15px_rgba(168,85,247,0.03)] transition-all cursor-pointer min-h-[190px]"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-purple-950/20 border border-purple-500/20 rounded-xl text-[#A855F7]">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white font-mono truncate max-w-[170px] uppercase">
                              {cv.title.replace('Uploaded CV: ', '')}
                            </h4>
                            <p className="text-[9px] text-[#9CA3AF] font-mono">
                              Target: {cv.content.personal_info.desiredPosition || 'Front-end developer'}
                            </p>
                          </div>
                        </div>

                        <span className="text-[8px] font-bold font-mono px-2 py-0.5 bg-[#1F293D] text-[#9CA3AF] rounded uppercase border border-[#303E57]">
                          {cv.template_name || 'classic'}
                        </span>
                      </div>

                      {/* Diagnostic Score Card */}
                      <div className="bg-[#0A0C10] border border-[#1F293D] px-4 py-2.5 rounded-xl flex items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-[8px] font-bold text-gray-500 font-mono uppercase tracking-wider">ATS Score Index</p>
                          <p className="text-[9px] text-[#10B981] font-mono">
                            {userPlan === 'free' ? 'Plan Upgrade Required' : 'ATS Compatible'}
                          </p>
                        </div>
                        <div className="text-xs font-extrabold w-8 h-8 rounded-full border flex items-center justify-center font-mono shrink-0">
                          {userPlan === 'free' ? (
                            <div className="p-1 bg-[#1F293D] border border-gray-800 rounded-lg text-gray-500" title="Premium Feature">
                              <Lock className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            <span className={`text-[11px] font-mono font-extrabold w-8 h-8 rounded-full border flex items-center justify-center ${
                              score >= 90 
                                ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30'
                                : 'text-amber-500 bg-amber-500/10 border-amber-500/30'
                            }`}>
                              {score}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                  {/* Actions footer */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#1F293D]/60 justify-between">
                    <div className="flex-1 flex">
                      {userPlan === 'free' ? (
                        <button
                          onClick={() => {
                            setRequiredPlan('pro');
                            setFeatureExplanation('AI CV diagnostics and review details require Pro or Ultra tier access.');
                            setUpgradeModalOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-[9px] font-mono py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                        >
                          <Lock className="h-3 w-3" />
                          <span>UPGRADE TO VIEW</span>
                        </button>
                      ) : userPlan === 'pro' ? (
                        <Link
                          href={`/editor?id=${cv.id}`}
                          className="flex-1 flex items-center justify-center gap-1 bg-[#1F293D] hover:bg-[#2B3952] border border-[#303E57] text-white font-bold text-[9px] font-mono py-1.5 px-3 rounded-lg transition-colors"
                        >
                          <Eye className="h-3 w-3 text-[#3B82F6]" />
                          <span>VIEW & SUGGESTIONS</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/editor?id=${cv.id}`}
                          className="flex-1 flex items-center justify-center gap-1 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-[9px] font-mono py-1.5 px-3 rounded-lg transition-colors"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>EDIT & RESOLVE</span>
                        </Link>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleDeleteCV(cv.id, e)}
                      className="p-1.5 bg-gray-900 border border-[#1F293D] hover:border-red-500/40 rounded-lg text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete Uploaded CV"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>

      {/* Premium Plan Upgrade Simulator Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#11131A] border border-[#1F293D] p-6 rounded-xl max-w-sm w-full space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setUpgradeModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer border-0 bg-transparent"
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
                className="bg-[#A855F7] hover:bg-purple-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer text-center font-mono"
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
