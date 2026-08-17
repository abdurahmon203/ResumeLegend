'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Terminal, ArrowRight, Menu, X, Sun, Moon } from 'lucide-react';
import { Github } from '@/components/icons';

import { Logo } from '@/components/Logo';

interface NavbarProps {
  activeSection?: string;
}

export function Navbar({ activeSection }: NavbarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [lang, setLang] = useState<'en' | 'ru'>('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    const saved = localStorage.getItem('lang');
    if (saved === 'ru' || saved === 'en') {
      setLang(saved);
    }
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      if (savedTheme === 'light') {
        document.documentElement.classList.add('light');
        document.body.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.body.classList.remove('light');
      }
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ru' : 'en';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    window.dispatchEvent(new Event('lang-changed'));
  };

  const toggleTheme = () => {
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

  return (
    <header className="sticky top-0 z-50 bg-[#0A0C10]/95 backdrop-blur-md border-b border-[#1F293D] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <Logo size="md" />
        </Link>
        
        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#9CA3AF]">
          <Link href="/#how-it-works" className="hover:text-white transition-colors">{lang === 'en' ? 'How it Works' : 'Как это работает'}</Link>
          <Link href="/templates" className={`hover:text-white transition-colors ${activeSection === 'templates' ? 'text-white border-b-2 border-[#A855F7] pb-1' : ''}`}>{lang === 'en' ? 'Templates' : 'Шаблоны'}</Link>
          <Link href="/pricing" className={`hover:text-white transition-colors ${activeSection === 'pricing' ? 'text-white border-b-2 border-[#A855F7] pb-1' : ''}`}>{lang === 'en' ? 'Pricing' : 'Цены'}</Link>
        </nav>

        {/* Desktop CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Icon-Only Theme Switcher Button */}
          <button 
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 bg-[#11131A] hover:bg-[#1C202C] border border-[#1F293D] hover:border-[#A855F7]/50 rounded-full transition-all cursor-pointer shadow-sm group flex items-center justify-center"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="h-4 w-4 text-purple-400 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 bg-[#11131A] hover:bg-[#1C202C] border border-[#1F293D] hover:border-gray-700 text-xs font-mono font-bold text-gray-400 hover:text-white px-2.5 py-1.5 rounded transition-all cursor-pointer uppercase"
          >
            🌐 {lang}
          </button>

          {isLoggedIn ? (
            <Link href="/dashboard" className="flex items-center gap-1.5 bg-[#A855F7] hover:bg-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-md transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <span>{lang === 'en' ? 'Go to Dashboard' : 'В личный кабинет'}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-[#9CA3AF] hover:text-white transition-colors">
                {lang === 'en' ? 'Login' : 'Войти'}
              </Link>
              <Link href="/signup" className="flex items-center gap-1.5 bg-[#A855F7] hover:bg-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-md transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <span>{lang === 'en' ? 'Get Started' : 'Начать'}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1 bg-[#11131A] border border-[#1F293D] rounded-lg text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bg-[#0A0C10] border-b border-[#1F293D] p-6 space-y-6 shadow-2xl flex flex-col z-50">
          <nav className="flex flex-col gap-4 text-sm font-medium text-[#9CA3AF]">
            <Link 
              href="/#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white transition-colors py-2 border-b border-[#1F293D]/50"
            >
              {lang === 'en' ? 'How it Works' : 'Как это работает'}
            </Link>
            <Link 
              href="/templates" 
              onClick={() => setMobileMenuOpen(false)}
              className={`hover:text-white transition-colors py-2 border-b border-[#1F293D]/50 ${activeSection === 'templates' ? 'text-white' : ''}`}
            >
              {lang === 'en' ? 'Templates' : 'Шаблоны'}
            </Link>
            <Link 
              href="/pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className={`hover:text-white transition-colors py-2 border-b border-[#1F293D]/50 ${activeSection === 'pricing' ? 'text-white' : ''}`}
            >
              {lang === 'en' ? 'Pricing' : 'Цены'}
            </Link>
            <div className="flex items-center justify-between py-2 border-b border-[#1F293D]/50">
              <span className="font-mono text-xs text-gray-400">Theme</span>
              <button 
                onClick={() => {
                  toggleTheme();
                }}
                className="p-2 bg-[#11131A] border border-[#1F293D] rounded-full text-xs"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-purple-400" />}
              </button>
            </div>
            <button 
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="text-left font-mono text-xs font-bold text-gray-400 py-2 border-b border-[#1F293D]/50 flex items-center gap-2"
            >
              <span>🌐 Language: {lang.toUpperCase()}</span>
            </button>
          </nav>

          <div className="flex flex-col gap-3 pt-2">
            {isLoggedIn ? (
              <Link 
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-[#A855F7] text-white py-3 rounded-lg text-sm font-semibold"
              >
                <span>{lang === 'en' ? 'Go to Dashboard' : 'В личный кабинет'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link 
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center bg-[#11131A] text-white py-3 rounded-lg text-sm font-medium border border-[#1F293D]"
                >
                  {lang === 'en' ? 'Login' : 'Войти'}
                </Link>
                <Link 
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-[#A855F7] text-white py-3 rounded-lg text-sm font-semibold"
                >
                  <span>{lang === 'en' ? 'Get Started' : 'Начать'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
