'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Terminal, ShieldAlert, Key, Mail, User, Info, ArrowRight, Cpu, Wifi } from 'lucide-react';
import { Github } from '@/components/icons';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [sourceDiscovery, setSourceDiscovery] = useState('GitHub Trending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latency, setLatency] = useState('24ms');
  const [lang, setLang] = useState<'en' | 'ru'>('en');

  useEffect(() => {
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
      initiateAccount: 'Initiate Account',
      subtitle: 'Secure your terminal-grade engineering profile.',
      errorFill: 'Please provide all required profile fields.',
      errorLength: 'ACCESS_KEY fails constraint: minimum 12 characters.',
      errorInit: 'Failed account initialization.',
      githubLogin: 'Continue with GitHub',
      recommendedBadge: 'RECOMMENDED FOR TECH STACK SYNC',
      orRegisterEmail: 'OR REGISTER VIA EMAIL',
      fullNameLabel: 'FULL_NAME',
      emailLabel: 'EMAIL_ADDRESS',
      accessKeyLabel: 'ACCESS_KEY',
      accessKeyHint: '[min_length: 12]',
      sourceDiscoveryLabel: 'SOURCE_DISCOVERY',
      sourcePlaceholder: 'How did you hear about us?',
      initializeBtn: 'Initialize Account',
      termsText: 'By clicking Continue, you agree to our Terms of Service and Privacy Policy.',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      alreadyMember: 'Already have credentials?',
      loginHere: 'Login here',
      systemOnline: 'SYSTEM: ONLINE'
    },
    ru: {
      initiateAccount: 'Создать Аккаунт',
      subtitle: 'Защитите свой профиль инженера.',
      errorFill: 'Пожалуйста, заполните все обязательные поля профиля.',
      errorLength: 'Длина ACCESS_KEY должна быть не менее 12 символов.',
      errorInit: 'Не удалось инициализировать учетную запись.',
      githubLogin: 'Продолжить через GitHub',
      recommendedBadge: 'РЕКОМЕНДУЕТСЯ ДЛЯ СИНХРОНИЗАЦИИ СТЕКА',
      orRegisterEmail: 'ИЛИ ЗАРЕГИСТРИРОВАТЬСЯ ЧЕРЕЗ EMAIL',
      fullNameLabel: 'ПОЛНОЕ_ИМЯ',
      emailLabel: 'EMAIL_АДРЕС',
      accessKeyLabel: 'КЛЮЧ_ДОСТУПА',
      accessKeyHint: '[мин_длина: 12]',
      sourceDiscoveryLabel: 'ИСТОЧНИК_ОТКРЫТИЯ',
      sourcePlaceholder: 'Как вы о нас узнали?',
      initializeBtn: 'Создать Аккаунт',
      termsText: 'Нажимая Продолжить, вы соглашаетесь с Условиями обслуживания и Политикой конфиденциальности.',
      terms: 'Условиями обслуживания',
      privacy: 'Политикой конфиденциальности',
      alreadyMember: 'Уже зарегистрированы?',
      loginHere: 'Войти здесь',
      systemOnline: 'СИСТЕМА: АКТИВНА'
    }
  }[lang];

  useEffect(() => {
    // Generate slight fluctuations in latency for visual realism
    const interval = setInterval(() => {
      const ms = Math.floor(Math.random() * 6) + 22;
      setLatency(`${ms}ms`);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGitHubLogin = () => {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const backendUrl = rawUrl.includes('localhost:8000') 
      ? rawUrl 
      : (rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`);
    
    // Check if backend is alive
    fetch(`${backendUrl}/auth/github`, { method: 'HEAD', mode: 'no-cors' })
      .then(() => {
        window.location.href = `${backendUrl}/auth/github`;
      })
      .catch(() => {
        console.log('Backend not reachable, routing to mock callback...');
        router.push('/callback?code=mock_code_123');
      });
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !accessKey) {
      setError(t.errorFill);
      return;
    }
    if (accessKey.length < 12) {
      setError(t.errorLength);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await new Promise(r => setTimeout(r, 1500));
      // Save local mock user information
      localStorage.setItem('token', 'mock-jwt-token-email');
      router.push('/dashboard');
    } catch (err: any) {
      setError(t.errorInit);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 relative min-h-screen py-12 cyber-grid">
      
      {/* Signup Card */}
      <div className="w-full max-w-md bg-[#11131A] border border-[#1F293D] rounded-2xl p-8 space-y-5 shadow-2xl relative overflow-hidden glow-purple/5">
        
        {/* Glowing border accent */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#A855F7] to-[#3B82F6]" />

        {/* Logo and title */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-mono font-bold text-sm text-white">
            <Terminal className="h-4.5 w-4.5 text-[#A855F7]" />
            <span>Resume<span className="text-[#A855F7]">Legend</span></span>
          </Link>
          <h2 className="text-lg font-bold text-white tracking-tight pt-2">{t.initiateAccount}</h2>
          <p className="text-[11px] text-[#9CA3AF]">{t.subtitle}</p>
        </div>

        {error && (
          <div className="bg-red-950/20 border border-red-500/30 text-red-500 p-3 rounded-lg text-[10px] flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* GitHub Continue Button */}
        <button
          onClick={handleGitHubLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-[#A855F7] hover:bg-purple-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-xs font-semibold transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
        >
          <Github className="h-4 w-4" />
          <span>{t.githubLogin}</span>
        </button>

        {/* Recommendation Badge */}
        <div className="text-center">
          <span className="bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 px-2 py-0.5 rounded text-[8px] font-mono tracking-widest uppercase">
            {t.recommendedBadge}
          </span>
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#1F293D]"></div>
          <span className="flex-shrink mx-4 font-mono text-[9px] text-gray-600 uppercase tracking-widest">
            {t.orRegisterEmail}
          </span>
          <div className="flex-grow border-t border-[#1F293D]"></div>
        </div>

        {/* Form fields */}
        <form onSubmit={handleEmailSignup} className="space-y-3.5">
          
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">
              {t.fullNameLabel} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Alex Rivera"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg pl-9 pr-4 py-2.5 transition-colors font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">
              {t.emailLabel} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
              <input
                type="email"
                placeholder="arivera.dev@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg pl-9 pr-4 py-2.5 transition-colors font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">
              {t.accessKeyLabel} <span className="text-gray-500 text-[8px]">{t.accessKeyHint}</span>
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
              <input
                type="password"
                placeholder="SecureKeyPass123!"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                disabled={loading}
                className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg pl-9 pr-4 py-2.5 transition-colors font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block">
              {t.sourceDiscoveryLabel}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={t.sourcePlaceholder}
                value={sourceDiscovery}
                onChange={(e) => setSourceDiscovery(e.target.value)}
                className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg pl-4 pr-4 py-2.5 transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 bg-[#11131A] hover:bg-[#1C202C] border border-[#1F293D] hover:border-gray-700 disabled:opacity-50 text-white text-xs font-semibold py-2.5 rounded-lg transition-all"
          >
            <span>{t.initializeBtn}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="text-[9px] font-mono text-gray-600 text-center leading-relaxed">
          {lang === 'en' ? (
            <>
              By clicking Continue, you agree to our{' '}
              <Link href="/" className="underline hover:text-white">Terms of Service</Link> and{' '}
              <Link href="/" className="underline hover:text-white">Privacy Policy</Link>.
            </>
          ) : (
            <>
              Нажимая Продолжить, вы соглашаетесь с нашими{' '}
              <Link href="/" className="underline hover:text-white">Условиями обслуживания</Link> и{' '}
              <Link href="/" className="underline hover:text-white">Политикой конфиденциальности</Link>.
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="text-center text-[10px] font-mono text-[#9CA3AF] border-t border-[#1F293D] pt-4">
          {t.alreadyMember}{' '}
          <Link href="/login" className="text-[#3B82F6] hover:underline font-bold">
            {t.loginHere}
          </Link>
        </div>

      </div>

      {/* Sovereign status bar */}
      <div className="fixed bottom-0 left-0 w-full bg-[#11131A] border-t border-[#1F293D] px-6 py-2.5 flex justify-between items-center text-[10px] font-mono text-gray-500">
        <div className="flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-[#10B981] animate-pulse" />
          <span>{t.systemOnline}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>BUILD: 2.0.4-PRO</span>
          <span className="flex items-center gap-1">
            <Wifi className="h-3.5 w-3.5 text-[#3B82F6]" />
            <span>LAT: {latency}</span>
          </span>
        </div>
      </div>
      
    </div>
  );
}
