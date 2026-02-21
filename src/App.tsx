/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView, animate } from 'motion/react';
import { 
  Sparkles, 
  Calendar, 
  User, 
  ArrowRight, 
  RefreshCw,
  Star,
  Compass,
  Heart,
  Shield,
  LayoutGrid,
  BarChart3,
  Network,
  Share2,
  Check,
  Copy
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer,
  Tooltip,
  Cell
} from 'recharts';
import { calculateLifePath, calculateNameNumbers, getNumberMeaning, NumerologyResult } from './lib/numerology';
import { cn } from './lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function Counter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
      });
      return () => controls.stop();
    }
  }, [value, isInView]);

  return <span ref={nodeRef}>{displayValue}</span>;
}

function CosmicHierarchy({ result }: { result: NumerologyResult }) {
  return (
    <div className="relative py-12 flex flex-col items-center">
      {/* Central Node: Life Path */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "backOut" }}
        className="relative z-20 flex flex-col items-center"
      >
        <div className="w-24 h-24 rounded-full bg-[#ff4e00] flex items-center justify-center shadow-[0_0_40px_rgba(255,78,0,0.4)] border-4 border-[#0a0502]">
          <span className="text-3xl font-serif font-bold text-white">{result.lifePath}</span>
        </div>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] font-bold text-[#ff4e00]">Life Path</p>
      </motion.div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 400 300">
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          d="M200 100 L100 200 M200 100 L200 200 M200 100 L300 200"
          stroke="#ff4e00"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      {/* Secondary Nodes */}
      <div className="flex justify-between w-full max-w-md mt-12 relative z-10">
        {[
          { label: "Expression", val: result.expression, icon: <Star className="w-4 h-4" /> },
          { label: "Soul Urge", val: result.soulUrge, icon: <Heart className="w-4 h-4" /> },
          { label: "Personality", val: result.personality, icon: <Shield className="w-4 h-4" /> }
        ].map((node, i) => (
          <motion.div
            key={node.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 + (i * 0.2) }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#1a1614] border-2 border-[#ff4e00]/30 flex items-center justify-center group hover:border-[#ff4e00] transition-colors">
              <span className="text-xl font-serif font-bold text-[#f5f2ed]">{node.val}</span>
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-widest text-[#f5f2ed]/40">{node.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [reading, setReading] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [copied, setCopied] = useState(false);

  const chartData = useMemo(() => {
    if (!result) return [];
    return [
      { subject: 'Life Path', A: result.lifePath, fullMark: 33 },
      { subject: 'Expression', A: result.expression, fullMark: 33 },
      { subject: 'Soul Urge', A: result.soulUrge, fullMark: 33 },
      { subject: 'Personality', A: result.personality, fullMark: 33 },
      { subject: 'Birth Day', A: result.birthDay % 9 || 9, fullMark: 9 },
    ];
  }, [result]);

  // Handle URL parameters for shared readings
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedName = params.get('name');
    const sharedDob = params.get('dob');

    if (sharedName && sharedDob) {
      setName(sharedName);
      setDob(sharedDob);
      // We can't call handleCalculate directly because it's an event handler
      // but we can trigger the logic
      performCalculation(sharedName, sharedDob);
    }
  }, []);

  const performCalculation = async (inputName: string, inputDob: string) => {
    setLoading(true);
    const lifePath = calculateLifePath(inputDob);
    const nameNums = calculateNameNumbers(inputName);
    const birthDay = parseInt(inputDob.split('-')[2]);

    const res: NumerologyResult = {
      lifePath,
      ...nameNums,
      birthDay
    };

    setResult(res);
    setStep('result');

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `As an expert numerologist, provide a vibrant and insightful reading for someone with these numbers:
        Name: ${inputName}
        Life Path: ${res.lifePath}
        Expression: ${res.expression}
        Soul Urge: ${res.soulUrge}
        Personality: ${res.personality}
        
        Structure your response with:
        1. A brief "Cosmic Essence" summary.
        2. Detailed breakdown of each core number.
        3. A "Life Strategy" for their current path.
        4. A mystical closing thought.
        
        Keep it encouraging and mystical. Use markdown formatting.`,
      });
      setReading(response.text || 'The stars are silent for a moment. Please try again.');
    } catch (error) {
      console.error("Gemini Error:", error);
      setReading("The cosmic connection was interrupted. But your numbers still hold power!");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob) return;
    performCalculation(name, dob);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?name=${encodeURIComponent(name)}&dob=${encodeURIComponent(dob)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Aura Numerology Reading for ${name}`,
          text: `Check out my cosmic numerology reading! My Life Path is ${result?.lifePath}.`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  const reset = () => {
    setStep('input');
    setResult(null);
    setReading('');
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-[#f5f2ed] font-sans selection:bg-[#ff4e00] selection:text-white overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#3a1510] rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ff4e00] rounded-full blur-[120px] opacity-20" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-24">
        <AnimatePresence mode="wait">
          {step === 'input' ? (
            <motion.div
              key="input-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <header className="text-center space-y-4">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ff4e00]/10 border border-[#ff4e00]/20 mb-4"
                >
                  <Sparkles className="w-8 h-8 text-[#ff4e00]" />
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight leading-tight">
                  Aura <span className="italic text-[#ff4e00]">Numerology</span>
                </h1>
                <p className="text-lg text-[#f5f2ed]/60 max-w-xl mx-auto font-light">
                  Unlock the hidden vibrations of your name and birth date. A cosmic blueprint for your soul's journey.
                </p>
              </header>

              <form onSubmit={handleCalculate} className="max-w-md mx-auto space-y-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] font-semibold text-[#f5f2ed]/40 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#f5f2ed]/30" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your birth name"
                      className="w-full bg-[#1a1614] border border-[#f5f2ed]/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#ff4e00]/50 transition-colors placeholder:text-[#f5f2ed]/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] font-semibold text-[#f5f2ed]/40 ml-1">Birth Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#f5f2ed]/30" />
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-[#1a1614] border border-[#f5f2ed]/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#ff4e00]/50 transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group relative overflow-hidden bg-[#ff4e00] text-white rounded-2xl py-4 font-semibold tracking-wide transition-all hover:shadow-[0_0_30px_rgba(255,78,0,0.3)] disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Consulting the Stars...
                      </>
                    ) : (
                      <>
                        Reveal My Path
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="result-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={reset}
                    className="flex items-center gap-2 text-sm text-[#f5f2ed]/40 hover:text-[#ff4e00] transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    New Calculation
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 text-sm text-[#f5f2ed]/40 hover:text-[#ff4e00] transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                    {copied ? 'Link Copied!' : 'Share Reading'}
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-[#f5f2ed]/40">Reading for</p>
                  <p className="text-xl font-serif italic">{name}</p>
                </div>
              </div>

              {/* SECTION 1: Hierarchy Summary */}
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <Network className="w-5 h-5 text-[#ff4e00]" />
                  <h2 className="text-sm uppercase tracking-[0.3em] font-bold text-[#f5f2ed]/60">Cosmic Blueprint</h2>
                </div>
                <div className="bg-[#1a1614]/50 border border-[#f5f2ed]/5 rounded-[2.5rem] p-8">
                  {result && <CosmicHierarchy result={result} />}
                </div>
              </section>

              {/* SECTION 2: Visual Graph & Detailed Cards */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-[#ff4e00]" />
                    <h2 className="text-sm uppercase tracking-[0.3em] font-bold text-[#f5f2ed]/60">Vibrational Spectrum</h2>
                  </div>
                  <div className="bg-[#1a1614]/50 border border-[#f5f2ed]/5 rounded-[2.5rem] p-6 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="rgba(245, 242, 237, 0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(245, 242, 237, 0.4)', fontSize: 10 }} />
                        <Radar
                          name="Vibration"
                          dataKey="A"
                          stroke="#ff4e00"
                          fill="#ff4e00"
                          fillOpacity={0.3}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1614', border: '1px solid rgba(255, 78, 0, 0.2)', borderRadius: '12px' }}
                          itemStyle={{ color: '#ff4e00' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="w-5 h-5 text-[#ff4e00]" />
                    <h2 className="text-sm uppercase tracking-[0.3em] font-bold text-[#f5f2ed]/60">Core Dimensions</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: "Life Path", number: result?.lifePath || 0, icon: <Compass className="w-5 h-5" />, description: "Your core purpose and the path you'll walk in this lifetime." },
                      { title: "Expression", number: result?.expression || 0, icon: <Star className="w-5 h-5" />, description: "Your natural talents, abilities, and potential shortcomings." },
                      { title: "Soul Urge", number: result?.soulUrge || 0, icon: <Heart className="w-5 h-5" />, description: "Your inner desires, what truly makes your heart sing." },
                      { title: "Personality", number: result?.personality || 0, icon: <Shield className="w-5 h-5" />, description: "How others perceive you and the mask you wear in the world." }
                    ].map((item, index) => (
                      <NumberCard 
                        key={item.title}
                        index={index}
                        title={item.title} 
                        number={item.number} 
                        icon={item.icon}
                        description={item.description}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* SECTION 3: Detailed AI Explanation */}
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#ff4e00]" />
                  <h2 className="text-sm uppercase tracking-[0.3em] font-bold text-[#f5f2ed]/60">The Long Explanation</h2>
                </div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative p-8 md:p-12 rounded-[2.5rem] bg-[#1a1614] border border-[#f5f2ed]/5 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles className="w-24 h-24 text-[#ff4e00]" />
                  </div>
                  
                  <h3 className="text-2xl font-serif italic mb-8 flex items-center gap-3">
                    <div className="w-8 h-[1px] bg-[#ff4e00]" />
                    Cosmic Insight
                  </h3>

                  {loading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-[#f5f2ed]/10 rounded w-3/4" />
                      <div className="h-4 bg-[#f5f2ed]/10 rounded w-full" />
                      <div className="h-4 bg-[#f5f2ed]/10 rounded w-5/6" />
                      <div className="h-4 bg-[#f5f2ed]/10 rounded w-2/3" />
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-orange max-w-none">
                      <div className="markdown-body">
                        <Markdown>{reading}</Markdown>
                      </div>
                    </div>
                  )}
                </motion.div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center border-t border-[#f5f2ed]/5">
        <p className="text-xs uppercase tracking-[0.3em] text-[#f5f2ed]/20">
          Guided by the ancient wisdom of numbers
        </p>
      </footer>
    </div>
  );
}

function NumberCard({ title, number, icon, description, index }: { title: string, number: number, icon: React.ReactNode, description: string, index: number }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98] 
      }}
      whileHover={{ 
        y: -4,
        backgroundColor: "rgba(26, 22, 20, 0.8)",
        borderColor: "rgba(255, 78, 0, 0.3)",
      }}
      className="p-5 rounded-3xl bg-[#1a1614] border border-[#f5f2ed]/5 transition-all group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff4e00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
            className="p-2 rounded-xl bg-[#ff4e00]/5 text-[#ff4e00]"
          >
            {icon}
          </motion.div>
          
          <div 
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full mb-3 right-0 w-48 p-3 bg-[#1a1614] border border-[#ff4e00]/30 rounded-xl shadow-2xl z-50 text-[10px] leading-tight text-[#f5f2ed]/90 italic pointer-events-none"
                >
                  {getNumberMeaning(number)}
                  <div className="absolute top-full right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#ff4e00]/30" />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="text-4xl font-serif font-bold text-[#ff4e00] group-hover:scale-110 transition-transform duration-500 cursor-help">
              <Counter value={number} />
            </div>
          </div>
        </div>
        <h4 className="text-base font-medium mb-1">{title}</h4>
        <p className="text-xs text-[#f5f2ed]/40 leading-relaxed mb-3">{description}</p>
        <div className="pt-3 border-t border-[#f5f2ed]/5">
          <p className="text-[10px] italic text-[#f5f2ed]/60 uppercase tracking-wider">
            {getNumberMeaning(number)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
