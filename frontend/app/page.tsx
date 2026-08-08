'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  FileDown, 
  Zap, 
  Sparkles,
  Layout,
  DollarSign
} from 'lucide-react';
import { Github } from '@/components/icons';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lang, setLang] = useState<'en' | 'ru'>('en');

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    const saved = localStorage.getItem('lang');
    if (saved === 'ru' || saved === 'en') {
      setLang(saved);
    }
  }, []);

  useEffect(() => {
    const updateLang = () => {
      const saved = localStorage.getItem('lang');
      if (saved === 'ru' || saved === 'en') {
        setLang(saved);
      }
    };
    window.addEventListener('lang-changed', updateLang);
    return () => window.removeEventListener('lang-changed', updateLang);
  }, []);

  const t = {
    en: {
      engineered: 'Engineered for Developers',
      heroTitle1: 'From Commit History to',
      heroTitle2: 'Career Milestones',
      heroDesc: "We've automated the most painful part of the job search: documenting your technical impact. ResumeLegend translates your repos into high-signal professional narratives.",
      buildBtn: 'Build My Resume Now',
      seeHowBtn: 'See How It Works',
      catalogTag: 'Templates Catalog',
      catalogTitle: 'Browse Design Layouts',
      catalogDesc: '4 terminal-grade templates',
      pricingTag: 'Pricing Models',
      pricingTitle: 'See Subscription Plans',
      pricingDesc: 'Free, Pro & Ultra plans',
      howItWorks: 'How it Works',
      howItWorksDesc: 'No manual drafting required. Our multi-agent LLM framework scans your code contributions and generates enterprise-grade credentials.',
      step01Title: 'Connect GitHub',
      step01Desc: 'Grant secure, read-only access to your public or private repositories. Our AI immediately begins mapping your tech stack, contribution frequency, and project complexity.',
      step02Title: 'AI Extraction',
      step02Desc: "Our proprietary LLM parses your PR descriptions, commit messages, and documentation. It doesn't just list tasks—it quantifies impact, identifying the specific metrics and scale of your engineering work.",
      step03Title: 'AI Scoring & Editing',
      step03Desc: 'Fine-tune your resume with real-time feedback. Our AI scores your resume against specific Job Descriptions (JDs), highlighting skill gaps and suggesting wording changes to bypass ATS filters effortlessly.',
      step04Title: 'Precision Export',
      step04Desc: 'Choose from developer-centric templates designed for maximum readability. Export to PDF, Word, or raw JSON for your personal portfolio site. No branding, no fluff—just raw expertise.',
      downloadResume: 'Download Resume',
      aiEngineOnline: 'AI Mapping Engine Online',
      impactScore: 'IMPACT SCORE',
      inputCommit: '// INPUT COMMIT',
      outputDesc: '// OUTPUT PROFESSIONAL DESCRIPTION',
      atsOptimized: 'ATS SCORE: OPTIMIZED'
    },
    ru: {
      engineered: 'Создано для Разработчиков',
      heroTitle1: 'От истории коммитов до',
      heroTitle2: 'Профессиональных Резюме',
      heroDesc: 'Мы автоматизировали самую неприятную часть поиска работы: документирование технического опыта. ResumeLegend превращает ваши репозитории в сильные профессиональные описания.',
      buildBtn: 'Создать мое резюме сейчас',
      seeHowBtn: 'Как это работает',
      catalogTag: 'Каталог Шаблонов',
      catalogTitle: 'Выбрать дизайн резюме',
      catalogDesc: '4 профессиональных шаблона',
      pricingTag: 'Ценовые Модели',
      pricingTitle: 'Тарифные планы подписки',
      pricingDesc: 'Тарифы Бесплатный, Про и Ультра',
      howItWorks: 'Как это работает',
      howItWorksDesc: 'Никакого ручного написания. Наша мультиагентная система ИИ сканирует ваш код и генерирует профессиональное резюме.',
      step01Title: 'Подключите GitHub',
      step01Desc: 'Предоставьте безопасный доступ только для чтения к вашим репозиториям. ИИ мгновенно определит стек технологий, частоту коммитов и сложность проектов.',
      step02Title: 'Извлечение ИИ',
      step02Desc: 'Наша нейросеть анализирует описания PR, коммиты и документацию. Она не просто перечисляет задачи — она оцифровывает и оценивает вклад в цифрах.',
      step03Title: 'ИИ Оценка и Редактор',
      step03Desc: 'Улучшайте резюме с помощью мгновенных советов. Наш ИИ оценивает резюме под конкретные вакансии, указывая на пробелы и помогая обойти ATS-фильтры.',
      step04Title: 'Точный Экспорт',
      step04Desc: 'Выберите шаблоны, созданные для максимальной читаемости разработчиков. Экспортируйте в PDF, Word или JSON. Никакой лишней воды — только ваш опыт.',
      downloadResume: 'Скачать Резюме',
      aiEngineOnline: 'Движок анализа ИИ активен',
      impactScore: 'ОЦЕНКА ВКЛАДА',
      inputCommit: '// ИСХОДНЫЙ КОММИТ',
      outputDesc: '// ИТОГОВОЕ ПРОФЕССИОНАЛЬНОЕ ОПИСАНИЕ',
      atsOptimized: 'ATS ОЦЕНКА: ОПТИМИЗИРОВАНО'
    }
  }[lang];

  const steps = [
    {
      num: '01',
      title: t.step01Title,
      description: t.step01Desc,
      visual: (
        <div className="bg-[#11131A] border border-[#1F293D] rounded-lg p-4 font-mono text-xs text-[#9CA3AF] space-y-2 glow-purple/10">
          <div className="flex items-center gap-2 text-[#A855F7] border-b border-[#1F293D] pb-2 mb-2">
            <Terminal className="h-3.5 w-3.5" />
            <span>github_sync_daemon.sh</span>
          </div>
          <p><span className="text-[#10B981]">&gt;</span> scanning_repo: <span className="text-[#F3F4F6]">"resume-legend-core"</span>... [OK]</p>
          <p><span className="text-[#10B981]">&gt;</span> detecting_stacks: <span className="text-[#3B82F6]">["React", "Go", "AWS", "gRPC"]</span></p>
          <p><span className="text-[#10B981]">&gt;</span> parsing_commits: <span className="text-[#A855F7]">148 commits found</span></p>
          <div className="flex items-center gap-1.5 mt-2 bg-purple-950/20 border border-purple-500/20 p-2 rounded text-[10px] text-[#A855F7]">
            <Zap className="h-3 w-3 animate-pulse" />
            <span>{t.aiEngineOnline}</span>
          </div>
        </div>
      )
    },
    {
      num: '02',
      title: t.step02Title,
      description: t.step02Desc,
      visual: (
        <div className="bg-[#11131A] border border-[#1F293D] rounded-lg p-4 font-mono text-xs text-[#9CA3AF] space-y-2.5">
          <div className="flex items-center gap-2 text-[#3B82F6] border-b border-[#1F293D] pb-2 mb-2">
            <Cpu className="h-3.5 w-3.5" />
            <span>ai_impact_translator.py</span>
          </div>
          <p className="text-[10px] text-gray-500">{t.inputCommit}</p>
          <p className="bg-[#0A0C10] p-1.5 rounded border border-[#1F293D] text-[10px] italic text-[#F3F4F6]">
            "Fixed race condition in auth middleware"
          </p>
          <p className="text-[10px] text-gray-500">{t.outputDesc}</p>
          <p className="bg-blue-950/20 border border-blue-500/20 p-2 rounded text-[10px] text-[#3B82F6] leading-relaxed">
            "Optimized authentication layer by eliminating concurrent race conditions, resulting in a 15% reduction in latency for high-traffic sessions."
          </p>
          <p className="text-[10px] text-right text-[#10B981]">{t.impactScore}: 88/100</p>
        </div>
      )
    },
    {
      num: '03',
      title: t.step03Title,
      description: t.step03Desc,
      visual: (
        <div className="bg-[#11131A] border border-[#1F293D] rounded-lg p-4 font-mono text-xs text-[#9CA3AF] space-y-3">
          <div className="flex justify-between items-center border-b border-[#1F293D] pb-2">
            <span className="text-[#10B981] font-bold">{t.atsOptimized}</span>
            <span className="text-xl font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">82</span>
          </div>
          <div className="space-y-1.5 text-[10px]">
            <div className="flex items-center gap-1.5 text-[#10B981]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Extracted 12 keywords matching Job Description</span>
            </div>
            <div className="flex items-start gap-1.5 text-amber-500">
              <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>Recommended: Add 'Kubernetes' or 'AWS ECS' to skills to match Infrastructure needs.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      num: '04',
      title: t.step04Title,
      description: t.step04Desc,
      visual: (
        <div className="bg-[#11131A] border border-[#1F293D] rounded-lg p-4 flex flex-col justify-center items-center gap-3">
          <div className="grid grid-cols-3 gap-2 w-full text-center font-mono text-[10px]">
            <div className="bg-[#0A0C10] border border-[#1F293D] hover:border-[#A855F7] p-2 rounded cursor-pointer transition-colors">
              <span className="text-red-500 font-bold block">PDF</span>
              <span className="text-gray-500">A4 Render</span>
            </div>
            <div className="bg-[#0A0C10] border border-[#1F293D] hover:border-[#3B82F6] p-2 rounded cursor-pointer transition-colors">
              <span className="text-blue-500 font-bold block">DOCX</span>
              <span className="text-gray-500">Word Doc</span>
            </div>
            <div className="bg-[#0A0C10] border border-[#1F293D] hover:border-[#10B981] p-2 rounded cursor-pointer transition-colors">
              <span className="text-emerald-500 font-bold block">JSON</span>
              <span className="text-gray-500">Raw Schema</span>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-1.5 bg-[#A855F7] text-white py-1.5 px-3 rounded text-xs font-medium hover:bg-purple-600 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <FileDown className="h-3.5 w-3.5" />
            <span>{t.downloadResume}</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 flex flex-col relative cyber-grid bg-[#0A0C10]">
      
      {/* Reusable Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 px-6 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-[#A855F7]/10 border border-[#A855F7]/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#A855F7] font-mono tracking-wide"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>{t.engineered}</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
            >
              {t.heroTitle1} <br/>
              <span className="bg-gradient-to-r from-[#A855F7] via-[#3B82F6] to-[#10B981] bg-clip-text text-transparent">
                {t.heroTitle2}
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-[#9CA3AF] max-w-2xl mx-auto leading-relaxed"
            >
              {t.heroDesc}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link href={isLoggedIn ? "/dashboard" : "/signup"} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#A855F7] hover:bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg text-sm transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                <Github className="h-4 w-4" />
                <span>{t.buildBtn}</span>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#11131A] hover:bg-[#1C202C] text-white border border-[#1F293D] font-semibold py-3 px-8 rounded-lg text-sm transition-all">
                <span>{t.seeHowBtn}</span>
              </a>
            </motion.div>
          </div>
          
          {/* Subtle bottom gradients */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[300px] bg-gradient-to-t from-purple-500/5 to-transparent blur-3xl rounded-full pointer-events-none" />
        </section>

        {/* Feature Redirect CTAs (Short Teaser) */}
        <section className="py-12 border-t border-[#1F293D] px-6 bg-[#07080B]/20">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link 
              href="/templates" 
              className="bg-[#11131A] border border-[#1F293D] hover:border-[#3B82F6] p-6 rounded-xl flex items-center justify-between group transition-all"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#3B82F6] font-bold uppercase tracking-wider block">{t.catalogTag}</span>
                <span className="text-sm font-bold text-white group-hover:text-[#3B82F6] transition-colors">{t.catalogTitle}</span>
                <p className="text-xs text-[#9CA3AF]">{t.catalogDesc}</p>
              </div>
              <Layout className="h-8 w-8 text-gray-700 group-hover:text-[#3B82F6] transition-colors shrink-0" />
            </Link>
            <Link 
              href="/pricing" 
              className="bg-[#11131A] border border-[#1F293D] hover:border-[#10B981] p-6 rounded-xl flex items-center justify-between group transition-all"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#10B981] font-bold uppercase tracking-wider block">{t.pricingTag}</span>
                <span className="text-sm font-bold text-white group-hover:text-[#10B981] transition-colors">{t.pricingTitle}</span>
                <p className="text-xs text-[#9CA3AF]">{t.pricingDesc}</p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-700 group-hover:text-[#10B981] transition-colors shrink-0" />
            </Link>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 border-t border-[#1F293D] bg-[#07080B]/50 px-6">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{t.howItWorks}</h2>
              <p className="text-sm text-[#9CA3AF] max-w-xl mx-auto">
                {t.howItWorksDesc}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#11131A] border border-[#1F293D] hover:border-[#1F293D]/80 p-6 rounded-xl flex flex-col justify-between gap-6 relative overflow-hidden group transition-all"
                >
                  <div className="absolute top-0 right-0 p-4 font-mono text-3xl font-extrabold text-[#1F293D] group-hover:text-[#A855F7]/10 transition-colors">
                    {step.num}
                  </div>
                  
                  <div className="space-y-3 relative z-10">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A855F7] block">
                      STEP {step.num}
                    </span>
                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">{step.description}</p>
                  </div>
                  
                  <div className="relative mt-2">
                    {step.visual}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Reusable Footer */}
      <Footer />
      
    </div>
  );
}
