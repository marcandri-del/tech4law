import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SYLLABUSES } from './SyllabusesData';
import { 
  CheckCircle, 
  XCircle, 
  Trophy, 
  RefreshCcw, 
  ArrowRight, 
  Lightbulb, 
  AlertCircle, 
  BookOpen, 
  Award, 
  ChevronLeft,
  ChevronRight,
  Zap,
  GraduationCap
} from 'lucide-react';

interface Question {
  id: string;
  chapterNumber: number;
  chapterTitle: string;
  question: string;
  options: string[];
  correctAnswer: number;
  recommendation: string;
}

const getCourseEmoji = (title: string): string => {
  if (title.includes('جنائي')) return '⚖️';
  if (title.includes('مدني') || title.includes('التزام') || title.includes('حق')) return '📜';
  if (title.includes('إداري') || title.includes('تنظيم')) return '🏢';
  if (title.includes('تجاري') || title.includes('شركات') || title.includes('أوراق')) return '💼';
  if (title.includes('أسرة') || title.includes('زواج') || title.includes('طلاق')) return '🏠';
  if (title.includes('دستوري') || title.includes('دولة')) return '🏛️';
  if (title.includes('دولي')) return '🌍';
  if (title.includes('عمل')) return '🛠️';
  if (title.includes('إجراءات')) return '✍️';
  if (title.includes('لغة') || title.includes('فرنسية') || title.includes('إنجليزية')) return '🗣️';
  return '🎓';
};

const getCourseYear = (courseId: string): number => {
  if (courseId.startsWith('y1')) return 1;
  if (courseId.startsWith('y2')) return 2;
  if (courseId.startsWith('y3')) return 3;
  return 1;
};

// Extractor to get all questions from a course syllabus
const getCourseQuestions = (syllabus: any): Question[] => {
  const questions: Question[] = [];
  if (!syllabus || !syllabus.chapters) return questions;

  syllabus.chapters.forEach((chapter: any) => {
    if (chapter.quiz) {
      questions.push({
        id: `${chapter.id}-single`,
        chapterNumber: chapter.chapterNumber,
        chapterTitle: chapter.title,
        question: chapter.quiz.question,
        options: chapter.quiz.options,
        correctAnswer: chapter.quiz.correctIndex,
        recommendation: chapter.quiz.explanation || 'راجع تفاصيل ومحاضرات هذا الفصل لمزيد من الفهم.'
      });
    }
    if (chapter.quizzes && Array.isArray(chapter.quizzes)) {
      chapter.quizzes.forEach((q: any, idx: number) => {
        questions.push({
          id: `${chapter.id}-q-${idx}`,
          chapterNumber: chapter.chapterNumber,
          chapterTitle: chapter.title,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctIndex,
          recommendation: q.explanation || 'راجع تفاصيل ومحاضرات هذا الفصل لمزيد من الفهم.'
        });
      });
    }
  });
  return questions;
};

