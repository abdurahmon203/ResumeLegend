'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Brain, 
  Sparkles, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCw, 
  BarChart3, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  BookOpen, 
  Clock, 
  FileText, 
  Terminal,
  Zap,
  Target,
  FileCheck,
  Globe
} from 'lucide-react';
import { 
  api, 
  Resume,
  MockInterviewQuestion, 
  MockInterviewAnswer, 
  MockInterviewEvaluationResult,
  defaultMock20Questions 
} from '@/lib/api';

export function MockInterviewStudio() {
  const router = useRouter();

  // Mode states: 'setup' | 'interview' | 'results'
  const [stage, setStage] = useState<'setup' | 'interview' | 'results'>('setup');
  
  // Resumes list & selection
  const [userResumes, setUserResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  // Language selection: 'en' | 'ru' | 'tg' | 'de'
  const [interviewLanguage, setInterviewLanguage] = useState<'en' | 'ru' | 'tg' | 'de'>('en');

  // Competency state
  const [languages, setLanguages] = useState<string>('TypeScript');
  const [frameworks, setFrameworks] = useState<string>('React, Next.js');
  const [tools, setTools] = useState<string>('Docker, Git, PostgreSQL, Redis');
  const [targetRole, setTargetRole] = useState<string>('Full Stack Senior Engineer');

  // Interview state
  const [questions, setQuestions] = useState<MockInterviewQuestion[]>(defaultMock20Questions);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showHint, setShowHint] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Speech Recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Timer states
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Loading & Results states
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');
  const [evaluation, setEvaluation] = useState<MockInterviewEvaluationResult | null>(null);
  
  // Accordion filter for results view
  const [filterCategory, setFilterCategory] = useState<'all' | 'correct' | 'partial' | 'incorrect'>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  // Fetch saved user resumes on mount
  useEffect(() => {
    async function loadResumes() {
      try {
        const fetched = await api.getResumes();
        setUserResumes(fetched);
        if (fetched && fetched.length > 0) {
          setSelectedResumeId(fetched[0].id);
          setSelectedResume(fetched[0]);
          extractResumeCompetencies(fetched[0]);
        }
      } catch (e) {
        console.error('Failed to load resumes:', e);
      }
    }
    loadResumes();
  }, []);

  const extractResumeCompetencies = (cv: Resume) => {
    if (!cv || !cv.content) return;
    const content = cv.content;
    
    if (content.personal_info?.desiredPosition) {
      setTargetRole(content.personal_info.desiredPosition);
    }

    if (content.skills && content.skills.length > 0) {
      let langList: string[] = [];
      let frameworkList: string[] = [];
      let toolList: string[] = [];

      content.skills.forEach(sc => {
        const catName = (sc.category || '').toLowerCase();
        if (catName.includes('language') || catName.includes('язык')) {
          langList.push(...sc.skills);
        } else if (catName.includes('framework') || catName.includes('фреймворк') || catName.includes('front')) {
          frameworkList.push(...sc.skills);
        } else {
          toolList.push(...sc.skills);
        }
      });

      if (langList.length > 0) setLanguages(langList.join(', '));
      if (frameworkList.length > 0) setFrameworks(frameworkList.join(', '));
      if (toolList.length > 0) setTools(toolList.join(', '));
    }
  };

  const handleSelectCV = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    const found = userResumes.find(r => r.id === resumeId) || null;
    setSelectedResume(found);
    if (found) {
      extractResumeCompetencies(found);
    }
  };

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.lang = interviewLanguage === 'ru' ? 'ru-RU' : interviewLanguage === 'tg' ? 'tg-TJ' : interviewLanguage === 'de' ? 'de-DE' : 'en-US';

        recognition.onresult = (event: any) => {
          let finalChunk = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalChunk += event.results[i][0].transcript;
            }
          }
          const textToAppend = finalChunk.trim();
          if (textToAppend) {
            setAnswers(prev => {
              const currentQuestionId = questions[currentIndex]?.id || 1;
              const prevAns = (prev[currentQuestionId] || '').trim();
              if (prevAns.endsWith(textToAppend)) {
                return prev;
              }
              return {
                ...prev,
                [currentQuestionId]: prevAns ? `${prevAns} ${textToAppend}` : textToAppend
              };
            });
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [questions, currentIndex, interviewLanguage]);

  // Interview Timer
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your current browser. You can type your answers directly.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleStartInterview = async () => {
    setLoading(true);
    const langNames = { en: 'English 🇬🇧', ru: 'Русский 🇷🇺', tg: 'Тоҷикӣ 🇹🇯', de: 'Deutsch 🇩🇪' };
    setLoadingText(`Parsing selected CV "${selectedResume?.title || 'Profile'}" & generating 20 questions in ${langNames[interviewLanguage]}...`);

    const compObj = {
      languages: languages.split(',').map(s => s.trim()).filter(Boolean),
      frameworks: frameworks.split(',').map(s => s.trim()).filter(Boolean),
      tools: tools.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      const res = await api.generateMockInterview(
        compObj,
        selectedResume?.id,
        selectedResume?.content,
        interviewLanguage
      );
      setSessionId(res.session_id);
      setQuestions(res.questions && res.questions.length > 0 ? res.questions : defaultMock20Questions);
      setCurrentIndex(0);
      setAnswers({});
      setStage('interview');
      setSecondsElapsed(0);
      setTimerActive(true);
    } catch (e) {
      console.error(e);
      setQuestions(defaultMock20Questions);
      setStage('interview');
      setTimerActive(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setShowHint(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setShowHint(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmitInterview = async () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setTimerActive(false);
    setLoading(true);
    const langNames = { en: 'English', ru: 'русском языке', tg: 'забони тоҷикӣ', de: 'Deutsch' };
    setLoadingText(`AI Recruiter is grading your 20 answers & calculating diagnostics in ${langNames[interviewLanguage]}...`);

    const formattedAnswers: MockInterviewAnswer[] = questions.map(q => ({
      question_id: q.id,
      candidate_answer: answers[q.id] || ''
    }));

    try {
      const result = await api.evaluateMockInterview(
        sessionId, 
        questions, 
        formattedAnswers,
        interviewLanguage
      );
      setEvaluation(result);
      setStage('results');
    } catch (e) {
      console.error(e);
      alert('Error evaluating interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex] || questions[0];
  const currentAnswerText = answers[currentQ?.id || 1] || '';
  const answeredCount = Object.keys(answers).filter(k => (answers[Number(k)] || '').trim().length > 0).length;

  return (
    <div className="w-full space-y-6">
      
      {/* Hero Banner Header inside Dashboard */}
      <div className="border border-[#1F293D] bg-gradient-to-r from-[#11131A] via-[#161B26] to-[#11131A] p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A855F7]/10 border border-[#A855F7]/30 text-[#A855F7] text-xs font-mono font-semibold">
            <Brain className="h-3.5 w-3.5" />
            <span>AI Recruiter Simulation Engine</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            💬 AI Mock Interview Assistant
          </h2>
          <p className="text-xs text-gray-400 max-w-2xl font-sans">
            Select your CV and choose your interview language (🇬🇧 English, 🇷🇺 Русский, 🇹🇯 Тоҷикӣ, 🇩🇪 Deutsch). AI derives 20 targeted recruiter questions directly from your CV projects & experiences!
          </p>
        </div>

        {stage === 'interview' && (
          <div className="flex items-center gap-4 bg-[#0A0C10]/80 border border-[#1F293D] p-3 px-5 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#3B82F6] animate-pulse" />
              <span className="font-mono text-sm font-bold text-white">{formatTime(secondsElapsed)}</span>
            </div>
            <div className="h-4 w-[1px] bg-[#1F293D]" />
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[#10B981]" />
              <span className="font-mono text-xs text-gray-300 font-semibold">{answeredCount} / {questions.length} Answered</span>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-[#0A0C10]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-[#A855F7] animate-spin" />
            <Brain className="h-7 w-7 text-[#A855F7] absolute inset-0 m-auto" />
          </div>
          <h3 className="mt-6 text-lg font-bold text-white font-mono">{loadingText}</h3>
          <p className="mt-2 text-xs text-gray-400 font-mono">Analyzing project architecture, state management, and language constraints...</p>
        </div>
      )}

      {/* STAGE 1: SETUP VIEW */}
      {stage === 'setup' && (
        <div className="space-y-6">
          <div className="bg-[#11131A] border border-[#1F293D] rounded-3xl p-8 shadow-2xl space-y-8">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1F293D] pb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
                  <FileCheck className="h-5 w-5 text-[#A855F7]" />
                  <span>Select CV & Interview Language</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Choose which CV you want the AI to interview you on and select the language for all 20 questions.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 text-xs font-mono font-bold">
                AI CV Parser Active
              </span>
            </div>

            {/* 1. SELECT CV CARD GRID */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider block flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#A855F7]" />
                <span>1. Choose Candidate CV to Interview On</span>
              </label>

              {userResumes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userResumes.map((cv) => {
                    const isSelected = cv.id === selectedResumeId;
                    const projectsCount = cv.content?.projects?.length || 0;
                    return (
                      <div
                        key={cv.id}
                        onClick={() => handleSelectCV(cv.id)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                          isSelected
                            ? 'bg-purple-950/20 border-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                            : 'bg-[#0A0C10] border-[#1F293D] hover:border-gray-600'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#A855F7] flex items-center justify-center text-white">
                            <Check className="h-3 w-3" />
                          </div>
                        )}

                        <div className="space-y-1 pr-6">
                          <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                            {cv.template_name || 'CV Document'}
                          </span>
                          <h4 className="text-sm font-bold text-white line-clamp-1 font-sans">
                            {cv.title}
                          </h4>
                          <p className="text-xs text-gray-400 font-mono">
                            {cv.content?.personal_info?.fullName || 'Candidate'} • {cv.content?.personal_info?.desiredPosition || 'Software Engineer'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 border-t border-[#1F293D]/60 pt-2">
                          <span>{projectsCount} CV Projects</span>
                          <span>{cv.content?.skills?.length || 0} Skill Categories</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-[#0A0C10] border border-[#1F293D] rounded-xl text-xs font-mono text-gray-400">
                  No saved CVs found. Your default profile will be used to generate your 20 interview questions.
                </div>
              )}
            </div>

            {/* 2. SELECT INTERVIEW LANGUAGE */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider block flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#3B82F6]" />
                <span>2. Choose Interview Language</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'en', label: 'English 🇬🇧', flag: '🇬🇧' },
                  { id: 'ru', label: 'Русский 🇷🇺', flag: '🇷🇺' },
                  { id: 'tg', label: 'Тоҷикӣ 🇹🇯', flag: '🇹🇯' },
                  { id: 'de', label: 'Deutsch 🇩🇪', flag: '🇩🇪' },
                ].map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setInterviewLanguage(lang.id as any)}
                    className={`p-3.5 rounded-xl font-mono text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                      interviewLanguage === lang.id
                        ? 'bg-[#3B82F6] text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                        : 'bg-[#0A0C10] border-[#1F293D] text-gray-400 hover:text-white hover:border-gray-600'
                    }`}
                  >
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartInterview}
              className="w-full py-4 bg-[#A855F7] hover:bg-purple-600 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_25px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-mono"
            >
              <span>🚀 Launch 20-Question AI Mock Interview ({interviewLanguage.toUpperCase()})</span>
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>
        </div>
      )}

      {/* STAGE 2: INTERVIEW ROOM VIEW */}
      {stage === 'interview' && (
        <div className="space-y-6">
          
          {/* Question Progress Bar */}
          <div className="bg-[#11131A] border border-[#1F293D] rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400 font-bold">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-[#A855F7] font-bold">
                  {Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-[#0A0C10] h-2 rounded-full overflow-hidden border border-[#1F293D]">
                <div 
                  className="bg-gradient-to-r from-[#A855F7] to-[#3B82F6] h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-[#11131A] border border-[#1F293D] rounded-3xl p-8 shadow-2xl space-y-6 relative">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F293D] pb-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-[#A855F7]/15 border border-[#A855F7]/30 text-[#A855F7] text-xs font-mono font-bold">
                  {currentQ.technology}
                </span>
                <span className="px-3 py-1 rounded-lg bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#3B82F6] text-xs font-mono font-bold uppercase">
                  {currentQ.type}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                  currentQ.difficulty === 'Senior'
                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                    : currentQ.difficulty === 'Mid'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  {currentQ.difficulty} Level
                </span>
              </div>

              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <Lightbulb className="h-4 w-4" />
                <span>{showHint ? 'Hide Recruiter Hint' : 'Show Recruiter Hint'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <h3 className="text-lg md:text-xl font-semibold text-white leading-relaxed font-sans">
                {currentQ.question}
              </h3>

              {showHint && (
                <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl text-xs text-amber-200 font-mono animate-fadeIn flex items-start gap-3">
                  <Lightbulb className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-1">Recruiter Hint:</span>
                    {currentQ.hint}
                  </div>
                </div>
              )}
            </div>

            {/* Answer Input Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <span>Your Answer ({interviewLanguage.toUpperCase()})</span>
                  {answers[currentQ.id]?.trim() && (
                    <span className="text-[#10B981] text-[10px] font-normal lowercase">(saved)</span>
                  )}
                </label>

                {/* Speech Dictation Button */}
                <button
                  onClick={toggleSpeech}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                    isListening
                      ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                      : 'bg-[#1F293D] hover:bg-[#2B3952] border-[#303E57] text-gray-300 hover:text-white'
                  }`}
                >
                  {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5 text-[#A855F7]" />}
                  <span>{isListening ? 'Stop Speech Dictation' : '🎤 Speech-to-Text'}</span>
                </button>
              </div>

              <textarea
                value={currentAnswerText}
                onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                placeholder={`Type your technical answer here in ${interviewLanguage.toUpperCase()} or click '🎤 Speech-to-Text' to speak...`}
                rows={6}
                className="w-full bg-[#0A0C10] border border-[#1F293D] focus:border-[#A855F7] rounded-2xl p-4 text-sm text-gray-100 font-sans focus:outline-none transition-colors resize-y leading-relaxed"
              />

              <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                <span>{currentAnswerText.length} characters</span>
                <span>Key Points: {currentQ.key_points.slice(0, 2).join(' • ')}</span>
              </div>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1F293D]">
              <button
                onClick={handlePrevQuestion}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1F293D] bg-[#0A0C10] hover:bg-[#161B26] text-xs font-mono font-bold text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#A855F7] hover:bg-purple-600 text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitInterview}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer uppercase tracking-wider"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Submit & Grade Interview</span>
                </button>
              )}
            </div>
          </div>

          {/* Questions Grid Quick Stepper */}
          <div className="bg-[#11131A] border border-[#1F293D] rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
              Question Stepper Matrix (Click to Jump)
            </h4>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = (answers[q.id] || '').trim().length > 0;
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setShowHint(false);
                      setCurrentIndex(idx);
                    }}
                    className={`h-9 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer border ${
                      isCurrent
                        ? 'bg-[#A855F7] text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                        : isAnswered
                          ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                          : 'bg-[#0A0C10] text-gray-500 border-[#1F293D] hover:text-white hover:border-gray-600'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* STAGE 3: DETAILED AI EVALUATION & ANALYTICS DASHBOARD */}
      {stage === 'results' && evaluation && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* HERO SCORE BANNER */}
          <div className="bg-[#11131A] border border-[#1F293D] rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            
            <div className="space-y-3 text-center md:text-left z-10">
              <span className="px-3 py-1 rounded-full bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/30 text-xs font-mono font-bold">
                AI Evaluation Verdict Complete ({interviewLanguage.toUpperCase()})
              </span>
              <h3 className="text-2xl font-extrabold text-white font-sans">
                {evaluation.verdict}
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Session duration: {formatTime(secondsElapsed)} • Evaluated {evaluation.evaluations.length} responses from "{selectedResume?.title || 'CV'}"
              </p>
            </div>

            {/* Ring Score Gauge */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle 
                    cx="64" cy="64" r="54" 
                    stroke="#1F293D" strokeWidth="10" fill="transparent" 
                  />
                  <circle 
                    cx="64" cy="64" r="54" 
                    stroke={evaluation.overall_score >= 80 ? '#10B981' : evaluation.overall_score >= 60 ? '#F59E0B' : '#EF4444'} 
                    strokeWidth="10" 
                    strokeDasharray={339.29} 
                    strokeDashoffset={339.29 - (339.29 * evaluation.overall_score) / 100}
                    strokeLinecap="round"
                    fill="transparent" 
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold font-mono text-white">
                    {evaluation.overall_score}%
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 uppercase">Score</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 z-10">
              <button
                onClick={() => setStage('setup')}
                className="px-5 py-3 rounded-xl bg-[#A855F7] hover:bg-purple-600 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
              >
                <RotateCw className="h-4 w-4" />
                <span>Retake Interview</span>
              </button>
            </div>

          </div>

          {/* VISUAL CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Chart 1: Answer Accuracy Donut Breakdown (5 Cols) */}
            <div className="lg:col-span-5 bg-[#11131A] border border-[#1F293D] rounded-3xl p-6 flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="h-4.5 w-4.5 text-[#A855F7]" />
                  <span>Answer Accuracy Distribution</span>
                </h4>
                <p className="text-xs text-gray-400 mt-1">Breakdown of 20 question performance</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#10B981] font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Correct Answers
                    </span>
                    <span className="font-bold text-white">{evaluation.total_correct} ({Math.round((evaluation.total_correct/20)*100)}%)</span>
                  </div>
                  <div className="w-full bg-[#0A0C10] h-3 rounded-full overflow-hidden border border-[#1F293D]">
                    <div className="bg-[#10B981] h-full transition-all duration-700" style={{ width: `${(evaluation.total_correct/20)*100}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#F59E0B] font-bold flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" /> Partially Correct
                    </span>
                    <span className="font-bold text-white">{evaluation.total_partially_correct} ({Math.round((evaluation.total_partially_correct/20)*100)}%)</span>
                  </div>
                  <div className="w-full bg-[#0A0C10] h-3 rounded-full overflow-hidden border border-[#1F293D]">
                    <div className="bg-[#F59E0B] h-full transition-all duration-700" style={{ width: `${(evaluation.total_partially_correct/20)*100}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#EF4444] font-bold flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5" /> Needs Work / Incomplete
                    </span>
                    <span className="font-bold text-white">{evaluation.total_incorrect} ({Math.round((evaluation.total_incorrect/20)*100)}%)</span>
                  </div>
                  <div className="w-full bg-[#0A0C10] h-3 rounded-full overflow-hidden border border-[#1F293D]">
                    <div className="bg-[#EF4444] h-full transition-all duration-700" style={{ width: `${(evaluation.total_incorrect/20)*100}%` }} />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1F293D] flex justify-around text-center text-xs font-mono">
                <div>
                  <span className="block text-lg font-bold text-[#10B981]">{evaluation.total_correct}</span>
                  <span className="text-[10px] text-gray-400">Passed</span>
                </div>
                <div className="w-[1px] bg-[#1F293D]" />
                <div>
                  <span className="block text-lg font-bold text-[#F59E0B]">{evaluation.total_partially_correct}</span>
                  <span className="text-[10px] text-gray-400 font-mono">Partial</span>
                </div>
                <div className="w-[1px] bg-[#1F293D]" />
                <div>
                  <span className="block text-lg font-bold text-[#EF4444]">{evaluation.total_incorrect}</span>
                  <span className="text-[10px] text-gray-400 font-mono">Failed</span>
                </div>
              </div>
            </div>

            {/* Chart 2: Tech Competency Breakdown Bars (7 Cols) */}
            <div className="lg:col-span-7 bg-[#11131A] border border-[#1F293D] rounded-3xl p-6 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Zap className="h-4.5 w-4.5 text-[#3B82F6]" />
                  <span>Technology Skill Competency Radar</span>
                </h4>
                <p className="text-xs text-gray-400 mt-1">Score percentage computed per CV technology</p>
              </div>

              <div className="space-y-4">
                {Object.entries(evaluation.tech_breakdown || {}).map(([tech, score]) => (
                  <div key={tech} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-gray-200 font-bold">{tech}</span>
                      <span className="font-bold text-[#A855F7]">{score}%</span>
                    </div>
                    <div className="w-full bg-[#0A0C10] h-2.5 rounded-full overflow-hidden border border-[#1F293D]">
                      <div 
                        className="bg-gradient-to-r from-[#A855F7] to-[#3B82F6] h-full transition-all duration-1000" 
                        style={{ width: `${score}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* DIAGNOSTICS: CANDIDATE WEAKNESSES ("What is bad & needs practice") */}
          <div className="bg-[#11131A] border border-red-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-[#1F293D] pb-5">
              <AlertTriangle className="h-6 w-6 text-red-500 shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-white font-mono">
                  Diagnostic Analysis: Conceptual Gaps & Areas to Practice
                </h4>
                <p className="text-xs text-gray-400">
                  Specific technical weaknesses identified by the AI interviewer during your 20-question evaluation
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluation.weaknesses.map((weakness, i) => (
                <div key={i} className="bg-[#0A0C10] border border-red-500/20 p-4 rounded-2xl flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-200 leading-relaxed font-sans font-medium">{weakness}</span>
                </div>
              ))}
            </div>

            {/* Practice Recommendations */}
            <div className="pt-4 border-t border-[#1F293D] space-y-3">
              <h4 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#10B981]" />
                <span>Personalized Actionable Practice Plan</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {evaluation.practice_recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-[#0A0C10] border border-[#1F293D] p-3.5 rounded-xl text-xs text-gray-300 flex items-start gap-2.5 font-sans">
                    <span className="w-5 h-5 rounded-full bg-[#10B981]/20 text-[#10B981] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COMPLETE 20-QUESTION ACCORDION REVIEW */}
          <div className="bg-[#11131A] border border-[#1F293D] rounded-3xl p-8 shadow-2xl space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1F293D] pb-5">
              <div>
                <h4 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#A855F7]" />
                  <span>20 Questions Complete AI Breakdown ({interviewLanguage.toUpperCase()})</span>
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Compare your answers with ideal recruiter responses and AI feedback
                </p>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-2 bg-[#0A0C10] border border-[#1F293D] p-1.5 rounded-xl">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    filterCategory === 'all' ? 'bg-[#A855F7] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All (20)
                </button>
                <button
                  onClick={() => setFilterCategory('correct')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    filterCategory === 'correct' ? 'bg-[#10B981] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Correct
                </button>
                <button
                  onClick={() => setFilterCategory('partial')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    filterCategory === 'partial' ? 'bg-[#F59E0B] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Partial
                </button>
                <button
                  onClick={() => setFilterCategory('incorrect')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    filterCategory === 'incorrect' ? 'bg-[#EF4444] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Needs Work
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {evaluation.evaluations
                .filter(item => filterCategory === 'all' || item.status === filterCategory)
                .map((item) => {
                  const isExpanded = expandedQuestionId === item.question_id;
                  return (
                    <div 
                      key={item.question_id}
                      className="bg-[#0A0C10] border border-[#1F293D] rounded-2xl overflow-hidden transition-all"
                    >
                      {/* Question Header Row */}
                      <button
                        onClick={() => setExpandedQuestionId(isExpanded ? null : item.question_id)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#11141F] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                            item.status === 'correct'
                              ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                              : item.status === 'partial'
                                ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'
                                : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                          }`}>
                            Q{item.question_id}
                          </span>
                          
                          <div className="min-w-0">
                            <span className="text-xs font-mono text-purple-400 font-bold block">
                              [{item.technology}]
                            </span>
                            <h4 className="text-sm font-semibold text-white truncate font-sans">
                              {item.question}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border uppercase ${
                            item.status === 'correct'
                              ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                              : item.status === 'partial'
                                ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                                : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                          }`}>
                            {item.status} ({item.score}/10)
                          </span>

                          {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="p-5 pt-0 border-t border-[#1F293D] space-y-4 bg-[#11131A]/50">
                          
                          {/* Candidate Answer */}
                          <div className="space-y-1 pt-4">
                            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Your Submitted Answer:</span>
                            <div className="p-3 bg-[#0A0C10] border border-[#1F293D] rounded-xl text-xs text-gray-300 font-sans leading-relaxed">
                              {item.candidate_answer}
                            </div>
                          </div>

                          {/* AI Critique Feedback */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">AI Recruiter Critique:</span>
                            <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl text-xs text-purple-200 font-sans leading-relaxed">
                              {item.feedback}
                            </div>
                          </div>

                          {/* Recruiter Model Answer */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Ideal Recruiter Model Answer:</span>
                            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 font-sans leading-relaxed">
                              {item.model_answer}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
