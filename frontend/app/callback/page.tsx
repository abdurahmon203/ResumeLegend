'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Terminal, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Contacting auth daemon...');

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('user_id');
    const username = searchParams.get('username');
    const email = searchParams.get('email');
    const avatarUrl = searchParams.get('avatar_url');
    const plan = searchParams.get('plan');

    if (token) {
      setStatus('Initializing session variables...');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id: userId,
        username: username,
        email: email || undefined,
        avatar_url: avatarUrl ? decodeURIComponent(avatarUrl) : undefined,
        plan: plan || 'free'
      }));
      
      setStatus('Verification success. Entering dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      return;
    }

    const code = searchParams.get('code');
    if (!code) {
      setError('OAuth credentials missing. Re-routing...');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    const exchangeCode = async () => {
      try {
        setStatus('Exchanging code for credentials...');
        const { token: receivedToken, user: receivedUser } = await api.loginWithGitHubCode(code);
        
        setStatus('Initializing session variables...');
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(receivedUser));
        
        setStatus('Verification success. Entering dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (err: any) {
        console.error(err);
        setError('GitHub login verification failed. Backend server offline?');
        setTimeout(() => {
          // Force mock session anyway for UI demo purposes
          localStorage.setItem('token', 'mock-jwt-token-fallback');
          router.push('/dashboard');
        }, 2500);
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  return (
    <div className="w-full max-w-sm bg-[#11131A] border border-[#1F293D] rounded-xl p-6 flex flex-col items-center gap-4 text-center">
      {error ? (
        <>
          <ShieldAlert className="h-8 w-8 text-red-500 shrink-0" />
          <p className="text-red-500 font-bold">{error}</p>
          <p className="text-[10px] text-gray-500">Launching offline demonstration fallback...</p>
        </>
      ) : (
        <>
          <Loader2 className="h-8 w-8 text-[#A855F7] animate-spin" />
          <p className="text-white font-semibold">{status}</p>
          <div className="w-full bg-[#0A0C10] h-1.5 rounded-full overflow-hidden border border-[#1F293D]">
            <div className="bg-[#A855F7] h-full animate-[shimmer_1.5s_infinite] w-2/3 rounded-full" />
          </div>
        </>
      )}
    </div>
  );
}

export default function CallbackPage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 min-h-screen bg-[#0A0C10] font-mono text-xs text-[#9CA3AF] space-y-6">
      <div className="flex items-center gap-2 font-bold text-sm text-white">
        <Terminal className="h-5 w-5 text-[#A855F7] animate-pulse" />
        <span>Resume<span className="text-[#A855F7]">Legend</span></span>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-sm bg-[#11131A] border border-[#1F293D] rounded-xl p-6 flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 text-[#A855F7] animate-spin" />
          <p className="text-white font-semibold">Loading authorization query...</p>
        </div>
      }>
        <CallbackContent />
      </Suspense>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
