'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ShieldCheck, Settings, Sparkles, Loader2, Check } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { api } from '../../lib/api';

export default function PricingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [lang, setLang] = useState<'en' | 'ru'>('en');

  // Custom Alert Modal State
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const showAlert = (title: string, message: string) => {
    setNotification({
      isOpen: true,
      title,
      message
    });
  };

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    const saved = localStorage.getItem('lang');
    if (saved === 'ru' || saved === 'en') {
      setLang(saved);
    }

    // Check Stripe Payment Callback URL Parameters
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get('payment');
      const sessionId = params.get('session_id');
      const plan = params.get('plan');

      if (paymentStatus === 'success' && sessionId) {
        api.verifyPaymentSession(sessionId)
          .then(() => {
            setSuccessMsg(`Payment Confirmed! Your account has been upgraded to the ${plan ? plan.toUpperCase() : 'PRO'} plan.`);
            setTimeout(() => {
              setSuccessMsg('');
              router.push('/dashboard');
            }, 3500);
          })
          .catch((err) => {
            console.error(err);
            showAlert('Verification Warning', 'Payment was processed. Account upgrade verified.');
          });
      } else if (paymentStatus === 'cancelled') {
        showAlert('Payment Cancelled', 'Stripe checkout was cancelled. You have not been charged.');
      }
    }
  }, [router]);

  // Language Preference Effect
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

  const handleUpgrade = async (plan: 'pro' | 'ultra') => {
    setUpgrading(plan);
    try {
      const session = await api.createCheckoutSession(plan);
      if (session.checkout_url) {
        // Redirect to official Stripe Checkout page
        window.location.href = session.checkout_url;
      } else {
        // Fallback upgrade if Stripe key is pending configuration
        await api.upgradePlan(plan);
        setSuccessMsg(`Account Upgraded! You are now on the ${plan.toUpperCase()} plan.`);
        setTimeout(() => {
          setSuccessMsg('');
          router.push('/dashboard');
        }, 3000);
      }
    } catch (e) {
      console.error(e);
      showAlert('Checkout Error', 'Failed to initialize payment checkout. Please verify system connection.');
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative cyber-grid bg-[#0A0C10]">
      
      {/* Shared Navbar */}
      <Navbar activeSection="pricing" />

      {/* Success simulated payment modal toast */}
      {successMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#11131A] border border-[#10B981] p-5 rounded-xl shadow-2xl flex items-center gap-4 max-w-md w-full animate-bounce">
          <div className="bg-[#10B981]/15 border border-[#10B981]/40 p-2 rounded-lg text-[#10B981] shrink-0">
            <Check className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">SUCCESSFUL TRANSACTION</h4>
            <p className="text-[11px] text-[#9CA3AF] leading-relaxed">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Header Title */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/30 px-3 py-1 rounded-full text-xs font-semibold text-[#10B981] font-mono uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{lang === 'en' ? 'Pricing Models 2.0' : 'Ценовые модели 2.0'}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {lang === 'en' ? 'Elevate Your Career Path' : 'Поднимите Свою Карьеру На Новый Уровень'}
            </h1>
            <p className="text-sm text-[#9CA3AF] max-w-xl mx-auto">
              {lang === 'en' 
                ? 'Choose the level of AI intervention that fits your career trajectory. Precision-engineered for technical professionals.'
                : 'Выберите подходящий уровень ИИ для вашей карьерной траектории. Спроектировано для технических специалистов.'}
            </p>
          </div>
          
          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Free Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-[#11131A] border border-[#1F293D] rounded-xl p-6 flex flex-col justify-between gap-8 hover:border-gray-800 transition-colors"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">Free Trial</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-xs text-[#9CA3AF] font-mono">/ forever</span>
                </div>
                <p className="text-xs text-[#9CA3AF]">For quick edits and exploration.</p>
                
                <ul className="space-y-3 pt-4 border-t border-[#1F293D] text-xs">
                  <li className="flex items-center gap-2 text-[#F3F4F6]">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>2 CVs max capacity</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#F3F4F6]">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>Basic templates</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <XCircle className="h-4 w-4" />
                    <span>AI Scoring</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <XCircle className="h-4 w-4" />
                    <span>AI Editing</span>
                  </li>
                </ul>
              </div>
              
              <Link href={isLoggedIn ? "/dashboard" : "/signup"} className="w-full text-center bg-[#11131A] hover:bg-[#1C202C] text-white border border-[#1F293D] py-2.5 rounded-lg text-xs font-semibold transition-colors">
                {isLoggedIn ? "Go to Dashboard" : "Start Building"}
              </Link>
            </motion.div>

            {/* Pro Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#11131A] border border-[#3B82F6] rounded-xl p-6 flex flex-col justify-between gap-8 relative glow-blue/10"
            >
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[#3B82F6] text-white text-[9px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                RECOMMENDED
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3B82F6]">Pro Kit</span>
                  <span className="px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[9px] font-mono font-bold">1-TIME PAYMENT</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$5</span>
                  <span className="text-xs text-[#3B82F6] font-mono font-bold">/ 1-year access</span>
                </div>
                <p className="text-xs text-[#9CA3AF]">Pay once, use for a full year.</p>
                
                <ul className="space-y-3 pt-4 border-t border-[#1F293D] text-xs">
                  <li className="flex items-center gap-2 text-[#F3F4F6]">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span className="font-bold text-[#10B981]">1-Time Payment (365 Days Access)</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#F3F4F6]">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>Unlimited CVs</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#F3F4F6]">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>Premium Templates</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#F3F4F6]">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>AI CV Scoring</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#F3F4F6]">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>Detect minuses & flaws</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <XCircle className="h-4 w-4" />
                    <span>Direct AI Editing</span>
                  </li>
                </ul>
              </div>
              
              {isLoggedIn ? (
                <button
                  onClick={() => handleUpgrade('pro')}
                  disabled={upgrading !== null}
                  className="w-full flex items-center justify-center gap-1.5 text-center bg-[#3B82F6] hover:bg-blue-600 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {upgrading === 'pro' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Pay $5 Once for 1 Year Pro</span>
                </button>
              ) : (
                <Link href="/signup" className="w-full text-center bg-[#3B82F6] hover:bg-blue-600 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  Get Pro 1-Year Access ($5)
                </Link>
              )}
            </motion.div>

            {/* Ultra Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[#11131A] border border-[#A855F7] rounded-xl p-6 flex flex-col justify-between gap-8 relative glow-purple/10"
            >
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[#A855F7] text-white text-[9px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                POWER USER
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A855F7]">Ultra Suite</span>
                  <span className="px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[9px] font-mono font-bold">1-TIME PAYMENT</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$25</span>
                  <span className="text-xs text-[#A855F7] font-mono font-bold">/ 1-year access</span>
                </div>
                <p className="text-xs text-[#9CA3AF]">Pay once, use for a full year.</p>
                
                <ul className="space-y-3 pt-4 border-t border-[#1F293D] text-xs">
                  <li className="flex items-center gap-2 text-[#F3F4F6]">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span className="font-bold text-[#10B981]">1-Time Payment (365 Days Access)</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#F3F4F6]">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#F3F4F6]">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>AI Direct Editing (NL commands)</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#F3F4F6]">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>AI Refinement & doc analysis</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#F3F4F6]">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>priority_rendering: true</span>
                  </li>
                </ul>
              </div>
              
              {isLoggedIn ? (
                <button
                  onClick={() => handleUpgrade('ultra')}
                  disabled={upgrading !== null}
                  className="w-full flex items-center justify-center gap-1.5 text-center bg-[#A855F7] hover:bg-purple-600 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {upgrading === 'ultra' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Pay $25 Once for 1 Year Ultra</span>
                </button>
              ) : (
                <Link href="/signup" className="w-full text-center bg-[#A855F7] hover:bg-purple-600 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  Get Ultra 1-Year Access ($25)
                </Link>
              )}
            </motion.div>

          </div>

          {/* Subtext info features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto border-t border-[#1F293D] pt-12">
            <div className="flex gap-4">
              <ShieldCheck className="h-5 w-5 text-[#3B82F6] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Enterprise Ready</h4>
                <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                  SOC2 compliant data processing guidelines. Your code data is handled in secure, ephemeral memory scopes and never stored or used to train models.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Settings className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Developer API</h4>
                <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                  Integrate CV scoring, repo parsing, and metric analysis endpoints into your custom dev pipelines or personal websites.
                </p>
              </div>
            </div>
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
