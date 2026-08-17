'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', iconOnly = false, size = 'md' }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none group ${className}`}>
      {/* Emblem Badge Icon */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        {/* Glow backdrop aura */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#3B82F6] via-[#8B5CF6] to-[#A855F7] opacity-60 blur-[6px] group-hover:opacity-100 transition-opacity" />
        
        {/* Main Emblem Container */}
        <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E1035] border border-[#A855F7]/40 shadow-lg flex items-center justify-center p-1.5 overflow-hidden">
          
          {/* Subtle grid accent inside badge */}
          <div className="absolute inset-0 opacity-20 bg-[radial-[#A855F7]_1px,transparent_1px] [background-size:6px_6px]" />
          
          {/* Vector Emblem Graphic */}
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
            <defs>
              <linearGradient id="logo-grad-svg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
              <linearGradient id="sparkle-grad-svg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>
            </defs>

            {/* Document sheet shape */}
            <path 
              d="M10 8C10 6.89543 10.8954 6 12 6H24L30 12V32C30 33.1046 29.1046 34 28 34H12C10.8954 34 10 33.1046 10 32V8Z" 
              fill="#0F172A" 
              stroke="url(#logo-grad-svg)" 
              strokeWidth="2.5" 
            />

            {/* Folded corner */}
            <path d="M24 6V12H30" stroke="url(#logo-grad-svg)" strokeWidth="2" strokeLinecap="round" />

            {/* Stylized 'R' Document Ribbon */}
            <path 
              d="M15 14H22C24.2091 14 26 15.7909 26 18C26 20.2091 24.2091 22 22 22H15V14Z" 
              stroke="url(#logo-grad-svg)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <path 
              d="M19 22L25 28" 
              stroke="url(#logo-grad-svg)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />
            <path 
              d="M15 14V28" 
              stroke="url(#logo-grad-svg)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />

            {/* AI Sparkle */}
            <path 
              d="M27 22L28.2 24.8L31 26L28.2 27.2L27 30L25.8 27.2L23 26L25.8 24.8L27 22Z" 
              fill="url(#sparkle-grad-svg)" 
            />
          </svg>
        </div>
      </div>

      {/* Typography */}
      {!iconOnly && (
        <div className="flex flex-col text-left">
          <div className={`font-mono font-extrabold tracking-tight leading-none ${textSizes[size]} text-white flex items-center`}>
            <span className="logo-text-primary">Resume</span>
            <span className="bg-gradient-to-r from-[#A855F7] via-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent ml-0.5">Legend</span>
          </div>
          <span className="text-[8px] font-mono font-bold tracking-widest text-[#9CA3AF] uppercase mt-0.5 opacity-80">
            AI RESUME BUILDER
          </span>
        </div>
      )}
    </div>
  );
}
