'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Terminal, ShieldAlert, Key, Mail, Cpu, Wifi } from 'lucide-react';
import { Github } from '@/components/icons';
import { api } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ping, setPing] = useState('24ms');
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
      welcome: 'Welcome Back',
      subtitle: 'Sign in to your sovereign workspace.',
      errorFill: 'Please fill in all security fields.',
      errorInvalid: 'Failed authorization: Invalid ACCESS_KEY credentials.',
      githubLogin: 'Continue with GitHub',
      orViaEmail: 'OR VIA EMAIL',
      emailLabel: 'USER_ID / EMAIL',
      accessKeyLabel: 'ACCESS_KEY',
      recoverKey: 'Recover Key?',
      authorizeBtn: 'Authorize Access',
      authorizing: 'Authorizing...',
      noAccount: "Don't have an account?",
      initiateSignup: 'Initiate Signup',
      aiCoreOnline: 'AI CORE ONLINE'
    },
    ru: {
      welcome: 'С возвращением',
      subtitle: 'Войдите в свое рабочее пространство.',
      errorFill: 'Пожалуйста, заполните все поля безопасности.',
      errorInvalid: 'Ошибка авторизации: Неверный ACCESS_KEY.',
      githubLogin: 'Войти через GitHub',
      orViaEmail: 'ИЛИ ЧЕРЕЗ EMAIL',
      emailLabel: 'ИДЕНТИФИКАТОР / EMAIL',
      accessKeyLabel: 'КЛЮЧ ДОСТУПА',
      recoverKey: 'Восстановить ключ?',
      authorizeBtn: 'Авторизовать доступ',
      authorizing: 'Авторизация...',
      noAccount: 'Нет аккаунта?',
      initiateSignup: 'Зарегистрироваться',
      aiCoreOnline: 'ИИ ЯДРО АКТИВНО'
    }
  }[lang];

  useEffect(() => {
    // Generate slight fluctuations in ping for visual realism
    const interval = setInterval(() => {
      const ms = Math.floor(Math.random() * 8) + 20;
      setPing(`${ms}ms`);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGitHubLogin = () => {
    setLoading(true);
    // Try to redirect to backend oauth, or fall back to mock callback redirect
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Check if backend is alive (async fire-and-forget style for routing)
    fetch(`${backendUrl}/auth/github`, { method: 'HEAD', mode: 'no-cors' })
      .then(() => {
        window.location.href = `${backendUrl}/auth/github`;
      })
      .catch(() => {
        console.log('Backend not reachable, routing to mock callback...');
        router.push('/callback?code=mock_code_123');
      });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !accessKey) {
      setError(t.errorFill);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Simulate auth check
      await new Promise(r => setTimeout(r, 1200));
      localStorage.setItem('token', 'mock-jwt-token-email');
      router.push('/dashboard');
    } catch (err: any) {
      setError(t.errorInvalid);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 relative min-h-screen py-12 cyber-grid">
      
      {/* Login Card */}
      <div className="w-full max-w-md bg-[#11131A] border border-[#1F293D] rounded-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden glow-purple/5">
        
        {/* Glowing border accent */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#A855F7] to-[#3B82F6]" />

        {/* Logo and title */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-mono font-bold text-lg text-white">
            <Terminal className="h-5 w-5 text-[#A855F7] glow-purple" />
            <span>Resume<span className="text-[#A855F7]">Legend</span></span>
          </Link>
          <h2 className="text-xl font-bold text-white tracking-tight pt-2">{t.welcome}</h2>
          <p className="text-xs text-[#9CA3AF]">{t.subtitle}</p>
        </div>

        {error && (
          <div className="bg-red-950/20 border border-red-500/30 text-red-500 p-3 rounded-lg text-xs flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* GitHub Continue Button */}
        <button
          onClick={handleGitHubLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-[#A855F7] hover:bg-purple-600 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
        >
          <Github className="h-4.5 w-4.5" />
          <span>{t.githubLogin}</span>
        </button>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#1F293D]"></div>
          <span className="flex-shrink mx-4 font-mono text-[9px] text-gray-600 uppercase tracking-widest">
            {t.orViaEmail}
          </span>
          <div className="flex-grow border-t border-[#1F293D]"></div>
        </div>

        {/* Form elements */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 block">
              {t.emailLabel}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="dev@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg pl-10 pr-4 py-3 transition-colors font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">
                {t.accessKeyLabel}
              </label>
              <Link href="#" className="text-[10px] font-mono text-[#3B82F6] hover:underline">
                {t.recoverKey}
              </Link>
            </div>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                disabled={loading}
                className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] outline-none text-xs text-white rounded-lg pl-10 pr-4 py-3 transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#11131A] hover:bg-[#1C202C] border border-[#1F293D] hover:border-gray-700 disabled:opacity-50 text-white text-xs font-semibold py-3 rounded-lg transition-all"
          >
            {loading ? t.authorizing : t.authorizeBtn}
          </button>
        </form>

        {/* Footer actions */}
        <div className="text-center text-[10px] font-mono text-[#9CA3AF] border-t border-[#1F293D] pt-4">
          {t.noAccount}{' '}
          <Link href="/signup" className="text-[#3B82F6] hover:underline font-bold">
            {t.initiateSignup}
          </Link>
        </div>

      </div>

      {/* Sovereign status bar */}
      <div className="fixed bottom-0 left-0 w-full bg-[#11131A] border-t border-[#1F293D] px-6 py-2.5 flex justify-between items-center text-[10px] font-mono text-gray-500">
        <div className="flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-[#10B981] animate-pulse" />
          <span>{t.aiCoreOnline}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>V2.4.0-STABLE</span>
          <span className="flex items-center gap-1">
            <Wifi className="h-3.5 w-3.5 text-[#3B82F6]" />
            <span>ping: {ping}</span>
          </span>
        </div>
      </div>
      
    </div>
  );
}
