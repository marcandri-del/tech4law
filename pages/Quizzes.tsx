import React, { useState } from 'react';
import { QUIZ_CATEGORIES } from '../constants';
import { CheckCircle, XCircle, Trophy, RefreshCcw, ArrowRight, Lightbulb, AlertCircle, BookOpen } from 'lucide-react';

const Quizzes: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // New state to track recommendations based on wrong answers
  const [studyPlan, setStudyPlan] = useState<{question: string, recommendation: string}[]>([]);

  const category = QUIZ_CATEGORIES.find(c => c.id === activeCategory);
  
  const handleAnswer = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    const question = category?.questions[currentQuestionIndex];
    const isCorrect = question && optionIndex === question.correctAnswer;
    
    // Increase delay if incorrect so user can read recommendation
    const delay = isCorrect ? 1200 : 4000;

    setTimeout(() => {
        if (isCorrect) {
            setScore(s => s + 1);
        } else {
            // Add to study plan if incorrect and has recommendation
            if (question && question.recommendation) {
                setStudyPlan(prev => [...prev, {
                    question: question.question,
                    recommendation: question.recommendation!
                }]);
            }
        }
        
        if (category && currentQuestionIndex < category.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
        } else {
            setShowResult(true);
        }
    }, delay); 
  };

  const resetQuiz = () => {
    setActiveCategory(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setStudyPlan([]);
  };

  const retryQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setStudyPlan([]);
  };

  if (!activeCategory) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-4xl font-black text-secondary dark:text-white mb-4">قيّم معلوماتك</h1>
            <p className="text-slate-500 max-w-lg mx-auto">مجموعة اختبارات تفاعلية مصممة لتقييم استيعابك للمفاهيم القانونية الأساسية في مختلف التخصصات.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {QUIZ_CATEGORIES.map((cat, index) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{ animationDelay: `${index * 100}ms` }}
              className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border border-slate-200 dark:border-slate-800 hover:border-primary group text-right animate-fade-in-up"
            >
              <span className="text-xs font-bold text-primary tracking-widest uppercase mb-4 block">اختبار تفاعلي</span>
              <h3 className="text-2xl font-bold text-secondary dark:text-white mb-4 group-hover:translate-x-[-4px] transition-transform">{cat.name}</h3>
              <div className="flex justify-between items-center text-slate-500 text-sm border-t border-slate-100 dark:border-slate-800 pt-4">
                 <span>{cat.questions.length} أسئلة</span>
                 <ArrowRight className="w-4 h-4 group-hover:text-primary transition-colors rtl:rotate-180" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (showResult && category) {
    const percentage = (score / category.questions.length) * 100;
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 animate-fade-in-up">
          
          {/* Result Header */}
          <div className="text-center mb-10">
              <div className="inline-flex justify-center items-center w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800 mb-6 shadow-inner animate-pop">
                <Trophy className={`w-12 h-12 ${percentage >= 50 ? 'text-primary' : 'text-slate-400'}`} />
              </div>
              <h2 className="text-3xl font-black mb-2 text-secondary dark:text-white">
                {percentage >= 80 ? 'أداء مذهل! 🌟' : percentage >= 50 ? 'نتيجة جيدة 👍' : 'حاول مرة أخرى 💪'}
              </h2>
              <p className="text-slate-500 mb-6 text-sm">أتممت اختبار {category.name}</p>
              
              <div className="text-6xl font-black text-secondary dark:text-white mb-2">
                {score}<span className="text-2xl text-slate-400">/{category.questions.length}</span>
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500">
                  نسبة النجاح: {percentage.toFixed(0)}%
              </div>
          </div>

          {/* Study Plan Section (Show only if there are wrong answers) */}
          {studyPlan.length > 0 && (
              <div className="mb-10 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-6 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                  <h3 className="font-bold text-lg text-orange-800 dark:text-orange-400 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      خطة المراجعة المقترحة
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">بناءً على إجاباتك، ننصحك بمراجعة الدروس التالية:</p>
                  <div className="space-y-3">
                      {studyPlan.map((item, index) => (
                          <div key={index} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-orange-100 dark:border-slate-800 shadow-sm flex gap-3 items-start">
                              <div className="mt-1 flex-shrink-0">
                                  <AlertCircle className="w-4 h-4 text-orange-500" />
                              </div>
                              <div>
                                  <p className="text-xs font-bold text-slate-400 mb-1">في السؤال: "{item.question}"</p>
                                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{item.recommendation}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             <button 
                onClick={retryQuiz}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-secondary dark:text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-5 h-5" />
                إعادة المحاولة
              </button>
              
              <button 
                onClick={resetQuiz}
                className="w-full bg-primary hover:bg-primary-light text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                العودة للقائمة
              </button>
          </div>
        </div>
      </div>
    );
  }

  if (category) {
    const question = category.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / category.questions.length) * 100;
    const isAnswered = selectedOption !== null;
    const isCorrect = isAnswered && selectedOption === question.correctAnswer;
    const showRecommendation = isAnswered && !isCorrect && question.recommendation;

    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
           <span>Question {currentQuestionIndex + 1} / {category.questions.length}</span>
           <span>{category.name}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-10 overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
        </div>

        <div 
            key={currentQuestionIndex}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg p-10 border border-slate-200 dark:border-slate-800 animate-fade-in-up"
        >
            <h2 className="text-2xl font-bold mb-10 leading-relaxed text-secondary dark:text-white">{question.question}</h2>
            
            <div className="space-y-4">
                {question.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isThisCorrect = idx === question.correctAnswer;
                    
                    let buttonClass = `w-full text-right p-5 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group relative overflow-hidden `;
                    
                    if (isAnswered) {
                        if (isSelected) {
                            if (isThisCorrect) {
                                buttonClass += 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 shadow-md z-10 animate-pop';
                            } else {
                                buttonClass += 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 shadow-md z-10 animate-shake';
                            }
                        } else if (isThisCorrect) {
                             // Show correct answer even if user picked wrong
                             buttonClass += 'border-green-500 bg-green-50/50 dark:bg-green-900/10 text-green-700 dark:text-green-400 opacity-80';
                        } else {
                             buttonClass += 'border-slate-100 dark:border-slate-800 opacity-40 grayscale';
                        }
                    } else {
                        buttonClass += 'border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800 text-secondary dark:text-slate-300 hover:shadow-md';
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={selectedOption !== null}
                            className={buttonClass}
                        >
                            <span className="font-medium">{opt}</span>
                            <div className="flex-shrink-0 mr-3">
                                {isAnswered && isSelected && isThisCorrect && <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 animate-bounce" />}
                                {isAnswered && isSelected && !isThisCorrect && <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />}
                                {isAnswered && !isSelected && isThisCorrect && <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 opacity-50" />}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Recommendation Box */}
            {showRecommendation && (
                <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex gap-4 animate-fade-in-up" style={{animationDelay: '300ms'}}>
                    <div className="flex-shrink-0 pt-1">
                        <Lightbulb className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-yellow-800 dark:text-yellow-400 mb-1 text-sm">نصيحة للمراجعة</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300/80 leading-relaxed">
                            {question.recommendation}
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>
    );
  }

  return null;
};

export default Quizzes;