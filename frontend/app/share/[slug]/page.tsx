'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, FileDown, Terminal, Award, ExternalLink, X } from 'lucide-react';
import { api, Resume, AchievementItem } from '../../../lib/api';

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCertPreview, setActiveCertPreview] = useState<{ title: string; imageUrl: string } | null>(null);

  useEffect(() => {
    if (!slug) return;
    loadPublicResume();
  }, [slug]);

  const loadPublicResume = async () => {
    setLoading(true);
    try {
      const data = await api.getPublicResume(slug);
      setResume(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = () => {
    if (resume?.content?.pdf_data) {
      const link = document.createElement('a');
      link.href = resume.content.pdf_data;
      link.download = `${resume.title || 'ResumeLegend_CV'}.pdf`;
      link.click();
      return;
    }
    
    window.print();
  };

  const detectLang = (): 'en' | 'ru' | 'de' | 'tg' => {
    if (!resume) return 'en';
    const pos = resume.content.personal_info.desiredPosition || '';
    const sum = resume.content.summary || '';
    const text = (pos + ' ' + sum).toLowerCase();
    if (text.includes('таҳиягари') || text.includes('сола') || text.includes('хулоса') || text.includes('маҳорат')) return 'tg';
    if (text.includes('разработчик') || text.includes('опытный') || text.includes('опыт')) return 'ru';
    if (text.includes('entwickler') || text.includes('erfahrener')) return 'de';
    return 'en';
  };

  const getSectionTitle = (key: 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'achievements' | 'languages') => {
    const activeLang = detectLang();
    const titles: Record<string, Record<'en' | 'ru' | 'de' | 'tg', string>> = {
      summary: {
        en: "PROFESSIONAL SUMMARY",
        ru: "ПРОФЕССИОНАЛЬНОЕ РЕЗЮМЕ",
        de: "BERUFLICHE ZUSAMMENFASSUNG",
        tg: "МАЪЛУМОТИ УМУМИИ КАСБӢ"
      },
      skills: {
        en: "CORE COMPETENCIES",
        ru: "КЛЮЧЕВЫЕ НАВЫКИ",
        de: "SCHLÜSSELKOMPETENZEN",
        tg: "МАҲОРАТҲОИ АСОСӢ"
      },
      experience: {
        en: "PROFESSIONAL EXPERIENCE",
        ru: "ОПЫТ РАБОТЫ",
        de: "BERUFSERFAHRUNG",
        tg: "ТАҶРИБАИ КОРӢ"
      },
      projects: {
        en: "OPEN SOURCE & PROJECTS",
        ru: "ПРОЕКТЫ И РАЗРАБОТКИ",
        de: "PROJEKTE & ENTWICKLUNGEN",
        tg: "ЛОИҲАҲО ВА КОРҲО"
      },
      education: {
        en: "EDUCATION",
        ru: "ОБРАЗОВАНИЕ",
        de: "AUSBILDUNG",
        tg: "ТАҲСИЛОТ"
      },
      achievements: {
        en: "ACHIEVEMENTS & AWARDS",
        ru: "ДОСТИЖЕНИЯ И НАГРАДЫ",
        de: "ERFOLGE & AUSZEICHNUNGEN",
        tg: "ДАСТОВАРДҲО ВА ҶОИЗАҲО"
      },
      languages: {
        en: "SPOKEN LANGUAGES",
        ru: "ЯЗЫКИ ОБЩЕНИЯ",
        de: "SPRACHEN",
        tg: "ЗАБОНҲОИ МУОШИРАТ"
      }
    };
    return titles[key]?.[activeLang] || titles[key]?.en;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center h-screen bg-[#0A0C10] font-mono text-xs text-[#9CA3AF] gap-3">
        <Loader2 className="h-8 w-8 text-[#A855F7] animate-spin" />
        <span>Fetching credential model...</span>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center h-screen bg-[#0A0C10] font-mono text-xs text-[#9CA3AF] gap-4 text-center px-6">
        <p className="text-red-500 font-bold">404 - SOVEREIGN PROFILE INDEX NOT FOUND</p>
        <p className="text-gray-500 max-w-sm">
          The requested shareable link is invalid or has been toggled to private by the profile owner.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-2 bg-[#1F293D] hover:bg-[#2B3952] text-[#F3F4F6] py-2 px-4 rounded-lg border border-[#303E57] transition-colors"
        >
          Return to Site
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] py-16 px-4 flex justify-center items-start relative">
      
      {/* Dynamic Render Canvas A4 */}
      <div 
        id="resume-pdf-canvas"
        className={`w-[794px] min-h-[1123px] bg-white text-black p-12 shadow-2xl relative transition-all ${
          resume.template_name === 'minimal' ? 'font-serif' : 'font-sans'
        }`}
      >
        {/* DEVELOPER TEMPLATE */}
        {resume.template_name === 'developer' && (
          <div className="space-y-6 text-[12px] leading-relaxed">
            <div className="border-b-2 border-black pb-4 text-center sm:text-left">
              <h1 className="text-2xl font-extrabold tracking-tight uppercase">
                {resume.content.personal_info.fullName}
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-[#A855F7] font-bold uppercase mt-1">
                {resume.content.personal_info.desiredPosition}
              </p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-[9px] font-mono text-gray-500 mt-3">
                <span>{resume.content.personal_info.email}</span>
                <span>•</span>
                <span>{resume.content.personal_info.phone}</span>
                <span>•</span>
                <span>{resume.content.personal_info.location}</span>
                {resume.content.personal_info.githubUrl && (
                  <>
                    <span>•</span>
                    <a 
                      href={resume.content.personal_info.githubUrl.startsWith('http') ? resume.content.personal_info.githubUrl : `https://${resume.content.personal_info.githubUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-black hover:text-[#A855F7] hover:underline"
                    >
                      {resume.content.personal_info.githubUrl}
                    </a>
                  </>
                )}
                {resume.content.personal_info.linkedIn && (
                  <>
                    <span>•</span>
                    <a 
                      href={resume.content.personal_info.linkedIn.startsWith('http') ? resume.content.personal_info.linkedIn : `https://${resume.content.personal_info.linkedIn}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-black hover:text-[#A855F7] hover:underline"
                    >
                      LinkedIn
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-[10px] font-mono font-bold tracking-wider uppercase text-gray-400 border-b border-gray-200 pb-1">
                {getSectionTitle('summary')}
              </h2>
              <p className="text-gray-700">{resume.content.summary}</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-[10px] font-mono font-bold tracking-wider uppercase text-gray-400 border-b border-gray-200 pb-1">
                {getSectionTitle('skills')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {resume.content.skills.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="font-mono text-[9px] font-bold text-black uppercase">{cat.category}</h4>
                    <p className="text-gray-600 text-[10px]">{cat.skills.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[10px] font-mono font-bold tracking-wider uppercase text-gray-400 border-b border-gray-200 pb-1">
                {getSectionTitle('experience')}
              </h2>
              <div className="space-y-4">
                {resume.content.experience.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline font-bold text-[11px]">
                      <div className="flex items-center gap-2">
                        <span>{exp.company}</span>
                        {(exp.endDate?.toLowerCase().includes('present') || exp.endDate?.includes('ҳоло') || exp.endDate?.includes('настоящее')) && (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[8px] px-1.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Currently Working</span>
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[9px] text-gray-500">{exp.startDate} — {exp.endDate}</span>
                    </div>
                    <p className="font-mono text-[9px] text-[#A855F7] uppercase tracking-wider">{exp.position}</p>
                    <ul className="list-disc list-inside text-gray-700 text-[10px] pl-2 space-y-1 mt-1.5">
                      {exp.description.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[10px] font-mono font-bold tracking-wider uppercase text-gray-400 border-b border-gray-200 pb-1">
                {getSectionTitle('projects')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resume.content.projects.map((proj) => (
                  <div key={proj.id} className="border border-gray-200 rounded p-3 space-y-1">
                    <div className="flex justify-between items-baseline font-bold">
                      <a 
                        href={proj.githubUrl?.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-mono text-[11px] text-black hover:text-[#A855F7] hover:underline cursor-pointer transition-colors"
                      >
                        {proj.name}
                      </a>
                      {proj.stars !== undefined && proj.stars > 0 && (
                        <span className="text-[9px] font-mono text-[#3B82F6]">{proj.stars} ★</span>
                      )}
                    </div>
                    <p className="text-[9px] font-mono text-gray-500">{proj.technologies.join(', ')}</p>
                    <p className="text-gray-600 text-[10px] leading-relaxed pt-1">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-[10px] font-mono font-bold tracking-wider uppercase text-gray-400 border-b border-gray-200 pb-1">
                {getSectionTitle('education')}
              </h2>
              {resume.content.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline text-[10px]">
                  <div>
                    <span className="font-bold">{edu.institution}</span> — <span>{edu.degree} in {edu.fieldOfStudy}</span>
                  </div>
                  <span className="font-mono text-[9px] text-gray-500">{edu.startDate} — {edu.endDate}</span>
                </div>
              ))}
            </div>

            {resume.content.achievements.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-[10px] font-mono font-bold tracking-wider uppercase text-gray-400 border-b border-gray-200 pb-1">
                  {getSectionTitle('achievements')}
                </h2>
                <ul className="list-disc list-inside text-gray-700 text-[10px] pl-2 space-y-1">
                  {resume.content.achievements.map((ach, idx) => {
                    const achObj: AchievementItem = typeof ach === 'string'
                      ? { title: ach, certificateUrl: '' }
                      : { title: ach.title || '', certificateUrl: ach.certificateUrl || '' };

                    return (
                      <li key={idx} className="leading-relaxed">
                        <span>{achObj.title}</span>
                        {achObj.certificateUrl ? (
                          <button
                            onClick={() => setActiveCertPreview({ title: achObj.title, imageUrl: achObj.certificateUrl! })}
                            className="ml-2 inline-flex items-center gap-1 text-[9px] font-mono text-[#A855F7] hover:text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                            title="Click to view Certificate image"
                          >
                            <span>📜 View Certificate ↗</span>
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Spoken Languages */}
            <div className="space-y-2">
              <h2 className="text-[10px] font-mono font-bold tracking-wider uppercase text-gray-400 border-b border-gray-200 pb-1">
                {getSectionTitle('languages')}
              </h2>
              <div className="flex flex-wrap gap-2 text-[10px]">
                {(resume.content.spoken_languages && resume.content.spoken_languages.length > 0 ? resume.content.spoken_languages : [
                  { id: '1', language: 'Tajik', proficiency: 'Native / Fully' },
                  { id: '2', language: 'Russian', proficiency: 'Fluent / Normal' },
                  { id: '3', language: 'English', proficiency: 'Intermediate (B1-B2)' }
                ]).map((langItem) => (
                  <span key={langItem.id} className="bg-gray-100 border border-gray-200 text-gray-800 px-2 py-0.5 rounded font-mono text-[9px]">
                    <strong className="text-black">{langItem.language}:</strong> {langItem.proficiency}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-[8px] font-mono text-gray-400">
              <span>SYSTEM_LOAD: 0.12</span>
              <span>VERIFIED BY RESUMELEGEND AI ARCHITECTURE</span>
            </div>
          </div>
        )}

        {/* MINIMAL TEMPLATE */}
        {resume.template_name === 'minimal' && (
          <div className="space-y-8 text-[12px] leading-relaxed">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-light tracking-wide uppercase">
                {resume.content.personal_info.fullName}
              </h1>
              <p className="text-xs tracking-wider text-gray-500 italic">
                {resume.content.personal_info.desiredPosition}
              </p>
              <div className="flex justify-center gap-4 text-[9px] text-gray-400 font-mono pt-1">
                {resume.content.personal_info.githubUrl && (
                  <a 
                    href={resume.content.personal_info.githubUrl.startsWith('http') ? resume.content.personal_info.githubUrl : `https://${resume.content.personal_info.githubUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black hover:underline"
                  >
                    {resume.content.personal_info.githubUrl}
                  </a>
                )}
                {resume.content.personal_info.githubUrl && resume.content.personal_info.linkedIn && <span>|</span>}
                {resume.content.personal_info.linkedIn && (
                  <a 
                    href={resume.content.personal_info.linkedIn.startsWith('http') ? resume.content.personal_info.linkedIn : `https://${resume.content.personal_info.linkedIn}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black hover:underline"
                  >
                    {resume.content.personal_info.linkedIn}
                  </a>
                )}
              </div>
            </div>

            <p className="text-center text-gray-600 italic px-6">{resume.content.summary}</p>

            <div className="space-y-3">
              <h2 className="text-xs font-bold tracking-widest text-center uppercase text-gray-400 border-b border-gray-100 pb-1">
                {getSectionTitle('skills')}
              </h2>
              <div className="flex flex-wrap justify-center gap-y-1 gap-x-6 text-[10px] text-gray-700">
                {resume.content.skills.flatMap(c => c.skills).map((skill, idx) => (
                  <span key={idx}>{skill}</span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-bold tracking-widest text-center uppercase text-gray-400 border-b border-gray-100 pb-1">
                {getSectionTitle('experience')}
              </h2>
              <div className="space-y-6">
                {resume.content.experience.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline font-bold">
                      <span className="text-[12px]">{exp.company}</span>
                      <span className="text-[10px] font-normal text-gray-500">{exp.startDate} — {exp.endDate}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 italic">{exp.position}</p>
                    <ul className="list-disc pl-4 text-gray-600 text-[10px] space-y-1 mt-1.5">
                      {exp.description.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-bold tracking-widest text-center uppercase text-gray-400 border-b border-gray-100 pb-1">
                {getSectionTitle('projects')}
              </h2>
              <div className="space-y-4">
                {resume.content.projects.map((proj) => (
                  <div key={proj.id} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <a 
                        href={proj.githubUrl?.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-bold text-[11px] hover:text-gray-600 hover:underline cursor-pointer transition-colors"
                      >
                        {proj.name}
                      </a>
                      <span className="text-[10px] text-gray-500">{proj.role}</span>
                    </div>
                    <p className="text-[9px] text-gray-400 font-mono">{proj.technologies.join(', ')}</p>
                    <p className="text-gray-600 text-[10px] pt-0.5">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs font-bold tracking-widest text-center uppercase text-gray-400 border-b border-gray-100 pb-1">
                {getSectionTitle('education')}
              </h2>
              {resume.content.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline text-[10px] text-gray-600">
                  <div>
                    <span className="font-bold text-black">{edu.institution}</span> — {edu.degree} in {edu.fieldOfStudy}
                  </div>
                  <span>{edu.startDate} — {edu.endDate}</span>
                </div>
              ))}
            </div>

            {/* Spoken Languages */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold tracking-widest text-center uppercase text-gray-400 border-b border-gray-100 pb-1">
                {getSectionTitle('languages')}
              </h2>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-gray-700">
                {(resume.content.spoken_languages && resume.content.spoken_languages.length > 0 ? resume.content.spoken_languages : [
                  { id: '1', language: 'Tajik', proficiency: 'Native / Fully' },
                  { id: '2', language: 'Russian', proficiency: 'Fluent / Normal' },
                  { id: '3', language: 'English', proficiency: 'Intermediate (B1-B2)' }
                ]).map((langItem) => (
                  <span key={langItem.id}>
                    <strong className="text-black">{langItem.language}:</strong> {langItem.proficiency}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODERN TEMPLATE */}
        {resume.template_name === 'modern' && (
          <div className="space-y-6 text-[12px] leading-relaxed">
            <div className="flex justify-between items-start border-b border-gray-200 pb-5">
              <div className="space-y-1.5">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 leading-none">
                  {resume.content.personal_info.fullName}
                </h1>
                <p className="text-xs font-semibold text-[#3B82F6] uppercase tracking-wide">
                  {resume.content.personal_info.desiredPosition}
                </p>
              </div>
              
              <div className="text-right text-[10px] text-gray-500 font-mono space-y-0.5">
                <p>{resume.content.personal_info.email}</p>
                <p>{resume.content.personal_info.phone}</p>
                <p>{resume.content.personal_info.location}</p>
                {resume.content.personal_info.githubUrl && (
                  <p>
                    <a 
                      href={resume.content.personal_info.githubUrl.startsWith('http') ? resume.content.personal_info.githubUrl : `https://${resume.content.personal_info.githubUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3B82F6] font-bold hover:underline"
                    >
                      {resume.content.personal_info.githubUrl}
                    </a>
                  </p>
                )}
                {resume.content.personal_info.linkedIn && (
                  <p>
                    <a 
                      href={resume.content.personal_info.linkedIn.startsWith('http') ? resume.content.personal_info.linkedIn : `https://${resume.content.personal_info.linkedIn}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3B82F6] font-bold hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border-l-4 border-[#3B82F6] p-3 rounded-r text-gray-700">
              {resume.content.summary}
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-4 space-y-6 border-r border-gray-100 pr-4">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold tracking-wider text-[#3B82F6] uppercase">{getSectionTitle('skills')}</h3>
                  {resume.content.skills.map((cat, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <h4 className="text-[9px] font-bold text-gray-800 uppercase font-mono">{cat.category}</h4>
                      <div className="flex flex-wrap gap-1">
                        {cat.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="bg-gray-100 text-gray-800 text-[8px] font-semibold px-1.5 py-0.5 rounded font-mono">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold tracking-wider text-[#3B82F6] uppercase">{getSectionTitle('education')}</h3>
                  {resume.content.education.map((edu) => (
                    <div key={edu.id} className="text-[10px] space-y-0.5 text-gray-600">
                      <p className="font-bold text-black leading-none">{edu.institution}</p>
                      <p className="text-[9px] italic">{edu.degree}</p>
                      <p className="text-[8px] font-mono text-gray-400">{edu.startDate} — {edu.endDate}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold tracking-wider text-[#3B82F6] uppercase">{getSectionTitle('languages')}</h3>
                  <div className="space-y-1 text-[9px] text-gray-600">
                    {(resume.content.spoken_languages && resume.content.spoken_languages.length > 0 ? resume.content.spoken_languages : [
                      { id: '1', language: 'Tajik', proficiency: 'Native / Fully' },
                      { id: '2', language: 'Russian', proficiency: 'Fluent / Normal' },
                      { id: '3', language: 'English', proficiency: 'Intermediate (B1-B2)' }
                    ]).map((langItem) => (
                      <p key={langItem.id}>
                        <strong className="text-black font-semibold">{langItem.language}:</strong> {langItem.proficiency}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-span-8 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold tracking-wider text-[#3B82F6] uppercase border-b border-gray-100 pb-1">{getSectionTitle('experience')}</h3>
                  <div className="space-y-4">
                    {resume.content.experience.map((exp) => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-bold text-[11px] text-gray-900">{exp.company}</h4>
                          <span className="text-[8px] font-mono text-gray-400">{exp.startDate} — {exp.endDate}</span>
                        </div>
                        <p className="text-[9px] font-semibold text-gray-500 uppercase">{exp.position}</p>
                        <ul className="list-disc list-inside text-gray-600 text-[10px] pl-1.5 space-y-1 pt-1">
                          {exp.description.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold tracking-wider text-[#3B82F6] uppercase border-b border-gray-100 pb-1">{getSectionTitle('projects')}</h3>
                  <div className="space-y-3.5">
                    {resume.content.projects.map((proj) => (
                      <div key={proj.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold font-mono text-[10px] text-gray-900">
                            <a 
                              href={proj.githubUrl?.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="hover:text-[#3B82F6] hover:underline cursor-pointer transition-colors"
                            >
                              {proj.name}
                            </a>
                          </h4>
                          {proj.stars !== undefined && proj.stars > 0 && (
                            <span className="text-[8px] font-mono text-amber-500 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">★ {proj.stars}</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-[10px] leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CLASSIC TEMPLATE */}
        {resume.template_name === 'classic' && (
          <div className="space-y-5 text-[11px] leading-relaxed font-sans text-black">
            {/* Header info */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-extrabold tracking-tight uppercase border-b-0 pb-0 mb-1 text-black">
                {resume.content.personal_info.fullName} <span className="font-normal text-gray-500 text-lg">| {resume.content.personal_info.desiredPosition}</span>
              </h1>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-2 gap-y-1 text-[9px] font-mono text-gray-500 mt-2">
                <a href={`mailto:${resume.content.personal_info.email}`} className="text-blue-600 underline font-semibold">{resume.content.personal_info.email}</a>
                <span>|</span>
                <span className="text-gray-700 font-semibold">{resume.content.personal_info.phone}</span>
                <span>|</span>
                <span className="text-gray-700">{resume.content.personal_info.location}</span>
                {resume.content.personal_info.linkedIn && (
                  <>
                    <span>|</span>
                    <a 
                      href={resume.content.personal_info.linkedIn.startsWith('http') ? resume.content.personal_info.linkedIn : `https://${resume.content.personal_info.linkedIn}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-semibold"
                    >
                      {resume.content.personal_info.linkedIn.replace(/^(https?:\/\/)?(www\.)?/, '')}
                    </a>
                  </>
                )}
                {resume.content.personal_info.githubUrl && (
                  <>
                    <span>|</span>
                    <a 
                      href={resume.content.personal_info.githubUrl.startsWith('http') ? resume.content.personal_info.githubUrl : `https://${resume.content.personal_info.githubUrl}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-semibold"
                    >
                      {resume.content.personal_info.githubUrl.replace(/^(https?:\/\/)?(www\.)?/, '')}
                    </a>
                  </>
                )}
                {resume.content.personal_info.instagram && (
                  <>
                    <span>|</span>
                    <a 
                      href={resume.content.personal_info.instagram.startsWith('http') ? resume.content.personal_info.instagram : `https://${resume.content.personal_info.instagram}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-semibold"
                    >
                      Instagram
                    </a>
                  </>
                )}
                {resume.content.personal_info.telegram && (
                  <>
                    <span>|</span>
                    <a 
                      href={resume.content.personal_info.telegram.startsWith('http') ? resume.content.personal_info.telegram : `https://t.me/${resume.content.personal_info.telegram}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-semibold"
                    >
                      Telegram
                    </a>
                  </>
                )}
                {resume.content.personal_info.twitter && (
                  <>
                    <span>|</span>
                    <a 
                      href={resume.content.personal_info.twitter.startsWith('http') ? resume.content.personal_info.twitter : `https://${resume.content.personal_info.twitter}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-semibold"
                    >
                      Twitter
                    </a>
                  </>
                )}
                {resume.content.personal_info.facebook && (
                  <>
                    <span>|</span>
                    <a 
                      href={resume.content.personal_info.facebook.startsWith('http') ? resume.content.personal_info.facebook : `https://${resume.content.personal_info.facebook}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-semibold"
                    >
                      Facebook
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Thick Separator line */}
            <hr className="border-t-2 border-black my-3" />

            {/* Professional Summary */}
            <div className="space-y-1.5">
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-black">{getSectionTitle('summary')}</h2>
              <hr className="border-t border-black/35 mb-2" />
              <p className="text-justify leading-relaxed text-black/90">
                {resume.content.summary}
              </p>
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-black">{getSectionTitle('skills')}</h2>
              <hr className="border-t border-black/35 mb-2" />
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-black/90">
                {resume.content.skills.map((cat, idx) => (
                  <span key={idx} className="font-semibold">
                    {idx > 0 && <span className="text-gray-400 font-normal mr-2">|</span>}
                    <span className="text-[8px] font-mono text-gray-500 uppercase mr-1">{cat.category}:</span>
                    {cat.skills.join(' • ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Work Experience */}
            <div className="space-y-1.5">
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-black">{getSectionTitle('experience')}</h2>
              <hr className="border-t border-black/35 mb-2" />
              <div className="space-y-4">
                {resume.content.experience.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[11px] text-black">{exp.company}</span>
                      <span className="text-[9px] font-semibold text-gray-500 font-mono">{exp.startDate} — {exp.endDate}</span>
                    </div>
                    <p className="font-mono text-[9px] text-gray-700 uppercase tracking-wider italic">{exp.position}</p>
                    <ul className="list-disc list-inside text-black/85 text-[10px] pl-1 space-y-1 mt-1">
                      {exp.description.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-1.5">
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-black">{getSectionTitle('education')}</h2>
              <hr className="border-t border-black/35 mb-2" />
              <div className="space-y-3">
                {resume.content.education.map((edu) => (
                  <div key={edu.id} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-[11px] text-black">{edu.institution}</h3>
                      <span className="text-[9px] font-semibold text-gray-500 font-mono">{edu.startDate} — {edu.endDate}</span>
                    </div>
                    <ul className="list-disc list-inside pl-1 space-y-0.5 text-black/85">
                      <li>{edu.degree} in {edu.fieldOfStudy}</li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="space-y-1.5">
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-black">{getSectionTitle('projects')}</h2>
              <hr className="border-t border-black/35 mb-2" />
              <div className="space-y-4">
                {resume.content.projects.map((proj) => (
                  <div key={proj.id} className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[11px] text-black">• {proj.name} ({proj.role})</span>
                      <span className="text-[9px] font-mono text-gray-400">{proj.technologies.join(', ')}</span>
                    </div>
                    <div className="flex gap-2 text-[9px] font-mono pl-3 mb-1">
                      <span className="text-blue-600 underline font-semibold cursor-pointer">Demo</span>
                      <span>|</span>
                      <a 
                        href={proj.githubUrl?.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 underline font-semibold"
                      >
                        GitHub
                      </a>
                    </div>
                    <p className="text-black/85 pl-3 leading-relaxed text-justify">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="space-y-1.5">
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-black">{getSectionTitle('achievements')}</h2>
              <hr className="border-t border-black/35 mb-2" />
              <ul className="list-disc list-inside pl-1 space-y-1 text-black/85">
                {resume.content.achievements.map((ach, idx) => {
                  const achObj: AchievementItem = typeof ach === 'string'
                    ? { title: ach, certificateUrl: '' }
                    : { title: ach.title || '', certificateUrl: ach.certificateUrl || '' };

                  return (
                    <li key={idx} className="leading-relaxed">
                      <span>{achObj.title}</span>
                      {achObj.certificateUrl ? (
                        <button
                          onClick={() => setActiveCertPreview({ title: achObj.title, imageUrl: achObj.certificateUrl! })}
                          className="ml-2 inline-flex items-center gap-1 text-[9px] font-mono text-[#A855F7] hover:text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                          title="Click to view Certificate image"
                        >
                          <span>📜 View Certificate ↗</span>
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Spoken Languages */}
            <div className="space-y-1.5">
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-black">{getSectionTitle('languages')}</h2>
              <hr className="border-t border-black/35 mb-2" />
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-black/85 text-[10px]">
                {(resume.content.spoken_languages && resume.content.spoken_languages.length > 0 ? resume.content.spoken_languages : [
                  { id: '1', language: 'Tajik', proficiency: 'Native / Fully' },
                  { id: '2', language: 'Russian', proficiency: 'Fluent / Normal' },
                  { id: '3', language: 'English', proficiency: 'Intermediate (B1-B2)' }
                ]).map((langItem) => (
                  <span key={langItem.id} className="font-semibold">
                    <span className="text-gray-500 font-mono uppercase mr-1">{langItem.language}:</span>
                    {langItem.proficiency}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Utility Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 no-print bg-[#11131A] border border-[#1F293D] p-2 rounded-xl shadow-2xl">
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#9CA3AF] px-3 font-semibold select-none border-r border-[#1F293D] py-1">
          <Terminal className="h-4 w-4 text-[#A855F7] animate-pulse" />
          <span>Resume<span className="text-white">Legend</span> AI</span>
        </div>
        <button
          onClick={handleExportPdf}
          className="flex items-center gap-1.5 bg-[#A855F7] hover:bg-purple-600 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
        >
          <FileDown className="h-4 w-4" />
          <span>Save PDF</span>
        </button>
      </div>

      {/* Inject styling scope for print rules */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          html, body {
            background: white !important;
            color: black !important;
            height: auto !important;
            overflow: visible !important;
          }
          body > div {
            height: auto !important;
            overflow: visible !important;
          }
          #resume-pdf-canvas {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 794px !important; /* A4 width */
            max-width: 100% !important;
            height: 1123px !important; /* A4 height */
            position: relative !important;
            overflow: hidden !important;
          }
        }
      `}</style>
      
      {/* Certificate Image Lightbox Modal */}
      {activeCertPreview && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-[#11131A] border border-[#1F293D] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#1F293D] pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#A855F7]" />
                <h3 className="text-sm font-bold text-white line-clamp-1">{activeCertPreview.title}</h3>
              </div>
              <button
                onClick={() => setActiveCertPreview(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1F293D] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="bg-[#0A0C10] border border-[#1F293D] rounded-xl p-2 flex items-center justify-center min-h-[300px] max-h-[500px]">
              <img
                src={activeCertPreview.imageUrl}
                alt={activeCertPreview.title}
                className="max-h-[460px] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <a
                href={activeCertPreview.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#A855F7] hover:underline font-mono"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Full Certificate Image in New Tab</span>
              </a>
              <button
                onClick={() => setActiveCertPreview(null)}
                className="bg-[#1F293D] hover:bg-[#2B3952] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
