import React, { useState, useCallback } from 'react';
import { FLASHCARDS } from '../constants';
import { RotateCw, Bookmark, Volume2 } from 'lucide-react';

const Flashcards: React.FC = () => {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  // Generate a soft paper-like sound using Web Audio API
  const playFlipSound = useCallback(() => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    try {
        const ctx = new AudioContext();
        // Create a short white noise burst
        const bufferSize = ctx.sampleRate * 0.1; // 100ms
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        // Filter to make it sound soft (Lowpass)
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        const gainNode = ctx.createGain();
        // Rapid envelope for percussive sound
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        noise.start();
    } catch (error) {
        console.error("Audio play failed", error);
    }
  }, []);

  const toggleFlip = (id: string) => {
    playFlipSound();
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(id)) {
      newFlipped.delete(id);
    } else {
      newFlipped.add(id);
    }
    setFlippedCards(newFlipped);
  };

  return (
    <div className="container mx-auto px-4 py-12">
       <div className="flex justify-between items-end mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
           <h1 className="text-3xl font-black text-secondary dark:text-white mb-2">المصطلحات القانونية</h1>
           <p className="text-slate-500 text-sm">مراجعة سريعة للمفاهيم الأساسية والسندات القانونية.</p>
        </div>
        <div className="flex gap-3">
             <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs font-bold bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <Volume2 className="w-3 h-3" />
                <span>الصوت مفعل</span>
            </div>
            <button className="flex items-center gap-2 text-secondary dark:text-slate-300 hover:text-primary transition font-bold text-sm bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                <Bookmark className="w-4 h-4" /> المحفوظات
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {FLASHCARDS.map((card) => (
          <div 
            key={card.id} 
            className="h-72 cursor-pointer perspective-1000 group"
            onClick={() => toggleFlip(card.id)}
          >
            <div className={`relative w-full h-full transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] transform-style-3d ${flippedCards.has(card.id) ? 'rotate-y-180' : ''}`}>
              
              {/* Front */}
              <div className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center hover:border-primary transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary-light mb-8 rounded-full"></div>
                <h3 className="text-2xl font-bold text-secondary dark:text-white mb-2 leading-tight">{card.term}</h3>
                <span className="text-xs text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded mt-2">ID: {card.id.toUpperCase()}</span>
                
                <div className="mt-auto text-primary text-xs flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  <RotateCw className="w-3 h-3" /> انقر للقلب
                </div>
              </div>

              {/* Back */}
              <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center text-center border border-slate-700">
                <p className="font-medium text-lg mb-6 leading-relaxed text-slate-200">{card.definition}</p>
                <div className="mt-auto border-t border-slate-700/50 pt-4 w-full bg-slate-800/50 rounded-xl p-3">
                  <span className="text-primary-light text-xs font-bold uppercase tracking-widest block mb-1">السند القانوني</span>
                  <span className="text-sm font-mono text-white">{card.lawReference}</span>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default Flashcards;