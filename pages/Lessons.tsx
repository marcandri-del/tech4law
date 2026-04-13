import React, { useState } from 'react';
import { LESSONS } from '../constants';
import { BookOpen, Sparkles, Clock, ChevronLeft, PlayCircle, Bookmark, FileText, CheckCircle2 } from 'lucide-react';
import { generateExplanation } from '../services/geminiService';

const Lessons: React.FC = () => {
  const [activeYear, setActiveYear] = useState<1 | 2 | 3>(1);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', text: '' });
  const [loadingAi, setLoadingAi] = useState(false);

  const filteredLessons = LESSONS.filter(l => l.year === activeYear);

  const handleExplain = async (title: string, summary: string) => {
    setAiModalOpen(true);
    setModalContent({ title: `شرح: ${title}`, text: 'جاري تحضير الشرح...' });
    setLoadingAi(true);
    
    const explanation = await generateExplanation(title, summary);
    
    setModalContent({ title: `شرح: ${title}`, text: explanation });
    setLoadingAi(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-16 pb-12 px-4">
          <div className="container mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">المحاضرات والدروس</h1>
                    <p className="text-slate-500 text-lg">مكتبة شاملة للمقاييس الجامعية مدعمة بالشرح الذكي.</p>
                </div>
                {/* Year Tabs */}
                <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl inline-flex">
                    {[1, 2, 3].map((year) => (
                    <button
                        key={year}
                        onClick={() => setActiveYear(year as 1|2|3)}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                        activeYear === year 
                            ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        السنة {year === 1 ? 'الأولى' : year === 2 ? 'الثانية' : 'الثالثة'}
                    </button>
                    ))}
                </div>
             </div>
          </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        <div className="grid lg:grid-cols-1 gap-6 max-w-4xl mx-auto">
            {filteredLessons.map((lesson, index) => (
                <div key={lesson.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row gap-6 group">
                    
                    {/* Visual Indicator */}
                    <div className="w-full md:w-48 bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center flex-shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                        <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm mb-3 text-primary">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">مقياس أساسي</span>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">وحدة {index + 1}</div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{lesson.title}</h3>
                            <button className="text-slate-400 hover:text-primary transition">
                                <Bookmark className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 line-clamp-2">
                            {lesson.summary}
                        </p>

                        <div className="mt-auto flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                <Clock className="w-3.5 h-3.5" />
                                <span>2 ساعات</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                <FileText className="w-3.5 h-3.5" />
                                <span>{lesson.keyPoints.length} محاور</span>
                            </div>

                            <div className="flex-1"></div>

                            <button 
                                onClick={() => handleExplain(lesson.title, lesson.summary)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-primary bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
                            >
                                <Sparkles className="w-4 h-4" />
                                شرح ذكي
                            </button>
                            <button className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary-light transition shadow-lg shadow-slate-200 dark:shadow-none">
                                <PlayCircle className="w-4 h-4" />
                                بدء الدرس
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* AI Explanation Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-scale-in">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-none">
                    <Sparkles className="w-4 h-4 text-white" />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">المعلم الذكي</h3>
                    <span className="text-[10px] text-slate-500 block">مدعوم بـ Gemini AI</span>
                 </div>
              </div>
              <button onClick={() => setAiModalOpen(false)} className="bg-slate-50 dark:bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition">✕</button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              {loadingAi ? (
                <div className="flex flex-col items-center justify-center py-12 gap-6">
                   <div className="relative">
                       <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center animate-pulse">
                            <Sparkles className="w-8 h-8 text-primary opacity-50" />
                       </div>
                       <div className="absolute top-0 right-0 w-4 h-4 bg-primary rounded-full animate-ping"></div>
                   </div>
                   <p className="text-slate-500 font-bold animate-pulse text-sm">جاري تحليل المحتوى وصياغة الشرح...</p>
                </div>
              ) : (
                <div className="prose dark:prose-invert prose-indigo max-w-none">
                   <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">{modalContent.title.replace('شرح: ', '')}</h2>
                   <div className="whitespace-pre-wrap leading-loose text-slate-600 dark:text-slate-300 text-sm md:text-base">
                      {modalContent.text}
                   </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 rounded-b-3xl text-center">
                <p className="text-xs text-slate-400">تأكد دائماً من المعلومات من المصادر الرسمية.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lessons;