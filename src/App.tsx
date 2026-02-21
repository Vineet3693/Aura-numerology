/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, animate } from 'motion/react';
import { 
  Sparkles, 
  Calendar, 
  User, 
  ArrowRight, 
  Info, 
  Moon, 
  Sun, 
  RefreshCw,
  Star,
  Compass,
  Heart,
  Shield
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
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

export default function App() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [reading, setReading] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'result'>('input');

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob) return;

    setLoading(true);
    const lifePath = calculateLifePath(dob);
    const nameNums = calculateNameNumbers(name);
    const birthDay = parseInt(dob.split('-')[2]);

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
        Name: ${name}
        Life Path: ${res.lifePath}
        Expression: ${res.expression}
        Soul Urge: ${res.soulUrge}
        Personality: ${res.personality}
        
        Focus on their strengths, potential challenges, and a cosmic advice for their current path. Keep it encouraging and mystical. Use markdown formatting.`,
      });
      setReading(response.text || 'The stars are silent for a moment. Please try again.');
    } catch (error) {
      console.error("Gemini Error:", error);
      setReading("The cosmic connection was interrupted. But your numbers still hold power!");
    } finally {
      setLoading(false);
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

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-24">
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
              className="space-y-12"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={reset}
                  className="flex items-center gap-2 text-sm text-[#f5f2ed]/40 hover:text-[#ff4e00] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  New Calculation
                </button>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-[#f5f2ed]/40">Reading for</p>
                  <p className="text-xl font-serif italic">{name}</p>
                </div>
              </div>

              {/* Numbers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* AI Reading Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative p-8 md:p-12 rounded-[2rem] bg-[#1a1614] border border-[#f5f2ed]/5 overflow-hidden"
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
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.15,
        ease: [0.21, 0.47, 0.32, 0.98] 
      }}
      whileHover={{ 
        y: -8,
        backgroundColor: "rgba(26, 22, 20, 0.8)",
        borderColor: "rgba(255, 78, 0, 0.3)",
      }}
      className="p-6 rounded-3xl bg-[#1a1614] border border-[#f5f2ed]/5 transition-all group relative overflow-hidden"
    >
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff4e00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.15 + 0.3, type: "spring", stiffness: 200 }}
            className="p-3 rounded-2xl bg-[#ff4e00]/5 text-[#ff4e00]"
          >
            {icon}
          </motion.div>
          <div className="text-5xl font-serif font-bold text-[#ff4e00] group-hover:scale-110 transition-transform duration-500">
            <Counter value={number} />
          </div>
        </div>
        <h4 className="text-lg font-medium mb-2">{title}</h4>
        <p className="text-sm text-[#f5f2ed]/40 leading-relaxed mb-4">{description}</p>
        <div className="pt-4 border-t border-[#f5f2ed]/5">
          <p className="text-xs italic text-[#f5f2ed]/60">
            {getNumberMeaning(number)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
