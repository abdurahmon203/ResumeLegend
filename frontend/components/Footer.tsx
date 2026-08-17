'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Github } from '@/components/icons';

export function Footer() {
  return (
    <footer className="border-t border-[#1F293D] bg-[#0A0C10] px-6 py-12 text-[#9CA3AF]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start">
            <Logo size="sm" />
          </div>
          <p className="text-[10px] text-gray-500">© 2026 ResumeLegend. Precision AI Resume Engine.</p>
        </div>
        
        <div className="flex gap-6 text-[11px] font-mono">
          <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="https://github.com" target="_blank" className="hover:text-white transition-colors flex items-center gap-1">
            <Github className="h-3 w-3" />
            <span>GitHub Integration</span>
          </Link>
          <Link href="/" className="hover:text-white transition-colors">API Docs</Link>
        </div>
      </div>
    </footer>
  );
}
