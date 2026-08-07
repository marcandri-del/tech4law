import React, { useState, useCallback, useEffect } from 'react';
import { ALL_FLASHCARDS } from '../constants_flashcards';
import { FLASHCARDS as FALLBACK_FLASHCARDS } from '../constants';
import { RotateCw, Bookmark, Volume2, Sparkles, Search, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ACTIVE_DATASET = ALL_FLASHCARDS && ALL_FLASHCARDS.length > 0 ? ALL_FLASHCARDS : FALLBACK_FLASHCARDS;

const Flashcards: React.FC = () => {
  const { user } = useAuth();
  const userYear = (Number(user?.studyYear) || 1) as 1 | 2 | 3;

  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks'>('all');
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'civil' | 'admin' | 'criminal'>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Bookmarked Flashcards IDs
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bookmarked_flashcards');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('bookmarked_flashcards', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid flipping the card when bookmarking!
    e.preventDefault();
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter(item => item !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
    }
  };

  // Helper to categorize flashcards
  const getCardCategory = (card: { id: string, lawReference: string }) => {
    const ref = card.lawReference.toLowerCase();
    const idNum = parseInt(card.id.replace('f', ''), 10);
    if (ref.includes('مدني') || (idNum >= 1 && idNum <= 14)) return 'civil';
    if (ref.includes('عقوبات') || (idNum >= 15 && idNum <= 17)) return 'criminal';
    if (ref.includes('إداري') || (idNum >= 18 && idNum <= 20)) return 'admin';
    return 'civil';
  };

  // Get list of modules available for the user's year
  const availableModules = Array.from(
    new Set(
      ACTIVE_DATASET
        .filter(card => card.year === userYear)
        .map(card => card.module)
        .filter((mod): mod is string => !!mod)
    )
  ).sort();

  const filteredCards = ACTIVE_DATASET.filter(card => {
    if (card.year && card.year !== userYear) {
      return false;
    }
    if (activeTab === 'bookmarks' && !bookmarkedIds.includes(card.id)) {
      return false;
    }
    // Filter by module if selected
    if (selectedModule !== 'all' && card.module !== selectedModule) {
      return false;
    }
    // Filter by category
    if (selectedCategory !== 'all') {
      const cat = getCardCategory(card);
      if (cat !== selectedCategory) {
        return false;
      }
    }
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const termMatch = card.term.toLowerCase().includes(query);
      const defMatch = card.definition.toLowerCase().includes(query);
      const refMatch = card.lawReference.toLowerCase().includes(query);
      if (!termMatch && !defMatch && !refMatch) {
        return false;
      }
    }
    return true;
  });

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
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
        <div>
           <h1 className="text-3xl font-black text-secondary dark:text-white mb-2 flex items-center gap-2">المصطلحات القانونية <span className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full text-xs font-bold border border-indigo-200 dark:border-indigo-700/50">🎓 L{userYear}</span></h1>
           <p className="text-slate-500 text-sm">مراجعة سريعة للمفاهيم الأساسية والسندات القانونية بأسلوب البطاقات التفاعلية.</p>
        </div>
        <div className="flex gap-3">
             <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs font-bold bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <Volume2 className="w-3 h-3 text-primary animate-pulse" />
                <span>الصوت مفعل</span>
            </div>
            
             <button 
               onClick={() => setActiveTab(activeTab === 'all' ? 'bookmarks' : 'all')}
               className={`flex items-center gap-2 font-bold text-sm px-4 py-2.5 rounded-xl transition cursor-pointer ${activeTab === 'bookmarks' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800'}`}
             >
                 <Bookmark className={`w-4 h-4 ${activeTab === 'bookmarks' ? 'fill-current' : ''}`} /> 
                 {activeTab === 'bookmarks' ? 'عرض جميع البطاقات' : `المحفوظات (${bookmarkedIds.length})`}
             </button>
        </div>
      </div>

      {/* Module Filter Tabs & Info */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-full lg:w-auto">
          <button
            onClick={() => setSelectedModule('all')}
            className={`py-2 px-4 rounded-xl text-xs md:text-sm font-bold transition whitespace-nowrap cursor-pointer ${selectedModule === 'all' ? 'bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm font-black' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            الكل
          </button>
          {availableModules.map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`py-2 px-4 rounded-xl text-xs md:text-sm font-bold transition whitespace-nowrap cursor-pointer ${selectedModule === mod ? 'bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm font-black' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {mod}
            </button>
          ))}
        </div>

        {filteredCards.length > 0 && (
          <div className="text-slate-400 text-xs font-bold bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 whitespace-nowrap self-end lg:self-auto">
            تمت تصفية <span className="text-primary dark:text-indigo-400 font-extrabold">{filteredCards.length}</span> بطاقة من أصل <span className="text-secondary dark:text-slate-300 font-extrabold">{ACTIVE_DATASET.filter(c => c.year === userYear).length}</span>
          </div>
        )}
      </div>

      {/* Search and Advanced Filters */}
      <div className="flex flex-col md:flex-row items-stretch gap-0 mb-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 overflow-hidden transition-all duration-200">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مصطلح قانوني أو سند قانوني أو تعريف..."
            className="w-full pl-4 pr-12 py-3.5 bg-transparent border-none text-sm focus:outline-none focus:ring-0 text-right dark:text-white"
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-[1px] bg-slate-200 dark:bg-slate-800 my-2"></div>

        {/* Category Dropdown */}
        <div className="relative flex items-center bg-slate-50/50 dark:bg-slate-800/30 md:w-72 border-t md:border-t-0 border-slate-100 dark:border-slate-800/50">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <BookOpen className="w-4 h-4" />
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="w-full pl-10 pr-4 py-3.5 bg-transparent border-none text-sm focus:outline-none focus:ring-0 text-right dark:text-white appearance-none cursor-pointer font-bold"
          >
            <option value="all">كل التخصصات القانونية</option>
            <option value="civil">القانون المدني</option>
            <option value="admin">القانون الإداري</option>
            <option value="criminal">القانون الجنائي</option>
          </select>
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto p-8 shadow-sm animate-fadeIn">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            لا توجد بطاقات مطابقة حالياً
          </h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto text-sm">
            غير الفئة المختارة، المقياس، أو امسح البحث لمذاكرة مفردات قانونية أخرى.
          </p>
          <button 
            onClick={() => { setSelectedCategory('all'); setSelectedModule('all'); setSearchQuery(''); setActiveTab('all'); }} 
            className="bg-primary hover:bg-primary-light text-white font-bold py-2.5 px-6 rounded-xl transition text-sm cursor-pointer"
          >
            إعادة تعيين الفلاتر وتصفح الكل
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
          {filteredCards.map((card) => {
            const isBookmarked = bookmarkedIds.includes(card.id);
            return (
              <div 
                key={card.id} 
                className="h-72 cursor-pointer perspective-1000 group relative"
                onClick={() => toggleFlip(card.id)}
              >
                <div className={`relative w-full h-full transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] transform-style-3d ${flippedCards.has(card.id) ? 'rotate-y-180' : ''}`}>
                  
                  {/* Front */}
                  <div className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center hover:border-primary transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                    {/* Bookmark on Front card */}
                    <button 
                      onClick={(e) => toggleBookmark(card.id, e)}
                      className={`absolute top-4 left-4 p-2 text-slate-400 hover:text-yellow-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition ${isBookmarked ? 'text-yellow-500' : ''}`}
                      aria-label={isBookmarked ? "إلغاء حفظ البطاقة" : "حفظ البطاقة"}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    {card.module && (
                      <span className="absolute top-4 right-4 text-[10px] font-bold text-primary bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-100/50 dark:border-indigo-900/30">
                        {card.module}
                      </span>
                    )}

                    <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary-light mb-6 rounded-full mt-4"></div>
                    <h3 className="text-xl font-bold text-secondary dark:text-white mb-2 leading-tight px-2">{card.term}</h3>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded mt-2">ID: {card.id.toUpperCase()}</span>
                    
                    <div className="mt-auto text-primary text-xs flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      <RotateCw className="w-3 h-3" /> انقر للقلب
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center text-center border border-slate-700">
                    <p className="font-medium text-base mb-6 leading-relaxed text-slate-200">{card.definition}</p>
                    <div className="mt-auto border-t border-slate-700/50 pt-4 w-full bg-slate-800/50 rounded-xl p-3">
                      <span className="text-primary-light text-xs font-bold uppercase tracking-widest block mb-1">السند القانوني</span>
                      <span className="text-sm font-mono text-white">{card.lawReference}</span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
      
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
