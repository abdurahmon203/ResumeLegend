'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  Plus, 
  Eye, 
  Sparkles, 
  LogOut,
  X,
  LayoutDashboard,
  PenTool,
  LayoutGrid,
  BarChart2,
  FolderArchive,
  Settings,
  BrainCircuit
} from 'lucide-react';
import { api } from '../../lib/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ats' | 'creative' | 'executive'>('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'ultra'>('free');
  const [userEmail, setUserEmail] = useState<string>('User');
  const [lang, setLang] = useState<'en' | 'ru'>('en');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [requiredPlan, setRequiredPlan] = useState<'pro' | 'ultra'>('pro');
  const [featureExplanation, setFeatureExplanation] = useState('');

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

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserPlan(user.subscription_plan || 'free');
        setUserEmail(user.email || 'User');
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

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

  const templates = [
    {
      name: 'Legend Developer',
      desc: 'Ultra-high density information architecture for senior engineers.',
      tag: 'MOST POPULAR',
      command: 'system.load_template("Legend Developer")',
      categories: ['all', 'ats']
    },
    {
      name: 'Minimal Pro',
      desc: 'Clean, typography-driven layout for high-level clarity.',
      tag: 'ATS-FRIENDLY',
      command: 'system.load_template("Minimal Pro")',
      categories: ['all', 'ats', 'executive']
    },
    {
      name: 'Dark Tech',
      desc: 'Cyber-aesthetic shell for cybersecurity & backend specialists.',
      tag: 'USED BY 4K+ DEVS',
      command: 'system.load_template("Dark Tech")',
      categories: ['all', 'creative']
    },
    {
      name: 'Modern Engineer',
      desc: 'The gold standard for full-stack and frontend portfolios.',
      tag: 'CLEAN & DYNAMIC',
      command: 'system.load_template("Modern Engineer")',
      categories: ['all', 'creative', 'executive']
    }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.categories.includes(selectedCategory));

  if (isLoggedIn) {
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
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all text-left relative bg-purple-950/20 text-white font-bold"
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#A855F7] rounded-l" />
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
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide text-gray-400 hover:text-white hover:bg-gray-800/40 transition-all text-left"
              >
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
              {lang === 'en' ? 'Templates Catalog' : 'Каталог Шаблонов'}
            </h1>
          </header>

          {/* Content Body Grid */}
          <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-8">
            
            {/* Title & Filter Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1F293D] pb-6">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 font-mono uppercase">
                  <LayoutGrid className="h-4.5 w-4.5 text-[#A855F7]" />
                  <span>{lang === 'en' ? 'Elite Architectural Layouts' : 'Профессиональные Дизайны Резюме'}</span>
                </h2>
                <p className="text-[10px] text-[#9CA3AF] max-w-xl font-mono">
                  {lang === 'en' 
                    ? 'Select premium layout grids styled for technical roles, optimized for recruiter eyes and automated keywords scanner algorithms.'
                    : 'Выберите премиум-шаблоны для технических специалистов, оптимизированные для рекрутеров и алгоритмов сканирования ключевых слов.'}
                </p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-2 p-1 bg-[#11131A] border border-[#1F293D] rounded-lg text-[9px] font-mono self-start md:self-end">
                {(['all', 'ats', 'creative', 'executive'] as const).map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)} 
                    className={`px-2.5 py-1 rounded transition-all uppercase font-bold ${
                      selectedCategory === cat 
                        ? 'bg-[#A855F7] text-white' 
                        : 'text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    {cat === 'all' 
                      ? (lang === 'en' ? 'All Templates' : 'Все шаблоны') 
                      : cat === 'ats' 
                        ? (lang === 'en' ? 'ATS-friendly' : 'ATS-совместимые') 
                        : cat === 'creative' 
                          ? (lang === 'en' ? 'Creative' : 'Креативные') 
                          : (lang === 'en' ? 'Executive' : 'Представительские')}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Layout of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredTemplates.map((tpl, idx) => (
                <div 
                  key={idx}
                  className="bg-[#11131A] border border-[#1F293D] hover:border-[#A855F7]/50 rounded-xl p-5 flex flex-col justify-between gap-6 transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono bg-purple-950/40 border border-purple-500/20 text-[#A855F7] px-2 py-0.5 rounded uppercase font-bold">
                        {tpl.tag}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-white group-hover:text-[#A855F7] transition-colors font-mono uppercase">
                        {tpl.name}
                      </h3>
                      <p className="text-[11px] text-[#9CA3AF] leading-relaxed font-sans">{tpl.desc}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-[#0A0C10] border border-[#1F293D] p-2.5 rounded font-mono text-[9px] text-[#A855F7] leading-none select-all truncate">
                      {tpl.command}
                    </div>
                    <button 
                      onClick={() => router.push('/dashboard')}
                      className="w-full flex items-center justify-center gap-1 bg-[#1F293D] hover:bg-[#253248] border border-[#303E57] hover:border-[#A855F7]/30 text-white py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors font-mono cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Use Template</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Advisor Card */}
            <div className="bg-gradient-to-r from-purple-950/10 via-[#11131A] to-blue-950/10 border border-[#1F293D] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 mt-6">
              <div className="flex items-start gap-4">
                <div className="bg-[#A855F7]/10 p-3 rounded-xl border border-[#A855F7]/20 text-[#A855F7] shrink-0">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Need a style recommendations?</h4>
                  <p className="text-[11px] text-[#9CA3AF] max-w-xl">
                    Our AI scan engine reviews your project stack lists and matches your profile formatting with modern layouts designed for maximum recruiter engagement.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/dashboard')}
                className="bg-[#A855F7] hover:bg-purple-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shrink-0 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.2)] font-mono"
              >
                Scan & Recommend
              </button>
            </div>

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
                  className="bg-[#0A0C10] border border-[#1F293D] hover:bg-[#1C202C] text-gray-400 hover:text-white text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer font-mono"
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

        {/* Custom Alert Modal */}
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

              <div className="flex pt-2">
                <button
                  onClick={() => setNotification(prev => ({ ...prev, isOpen: false }))}
                  className="w-full bg-[#A855F7] hover:bg-purple-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer font-mono text-center"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Logged-out Landing Page style
  return (
    <div className="min-h-screen flex flex-col relative cyber-grid bg-[#0A0C10]">
      
      {/* Shared Navbar */}
      <Navbar activeSection="templates" />

      {/* Main Content */}
      <main className="flex-grow py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-3 py-1 rounded-full text-xs font-semibold text-[#3B82F6] font-mono">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Templates Catalog</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Elite Architectural Layouts
              </h1>
              <p className="text-sm text-[#9CA3AF] max-w-xl">
                Choose from terminal-grade resume templates designed specifically for technical sovereignty. Optimized for both hiring managers and ATS filters.
              </p>
            </div>
            
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-[#11131A] border border-[#1F293D] rounded-lg text-xs font-mono self-start md:self-end">
              {(['all', 'ats', 'creative', 'executive'] as const).map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)} 
                  className={`px-3 py-1.5 rounded-md transition-all uppercase ${
                    selectedCategory === cat 
                      ? 'bg-[#3B82F6] text-white' 
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All Templates' : cat}
                </button>
              ))}
            </div>
          </div>
          
          {/* Grid Layout of Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTemplates.map((tpl, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#11131A] border border-[#1F293D] hover:border-[#3B82F6]/50 rounded-xl p-5 flex flex-col justify-between gap-6 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-mono bg-blue-950/40 border border-blue-500/20 text-[#3B82F6] px-2 py-0.5 rounded">
                      {tpl.tag}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white group-hover:text-[#3B82F6] transition-colors">
                      {tpl.name}
                    </h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">{tpl.desc}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-[#0A0C10] border border-[#1F293D] p-2.5 rounded font-mono text-[9px] text-[#3B82F6] leading-none">
                    {tpl.command}
                  </div>
                  <Link href={isLoggedIn ? "/dashboard" : "/signup"} className="flex items-center justify-center gap-1 bg-[#11131A] border border-[#1F293D] hover:bg-[#1C202C] text-white py-1.5 rounded text-xs font-semibold transition-colors">
                    <Eye className="h-3.5 w-3.5" />
                    <span>Preview Template</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* AI Selection Advisor */}
          <div className="bg-gradient-to-r from-purple-950/20 via-[#11131A] to-blue-950/20 border border-[#1F293D] p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6 mt-12">
            <div className="flex items-start gap-4">
              <div className="bg-[#A855F7]/10 p-3 rounded-lg border border-[#A855F7]/20 text-[#A855F7] shrink-0">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Unsure which template to choose?</h4>
                <p className="text-xs text-[#9CA3AF] max-w-xl">
                  Our AI analysis engine can scan your existing profile or resume details and suggest the layouts that maximize recruiter impact for your specific target firms.
                </p>
              </div>
            </div>
            <Link href={isLoggedIn ? "/dashboard" : "/signup"} className="bg-[#A855F7] hover:bg-purple-600 text-white font-semibold text-xs px-5 py-2.5 rounded-md shrink-0 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              Start AI Analysis
            </Link>
          </div>

        </div>
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Custom Alert Modal */}
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

            <div className="flex pt-2">
              <button
                onClick={() => setNotification(prev => ({ ...prev, isOpen: false }))}
                className="w-full bg-[#A855F7] hover:bg-purple-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer font-mono text-center"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
