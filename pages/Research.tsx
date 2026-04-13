import React, { useState, useRef } from 'react';
import { RESEARCH_TOPICS } from '../constants';
import { FileText, Lightbulb, PenTool, Search, CheckCircle, Image as ImageIcon, Upload, X } from 'lucide-react';
import { generateResearchPlan, correctResearchMethodology, analyzeDocumentImage } from '../services/geminiService';

type Mode = 'suggest' | 'correct' | 'analyze';

const Research: React.FC = () => {
  const [mode, setMode] = useState<Mode>('suggest');
  const [planOutput, setPlanOutput] = useState<{id: string, text: string} | null>(null);
  const [loading, setLoading] = useState(false);

  // Correction State
  const [correctionTitle, setCorrectionTitle] = useState('');
  const [userPlan, setUserPlan] = useState('');
  const [correctionResult, setCorrectionResult] = useState('');

  // Image Analysis State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('');
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSuggestPlan = async (id: string, title: string) => {
    setLoading(true);
    setPlanOutput({ id, text: 'جاري إنشاء هيكل البحث...' });
    const plan = await generateResearchPlan(title);
    setPlanOutput({ id, text: plan });
    setLoading(false);
  };

  const handleCorrectPlan = async () => {
    if(!correctionTitle.trim() || !userPlan.trim()) return;
    
    setLoading(true);
    const result = await correctResearchMethodology(userPlan, correctionTitle);
    setCorrectionResult(result);
    setLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        setImageMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    setAnalysisResult('');
    
    // Extract base64 data (remove data:image/png;base64, prefix)
    const base64Data = selectedImage.split(',')[1];
    
    const result = await analyzeDocumentImage(base64Data, imageMimeType, analysisPrompt);
    setAnalysisResult(result);
    setLoading(false);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImageMimeType('');
    setAnalysisResult('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
           <h1 className="text-3xl font-black text-secondary dark:text-white mb-2">منهجية البحث العلمي</h1>
           <p className="text-slate-500">أدوات ذكية لمساعدتك في إعداد مذكرات التخرج.</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mt-4 md:mt-0 overflow-x-auto max-w-full">
            <button 
                onClick={() => setMode('suggest')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${mode === 'suggest' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-500'}`}
            >
                اقتراح مواضيع
            </button>
            <button 
                onClick={() => setMode('correct')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${mode === 'correct' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-500'}`}
            >
                تصحيح خطة
            </button>
            <button 
                onClick={() => setMode('analyze')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${mode === 'analyze' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-500'}`}
            >
                تحليل وثيقة
            </button>
        </div>
      </div>

      {mode === 'suggest' && (
          /* Suggestion Mode */
          <div className="space-y-8 animate-fade-in-up">
             <div className="relative max-w-md">
                 <input type="text" placeholder="بحث عن موضوع..." className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full px-4 py-3 pl-10 text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
                 <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {RESEARCH_TOPICS.map((topic) => (
                <div key={topic.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col hover:border-primary transition duration-300 group">
                    <div className="p-6 flex-1">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-indigo-50 dark:bg-indigo-900/30 text-primary text-[10px] font-bold uppercase px-2 py-1 rounded tracking-wider">{topic.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-secondary dark:text-white mb-3 leading-snug group-hover:text-primary transition-colors">{topic.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{topic.description}</p>
                    </div>
                    
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 rounded-b-2xl">
                    {planOutput?.id === topic.id ? (
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm animate-fade-in">
                            <h4 className="font-bold mb-3 flex items-center gap-2 text-secondary dark:text-white border-b border-slate-100 pb-2">
                                <FileText className="w-4 h-4 text-primary" />
                                الخطة المقترحة
                            </h4>
                            {loading ? (
                                <div className="space-y-2 py-4">
                                    <div className="h-2 bg-slate-200 rounded w-full animate-pulse"></div>
                                    <div className="h-2 bg-slate-200 rounded w-2/3 animate-pulse"></div>
                                    <div className="h-2 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap font-sans text-xs text-slate-600 dark:text-slate-300 max-h-60 overflow-y-auto leading-loose custom-scrollbar">
                                    {planOutput.text}
                                </div>
                            )}
                        </div>
                    ) : (
                        <button 
                            onClick={() => handleSuggestPlan(topic.id, topic.title)}
                            className="w-full text-secondary dark:text-white hover:text-primary dark:hover:text-primary py-2 rounded text-sm font-bold flex items-center justify-center gap-2 transition group"
                        >
                            <Lightbulb className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                            إنشاء خطة بحث
                        </button>
                    )}
                    </div>
                </div>
                ))}
            </div>
          </div>
      )}
      
      {mode === 'correct' && (
          /* Correction Mode */
          <div className="max-w-4xl mx-auto animate-fade-in-up">
             <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                            <PenTool className="w-5 h-5 text-primary" />
                            بيانات المذكرة
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">عنوان البحث</label>
                                <input 
                                    type="text" 
                                    value={correctionTitle}
                                    onChange={(e) => setCorrectionTitle(e.target.value)}
                                    placeholder="مثال: المسؤولية الجنائية للطبيب..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الخطة المقترحة (أو المنهجية الحالية)</label>
                                <textarea 
                                    value={userPlan}
                                    onChange={(e) => setUserPlan(e.target.value)}
                                    placeholder="اكتب تقسيمات بحثك هنا (المباحث، المطالب...)"
                                    className="w-full h-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none text-slate-900 dark:text-white"
                                ></textarea>
                            </div>
                            <button 
                                onClick={handleCorrectPlan}
                                disabled={loading || !correctionTitle || !userPlan}
                                className="w-full bg-primary hover:bg-primary-light disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                {loading ? 'جاري التحليل...' : 'تصحيح المنهجية'}
                            </button>
                        </div>
                    </div>
                 </div>

                 {/* Result Section */}
                 <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 min-h-[500px] relative">
                    {!correctionResult ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-center p-8">
                            <CheckCircle className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-medium">أدخل خطتك للتحقق من:</p>
                            <ul className="text-sm mt-2 space-y-1 opacity-70">
                                <li>- التوازن الشكلي والموضوعي</li>
                                <li>- دقة العناوين القانونية</li>
                                <li>- احترام التقسيم الثنائي</li>
                            </ul>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-white">تقرير التصحيح</h3>
                            </div>
                            <div className="prose dark:prose-invert prose-sm max-w-none">
                                <div className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                                    {correctionResult}
                                </div>
                            </div>
                        </div>
                    )}
                 </div>
             </div>
          </div>
      )}

      {mode === 'analyze' && (
          /* Image Analysis Mode */
          <div className="max-w-4xl mx-auto animate-fade-in-up">
              <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                              <ImageIcon className="w-5 h-5 text-primary" />
                              تحليل وثيقة
                          </h3>
                          
                          <div className="space-y-4">
                              <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${selectedImage ? 'border-primary/50 bg-primary/5' : 'border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                              >
                                  <input 
                                      type="file" 
                                      ref={fileInputRef} 
                                      className="hidden" 
                                      accept="image/*"
                                      onChange={handleImageUpload}
                                  />
                                  
                                  {selectedImage ? (
                                      <div className="relative w-full">
                                          <img src={selectedImage} alt="Preview" className="w-full h-48 object-contain rounded-lg" />
                                          <button 
                                              onClick={(e) => { e.stopPropagation(); clearImage(); }}
                                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-md"
                                          >
                                              <X className="w-4 h-4" />
                                          </button>
                                      </div>
                                  ) : (
                                      <>
                                          <Upload className="w-10 h-10 text-slate-400 mb-3" />
                                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center">
                                              اضغط لرفع صورة أو وثيقة<br/>
                                              <span className="text-xs text-slate-400">JPG, PNG</span>
                                          </p>
                                      </>
                                  )}
                              </div>

                              <div>
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ماذا تريد أن تعرف عن هذه الصورة؟</label>
                                  <input 
                                      type="text" 
                                      value={analysisPrompt}
                                      onChange={(e) => setAnalysisPrompt(e.target.value)}
                                      placeholder="مثال: اشرح لي هذه المادة القانونية..."
                                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 dark:text-white"
                                  />
                              </div>

                              <button 
                                  onClick={handleAnalyzeImage}
                                  disabled={loading || !selectedImage}
                                  className="w-full bg-primary hover:bg-primary-light disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                              >
                                  {loading ? 'جاري التحليل (Gemini 3.0)...' : 'تحليل الصورة'}
                              </button>
                          </div>
                      </div>
                  </div>

                   {/* Result Section */}
                   <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 min-h-[500px] relative">
                    {!analysisResult ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-center p-8">
                            <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-medium">قم برفع صورة للحصول على:</p>
                            <ul className="text-sm mt-2 space-y-1 opacity-70">
                                <li>- شرح للنصوص القانونية المصورة</li>
                                <li>- استخراج المواد والأحكام</li>
                                <li>- تلخيص المخططات والملاحظات</li>
                            </ul>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600">
                                    <Lightbulb className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-white">نتيجة التحليل</h3>
                            </div>
                            <div className="prose dark:prose-invert prose-sm max-w-none">
                                <div className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                                    {analysisResult}
                                </div>
                            </div>
                        </div>
                    )}
                 </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Research;