const Quizzes: React.FC = () => {
  const { user } = useAuth();
  const userYear = Number(user?.studyYear) || 1;

  // Tabs for years: 1, 2, 3
  const [activeYearTab, setActiveYearTab] = useState<number>(userYear);

  // Selected Course
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Configuration inside the course
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all'); // 'all' or specific chapter id
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'comprehensive'>('comprehensive');

  // Gameplay states
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  const [activeQuestionsList, setActiveQuestionsList] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [studyPlan, setStudyPlan] = useState<{question: string, recommendation: string}[]>([]);

  // Get selected course syllabus
  const selectedSyllabus = selectedCourseId ? SYLLABUSES[selectedCourseId] : null;

  // Filter courses that have chapters with questions for the active year
  const availableCourses = Object.values(SYLLABUSES).filter(syllabus => {
    const year = getCourseYear(syllabus.courseId);
    if (year !== activeYearTab) return false;
    
    // Check if course has at least one quiz/question
    const questions = getCourseQuestions(syllabus);
    return questions.length > 0;
  });

  const activeQuizName = selectedSyllabus ? selectedSyllabus.courseTitle : "اختبار";

  const handleAnswer = (optionIndex: number) => {
    if (selectedOption !== null) return; // Prevent multiple answers
    setSelectedOption(optionIndex);
    const question = activeQuestionsList[currentQuestionIndex];
    const isCorrect = question && optionIndex === question.correctAnswer;
    
    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      if (question && question.recommendation) {
        setStudyPlan(prev => [...prev, {
          question: question.question,
          recommendation: question.recommendation
        }]);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuestionsList.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  const handleStartQuiz = () => {
    if (!selectedSyllabus) return;

    let baseQuestions: Question[] = [];

    if (selectedChapterId === 'all') {
      // Gather questions from all chapters
      baseQuestions = getCourseQuestions(selectedSyllabus);
    } else {
      // Gather questions from specific chapter
      const chapter = selectedSyllabus.chapters.find((ch: any) => ch.id === selectedChapterId);
      if (chapter) {
        if (chapter.quiz) {
          baseQuestions.push({
            id: `${chapter.id}-single`,
            chapterNumber: chapter.chapterNumber,
            chapterTitle: chapter.title,
            question: chapter.quiz.question,
            options: chapter.quiz.options,
            correctAnswer: chapter.quiz.correctIndex,
            recommendation: chapter.quiz.explanation || 'راجع تفاصيل ومحاضرات هذا الفصل لمزيد من الفهم.'
          });
        }
        if (chapter.quizzes && Array.isArray(chapter.quizzes)) {
          chapter.quizzes.forEach((q: any, idx: number) => {
            baseQuestions.push({
              id: `${chapter.id}-q-${idx}`,
              chapterNumber: chapter.chapterNumber,
              chapterTitle: chapter.title,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctIndex,
              recommendation: q.explanation || 'راجع تفاصيل ومحاضرات هذا الفصل لمزيد من الفهم.'
            });
          });
        }
      }
    }

    // Process based on difficulty selection
    if (selectedDifficulty === 'easy') {
      baseQuestions = baseQuestions.slice(0, Math.min(3, baseQuestions.length));
    } else if (selectedDifficulty === 'medium') {
      baseQuestions = baseQuestions.slice(0, Math.min(5, baseQuestions.length));
    }
    // 'comprehensive' uses all available questions in that scope

    if (baseQuestions.length === 0) return;

    setActiveQuestionsList(baseQuestions);
    setIsQuizActive(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowResult(false);
    setStudyPlan([]);
  };

  const resetToSetup = () => {
    setIsQuizActive(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setStudyPlan([]);
  };

  const resetToMainMenu = () => {
    setSelectedCourseId(null);
    setSelectedChapterId('all');
    setIsQuizActive(false);
    setActiveQuestionsList([]);
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

  // ==========================================
  // VIEW 1: Main Menu (Syllabus Course Selection)
  // ==========================================
  if (!selectedCourseId) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">قيّم معلوماتك من المحاضرات</h1>
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
              🎓 السنة {userYear}
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base leading-relaxed font-semibold">
            اختر المقياس القانوني المناسب لاختبار معلوماتك المكتسبة من المحاضرات والدروس المعتمدة رسمياً في الجامعات الجزائرية.
          </p>
        </div>

        {/* Year Selector Tabs */}
        <div className="flex justify-center gap-2 mb-10 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl max-w-md mx-auto">
          {([1, 2, 3] as const).map((year) => (
            <button
              key={year}
              onClick={() => setActiveYearTab(year)}
              className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer ${
                activeYearTab === year
                  ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              السنة {year === 1 ? 'الأولى' : year === 2 ? 'الثانية' : 'الثالثة'}
              {userYear === year && ' (سنتك)'}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {availableCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {availableCourses.map((syllabus, index) => {
              const questions = getCourseQuestions(syllabus);
              const emoji = getCourseEmoji(syllabus.courseTitle);
              
              // Chapters containing questions
              const chaptersWithQuizzes = syllabus.chapters.filter(ch => ch.quiz || (ch.quizzes && ch.quizzes.length > 0)).length;

              return (
                <button
                  key={syllabus.courseId}
                  onClick={() => {
                    setSelectedCourseId(syllabus.courseId);
                    setSelectedChapterId('all');
                    setSelectedDifficulty('medium');
                  }}
                  style={{ animationDelay: `${index * 80}ms` }}
                  className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary group text-right flex flex-col justify-between min-h-[220px] cursor-pointer relative overflow-hidden active:scale-[0.99]"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                      {emoji}
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {syllabus.courseTitle}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                        بإشراف {syllabus.professor} - {syllabus.university}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-slate-400 text-xs border-t border-slate-100 dark:border-slate-800/85 pt-4 mt-4">
                    <span className="font-bold text-slate-500">
                      {chaptersWithQuizzes} محاضرات • {questions.length} أسئلة
                    </span>
                    <div className="flex items-center gap-1 font-black text-primary group-hover:translate-x-[-4px] transition-transform">
                      <span>دخول للمحاضرة</span>
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">لا توجد تمارين بعد</h3>
            <p className="text-xs text-slate-500">لم يتم تضمين تمارين لهذه السنة الدراسية حالياً.</p>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: Course Configuration (Setup)
  // ==========================================
  if (selectedCourseId && !isQuizActive && selectedSyllabus) {
    const emoji = getCourseEmoji(selectedSyllabus.courseTitle);
    const allQuestions = getCourseQuestions(selectedSyllabus);

    // Filter chapters that actually have questions
    const chaptersWithOptions = selectedSyllabus.chapters.filter(ch => ch.quiz || (ch.quizzes && ch.quizzes.length > 0));

    // Get number of questions for current selection
    let questionsCount = allQuestions.length;
    if (selectedChapterId !== 'all') {
      const chObj = selectedSyllabus.chapters.find(ch => ch.id === selectedChapterId);
      if (chObj) {
        let count = 0;
        if (chObj.quiz) count += 1;
        if (chObj.quizzes) count += chObj.quizzes.length;
        questionsCount = count;
      }
    }

    // Limit based on difficulty
    let finalQuestionsCount = questionsCount;
    if (selectedDifficulty === 'easy') {
      finalQuestionsCount = Math.min(3, questionsCount);
    } else if (selectedDifficulty === 'medium') {
      finalQuestionsCount = Math.min(5, questionsCount);
    }

    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl animate-fadeIn">
        {/* Breadcrumbs */}
        <button
          onClick={resetToMainMenu}
          className="mb-8 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-black text-sm cursor-pointer transition active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
          <span>العودة لقائمة المقاييس الرئيسية</span>
        </button>

        {/* Selected Course Header */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 mb-8">
          <div className="flex items-start gap-5">
            <span className="text-5xl bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl shadow-xs shrink-0">
              {emoji}
            </span>
            <div className="space-y-2 text-right">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold">
                تمارين معتمدة ومطابقة للمحاضرات
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                {selectedSyllabus.courseTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                بإشراف البروفيسور: {selectedSyllabus.professor} • {selectedSyllabus.university}
              </p>
            </div>
          </div>
        </div>

        {/* Configurations */}
        <div className="space-y-8">
          {/* Lecture/Chapter Selector */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-sm">١</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">اختر المحاضرة أو الفصل المستهدف</h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedChapterId('all')}
                className={`w-full text-right p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                  selectedChapterId === 'all'
                    ? 'bg-slate-50 dark:bg-slate-950 ring-2 ring-primary border-primary font-black text-slate-900 dark:text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-400 font-semibold'
                }`}
              >
                <span>جميع محاضرات وفصول المقياس (اختبار شامل)</span>
                <span className="text-xs text-slate-400">{allQuestions.length} سؤال متوفر</span>
              </button>

              {chaptersWithOptions.map((chapter) => {
                let count = 0;
                if (chapter.quiz) count += 1;
                if (chapter.quizzes) count += chapter.quizzes.length;

                return (
                  <button
                    key={chapter.id}
                    onClick={() => setSelectedChapterId(chapter.id)}
                    className={`w-full text-right p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                      selectedChapterId === chapter.id
                        ? 'bg-slate-50 dark:bg-slate-950 ring-2 ring-primary border-primary font-black text-slate-900 dark:text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-400 font-semibold'
                    }`}
                  >
                    <span className="truncate max-w-md">{chapter.title}</span>
                    <span className="text-xs text-slate-400 shrink-0">{count} سؤال</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action trigger */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-150 dark:border-slate-800">
            <div className="space-y-1 text-right self-start sm:self-center">
              <p className="text-sm font-black text-slate-900 dark:text-white">
                📚 جاهز لبدء التمرين المعتمد:
              </p>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                ستقوم بحل {finalQuestionsCount} سؤالاً من صميم محاضرات {selectedSyllabus.courseTitle} دون أي مؤقت أو قيود زمنية.
              </p>
            </div>

            <button
              onClick={handleStartQuiz}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-light text-white font-black px-8 py-4 rounded-2xl text-xs md:text-sm transition-all shadow-lg shadow-primary/25 cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Zap className="w-4.5 h-4.5 animate-pulse" />
              <span>ابدأ الآن ({finalQuestionsCount} أسئلة)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: Active Quiz Gameplay
  // ==========================================
  if (selectedCourseId && isQuizActive && !showResult) {
    const question = activeQuestionsList[currentQuestionIndex];
    const progress = (currentQuestionIndex / activeQuestionsList.length) * 100;
    const isAnswered = selectedOption !== null;

    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl animate-fadeIn">
        <div className="mb-6 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>سؤال {currentQuestionIndex + 1} من {activeQuestionsList.length}</span>
          <span className="text-primary bg-primary/10 px-2.5 py-1 rounded-md max-w-[200px] truncate">{activeQuizName}</span>
        </div>
        
        <div className="h-2 bg-slate-100 dark:bg-slate-850 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-6 md:p-10 border border-slate-200 dark:border-slate-850 space-y-8">
          <div className="space-y-2">
            <span className="inline-block px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded text-[10px] font-bold">
              {question?.chapterTitle}
            </span>
            <h2 className="text-xl md:text-2xl font-black leading-relaxed text-slate-900 dark:text-white text-right">
              {question?.question}
            </h2>
          </div>
          
          <div className="space-y-4">
            {question?.options.map((opt: string, idx: number) => {
              const isSelected = selectedOption === idx;
              const isThisCorrect = idx === question.correctAnswer;
              
              let buttonClass = `w-full text-right p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group cursor-pointer `;
              
              if (isAnswered) {
                if (isSelected) {
                  if (isThisCorrect) {
                    buttonClass += 'border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 font-bold';
                  } else {
                    buttonClass += 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 font-bold';
                  }
                } else if (isThisCorrect) {
                  buttonClass += 'border-green-500 bg-green-50/50 dark:bg-green-950/10 text-green-700 dark:text-green-400 opacity-90';
                } else {
                  buttonClass += 'border-slate-100 dark:border-slate-800 opacity-40';
                }
              } else {
                buttonClass += 'border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-900 dark:text-slate-300';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={isAnswered}
                  className={buttonClass}
                >
                  <span className="font-bold text-xs md:text-sm">{opt}</span>
                  <div className="flex-shrink-0 mr-3">
                    {isAnswered && isSelected && isThisCorrect && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                    {isAnswered && isSelected && !isThisCorrect && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                    {isAnswered && !isSelected && isThisCorrect && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 opacity-50" />}
                  </div>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-5 flex gap-4">
                <div className="flex-shrink-0 pt-0.5 animate-pulse">
                  <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="space-y-1.5 text-right w-full">
                  <h4 className="font-black text-indigo-900 dark:text-indigo-400 text-xs md:text-sm">التوضيح القانوني والمستند المنهجي:</h4>
                  <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                    {question.recommendation}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNextQuestion}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-black px-6 py-3 rounded-xl text-xs md:text-sm transition cursor-pointer active:scale-95"
                >
                  <span>{currentQuestionIndex < activeQuestionsList.length - 1 ? 'السؤال التالي' : 'إنهاء وعرض النتيجة'}</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-start border-t border-slate-100 dark:border-slate-800/80 pt-6 mt-4">
            <button 
              onClick={resetToSetup}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>إلغاء والعودة لخيارات التمرين</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 4: Scorecard Results
  // ==========================================
  if (showResult) {
    const percentage = (score / activeQuestionsList.length) * 100;
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-lg w-full max-w-2xl border border-slate-200 dark:border-slate-800 text-center">
          <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 mb-6 shadow-inner">
            <Trophy className={`w-10 h-10 ${percentage >= 50 ? 'text-primary' : 'text-slate-400'}`} />
          </div>
          <h2 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">
            {percentage >= 80 ? 'أداء مذهل! 🌟' : percentage >= 50 ? 'نتيجة جيدة 👍' : 'حاول مرة أخرى 💪'}
          </h2>
          <p className="text-slate-500 mb-6 text-xs md:text-sm font-semibold">أتممت تمرين {activeQuizName}</p>
          
          <div className="text-6xl font-black text-slate-900 dark:text-white mb-2">
            {score}<span className="text-2xl text-slate-400">/{activeQuestionsList.length}</span>
          </div>
          <div className="inline-block px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 mb-10">
            نسبة النجاح والتحصيل: {percentage.toFixed(0)}%
          </div>

          {studyPlan.length > 0 && (
            <div className="mb-10 text-right bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-orange-800 dark:text-orange-400 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                توجيهات المراجعة والمستندات القانونية:
              </h3>
              <div className="space-y-4">
                {studyPlan.map((item, index) => (
                  <div key={index} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-orange-100/60 dark:border-slate-800 shadow-xs flex gap-3 items-start">
                    <div className="mt-1 flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="space-y-1 w-full">
                      <p className="text-xs font-bold text-slate-400">السؤال: "{item.question}"</p>
                      <p className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{item.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button 
              onClick={retryQuiz}
              className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black py-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <RefreshCcw className="w-5 h-5" />
              <span>إعادة محاولة الاختبار</span>
            </button>
            
            <button 
              onClick={resetToMainMenu}
              className="w-full bg-primary hover:bg-primary-light text-white font-black py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer active:scale-95"
            >
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              <span>العودة للمقاييس</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Quizzes;
