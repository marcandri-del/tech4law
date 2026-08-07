import React, { useState, useEffect } from 'react';
import { LESSONS } from '../constants';
import { BookOpen, Sparkles, Clock, PlayCircle, Bookmark, FileText, CheckCircle2, Award, HelpCircle, X, Download, ChevronLeft, ChevronRight, Check, ArrowRight } from 'lucide-react';
import { generateExplanation } from '../services/geminiService';
import { Lesson } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { loadTracking, saveTracking } from '../lib/trackingService';

import { CourseChapter, CourseSyllabus } from './LessonsTypes';
import { SYLLABUSES } from './SyllabusesData';

const Lessons: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks'>('all');
  const [activeYear, setActiveYear] = useState<1 | 2 | 3>(() => {
    const y = Number(user?.studyYear);
    return (y >= 1 && y <= 3 ? y : 1) as 1 | 2 | 3;
  });

  useEffect(() => {
    if (user?.studyYear) {
      const y = Number(user.studyYear);
      if (y >= 1 && y <= 3) {
        setActiveYear(y as 1 | 2 | 3);
      }
    }
  }, [user?.studyYear]);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', text: '' });
  const [loadingAi, setLoadingAi] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };
  
  // Bookmarked lessons state
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bookmarked_lessons');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Active/started courses state
  const [activeLessonIds, setActiveLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('active_lessons');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Active selected course syllabus (Coursera / Moodle University style)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [completedChapters, setCompletedChapters] = useState<Record<string, number[]>>(() => {
    try {
      const saved = localStorage.getItem('completed_chapters');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  
  // Quiz selection state for chapter test
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [showQuizResult, setShowQuizResult] = useState<Record<string, boolean>>({});
  const [chapterStudyTab, setChapterStudyTab] = useState<'explanation' | 'characteristics' | 'examples' | 'methodology' | 'quizzes'>('explanation');

  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [customAiQuizzes, setCustomAiQuizzes] = useState<Record<string, any[]>>({});
  const [loadingAiQuiz, setLoadingAiQuiz] = useState<boolean>(false);
  const [aiQuizError, setAiQuizError] = useState<string | null>(null);

  const handleGenerateAIQuiz = async (chapter: any) => {
    if (!currentSyllabus) return;
    setLoadingAiQuiz(true);
    setAiQuizError(null);
    try {
      const difficultyAr = 
        selectedDifficulty === 'easy' ? 'سهل' :
        selectedDifficulty === 'hard' ? 'صعب' : 'متوسط';

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateQuiz",
          payload: {
            courseTitle: currentSyllabus.courseTitle,
            chapterTitle: chapter.title,
            chapterContent: chapter.detailedContent || chapter.summary,
            difficulty: difficultyAr
          }
        })
      });

      if (!res.ok) {
        throw new Error("فشلت عملية توليد الأسئلة من الخادم.");
      }

      const data = await res.json();
      let parsed;
      try {
        parsed = JSON.parse(data.text);
      } catch (jsonErr) {
        // Fallback parse if markdown block exists
        const cleaned = data.text.replace(/```json|```/gi, '').trim();
        parsed = JSON.parse(cleaned);
      }

      if (parsed && parsed.quizzes && parsed.quizzes.length > 0) {
        const cacheKey = `${chapter.id}-${selectedDifficulty}`;
        setCustomAiQuizzes(prev => ({
          ...prev,
          [cacheKey]: parsed.quizzes
        }));
        
        // Clear old answers for this key
        const newAnswers = { ...selectedQuizAnswers };
        const newResults = { ...showQuizResult };
        parsed.quizzes.forEach((_: any, idx: number) => {
          const k = `${chapter.id}-ai-${selectedDifficulty}-${idx}`;
          delete newAnswers[k];
          delete newResults[k];
        });
        setSelectedQuizAnswers(newAnswers);
        setShowQuizResult(newResults);
      } else {
        throw new Error("محتوى الأسئلة المرتجع غير صالح.");
      }
    } catch (err: any) {
      console.error(err);
      setAiQuizError(err.message || "حدث خطأ غير متوقع أثناء توليد الأسئلة.");
    } finally {
      setLoadingAiQuiz(false);
    }
  };

  useEffect(() => {
    setChapterStudyTab('explanation');
  }, [selectedCourseId, activeChapterIndex]);

  // Load tracking on mount / auth state change
  useEffect(() => {
    if (!user?.uid) return;
    loadTracking(user.uid).then((data) => {
      if (data.completedChapters) {
        setCompletedChapters(data.completedChapters);
      }
      if (data.bookmarkedLessons) {
        setBookmarkedIds(data.bookmarkedLessons);
      }
    }).catch(err => console.error('Error syncing from Firestore on mount:', err));
  }, [user?.uid]);

  useEffect(() => {
    localStorage.setItem('bookmarked_lessons', JSON.stringify(bookmarkedIds));
    if (user?.uid) {
      saveTracking(user.uid, { bookmarkedLessons: bookmarkedIds }).catch(err => console.error(err));
    }
  }, [bookmarkedIds, user?.uid]);

  useEffect(() => {
    localStorage.setItem('active_lessons', JSON.stringify(activeLessonIds));
  }, [activeLessonIds]);

  useEffect(() => {
    localStorage.setItem('completed_chapters', JSON.stringify(completedChapters));
    if (user?.uid) {
      saveTracking(user.uid, { completedChapters }).catch(err => console.error(err));
    }
  }, [completedChapters, user?.uid]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter(item => item !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
    }
  };

  const handleStartCourse = (lessonId: string) => {
    if (!activeLessonIds.includes(lessonId)) {
      setActiveLessonIds([...activeLessonIds, lessonId]);
    }
    setSelectedCourseId(lessonId);
    setActiveChapterIndex(0);
  };

  const filteredLessons = LESSONS.filter(l => {
    if (activeTab === 'bookmarks') {
      return bookmarkedIds.includes(l.id);
    }
    return l.year === activeYear;
  });

  const handleExplain = async (title: string, summary: string) => {
    setAiModalOpen(true);
    setModalContent({ title: `شرح: ${title}`, text: 'جاري تحضير الشرح...' });
    setLoadingAi(true);
    
    const explanation = await generateExplanation(title, summary);
    
    setModalContent({ title: `شرح: ${title}`, text: explanation });
    setLoadingAi(false);
  };

  const getSyllabusForLesson = (id: string) => {
    if (SYLLABUSES[id]) return SYLLABUSES[id];
    const baseId = id.replace(/-s[12]/, '');
    if (SYLLABUSES[baseId]) return SYLLABUSES[baseId];
    if (id.startsWith('y1')) return SYLLABUSES['y1-s1-l1'];
    if (id.startsWith('y2')) return SYLLABUSES['y2-s1-l1'];
    if (id.startsWith('y3')) return SYLLABUSES['y3-l1'];
    return null;
  };

  const currentSyllabus = selectedCourseId ? (
    getSyllabusForLesson(selectedCourseId) || {
    courseId: selectedCourseId,
    courseTitle: LESSONS.find(l => l.id === selectedCourseId)?.title || 'المحاضرة الأكاديمية الشاملة',
    professor: 'د. هيئة التدريس - جامعة الجلفة',
    university: 'كلية الحقوق والعلوم السياسية - جامعة الجلفة',
    totalChapters: 4,
    chapters: [
      {
        id: 'ch-default-1',
        chapterNumber: 1,
        title: 'الفصل الأول: الإطار المفاهيمي والقانوني العام',
        duration: '45 دقيقة',
        summary: LESSONS.find(l => l.id === selectedCourseId)?.summary || 'دراسة شاملة لمفاهيم وأحكام هذا المقياس القانوني.',
        detailedContent: `تعتبر دراسة هذا المقياس ركيزة أساسية في تكوين طالب الحقوق.\n\nيتناول هذا الفصل المبادئ العامة، التعريفات الأكاديمية، والأسس التشريعية المستمدة من التشريع الجزائري وقرارات المحكمة العليا.`,
        keyPoints: [
          'المفاهيم الأساسية للمقياس',
          'الإطار التشريعي والتنظيمي المعمول به',
          'التطبيقات القضائية والعملية'
        ],
        examples: [
          'تطبيق قواعد التشريع الجزائري في المنازعات القضائية ذات الصلة.',
          'الاستئناس بالاجتهاد القضائي للمحكمة العليا ومجلس الدولة.'
        ],
        quiz: {
          question: 'ما هو الهدف الأساسي من دراسة هذا الفصل القانوني؟',
          options: [
            'فهم الإطار القانوني والتطبيقي بشكل دقيق',
            'حفظ النصوص القانونية دون فهم',
            'تجاهل التطبيقات العملية',
            'الاكتفاء بالتعريفات التاريخية'
          ],
          correctIndex: 0,
          explanation: 'الهدف هو الاستيعاب القانوني السليم الذي يربط النظري بالتطبيقي العملي في المحاكم والإدارات.'
        }
      },
      {
        id: 'ch-default-2',
        chapterNumber: 2,
        title: 'الفصل الثاني: الأحكام الموضوعية والإجرائية',
        duration: '50 دقيقة',
        summary: 'تفصيل القواعد الموضوعية والإجراءات العملية لتطبيق أحكام هذا المقياس.',
        detailedContent: `يعرض هذا الفصل الشروط الموضوعية والإجرائية الواجب توافرها لقيام التصرفات أو الحقوق أو المسؤوليات القانونية.\n\nكما يتم التركيز على الاستثناءات الواردة في النصوص التشريعية الجزائرية.`,
        keyPoints: [
          'الشروط الموضوعية للإجراء',
          'الآثار القانونية المترتبة',
          'الجزاءات المترتبة عن المخالفة'
        ],
        examples: [
          'رفع الدعوى وفق الأشكال القانونية المقررة قانوناً.',
          'إعمال الجزاءات المقررة في النص التشريعي عند الإخلال.'
        ],
        quiz: {
          question: 'ما هي أهمية الشروط الموضوعية والإجرائية معاً؟',
          options: [
            'ضمان صحة وسلامة التصرف القانوني أو الدعوى',
            'إطالة أمد النزاع بلا مبرر',
            'إلغاء دور القاضي تماماً',
            'الاستغناء عن النصوص القانونية'
          ],
          correctIndex: 0,
          explanation: 'استيفاء الشروط الموضوعية والإجرائية معاً هو أساس قبول أي تصرف أو نزاع قضائي.'
        }
      },
      {
        id: 'ch-default-3',
        chapterNumber: 3,
        title: 'الفصل الثالث: الآثار القانونية وانقضاء الحقوق أو الالتزامات',
        duration: '45 دقيقة',
        summary: 'دراسة الآثار القانونية المترتبة وكيفية انقضاء الحقوق والالتزامات وفق التشريع الساري.',
        detailedContent: `يترتب على قيام المراكز القانونية مجموعة من الآثار والالتزامات المتبادلة بين الأطراف.\n\nوفي حال استنفاد الغاية أو حلول الأجل أو التقادم، تنقضي تلك الحقوق والالتزامات وفق القواعد العامة في القانون المدني والتشريعات الخاصة.`,
        keyPoints: [
          'الآثار المترتبة على المراكز القانونية',
          'حالات انقضاء الالتزامات والحقوق',
          'التقادم والأسقاط القانوني'
        ],
        examples: [
          'انقضاء الالتزام بالوفاء أو المقاصة أو استحالة التنفيذ.',
          'سقوط الحق بمرور المدة (التقادم المسقط).'
        ],
        quiz: {
          question: 'ما هو الأثر القانوني للوفاء بالالتزام؟',
          options: [
            'انقضاء الالتزام وبراءة ذمة المدين',
            'بقاء الالتزام قائماً',
            'تضاعف الديون',
            'فرض عقوبات جنائية على المدين'
          ],
          correctIndex: 0,
          explanation: 'الوفاء هو الطريق الطبيعي لانقضاء الالتزام وبراءة ذمة المدين.'
        }
      },
      {
        id: 'ch-default-4',
        chapterNumber: 4,
        title: 'الفصل الرابع: الاجتهاد القضائي والتطبيقات العملية المعاصرة',
        duration: '60 دقيقة',
        summary: 'استعراض قرارات المحكمة العليا ومجلس الدولة وأبرز الإشكالات العملية في الواقع الجزائري.',
        detailedContent: `يختتم المقياس بدراسة تطبيقية لقرارات ومبادئ المحكمة العليا التي توحد الاجتهاد القضائي في الجزائر.\n\nتتم مناقشة حالات دراسية واقعية وكيفية معالجتها قانونياً.`,
        keyPoints: [
          'قرارات المحكمة العليا ومجلس الدولة',
          'توحيد الاجتهاد القضائي',
          'معالجة النزاعات العملية المعقدة'
        ],
        examples: [
          'الاستشهاد بقرار صادر عن الغرفة المدنية بالمحكمة العليا.',
          'التعليق على حكم قضائي صادر في منازعة إدارية أو تجارية.'
        ],
        quiz: {
          question: 'ما هي أهمية قرارات المحكمة العليا في النظام القانوني الجزائري؟',
          options: [
            'توحيد الاجتهاد القضائي وضمان حسن تطبيق القانون',
            'إصدار قوانين جديدة بدلاً من البرلمان',
            'إلغاء الدستور',
            'تحديد الضرائب العامة'
          ],
          correctIndex: 0,
          explanation: 'المحكمة العليا تضمن توحيد الاجتهاد القضائي في جميع أنحاء الوطن.'
        }
      }
    ]
  }) : null;

  const getEnrichedChapter = (chapter: CourseChapter): CourseChapter & {
    concept: string;
    characteristics: string[];
    examMethodology: {
      expectedQuestions: string[];
      modelAnswerPlan: string;
      keyTerms: { ar: string; fr: string; desc: string }[];
    };
  } => {
    if (!chapter) return chapter as any;
    const title = chapter.title || '';
    const summary = chapter.summary || '';
    const content = chapter.detailedContent || '';
    const combinedText = (title + ' ' + summary + ' ' + content).toLowerCase();

    // 1. Determine Law Theme
    let theme: 'constitutional' | 'criminal' | 'civil' | 'administrative' | 'sources' | 'application' | 'right' | 'french' | 'french2' | 'general' = 'general';

    if (selectedCourseId === 'y1-s2-l7' || (chapter.id && chapter.id.includes('ch-fr2'))) {
      theme = 'french2';
    } else if (selectedCourseId === 'y1-s1-l7' || (chapter.id && chapter.id.includes('ch-fr')) || combinedText.includes('chapitre') || combinedText.includes('terminologie') || combinedText.includes('français')) {
      theme = 'french';
    } else if (combinedText.includes('دستور') || (combinedText.includes('دستورية') && !selectedCourseId?.includes('l7')) || combinedText.includes('السلطة') || combinedText.includes('الحكم')) {
      theme = 'constitutional';
    } else if (combinedText.includes('جنائي') || combinedText.includes('عقوبات') || combinedText.includes('جريمة') || combinedText.includes('عقوبة') || combinedText.includes('متهم')) {
      theme = 'criminal';
    } else if (combinedText.includes('مدني') || combinedText.includes('عقد') || combinedText.includes('الالتزام') || combinedText.includes('التعويض') || combinedText.includes('المسؤولية')) {
      theme = 'civil';
    } else if (combinedText.includes('إداري') || combinedText.includes('الإدارة') || combinedText.includes('المرفق') || combinedText.includes('قرار إداري')) {
      theme = 'administrative';
    } else if (combinedText.includes('مصدر') || combinedText.includes('مصادر') || combinedText.includes('التشريع') || combinedText.includes('العرف') || combinedText.includes('شريعة')) {
      theme = 'sources';
    } else if (combinedText.includes('تطبيق') || combinedText.includes('الزمان') || combinedText.includes('المكان') || combinedText.includes('الرجعية') || combinedText.includes('إقليمية')) {
      theme = 'application';
    } else if (combinedText.includes('الحق') || combinedText.includes('الأشخاص') || combinedText.includes('الأهلية') || combinedText.includes('الذمة المالية')) {
      theme = 'right';
    }

    // 2. Default values based on themes
    let concept = '';
    let characteristics: string[] = [];
    let examMethodology = {
      expectedQuestions: [] as string[],
      modelAnswerPlan: '',
      keyTerms: [] as { ar: string; fr: string; desc: string }[]
    };
    let extraExamples: string[] = [];
    let extraQuizzes: any[] = [];

    if (theme === 'french') {
      concept = `مفهوم المصطلحات القانونية بالفرنسية (La Terminologie Juridique) هو دراسة المصطلحات والتعابير اللغوية والصياغات الرسمية الخاصة بحقل العلوم القانونية باللغة الفرنسية. يهدف هذا المقياس الأكاديمي لتمكين طالب الحقوق من قراءة وفهم وترجمة النصوص والوثائق القانونية والأحكام القضائية بدقة بالغة، ومقارنة فروع القانون العام والخاص والالتزامات والعقود لغةً واصطلاحاً.`;
      characteristics = [
        'La précision terminologique (الدقة الاصطلاحية): تفادي الخلط بين المفاهيم المتقاربة مثل الفرق الدقيق بين "الحكم" (Jugement) و"القرار" (Arrêt).',
        'La dualité linguistique (الثنائية اللغوية): القدرة على صياغة وترجمة المفاهيم القانونية بسلاسة تامة بين اللغتين العربية والفرنسية دون الإخلال بالمعنى التشريعي.',
        'La structure romano-germanique (البنية الرومانية الجرمانية): فهم الجذور المشتركة للنظامين القانونيين الجزائري والفرنسي في تصنيف القوانين ومصادرها.',
        'La clarté rédactionnelle (الوضوح التعبيري): صياغة الالتزامات والعقود والمرافعات بأسلوب قانوني بليغ ومحكم يطابق متطلبات المهنة القضائية.'
      ];
      extraExamples = [
        'ترجمة المادة الأولى من القانون المدني ببيان معنى "Les sources du droit" (مصادر القانون).',
        'مقارنة التعبيرين "Responsabilité contractuelle" و "Responsabilité délictuelle" في لوائح المحاكم.',
        'استعمال مصطلح "Force Majeure" (القوة القاهرة) في صياغة العقود التجارية الدولية والمحلية بالجزائر.'
      ];
      examMethodology = {
        expectedQuestions: [
          'Traduisez en arabe et expliquez la différence: "Droit Public" et "Droit Privé"?',
          'Quelles sont les conditions de validité d’un contrat en terminologie française?'
        ],
        modelAnswerPlan: `• **Introduction:** Définition de la terminologie juridique et importance de la traduction exacte dans l’interprétation judiciaire.\n• **Analyse - Partie I:** Les branches du droit et le vocabulaire lié à l’organisation judiciaire (Tribunal, Cour, Arrêt, Jugement).\n• **Analyse - Partie II:** La théorie générale des obligations et les expressions contractuelles de base (Contrat, Consentement, Capacité).\n• **Conclusion:** Rôle de la maîtrise de la langue étrangère pour le chercheur et le praticien du droit en Algérie.`,
        keyTerms: [
          { ar: 'القاعدة القانونية', fr: 'La règle de droit', desc: 'La norme de conduite générale, abstraite et obligatoire. / سلوك عام، مجرد وملزم ينظم العلاقات في المجتمع.' },
          { ar: 'القانون الموضوعي', fr: 'Droit Objectif', desc: "L'ensemble des règles juridiques régissant la société. / مجموعة القواعد القانونية التي تنظم سلوك الأفراد في المجتمع." },
          { ar: 'الحق الشخصي', fr: 'Droit Subjectif', desc: 'Prérogative attribuée à un sujet de droit par le droit objectif. / الميزة أو السلطة التي يمنحها القانون لشخص معين ويحميها.' },
          { ar: 'القانون العام', fr: 'Droit Public', desc: "Ensemble des règles qui régissent l'État et les collectivités publiques. / قواعد تنظم الدولة والشركات العامة وعلاقتها بالأفراد بصفتها صاحبة سيادة." },
          { ar: 'القانون الخاص', fr: 'Droit Privé', desc: 'Ensemble des règles qui régissent les rapports des particuliers entre eux. / قواعد تنظم العلاقات بين الأفراد أو الأشخاص العاديين.' },
          { ar: 'العقد', fr: 'Le Contrat', desc: 'Accord de volontés créant des obligations. /  اتفاق بين إرادتين أو أكثر على إحداث أثر قانوني.' },
          { ar: 'الالتزام', fr: "L'Obligation", desc: 'Lien de droit entre un créancier et un débiteur. / رابطة قانونية بين دائن ومدين تفرض القيام بعمل أو الامتناع عنه.' },
          { ar: 'الدائن', fr: 'Le Créancier', desc: 'Personne à qui une obligation est due (titulaire du droit). / الشخص صاحب الحق الذي يحق له مطالبة المدين بالوفاء.' },
          { ar: 'المدين', fr: 'Le Débiteur', desc: "Personne tenue d'exécuter une prestation envers le créancier. / الشخص الملتزم بأداء عمل أو دفع مبلغ لصالح الدائن." },
          { ar: 'الأهلية القانونية', fr: 'La Capacité juridique', desc: "Aptitude d'une personne à être titulaire de droits et à les exercer. / صلاحية الشخص لكسب الحقوق وتحمل الالتزامات ومباشرتها بنفسه." },
          { ar: 'الرضا', fr: 'Le Consentement', desc: 'Accord de volonté libre et sans vice pour former un contrat. / تطابق إرادتين خاليتين من أي عيب لنشوء العقد وتأسيسه.' },
          { ar: 'محل العقد', fr: "L'Objet du contrat", desc: 'La prestation ou la chose sur laquelle porte l\'accord. / العملية القانونية أو الشيء المادي الذي يلتزم الأطراف بتقديمه.' },
          { ar: 'السبب', fr: 'La Cause', desc: 'Le motif licite pour lequel les parties s\'engagent. / الباعث الدافع والمشروع الذي دفع أطراف العقد للتعاقد.' },
          { ar: 'القوة القاهرة', fr: 'Force Majeure', desc: 'Événement imprévisible, irrésistible et extérieur libérant le débiteur. / حادث مفاجئ، غير متوقع وخارجي يجعل الوفاء بالالتزام مستحيلاً.' },
          { ar: 'المسؤولية التقصيرية', fr: 'Responsabilité délictuelle', desc: 'Obligation de réparer le dommage causé par un fait illicite (Art. 124). / الالتزام بالتعويض عن ضرر ناتج عن فعل غير مشروع دون عقد سابق.' },
          { ar: 'المسؤولية العقدية', fr: 'Responsabilité contractuelle', desc: 'Obligation de réparer le dommage résultant de l\'inexécution d\'un contrat. / الالتزام بجبر الضرر الناتج عن عدم تنفيذ بنود العقد أو التأخر فيه.' },
          { ar: 'المحكمة', fr: 'Le Tribunal', desc: 'Juridiction de premier degré qui tranche les litiges ordinaires. / الجهة القضائية الابتدائية ذات الدرجة الأولى للفصل في النزاعات.' },
          { ar: 'مجلس القضاء', fr: "La Cour d'appel", desc: 'Juridiction de second degré réexaminant les affaires contestées. / الجهة القضائية من الدرجة الثانية التي تفصل في استئناف الأحكام.' },
          { ar: 'المحكمة العليا', fr: 'La Cour Suprême', desc: 'Sommet de l\'ordre judiciaire, juge de la bonne application de la loi. / قمة الهرم القضائي العادي، تراقب مدى ملاءمة وصحة تطبيق القانون.' },
          { ar: 'مجلس الدولة', fr: "Le Conseil d'État", desc: 'Organe suprême régulateur de l\'activité des juridictions administratives. / الهيئة القضائية العليا المكلفة بتوحيد واجتهاد القضاء الإداري.' },
          { ar: 'الحكم القضائي', fr: 'Le Jugement', desc: 'Décision de justice rendue par un tribunal de premier degré. / القرار الصادر عن محكمة الدرجة الأولى للفصل في خصومة معينة.' },
          { ar: 'القرار القضائي', fr: "L'Arrêt", desc: 'Décision de justice rendue par une juridiction supérieure (Cour, etc.). / القرار الصادر عن جهة قضائية عليا كالمجلس القضائي أو المحكمة العليا.' },
          { ar: 'الاجتهاد القضائي', fr: 'La Jurisprudence', desc: 'Ensemble des décisions des tribunaux créant des solutions de droit. / ما استقرت عليه المحاكم من تفسيرات قانونية لسد ثغرات التشريع.' },
          { ar: 'الفقه القانوني', fr: 'La Doctrine', desc: 'Travaux, analyses et opinions des professeurs et savants du droit. / آراء ودراسات أساتذة وشيوخ القانون المكتوبة لشرح ونقد التشريعات.' },
          { ar: 'الدستور', fr: 'La Constitution', desc: 'Loi suprême organisant les pouvoirs publics et garantissant les libertés. / القانون الأساسي الأعلى للدولة الذي يحدد نظام الحكم والسلطات وحريات الأفراد.' },
          { ar: 'القوانين العضوية', fr: 'Lois Organiques', desc: 'Lois complétant la Constitution pour organiser les grandes institutions. / قوانين تكمل وتفصل نصوص الدستور لتنظيم الهيئات الدستورية الكبرى.' },
          { ar: 'مرسوم رئاسي', fr: 'Décret Présidentiel', desc: 'Acte réglementaire émis directement par le Président de la République. / نص تنظيمي يصدر عن رئيس الجمهورية في حدود صلاحياته الدستورية.' },
          { ar: 'الاستئناف', fr: "L'Appel (Recours)", desc: 'Voie de recours ordinaire visant à réformer un jugement de premier degré. / طريق طعن عادي يهدف لإعادة عرض النزاع أمام المجلس القضائي.' },
          { ar: 'الطعن بالنقض', fr: 'Le Pourvoi en cassation', desc: 'Recours extraordinaire devant la Cour suprême pour violation de la loi. / طريق طعن غير عادي يرفع للمحكمة العليا لمراجعة الأخطاء القانونية للحكم.' },
          { ar: 'الأمر التشريعي', fr: "L'Ordonnance", desc: 'Mesure prise par le Président dans des matières législatives urgentes. / أداة تشريعية يضعها رئيس الجمهورية في ظروف استثنائية أو غياب البرلمان.' },
          { ar: 'العرف', fr: 'La Coutume', desc: 'Règle née d\'une pratique répétée et perçue comme obligatoire. / عادة سلوكية استقرت في المجتمع لزمن طويل واعتقد الأفراد بإلزاميتها.' },
          { ar: 'البطلان المطلق', fr: 'Nullité absolue', desc: 'Sanction frappant un acte manquant d\'une condition essentielle de validité. / جزاء يلحق العقد إذا فقد ركناً أساسياً، ويعيده للعدم بأثر رجعي.' },
          { ar: 'البطلان النسبي (القابلية للإبطال)', fr: 'Nullité relative', desc: 'Sanction protégeant une partie dont le consentement a été vicié. / بطلان يقرره القانون لحماية متعاقد شاب رضا إرادته عيب أو نقص أهلية.' },
          { ar: 'التقادم', fr: 'La Prescription', desc: 'Extinction d\'un droit ou libération d\'une obligation après un délai légal. / مرور فترة زمنية يحددها القانون تؤدي لسقوط الحق أو كسبه.' },
          { ar: 'الشخص الاعتباري (المعنوي)', fr: 'La Personne Morale', desc: 'Entité juridique fictive (société, association) ayant des droits et devoirs. / كيان اعتباري مستقل (شركة، بلدية) يمنحه القانون ذمة مالية وأهلية.' },
          { ar: 'النظام العام', fr: 'Ordre Public', desc: 'Principes impératifs nécessaires à la stabilité sociale et morale. / الأسس والقواعد الآمرة الضرورية لحماية أمن واستقرار ومصالح المجتمع.' },
          { ar: 'إلغاء القانون', fr: "L'Abrogation de la loi", desc: 'Annulation ou remplacement d\'une règle de droit par une nouvelle. / إنهاء العمل بقاعدة قانونية وتعويضها بنص جديد صريح أو ضمني.' },
          { ar: 'الإعذار', fr: 'La mise en demeure', desc: 'Sommation solennelle exigeant du débiteur qu\'il exécute son obligation. / تنبيه رسمي يوجهه الدائن للمدين لمطالبته بتنفيذ التزامه تحت طائلة التعويض.' },
          { ar: 'المتقاضي', fr: 'Le Justiciable', desc: 'Toute personne physique ou morale soumise à la compétence des tribunaux. / كل شخص طبيعي أو اعتباري يلجأ للقضاء للحصول على حقوقه.' },
          { ar: 'القانون الجنائي (العقوبات)', fr: 'Droit Pénal', desc: 'Ensemble des règles définissant les infractions et fixant les peines. / فرع من فروع القانون يحدد الأفعال المجرمة والعقوبات المقررة لها.' }
        ]
      };
      extraQuizzes = [
        {
          question: 'Comment traduit-on "La règle de droit est générale, abstraite et obligatoire"?',
          options: [
            'القاعدة القانونية عامة ومجردة وملزمة',
            'الحق الشخصي خاص ونسبي ومستقل',
            'المحكمة العليا تصدر قرارات قضائية ملزمة',
            'العقد شريعة المتعاقدين بموجب الاتفاق'
          ],
          correctIndex: 0,
          explanation: '"Générale" = عامة, "abstraite" = مجردة, "obligatoire" = ملزمة.'
        },
        {
          question: 'Quelle est la signification en arabe de "La force majeure"?',
          options: [
            'المسؤولية التقصيرية والتعويض المادي',
            'القوة القاهرة وحادث خارجي غير متوقع',
            'الأهلية القانونية الكاملة للقاصر',
            'سلطان الإرادة وحرية التعاقد المطلقة'
          ],
          correctIndex: 1,
          explanation: '"Force majeure" signifie القوة القاهرة.'
        }
      ];
    } else if (theme === 'french2') {
      concept = `مفهوم المصطلحات القانونية بالفرنسية للمستوى الثاني (La Terminologie Juridique II) يرتكز أساساً على دراسة مصطلحات القانون الإداري والقانون الدستوري ونظرية الدولة والتنظيم الإداري والمنازعات الإدارية باللغة الفرنسية. يهدف لتمكين الطالب من صياغة وتحليل النصوص المتعلقة بالسلطات العامة، المرفق العام، القرارات الإدارية، وعلاقة الإدارة بالمواطنين في ظل الثنائية القضائية بالجزائر.`;
      characteristics = [
        'La rigueur de la terminologie publique (دقة المصطلحات العامة): التمييز الدقيق بين المفاهيم الرئاسية والوصائية، وبين اللامركزية وعدم التركيز الإداري.',
        'La dualité juridictionnelle (الثنائية القضائية): فهم بنية القضاء الإداري بالفرنسية والتمييز بين مجلس الدولة والمحاكم الإدارية ومحكمة التنازع.',
        'Les prérogatives exorbitantes (الامتيازات الاستثنائية): استيعاب المصلحة العامة والتوازن بين سلطات المرفق العام وحماية حقوق الخواص.',
        'La terminologie constitutionnelle (المصطلحات الدستورية): فهم المبادئ الكبرى كفصل السلطات وسيادة القانون وشكل الدولة البسيطة والمركبة.'
      ];
      extraExamples = [
        'تحليل مصطلح "Service public" (المرفق العام) والفرق بينه وبين "L’établissement public" (المؤسسة العمومية).',
        'ترجمة وتحليل شروط دعوى تجاوز السلطة "Le recours pour excès de pouvoir" أمام مجلس الدولة والجهة الإدارية المختصة.',
        'استيعاب الركائز الثلاث للنظام العام "L’ordre public" وهي: الأمن (La sécurité)، السكينة (La tranquillité)، والصحة العامة (La salubrité).'
      ];
      examMethodology = {
        expectedQuestions: [
          'Traduisez en arabe et expliquez la différence entre "La centralisation" et "La décentralisation administrative"?',
          'Analysez en terminologie française les éléments constitutifs de l’État et ses formes.'
        ],
        modelAnswerPlan: `• **Introduction:** Définition de l’État et de l'organisation administrative comme bases du droit public.\n• **Analyse - Partie I:** Les concepts constitutionnels: la souveraineté, la Constitution et le principe de séparation des pouvoirs.\n• **Analyse - Partie II:** Les concepts administratifs: le service public, la police administrative, l'acte unilatéral et le contentieux devant le Conseil d'État.\n• **Conclusion:** L'importance d'employer une terminologie rigoureuse pour garantir la sécurité juridique et la conformité constitutionnelle.`,
        keyTerms: [
          { ar: 'الدولة', fr: 'L’État', desc: "Ancienne institution politique disposant d'un territoire, d'une population et d'un pouvoir souverain. / مؤسسة سياسية وقانونية تقوم على ركائز الإقليم والشعب والسلطة ذات السيادة." },
          { ar: 'السيادة', fr: 'La Souveraineté', desc: "Le pouvoir suprême et indépendant reconnu à l'État. / السلطة العليا والكاملة والمستقلة للدولة على إقليمها وفي علاقاتها الخارجية." },
          { ar: 'الإقليم', fr: 'Le Territoire', desc: "L’espace géographique terrestre, maritime et aérien sous la juridiction de l'État. / المجال الجغرافي الأرضي والبحري والجوي الذي تمارس الدولة فيه سلطاتها." },
          { ar: 'الشعب', fr: 'La Population', desc: "L’ensemble des individus vivant sur le territoire de l’État et soumis à ses lois. / مجموع الأفراد المقيمين على إقليم الدولة والمرتبطين بها برابطة الجنسية." },
          { ar: 'الدستور', fr: 'La Constitution', desc: "La loi fondamentale qui régit l’organisation des pouvoirs publics et garantit les droits. / القانون الأسمى والأساسي للدولة الذي يحدد نظام الحكم والسلطات." },
          { ar: 'الدولة البسيطة (الموحدة)', fr: 'L’État unitaire', desc: "Une forme d’État où un seul centre de décision détient la totalité du pouvoir politique. / الدولة التي تنفرد فيها سلطة واحدة بإدارة جميع شؤون إقليمها بشكل موحد." },
          { ar: 'الدولة الفدرالية (المركبة)', fr: 'L’État fédéral', desc: "Union d’États qui partagent le pouvoir politique entre un gouvernement fédéral et des États fédérés. / اتحاد دولتين أو أكثر تنشأ بموجبه دولة جديدة تتقاسم السلطة مع دويلاتها." },
          { ar: 'الفصل بين السلطات', fr: 'La Séparation des pouvoirs', desc: "Principe constitutionnel empêchant la concentration des pouvoirs entre les mains d'un seul organe. / مبدأ دستوري يوزع الوظائف التشريعية والتنفيذية والقضائية لمنع الاستبداد." },
          { ar: 'السلطة التشريعية', fr: 'Le Pouvoir législatif', desc: "Le pouvoir chargé de voter et de rédiger les lois, exercé par le Parlement. / السلطة التي يمارسها البرلمان بسن وتشريع القوانين ومراقبة الحكومة." },
          { ar: 'السلطة التنفيذية', fr: 'Le Pouvoir exécutif', desc: "Le pouvoir chargé de veiller à l’application des lois et de diriger la politique nationale. / السلطة المكلفة بتنفيذ وتطبيق القوانين وإدارة السياسة العامة وتسيير الدولة." },
          { ar: 'السلطة القضائية', fr: 'Le Pouvoir judiciaire', desc: "Le pouvoir chargé d’interpréter et d’appliquer les lois pour trancher les litiges. / السلطة المستقلة المكلفة بالفصل في المنازعات وتطبيق النصوص لحفظ الحقوق." },
          { ar: 'اللامركزية الإدارية', fr: 'La Décentralisation', desc: "Le transfert de compétences administratives de l'État vers des collectivités locales autonomes. / توزيع الوظيفة الإدارية بمنح الشخصية المعنوية والاستقلال المالي للمجالس المنتخبة." },
          { ar: 'المركزية الإدارية', fr: 'La Centralisation', desc: "La concentration de toutes les décisions administratives entre les mains des autorités centrales. / حصر سلطات البت والتقرير الإداري في العاصمة بيد الوزير والجهات المركزية." },
          { ar: 'عدم التركيز الإداري', fr: 'La Déconcentration', desc: "L’attribution de pouvoirs de décision à des agents locaux de l'État (comme le Wali). / نقل جزء من سلطة القرار من الإدارة المركزية إلى ممثليها المحليين لتخفيف العبء." },
          { ar: 'الشخصية المعنوية', fr: 'La Personnalité morale', desc: "L’aptitude d’un groupement (comme l'État ou la Commune) à être titulaire de droits et d'obligations. / صلاحية يعترف بها القانون لكيان مستقل لكسب الحقوق والالتزام مالياً." },
          { ar: 'الإدارة العامة', fr: 'L’Administration publique', desc: "L’ensemble des organismes et agents chargés de mettre en œuvre les politiques publiques. / مجموع الهياكل والمؤسسات والموظفين المكلفين بتسيير المرافق والخدمات العامة." },
          { ar: 'المرفق العام', fr: 'Le Service public', desc: "Une activité d’intérêt général gérée par une personne publique ou sous son contrôle. / نشاط يستهدف الصالح العام تنشئه الدولة وتديره مباشرة أو غير مباشرة." },
          { ar: 'المصلحة العامة', fr: 'L’Intérêt général', desc: "La finalité de l'action administrative visant le bien-être de l’ensemble de la société. / الهدف والغاية الكبرى لكافة الأنشطة والقرارات والتدابير الإدارية." },
          { ar: 'الضبط الإداري', fr: 'La Police administrative', desc: "L'activité administrative visant à préserver l'ordre public par des mesures restrictives. / مجموعة القرارات والتدابير الوقائية المانعة التي تحد من الحريات لحفظ الاستقرار." },
          { ar: 'النظام العام', fr: 'L’Ordre public', desc: "L'état de paix sociale caractérisé par la sécurité, la salubrité et la tranquillité publiques. / الحالة التي يسودها الأمن والهدوء والنظافة العامة كركائز للاستقرار." },
          { ar: 'الأمن العام', fr: 'La Sécurité publique', desc: "La protection des personnes et des biens contre les risques de violence ou d’accidents. / حماية الأفراد وممتلكاتهم وصيانتهم من الأخطار والاعتداءات المادية." },
          { ar: 'السكينة العامة', fr: 'La Tranquillité publique', desc: "L'absence de bruits, désordres, disputes ou nuisances dans l’espace public. / توفير الهدوء وراحة المواطنين ومنع الضوضاء والاضطرابات والضجيج بالشارع." },
          { ar: 'الصحة العامة / النظافة', fr: 'La Salubrité publique', desc: "La préservation de l'hygiène, de la santé collective et de l’environnement. / التدابير الهادفة لمنع انتشار الأوبئة والأمراض والحفاظ على البيئة السليمة." },
          { ar: 'القرار الإداري الانفرادي', fr: 'L’Acte administratif unilatéral', desc: "La décision prise par une autorité administrative s'imposant aux administrés sans leur consentement. / إفصاح الإدارة عن إرادتها الملزمة بامتياز السلطة العامة دون توافق الإرادتين." },
          { ar: 'العقد الإداري', fr: 'Le Contrat administratif', desc: "L’accord passé par une personne publique comportant des clauses exorbitantes du droit commun. / اتفاق تبرمه جهة إدارية لتسيير مرفق عام يشتمل على شروط استثنائية." },
          { ar: 'الشرط الاستثنائي', fr: 'La Clause exorbitante', desc: "Une clause contractuelle inhabituelle en droit privé, accordant des prérogatives de puissance publique. / شرط يعطي الإدارة حقوقاً أو يفرض التزامات تخرج عن المألوف في القانون المدني." },
          { ar: 'امتياز السلطة العامة', fr: 'La Prérogative de puissance publique', desc: "Les pouvoirs de commandement exceptionnels reconnus à l'administration (ex: expropriation). / حقوق استثنائية للإدارة تمنحها التفوق القانوني لحماية المصلحة العامة." },
          { ar: 'نزع الملكية للمنفعة العامة', fr: 'L’Expropriation', desc: "La procédure permettant à l'administration d'acquérir un bien immobilier privé en échange d'une indemnité. / نزع ملكية عقار خاص جبرياً بامتياز القانون لتنفيذ مشروع عمومي مقابل تعويض عادل." },
          { ar: 'المنازعات الإدارية', fr: 'Le Contentieux administratif', desc: "L’ensemble des litiges opposant les administrés à l’administration, tranchés par le juge administratif. / القضايا والخلافات القضائية التي تكون الإدارة طرفاً فيها أمام القضاء الإداري." },
          { ar: 'دعوى تجاوز السلطة', fr: 'Le Recours pour excès de pouvoir', desc: "Le recours visant à obtenir l’annulation d’un acte administratif illégal devant le juge. / دعوى ترفع أمام القاضي الإداري للمطالبة بإلغاء قرار إداري مشوب بعدم المشروعية." },
          { ar: 'دعوى القضاء الكامل', fr: 'Le Recours de plein contentieux', desc: "La procédure permettant au juge de réformer un acte administratif et de condamner l’administration à indemniser. / دعوى يملك فيها القاضي تعديل القرار وتجاوز الإلغاء إلى الحكم بالتعويض المالي." },
          { ar: 'مجلس الدولة', fr: 'Le Conseil d’État', desc: "La plus haute juridiction de l’ordre administratif en Algérie, régulateur du contentieux administrative. / الهيئة القضائية العليا لتثبيت أحكام القضاء الإداري وتوحيد ممارساته." },
          { ar: 'المحكمة الإدارية', fr: 'Le Tribunal administratif', desc: "La juridiction de premier degré compétente pour juger les litiges administratifs locaux. / الجهة القضائية ذات الدرجة الأولى والمختصة بالنزاعات الإدارية الولائية والبلدية." },
          { ar: 'تنازع الاختصاص', fr: 'Le Conflit d’attribution', desc: "La contestation de la compétence entre le juge ordinaire et le juge administratif. / النزاع حول تحديد الجهة القضائية المختصة بالفصل (القضاء العادي أم الإداري)." },
          { ar: 'محكمة التنازع', fr: 'Le Tribunal des conflits', desc: "La jurisdiction spéciale chargée de trancher les conflits de compétence entre les deux ordres judiciaires. / محكمة مخصصة لحل النزاعات القضائية حول الاختصاص وتحديد القاضي الطبيعي للملف." },
          { ar: 'الوصاية الإدارية', fr: 'La Tutelle administrative', desc: "Le contrôle exercé par l'État sur les actes et les organes des collectivités décentralisées. / رقابة محدودة يفرضها القانون على المجالس المحلية لضمان المشروعية والمال العام." },
          { ar: 'السلطة الرئاسية', fr: 'Le Pouvoir hiérarchique', desc: "Le pouvoir d'un supérieur d'adresser des instructions, d'annuler ou de réformer les actes de son subordonné. / سلطة يملكها رئيس الإدارة لتوجيه وتعديل وإلغاء قرارات مرؤوسيه دون قيد مسبق." },
          { ar: 'الجماعة الإقليمية', fr: 'La Collectivité territoriale', desc: "Une entité de décentralisation disposant de la personnalité morale, comme la Commune ou la Wilaya. / أشخاص معنوية عامة تمثل جزءاً من التراب الوطني، تتمتع باستقلال محلي." },
          { ar: 'المؤسسة العمومية الإدارية', fr: 'L’Établissement public administratif (EPA)', desc: "Une personne publique dotée d’une autonomie de gestion pour accomplir une mission de service public administratif. / شخص معنوي عام يمنح الاستقلال الإداري لتسيير مرفق عام لا طابع تجاري له." },
          { ar: 'مسؤولية الإدارة', fr: 'La Responsabilité de l’administration', desc: "L’obligation pour l’administration de réparer les préjudices causés par ses activités ou ses fautes. / التزام الشخص العام بجبر وتعويض الأضرار المترتبة عن أخطاء موظفيه ومرافقه." }
        ]
      };
      extraQuizzes = [
        {
          question: 'Comment traduit-on "Le principe de séparation des pouvoirs"?',
          options: [
            'مبدأ الفصل بين السلطات',
            'مبدأ سمو الدستور الجزائري',
            'مبدأ استقلالية المرفق العام',
            'مبدأ الرقابة القضائية الإدارية'
          ],
          correctIndex: 0,
          explanation: '"Le principe de séparation des pouvoirs" se traduit par مبدأ الفصل بين السلطات.'
        },
        {
          question: 'Quelle est la juridiction suprême de l’ordre administratif en Algérie?',
          options: [
            'La Cour Suprême',
            'Le Conseil d’État',
            'Le Tribunal des conflits',
            'La Cour Constitutionnelle'
          ],
          correctIndex: 1,
          explanation: '"Le Conseil d’État" (مجلس الدولة) est la plus haute instance de l’ordre administratif en Algérie.'
        }
      ];
    } else if (theme === 'constitutional') {
      concept = `المفهوم الدستوري الأكاديمي يقرر بأن القانون الدستوري هو البنيان القانوني الأسمى للدولة. يعبّر عن سيادة الشعب ويحدد هوية الدولة الجزائرية، نظامها الجمهوري، توزيع الصلاحيات بين رئيس الجمهورية ورئيس الحكومة، ومهمة البرلمان بغرفتيه في الرقابة والتشريع، مع تقرير الضمانات اللازمة للحريات الأساسية للمواطنين.`;
      characteristics = [
        'العلو والسمو الدستوري المطلق على كافة القوانين والأنظمة التنفيذية في هرم التدرج القانوني.',
        'الجمود النسبي (يتطلب تعديل الدستور إجراءات مبادرة وتصويت واستفتاء معقدة وخاصة تختلف تماماً عن القوانين العادية).',
        'التأصيل السياسي والديمقراطي (يعتبر بمثابة العقد الاجتماعي الحقيقي المؤسس والمنظم للسلطات العامة).',
        'توفير الحماية القضائية العظمى عبر الرقابة الصارمة للمحكمة الدستورية على كافة التشريعات والمراسيم.'
      ];
      extraExamples = [
        'ممارسة البرلمان لحق الرقابة على الحكومة عبر الأسئلة الشفهية والكتابية وملتمسات الرقابة بضوابط الدستور الجزائري.',
        'إصدار رئيس الجمهورية لمراسيم رئاسية بقوانين في الحالة الاستثنائية بضوابط المادة 98 من الدستور.',
        'استشارة المحكمة الدستورية مسبقاً في دستورية القوانين العضوية قبل إصدارها رسمياً.'
      ];
      examMethodology = {
        expectedQuestions: [
          'قارن بين صلاحيات رئيس الجمهورية ورئيس الحكومة في ظل التعديل الدستوري لسنة 2020 بالجزائر؟',
          'حلل طبيعة رقابة الملائمة ورقابة الدستورية التي تمارسها المحكمة الدستورية الجزائرية.'
        ],
        modelAnswerPlan: `• **المقدمة:** تعريف الدستور كمصدر أعلى للشرعية القانونية، والتأكيد على المبادئ التي كرسها تعديل 2020.\n• **التحليل - المبحث الأول:** طبيعة وتوزيع الصلاحيات الدستورية بين السلطة التنفيذية والتشريعية في الجزائر.\n• **التحليل - المبحث الثاني:** دور المحكمة الدستورية في ضمان سمو الدستور وحماية الحقوق والحريات الفردية.\n• **الخاتمة:** التأكيد على أن استقلال القضاء وحياد الرقابة هما صمام الأمان الحقيقي لدولة القانون.`,
        keyTerms: [
          { ar: 'المحكمة الدستورية', fr: 'Cour Constitutionnelle', desc: 'الجهة الدستورية العليا المستقلة لمراقبة الدستورية وتفسير أحكامه.' },
          { ar: 'الفصل بين السلطات', fr: 'Séparation des pouvoirs', desc: 'مبدأ يمنع تركز السلطة في جهة واحدة تلافياً للاستبداد وحفظاً للتوازن.' },
          { ar: 'السمو الدستوري', fr: 'Suprématie constitutionnelle', desc: 'علو القواعد الدستورية على ما دونها من قواعد كالتشريع العادي والتنظيمي.' }
        ]
      };
      extraQuizzes = [
        {
          question: 'ما هي الهيئة العليا المستقلة المكلفة بضمان احترام الدستور ورقابة دستورية القوانين بالجزائر؟',
          options: ['المجلس الأعلى للقضاء', 'المحكمة الدستورية', 'المحكمة العليا', 'مجلس الدولة'],
          correctIndex: 1,
          explanation: 'المحكمة الدستورية هي الهيئة الدستورية العليا المستقلة المكلفة بضمان احترام الدستور ورقابة دستورية القوانين.'
        },
        {
          question: 'من يملك سلطة المبادرة بالقوانين في النظام البرلماني الجزائري؟',
          options: ['رئيس الجمهورية فقط', 'رئيس الحكومة (أو الوزير الأول) وأعضاء المجلس الشعبي الوطني', 'المحكمة العليا والنائب العام المساعد', 'المواطنون عبر عريضة شعبية ملزمة بغير قيد'],
          correctIndex: 1,
          explanation: 'تكون المبادرة بالقوانين بموجب الدستور من طرف رئيس الحكومة (مشاريع قوانين) أو النواب (اقتراحات قوانين).'
        }
      ];
    } else if (theme === 'criminal') {
      concept = `مفهوم القانون الجنائي يقوم على ضبط الحدود الفاصلة بين الحرية الفردية وحماية الكيان الاجتماعي. وهو يهدف لمنع الجريمة عبر تقرير الجزاءات والتدابير المناسبة، وضمان محاكمة عادلة تكفل للمتهم حقوق الدفاع وقرينة البراءة كأصول دستورية لا حياد عنها.`;
      characteristics = [
        'مبدأ الشرعية المطلق (لا جريمة ولا عقوبة بلا نص تشريعي صريح ومكتوب مسبق التطبيق).',
        'التفسير الضيق للنصوص الجنائية (منع القياس أو التوسع في التجريم مطلقاً لفائدة المتهم وصوناً لحقوقه).',
        'شخصية العقوبة والمسؤولية (لا تقع العقوبة أو المساءلة إلا على الشخص الفاعل أو الشريك المباشر في ارتكابها).',
        'العام والآمر (قواعد القانون الجنائي تهم النظام العام الاجتماعي مباشرة ولا يجوز الاتفاق على مخالفتها أو إعفائها بغير نص).'
      ];
      extraExamples = [
        'منع إدانة أي شخص بتهمة النصب الإلكتروني ما لم تتوفر الأركان المادية المحددة بالمادة 372 من قانون العقوبات الجزائري.',
        'تطبيق ركن القصد الجنائي (النية الإجرامية) لتشديد العقوبة في القتل العمدي مقارنة بالقتل الخطأ غير المقصود.',
        'مراعاة المحكمة لظروف التخفيف القانونية أو الأعذار القانونية المخففة كصغر السن وعوارض الأهلية للحد من قسوة العقوبة.'
      ];
      examMethodology = {
        expectedQuestions: [
          'حلل الأركان الثلاثة للجريمة (الشرعي والمادي والمعنوي) ببيان دور السببية القضائية؟',
          'اشرح مبدأ الشرعية الجنائية مبيناً النتائج المترتبة عليه في التشريع والقضاء الجزائري.'
        ],
        modelAnswerPlan: `• **المقدمة:** تعريف الجريمة قانوناً، وبيان أهمية مبدأ الشرعية الجنائية (مبدأ حماية الحقوق والحريات).\n• **التحليل - المبحث الأول:** تفصيل الركن المادي (سلوك، نتيجة، رابطة سببية) وتطبيقاته القضائية بالجزائر.\n• **التحليل - المبحث الثاني:** تفصيل الركن المعنوي (القصد الجنائي العام والخاص، والخطأ غير العمدي وعوارض النية).\n• **الخاتمة:** التأكيد على ضرورة التوازن بين مكافحة الجريمة وضمان حقوق الإنسان والمحاكمة العادلة.`,
        keyTerms: [
          { ar: 'شرعية الجرائم والعقوبات', fr: 'Légalité des délits et des peines', desc: 'مبدأ يمنع تجريم الأفعال أو المعاقبة عليها دون نص سابق صريح ومكتوب.' },
          { ar: 'الركن المادي', fr: 'Élément matériel', desc: 'السلوك الإجرامي الملموس والنتيجة المترتبة وعلاقة السببية الحتمية بينهما.' },
          { ar: 'القصد الجنائي', fr: 'Intention coupable', desc: 'اتجاه إرادة الجاني إلى ارتكاب الفعل مع العلم بعناصره وآثاره القانونية.' }
        ]
      };
      extraQuizzes = [
        {
          question: 'ما هو المبدأ الذي يمنع القاضي الجنائي من القياس لتجريم سلوك جديد غير منصوص عليه؟',
          options: ['مبدأ حسن النية', 'مبدأ شرعية الجرائم والعقوبات والتفسير الضيق', 'مبدأ سلطان الإرادة', 'مبدأ الأثر الفوري للقانون المدني'],
          correctIndex: 1,
          explanation: 'مبدأ الشرعية الجنائية يفرض التفسير الضيق للنصوص ويحظر تماماً القياس لتجريم أفعال لم ينص عليها المشرع صراحة.'
        },
        {
          question: 'يتكون الركن المادي للجريمة من ثلاثة عناصر أساسية وهي:',
          options: ['القصد الجنائي، النية، والإرادة العامة', 'السلوك الإجرامي، النتيجة الإجرامية، وعلاقة السببية بينهما', 'النص القانوني، العقوبة، والمحاكمة الجنائية', 'المتهم، الضحية، والشهود الحاضرين في الواقعة'],
          correctIndex: 1,
          explanation: 'الركن المادي يتطلب نشاطاً خارجياً ملموساً (سلوك)، وحدوث أثر مادي (نتيجة)، وربط السلوك بالنتيجة (علاقة سببية).'
        }
      ];
    } else if (theme === 'civil') {
      concept = `مفهوم القانون المدني يعتبره الشريعة العامة والعمود الفقري لكافة معاملات القانون الخاص. ينظم العلاقات المالية والتزامات الأشخاص التعاقدية وغير التعاقدية، مستنداً إلى مبادئ العدالة، استقرار العقود، وحماية الطرف الضعيف والمستهلك من شروط الإذعان المجحفة في المعاملات الحديثة.`;
      characteristics = [
        'مبدأ سلطان الإرادة (حرية التعاقد واختيار البنود بضوابط النظام العام والآداب العامة).',
        'مبدأ حسن النية المطلق في تنفيذ وتفسير الالتزامات التعاقدية بين المتعاقدين.',
        'الموازنة بين استقرار المعاملات وحماية الإرادة المعيبة (الرضا الخالي من العيوب).',
        'جبر الضرر بالكامل عبر المسؤولية المدنية بنوعيها (التقصيرية والعقدية).'
      ];
      extraExamples = [
        'حق المشتري في طلب إبطال عقد بيع عقار نتيجة لوقوعه ضحية تدليس متعمد من البائع بإخفاء عيوب هيكلية.',
        'إلزام شخص بالتعويض الكامل عن إتلاف سيارة جاره نتيجة إهماله وتسببه في حادث (مسؤولية تقصيرية بموجب المادة 124).',
        'تعديل المحكمة لبند تعسفي في عقد اشتراك بالإنترنت لمصلحة المستهلك باعتباره عقد إذعان مجحف للطرف الضعيف.'
      ];
      examMethodology = {
        expectedQuestions: [
          'حلل شروط قيام المسؤولية التقصيرية في القانون المدني الجزائري وفق المادة 124 وما بعدها؟',
          'ما هي حدود تطبيق مبدأ سلطان الإرادة وعلاقته بالنظام العام والآداب العامة؟'
        ],
        modelAnswerPlan: `• **المقدمة:** تعريف العقد والالتزام، وموقع المسؤولية المدنية في المنظومة التشريعية المدنية.\n• **التحليل - المبحث الأول:** أركان المسؤولية التقصيرية (الخطأ، الضرر، الرابطة السببية) وطرق إثباتها قضائياً.\n• **التحليل - المبحث الثاني:** آثار قيام المسؤولية وطرق جبر الضرر (التعويض العيني أو النقدي) وضوابطه.\n• **الخاتمة:** دور المشرع الجزائري في تحديث أحكام المسؤولية لمواكبة التطورات الصناعية والرقمنة.`,
        keyTerms: [
          { ar: 'العقد شريعة المتعاقدين', fr: 'Force obligatoire du contrat', desc: 'مبدأ يمنع نقض العقد أو تعديله إلا باتفاق الطرفين أو لأسباب يقررها القانون بوضوح.' },
          { ar: 'المسؤولية التقصيرية', fr: 'Responsabilité délictuelle', desc: 'الالتزام بالتعويض الناشئ عن فعل ضار غير مشروع دون وجود عقد سابق يربط الأطراف.' },
          { ar: 'عيوب الرضا', fr: 'Vices du consentement', desc: 'العوامل المؤثرة على الإرادة والتمييز مثل الغلط والتدليس والإكراه والاستغلال.' }
        ]
      };
      extraQuizzes = [
        {
          question: 'أي من عيوب الرضا يخول للمتعاقد طلب إبطال العقد بسبب استعمال طرق احتيالية لإيقاعه في الغلط؟',
          options: ['الإكراه المادي', 'الغبن والتعسف', 'التدليس الخداعي', 'الغلط التلقائي غير المفتعل'],
          correctIndex: 2,
          explanation: 'التدليس هو استعمال حيل واحتيال وخداع يوقع المتعاقد الآخر في غلط يدفعه للتعاقد لولا هذا الخداع.'
        },
        {
          question: 'ما هي الأركان الثلاثة الواجب توفرها لقيام المسؤولية التقصيرية والالتزام بالتعويض عن الفعل الضار؟',
          options: ['التراضي، المحل، والسبب المشروع', 'الخطأ، الضرر، وعلاقة السببية بين الخطأ والضرر', 'الكتابة، التسجيل، والإشهار العقاري بالمحافظة العقارية', 'الإنذار، الإعذار، والفسخ القضائي المصحوب بتعويض'],
          correctIndex: 1,
          explanation: 'وفقاً للمادة 124 من القانون المدني الجزائري، تقوم المسؤولية على ثلاثة أركان متكاملة: الخطأ (الفعل الضار)، الضرر (المادي أو المعنوي)، والسببية.'
        }
      ];
    } else if (theme === 'administrative') {
      concept = `مفهوم القانون الإداري يحدد الضوابط والقواعد القانونية التي تحكم تنظيم وإدارة السلطات الإدارية والمرافق العامة بالدولة. يهدف القانون لضمان المصلحة العامة وتيسير شؤون المواطنين عبر امتيازات استثنائية للإدارة بضوابط المشروعية والرقابة القضائية المتخصصة للقضاء الإداري.`;
      characteristics = [
        'قانون قضائي النشأة (انبثق وتطور أساساً عبر الاجتهادات القضائية لمجلس الدولة والمحاكم الإدارية بالجزائر).',
        'قانون غير مقنن بالكامل (نظراً لتشعب مواضيعه وتنوع القوانين المنظمة للنشاط الإداري والخدمة العمومية).',
        'قانون مرن ومتطور (يتكيف بسرعة مع المستجدات الاقتصادية والاجتماعية للدولة لتسيير المرافق العامة بانتظام).',
        'امتيازات السلطة العامة (تتمتع الإدارة بوسائل قانونية استثنائية مثل نزع الملكية والتنفيذ المباشر للأوامر).'
      ];
      extraExamples = [
        'حق البلدية في إنهاء عقد صيانة إنارة عمومية مع شركة خاصة من جانب واحد إذا قصرت في العمل وضماناً لسير المرفق العام بانتظام.',
        'إلغاء المحكمة الإدارية لقرار صادر عن الوالي بغلق محل تجاري لعدم تسبيبه قانوناً أو تجاوز الصلاحيات الممنوحة.',
        'رفع موظف عمومي دعوى تعويض عن قرار نقله التعسفي الذي ألحق به ضرراً مادياً ومعنوياً في مساره المهني.'
      ];
      examMethodology = {
        expectedQuestions: [
          'اشرح معيار المرفق العام ودوره الحاسم في تحديد اختصاص القضاء الإداري الجزائري؟',
          'حلل شروط قبول دعوى إلغاء القرار الإداري لتجاوز السلطة أمام المحاكم الإدارية.'
        ],
        modelAnswerPlan: `• **المقدمة:** تعريف القانون الإداري ووسائله الاستثنائية، وعلاقة الإدارة بالمواطنين في دولة القانون.\n• **التحليل - المبحث الأول:** معايير تمييز العقد الإداري والقرار الإداري عن الأعمال المدنية العادية للشركاء.\n• **التحليل - المبحث الثاني:** آليات الرقابة القضائية (دعاوى الإلغاء ودعاوى القضاء الكامل) لتصحيح الانحراف بالسلطة الإدارية.\n• **الخاتمة:** أهمية إرساء قضاء إداري قوي ومستقل لترسيخ مبدأ المشروعية وحماية حقوق الأفراد.`,
        keyTerms: [
          { ar: 'دعوى إلغاء القرار الإداري', fr: "Recours en annulation pour excès de pouvoir", desc: 'دعوى تهدف لإبطال قرار إداري غير مشروع صادر عن جهة إدارية لمخالفته صريح القانون.' },
          { ar: 'المرفق العام', fr: 'Service public', desc: 'كل نشاط تتولاه الإدارة مباشرة أو تحت إشرافها بهدف إشباع حاجة عامة وتحقيق المنفعة.' },
          { ar: 'اللامركزية الإدارية', fr: 'Décentralisation administrative', desc: 'توزيع الوظائف الإدارية بين السلطة المركزية وهيئات محلية مستقلة منتخبة مثل البلديات والولايات.' }
        ]
      };
      extraQuizzes = [
        {
          question: 'ما هي الميزة الأساسية التي تجعل القانون الإداري يتميز عن القانون المدني بصفة جلية؟',
          options: ['أنه قانون مكتوب بالكامل في مدونة واحدة صلبة لا تتغير', 'أنه يمنح الإدارة امتيازات السلطة العامة وسلطات استثنائية لتحقيق المصلحة العامة', 'أنه يطبق على العلاقات التجارية والشركات الأجنبية والبورصة فقط', 'أنه يخضع لاختصاص المحاكم العادية والمجلس القضائي المدني حصراً'],
          correctIndex: 1,
          explanation: 'ينفرد القانون الإداري بمنح الإدارة وسائل غير مألوفة في القانون الخاص (امتيازات السلطة العامة) مثل نزع الملكية لإنشاء مشاريع عمومية.'
        },
        {
          question: 'ما هي الهيئة القضائية العليا للفصل في استئنافات الأحكام الصادرة عن المحاكم الإدارية بالجزائر؟',
          options: ['المجلس الأعلى للقضاء', 'المحكمة العليا', 'مجلس الدولة الموقر', 'المحكمة الدستورية العليا'],
          correctIndex: 2,
          explanation: 'مجلس الدولة الجزائري هو الهيئة المقومة لأعمال المحاكم الإدارية والمحاكم الإدارية للاستئناف وله دور استشاري وتوحيدي.'
        }
      ];
    } else if (theme === 'sources') {
      concept = `مفهوم مصادر القانون يحدد المراجع الرسمية المعتمدة لاستقاء القواعد القانونية المنظمة للحقوق والواجبات. يرتكز النظام الجزائري على التشريع كأصل مكتوب، ثم الشريعة الإسلامية والعرف كمصادر احتياطية تمنع الفراغ التشريعي وتضمن حل كافة النزاعات.`;
      characteristics = [
        'التدرج الهرمي الصارم (القوانين الأدنى مرتبة كالمراسيم يجب ألا تخالف القوانين الأعلى كالتشريع العادي والدستور).',
        'تكامل المصادر (وجود مصادر رسمية أصلية واحتياطية وتفسيرية تمنع امتناع القاضي عن الحكم بحجة عدم وجود نص).',
        'الارتباط بالثقافة الوطنية والدينية (مكانة الشريعة الإسلامية والعرف في تكوين الهوية القانونية للمجتمع الجزائري).',
        'الديناميكية (قدرة المصادر التفسيرية كالفقه والقضاء على ملء الفراغ وتوجيه المشرع لتبني تعديلات حديثة).'
      ];
      extraExamples = [
        'لجوء المحكمة لقواعد الفقه المالكي لتسوية نزاع حول تركة عقارية أو أحوال أسرية غاب فيها النص التشريعي الصريح.',
        'استعانة القضاء بالعرف التجاري المستقر بين مزارعي النخيل في الجنوب الجزائري لتحديد معايير تسليم البضاعة.',
        'تأثير قرارات المحكمة العليا التفسيرية لتوحيد الاجتهاد القضائي حول المسؤولية والتعويضات المادية والمعنوية.'
      ];
      examMethodology = {
        expectedQuestions: [
          'حلل التدرج الهرمي لمصادر القانون في الجزائر ودور الشريعة الإسلامية كمصدر رسمي احتياطي؟',
          'ما هي شروط اعتبار العرف مصدراً ملزماً للقانون وما الفرق بينه وبين العادة الاتفاقية؟'
        ],
        modelAnswerPlan: `• **المقدمة:** تعريف مصادر القانون وأهمية وضع سلم تدرجي واضح لتطبيقها من طرف القضاة بالمحاكم.\n• **التحليل - المبحث الأول:** المصادر الرسمية الأصلية (التشريع ومستوياته المتعددة: دستور، قوانين عضوية، عادية، لوائح ومراسيم).\n• **التحليل - المبحث الثاني:** المصادر الرسمية الاحتياطية (الشريعة الإسلامية، العرف، ومبادئ القانون الطبيعي والعدالة).\n• **الخاتمة:** التأكيد على ضرورة مرونة المصادر لتحقيق العدالة وتلبية الاحتياجات المتطورة للمجتمع الجزائري.`,
        keyTerms: [
          { ar: 'مصادر رسمية احتياطية', fr: 'Sources formelles subsidiaires', desc: 'المصادر التي يلجأ إليها القاضي فقط في حال غياب النص التشريعي الصريح والكامل.' },
          { ar: 'تدرج القواعد القانونية', fr: 'Hiérarchie des règles juridiques', desc: 'خضوع القوانين الأدنى للأعلى صياغة وتطبيقاً من حيث القوة القانونية.' },
          { ar: 'العرف القانوني', fr: 'Coutume juridique', desc: 'سلوك عام ومستقر تواتر الأفراد على اتباعه مع اعتقاد جازم بإلزامية تطبيقه وعقاب مخالفه.' }
        ]
      };
      extraQuizzes = [
        {
          question: 'وفقاً للمادة الأولى من القانون المدني الجزائري، ما هو الترتيب الصحيح للمصادر الاحتياطية؟',
          options: ['العرف ثم مبادئ القانون الطبيعي ثم الشريعة الإسلامية', 'مبادئ الشريعة الإسلامية ثم العرف ثم مبادئ القانون الطبيعي وقواعد العدالة', 'مبادئ القانون الطبيعي ثم الفقه ثم القضاء والاجتهاد الأكاديمي', 'العرف ثم الفقه ثم القضاء المدني والجزائي'],
          correctIndex: 1,
          explanation: 'تنص المادة الأولى بوضوح على أنه في حالة غياب النص التشريعي يحكم القاضي بمقتضى الشريعة الإسلامية، ثم بمقتضى العرف، ثم بمقتضى القانون الطبيعي وقواعد العدالة.'
        },
        {
          question: 'ما هما الركنان الأساسيان لتكوين العرف القانوني الملزم؟',
          options: ['الكتابة والقبول الرسمي من البرلمان بغرفتيه', 'الركن المادي (الاعتياد والاستقرار) والركن المعنوي (الشعور بالإلزام القانوني)', 'الإشهار في الجريدة الرسمية وتطبيق العقوبات الحبسية بقرار وزاري', 'صدور حكم قضائي نهائي وتأييد من وزارة العدل مباشرة'],
          correctIndex: 1,
          explanation: 'يتشكل العرف من ركن مادي يتمثل في تكرار واعتياد السلوك لزمن طويل، وركن معنوي متمثل في استقرار الاعتقاد بإلزاميته وعقاب مخالفه.'
        }
      ];
    } else if (theme === 'application') {
      concept = `مفهوم تطبيق القانون يمثل دراسة الحدود الزمنية والمكانية لفاعلية ونفاذ القواعد القانونية لمنع الفوضى وتنازع التشريعات. يعتمد على أصول ثابتة مثل الأثر المباشر، عدم الرجعية، والإقليمية، لضمان استقرار الحقوق والمراكز وحياد تطبيق السلطة القانونية بالدولة.`;
      characteristics = [
        'مبدأ عدم رجعية القوانين (منع تضرر المراكز القانونية المكتسبة سابقاً بنصوص قانونية جديدة تطبق فجأة).',
        'الأثر الفوري والمباشر (ضمان تطبيق الإصلاحات والتشريعات الجديدة فوراً على ما ينشأ من روابط وآثار مستقبلية).',
        'سيادة الدولة الإقليمية (تطبيق القانون داخل الحدود الجغرافية للدولة كأصل عام للسيادة وحكم الإقليم).',
        'شخصية القوانين المتبادلة (رعاية شؤون الأحوال الشخصية والمواطنة خارج الحدود طبقاً للاتفاقيات الدولية).'
      ];
      extraExamples = [
        'عدم جواز مطالبة تاجر برسوم ترخيص جديدة عن السنوات الخمس الماضية بأثر رجعي لقانون صدر هذا العام بغير نص استثنائي.',
        'تطبيق قانون الإيجار الجديد فوراً على عقود الإيجار التي تبدأ آثارها بعد تاريخ نشره بالجريدة الرسمية دون رجوع للماضي.',
        'إعفاء متهم من العقوبة بموجب قانون جديد ألغى العقوبة على الفعل قبل صدور حكم قضائي بات (مبدأ القانون الأصلح للمتهم).'
      ];
      examMethodology = {
        expectedQuestions: [
          'حلل نظرية الحقوق المكتسبة ونظرية الأثر المباشر في فض تنازع القوانين من حيث الزمان؟',
          'ما هي الاستثناءات الواردة على مبدأ إقليمية القوانين في القانون الجزائري؟'
        ],
        modelAnswerPlan: `• **المقدمة:** تعريف تنازع القوانين من حيث الزمان والمكان، وأهمية مبادئ الاستقرار القانوني والأمن المعاملي.\n• **التحليل - المبحث الأول:** مبدأ عدم رجعية القوانين والأسس الأخلاقية والعملية له، مع الاستثناءات (التفسيري، الأصلح للمتهم، النظام العام).\n• **التحليل - المبحث الثاني:** مبدأ الأثر الفوري والمباشر للقانون الجديد وحدود تطبيقه على العقود المستمرة ذات الآثار المتعاقبة.\n• **الخاتمة:** دور القاضي في التمييز الدقيق بين الأثر الفوري والرجوع الماضي لضمان تماسك العدالة واستمرارية استثمار الأفراد.`,
        keyTerms: [
          { ar: 'القانون الأصلح للمتهم', fr: 'Loi pénale plus douce', desc: 'استثناء من عدم الرجعية يسمح بتطبيق القانون الجديد بأثر رجعي إذا كان يخدم مصلحة المتهم ويلغي أو يخفف العقوبة.' },
          { ar: 'الأثر الفوري والمباشر', fr: 'Effet immédiat de la loi', desc: 'سريان القانون الجديد فوراً على المراكز التي تنشأ أو تستكمل آثارها بعد نفاذه بشكل مباشر.' },
          { ar: 'إقليمية القوانين', fr: 'Territorialité des lois', desc: 'سريان القوانين الوطنية على الإقليم الجغرافي الكامل للدولة والسيادة الجوية والبحرية المعتمدة.' }
        ]
      };
      extraQuizzes = [
        {
          question: 'ما هو المبدأ الأساسي الذي يمنع سريان قانون عقوبات جديد على أفعال ارتكبت قبل صدوره؟',
          options: ['الأثر الفوري والمباشر للقانون', 'مبدأ عدم رجعية القوانين وعقوباتها', 'مبدأ إقليمية القوانين العامة', 'مبدأ شخصية القوانين الدولية'],
          correctIndex: 1,
          explanation: 'مبدأ عدم رجعية القوانين يحمي الأفراد من المعاقبة أو المحاسبة على أفعال سابقة ارتكبت بظل قانون قديم كان يبيحها.'
        },
        {
          question: 'متى يعتبر القانون الجديد سارياً بأثر رجعي في المادة الجنائية (قانون العقوبات)؟',
          options: ['إذا كان يقرر عقوبات أشد قسوة وشمولية للغير', 'إذا كان قانوناً أصلح للمتهم وصدر قبل الفصل في الدعوى بحكم نهائي وبات', 'إذا وافق عليه النائب العام بصفة استثنائية وشخصية بطلب مكتوب', 'إذا كان يتعلق بالجرائم العسكرية والحدودية حصراً بغير قيد'],
          correctIndex: 1,
          explanation: 'القانون الأصلح للمتهم يعتبر استثناء جوهرياً من مبدأ عدم الرجعية، ويطبق فوراً على الماضي لغايات إنسانية وعدالة قضائية.'
        }
      ];
    } else if (theme === 'right') {
      concept = `مفهوم نظرية الحق ينصب على تقرير وصيانة المصالح المشروعة للأشخاص طبيعيين واعتباريين. يضبط القانون أركان الحق، طرق كسبه، عوارض الأهلية، والذمة المالية المستقلة كدعامة قانونية لتفعيل التبادل الاقتصادي واستقرار العقود والمعاملات المتبادلة بالجزائر.`;
      characteristics = [
        'وجود صاحب للحق يتمتع بالشخصية والأهلية القانونية اللازمة لنشوء الحق في مواجهة الغير.',
        'وجود محل للحق (الشيء المادي العيني أو العمل الإيجابي أو السلبي المتفق عليه أو محل الملكية الفكرية).',
        'الحماية القانونية الصارمة (وجود دعوى قضائية مكفولة دستورياً يستعملها صاحب الحق لحماية حقه عند الاعتداء).',
        'الذمة المالية المستقلة (الوعاء القانوني الذي يضم كافة الحقوق والالتزامات المالية الحالية والمستقبلية للشخص).'
      ];
      extraExamples = [
        'اكتساب شركة تجارية (شخص اعتباري) لذمة مالية مستقلة عن ذمم الشركاء الشخصية تضمن حماية الدائنين للشركة واستقرارها.',
        'بطلان عقد بيع عقار أبرمه قاصر مميز (عمره 15 سنة) دون إذن وليه الشرعي لعدم بلوغه سن الأهلية (19 سنة كاملة).',
        'حماية حق المؤلف والملكية الفكرية لكاتب جزائري على مصنفه الأدبي ومنع نسخه أو ترجمته بغير ترخيص مسبق.'
      ];
      examMethodology = {
        expectedQuestions: [
          'قارن بين أهلية الوجوب وأهلية الأداء مبيناً آثار عوارض الأهلية (كالجنون والعته والسفه)؟',
          'حلل مفهوم الذمة المالية وخصائصها بالنسبة للأشخاص الطبيعيين والاعتباريين في القانون المدني الجزائري.'
        ],
        modelAnswerPlan: `• **المقدمة:** تعريف الحق وعلاقة الحق بالقانون كوجهين لعملة واحدة لتسيير مصالح الأفراد والعدالة.\n• **التحليل - المبحث الأول:** الشخصية القانونية (مفهومها، بدؤها، وانتهاؤها، وعوارضها وموانعها المتعددة بالتشريع الجزائري).\n• **التحليل - المبحث الثاني:** الأهلية القانونية ومراحلها وتأثرها بعوارض الأهلية والذمة المالية المستقلة للدائنين.\n• **الخاتمة:** ضرورة وضع معايير أهلية صارمة لحماية الروابط التعاقدية من الغش والاستغلال الاقتصادي والأخلاقي للضعفاء.`,
        keyTerms: [
          { ar: 'أهلية الأداء', fr: "Capacité d'exercice", desc: 'صلاحية الشخص للقيام بالتصرفات القانونية بنفسه وبطرق صحيحة وتتحقق بتمام العقل وسن الرشد.' },
          { ar: 'الشخص الاعتباري', fr: 'Personne morale', desc: 'مجموعة من الأشخاص أو الأموال تكتسب شخصية قانونية مستقلة تماماً لتحقيق غرض معين.' },
          { ar: 'عوارض الأهلية', fr: 'Vices de la capacité', desc: 'أسباب تؤثر على عقل الشخص وإدراكه للحقائق وتعدم التمييز مثل الجنون، العته، الغفلة، والسفه.' }
        ]
      };
      extraQuizzes = [
        {
          question: 'ما هو سن الرشد القانوني والأهلية الكاملة للتصرفات في القانون المدني الجزائري؟',
          options: ['18 سنة كاملة دون قيد', '19 سنة كاملة دون عارض عقلي أو حجر', '21 سنة كاملة وبحضور الولي الشرعي', '16 سنة كاملة مع ترشيد قضائي بطلب الأب'],
          correctIndex: 1,
          explanation: 'تحدد المادة 40 من القانون المدني الجزائري سن الرشد بـ 19 سنة كاملة، ويصبح الشخص مؤهلاً لمباشرة حقوقه المدنية وتصرفاته القانونية بالكامل.'
        },
        {
          question: 'ماذا يترتب على تصرفات الشخص المصاب بالجنون بعد صدور قرار الحجر القضائي عليه رسميًا؟',
          options: ['تعتبر تصرفاته صحيحة ونافذة وبقوة القانون', 'تعتبر تصرفاته باطلة بطلاناً مطلقاً لانعدام التمييز والرضا', 'تعتبر تصرفاته موقوفة على إجازة الولي أو المحجوز لمصلحته', 'تعتبر تصرفاته قابلة للإبطال لمصلحة الغير ذو النية الحسنة'],
          correctIndex: 1,
          explanation: 'المجنون فاقد تماماً لتمييزه وعقله، ولذلك فإن كافة تصرفاته القانونية بعد الحجر تعتبر باطلة بطلاناً مطلقاً لانعدام ركن الرضا.'
        }
      ];
    } else {
      // General Law template if no specific theme is found
      concept = `مفهوم المبادئ والضوابط القانونية في هذا المبحث يمثل حجر الأساس لتفهم الرابطة العادلة بين أطراف المعاملة القانونية في الجزائر، بما يكفل التوازن المطلق وحماية الصالح العام والخاص في ضوء الشريعة العامة والممارسات القضائية الحديثة.`;
      characteristics = [
        'أهمية عملية بالغة الأثر في توجيه دفة المنازعات وحسمها قضائياً أمام المحاكم والجهات المعنية.',
        'الارتباط الوثيق بالنظام العام والآداب العامة بالمجتمع الجزائري وثقافته العريقة.',
        'الوضوح والصياغة المحكمة الكفيلة بمنع اللبس والغموض والتأويلات القضائية المتناقضة.',
        'المرونة الكافية لمسايرة روح الإصلاحات والتحديث التشريعي المستمر لقطاع العدالة بالجزائر.'
      ];
      extraExamples = [
        'تطبيق القضاء الجزائري للمبادئ العامة للعدالة والإنصاف وقواعد القانون الطبيعي عند غياب التفصيل التشريعي لفض نزاع مستجد.',
        'منع التعسف في استعمال الحق وضرورة ملاءمة الوسيلة والغاية طبقاً للمادة 124 مكرر من القانون المدني.'
      ];
      examMethodology = {
        expectedQuestions: [
          'وضح وجه الأهمية العلمية والعملية للمبادئ المدروسة في هذا الفصل في الممارسة القضائية اليومية بالجزائر؟',
          'حلل علاقة المبادئ التنظيمية الواردة بالمسار التاريخي للتشريع الجزائري الحديث.'
        ],
        modelAnswerPlan: `• **المقدمة:** تعريف الإطار العام للدرس، وتحديد المشكلة القانونية المطروحة بشكل واضح ومكثف.\n• **التحليل - المبحث الأول:** دراسة وتفصيل الأحكام الأساسية والخصائص المميزة للنزاع بموجب القوانين المعمول بها.\n• **التحليل - المبحث الثاني:** التطبيقات العملية بالمحاكم والحلول النموذجية للنزاعات المحتملة وتدارك عيوب الصياغة.\n• **الخاتمة:** رصد تطلعات التطوير التشريعي وتأثيرها المباشر على ترقية وتحسين الأداء المهني والأكاديمي للطلبة المتميزين.`,
        keyTerms: [
          { ar: 'النظام العام والآداب العامة', fr: 'Ordre public et bonnes moeurs', desc: 'الأسس الاجتماعية والأخلاقية والأمنية العليا التي يمنع على الأفراد والشركات مخالفتها إطلاقاً.' },
          { ar: 'الاجتهاد القضائي', fr: 'Jurisprudence', desc: 'مجموعة الأحكام والحلول التي تستقر عليها الهيئات القضائية العليا لتفسير غموض القوانين وتوحيد الممارسة.' }
        ]
      };
      extraQuizzes = [
        {
          question: 'ما هي الغاية المثلى لوجود القواعد والمبادئ القانونية المنظمة لشؤون الأفراد في المجتمع؟',
          options: ['حفظ النظام والسكينة والاستقرار وتحقيق المساواة والعدالة بين الجميع وبلا تمييز', 'تسهيل العقوبات العشوائية لغرض الانتقام الشخصي فقط', 'إلغاء كافة الحريات الفردية نهائياً لمصلحة متنفذين بالدولة', 'منع التعامل التجاري والاقتصادي والزراعي الخارجي تلافياً للتضخم'],
          correctIndex: 0,
          explanation: 'الغاية العليا للأنظمة القانونية هي تحقيق التوازن العادل بين الحرية الفردية والمصلحة العامة وصيانة الأمن والسلم الاجتماعي.'
        }
      ];
    }

    // Combine quizzes and ensure at least 3
    let combinedQuizzes = chapter.quizzes ? [...chapter.quizzes] : [];
    if (combinedQuizzes.length === 0 && chapter.quiz) {
      combinedQuizzes.push(chapter.quiz);
    }

    // Append extra quizzes to make at least 3
    const mergedQuizzes = [...combinedQuizzes];
    for (const eq of extraQuizzes) {
      if (mergedQuizzes.length < 3) {
        // Prevent duplicate questions if any
        if (!mergedQuizzes.some(q => q.question === eq.question)) {
          mergedQuizzes.push(eq);
        }
      }
    }

    // If still less than 3, add general ones
    if (mergedQuizzes.length < 3) {
      mergedQuizzes.push({
        question: `ما هي غاية تطبيق القوانين والأنظمة المتعلقة بموضوع المحاضرة: "${title}"؟`,
        options: [
          'تنظيم سلوك الأفراد وحماية حقوقهم واستقرار المعاملات بالدولة وتحقيق التوازن',
          'تعطيل حركة الاقتصاد والاستثمار وإلغاء الرساميل الفردية',
          'إخضاع القضاء للرأي الفردي والارتجال دون سند مكتوب ملزم',
          'تفضيل المصالح الشخصية الضيقة على حساب المصلحة العامة للمجتمع والعدالة'
        ],
        correctIndex: 0,
        explanation: 'الغاية الأساسية للقوانين هي تنظيم المعاملات وحماية الحقوق وصيانة النظام العام والعدالة.'
      });
    }

    // For foreign language modules, bypass standard law enrichment to keep them clean, bilingual, and exactly as structured in the database
    if (selectedCourseId === 'y1-s1-l7' || selectedCourseId === 'y1-s2-l7') {
      return {
        ...chapter,
        concept,
        characteristics,
        examples: chapter.examples || [],
        examMethodology,
        quizzes: chapter.quizzes || (chapter.quiz ? [chapter.quiz] : [])
      } as any;
    }

    // Enrich existing fields to be longer
    const enrichedDetailedContent = chapter.detailedContent;

    const enrichedSummary = chapter.summary + ` (مقرر معزز وشامل يضم المفاهيم والخصائص التفصيلية والمنهجية القضائية والامتحانات).`;

    const enrichedExamples = [...chapter.examples];
    for (const ex of extraExamples) {
      if (!enrichedExamples.includes(ex)) {
        enrichedExamples.push(ex);
      }
    }

    return {
      ...chapter,
      summary: enrichedSummary,
      detailedContent: enrichedDetailedContent,
      concept,
      characteristics,
      examples: enrichedExamples,
      examMethodology,
      quizzes: mergedQuizzes
    } as any;
  };

  const currentChapterRaw = currentSyllabus ? (currentSyllabus.chapters[activeChapterIndex] as CourseChapter) : null;
  const currentChapter: CourseChapter | null = currentChapterRaw ? getEnrichedChapter(currentChapterRaw) : null;

  const markChapterComplete = (courseId: string, chapterIndex: number) => {
    const existing = completedChapters[courseId] || [];
    if (!existing.includes(chapterIndex)) {
      const updated = { ...completedChapters, [courseId]: [...existing, chapterIndex] };
      setCompletedChapters(updated);
    }
  };

  const handleDownloadPDF = () => {
    if (!currentSyllabus) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('الرجاء السماح بفتح النوافذ المنسدلة لتنزيل المحاضرة.');
      return;
    }
    const htmlContent = `
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>${currentSyllabus.courseTitle} - منصة الحقوق الجزائرية</title>
          <style>
            body { font-family: Tahoma, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.8; background: #fff; }
            h1 { color: #4338ca; border-bottom: 2px solid #4338ca; padding-bottom: 10px; font-size: 24px; }
            h2 { color: #334155; margin-top: 35px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; font-size: 18px; }
            h3 { color: #4f46e5; font-size: 14px; margin-top: 15px; }
            .meta { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; border: 1px solid #e2e8f0; }
            .chapter { margin-bottom: 40px; page-break-inside: avoid; }
            .key-points { background: #f0fdf4; padding: 15px; border-radius: 8px; border-right: 4px solid #22c55e; margin: 15px 0; font-size: 13px; }
            .legal-articles { background: #e0e7ff; padding: 15px; border-radius: 8px; border-right: 4px solid #4338ca; margin: 15px 0; font-size: 13px; font-family: monospace; }
            .examples { background: #fffbeb; padding: 15px; border-radius: 8px; border-right: 4px solid #f59e0b; margin: 15px 0; font-size: 13px; }
            ul { margin: 5px 0; padding-right: 20px; }
            li { margin-bottom: 5px; }
            footer { text-align: center; margin-top: 50px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            @media print {
              body { padding: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${currentSyllabus.courseTitle}</h1>
          <div class="meta">
            <p><strong>الأستاذ:</strong> ${currentSyllabus.professor}</p>
            <p><strong>الجامعة:</strong> ${currentSyllabus.university}</p>
            <p><strong>عدد الفصول:</strong> ${currentSyllabus.totalChapters} فصول أكاديمية معتمدة</p>
          </div>
          <hr />
          ${currentSyllabus.chapters.map(ch => `
            <div class="chapter">
              <h2>الفصل ${ch.chapterNumber}: ${ch.title}</h2>
              <p><strong>الملخص:</strong> ${ch.summary}</p>
              <h3>الشرح المفصل:</h3>
              <p style="white-space: pre-wrap; font-size: 13px;">${ch.detailedContent}</p>
              
              <div class="key-points">
                <strong>النقاط الأساسية للاستيعاب:</strong>
                <ul>
                  ${ch.keyPoints.map(kp => `<li>${kp}</li>`).join('')}
                </ul>
              </div>

              ${ch.legalArticles && ch.legalArticles.length > 0 ? `
                <div class="legal-articles">
                  <strong style="font-family: inherit; font-size: 14px; color: #312e81;">المواد القانونية المرجعية:</strong>
                  <ul style="margin: 5px 0 0 0; padding-right: 20px;">
                    ${ch.legalArticles.map(art => `<li>${art}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              <div class="examples">
                <strong>أمثلة وتطبيقات قانونية:</strong>
                <ul>
                  ${ch.examples.map(ex => `<li>${ex}</li>`).join('')}
                </ul>
              </div>
            </div>
          `).join('')}
          <footer>
            تم استخراج هذه المحاضرة عبر منصة الحقوق الجزائرية - مرجع رسمي للطلاب.
          </footer>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-16 pb-12 px-4">
          <div className="container mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">المحاضرات والمقررات الأكاديمية</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl mt-2 leading-relaxed">
                      منهجية ومحاضرات معتمدة وفق البرنامج الدراسي لـ <span className="font-bold text-primary dark:text-indigo-400">جامعة زيان عاشور بالجلفة - كلية الحقوق والعلوم السياسية</span> (قسم الحقوق) لتعزيز تفوقك الأكاديمي.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* View mode toggle */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
                      <button 
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-900 dark:text-slate-100'}`}
                      >
                        كل المقررات
                      </button>
                      <button 
                        onClick={() => setActiveTab('bookmarks')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'bookmarks' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-900 dark:text-slate-100'}`}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                        المحفوظات ({bookmarkedIds.length})
                      </button>
                    </div>

                    {/* Year Tabs (Only visible when viewing all) */}
                    {activeTab === 'all' && (
                      <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl inline-flex gap-1">
                          {[1, 2, 3].map((year) => (
                          <button
                              key={year}
                              onClick={() => setActiveYear(year as 1|2|3)}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                              activeYear === year 
                                  ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' 
                                  : 'text-slate-900 dark:text-slate-100'
                              }`}
                          >
                              السنة {year === 1 ? 'الأولى (L1)' : year === 2 ? 'الثانية (L2)' : 'الثالثة (L3)'}
                          </button>
                          ))}
                      </div>
                    )}
                </div>
             </div>
          </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto p-8 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
              <Bookmark className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {activeTab === 'bookmarks' ? 'لا توجد دروس محفوظة حالياً' : 'لا توجد دروس متوفرة'}
            </h3>
            <p className="text-slate-900 dark:text-slate-100 mb-6 max-w-sm mx-auto text-sm font-semibold">
              {activeTab === 'bookmarks' 
                ? 'تصفح قائمة الدروس واضغط على زر الحفظ للوصول السريع إليها لاحقاً هنا.' 
                : 'سيتم إضافة المزيد من المقاييس والمحاضرات قريباً.'}
            </p>
            {activeTab === 'bookmarks' && (
              <button onClick={() => setActiveTab('all')} className="bg-primary hover:bg-primary-light text-white font-bold py-2.5 px-6 rounded-xl transition text-sm">
                تصفح المقررات الدراسية
              </button>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-1 gap-6 max-w-4xl mx-auto animate-fadeIn">
              {filteredLessons.map((lesson, index) => {
                  const isBookmarked = bookmarkedIds.includes(lesson.id);
                  const isActive = activeLessonIds.includes(lesson.id);
                  const hasSyllabus = !!SYLLABUSES[lesson.id];
                  const courseCompletions = completedChapters[lesson.id] || [];
                  const syllabusData = SYLLABUSES[lesson.id];
                  const totalChs = syllabusData ? syllabusData.totalChapters : 4;
                  const progressPct = Math.round((courseCompletions.length / totalChs) * 100);

                  return (
                    <div key={lesson.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row gap-6 group relative">
                        
                        {/* Visual Indicator */}
                        <div className="w-full md:w-52 bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center flex-shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                            <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm mb-3 text-primary">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-1">مقياس معتمد</span>
                            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">السنة {lesson.year} - وحدة التعليم</div>
                            {isActive && (
                              <div className="w-full mt-2">
                                <div className="flex justify-between text-[10px] text-slate-900 dark:text-slate-100 font-bold mb-1">
                                  <span>التقدم</span>
                                  <span>{progressPct}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-primary h-full transition-all" style={{ width: `${progressPct}%` }}></div>
                                </div>
                              </div>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-2 inline-block">
                                    {hasSyllabus ? `${totalChs} فصول دراسية مقسمة` : 'محاضرة أكاديمية شاملة'}
                                  </span>
                                  <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{lesson.title}</h3>
                                </div>
                                <button 
                                  onClick={(e) => toggleBookmark(lesson.id, e)}
                                  className={`text-slate-400 hover:text-yellow-500 transition-all p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 absolute top-6 left-6 md:static ${isBookmarked ? 'text-yellow-500' : ''}`}
                                  aria-label={isBookmarked ? "إلغاء حفظ المقياس" : "حفظ المقياس في المفضلة"}
                                >
                                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                            
                            <p className="text-slate-900 dark:text-slate-100 leading-relaxed mb-6 text-sm md:text-base font-semibold">
                                {lesson.summary}
                            </p>

                            <div className="mt-auto flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                    <Clock className="w-3.5 h-3.5 text-primary" />
                                    <span>سداسي معتمد</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                    <FileText className="w-3.5 h-3.5 text-primary" />
                                    <span>{hasSyllabus ? `${totalChs} فصول مفصلة` : `${lesson.keyPoints.length} محاور رئيسية`}</span>
                                </div>

                                <div className="flex-1"></div>

                                <button 
                                    onClick={() => handleExplain(lesson.title, lesson.summary)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-primary bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    شرح ذكي بالذكاء الاصطناعي
                                </button>
                                
                                <button 
                                  onClick={() => handleStartCourse(lesson.id)}
                                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-light transition shadow-lg shadow-primary/20 cursor-pointer"
                                >
                                    <PlayCircle className="w-4 h-4" />
                                    {hasSyllabus ? 'دخول المنهج الدراسي (فصول مرتبة)' : 'استعراض المحاضرة'}
                                    <ArrowRight className="w-4 h-4 rotate-180" />
                                </button>
                            </div>
                        </div>
                    </div>
                  );
              })}
          </div>
        )}
      </div>

      {/* Coursera / Moodle Style Structured Course Curriculum Modal */}
      {selectedCourseId && currentSyllabus && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-6 animate-fadeIn" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-7xl w-full h-[95vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden animate-scaleIn">
            
            {/* Top Bar */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-black">
                  ⚖️
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-white">{currentSyllabus.courseTitle}</h2>
                  <p className="text-xs text-slate-400">{currentSyllabus.university} | الأستاذ: {currentSyllabus.professor}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/25 cursor-pointer"
                  title="تنزيل المحاضرة PDF"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل المحاضرة PDF</span>
                </button>

                <button 
                  onClick={() => setSelectedCourseId(null)}
                  className="w-10 h-10 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-full flex items-center justify-center transition cursor-pointer"
                  aria-label="إغلاق المنهج"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Split Layout: Sidebar Syllabus Navigation + Active Chapter Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Sidebar: Course Chapters List (Syllabus breakdown) */}
              <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto">
                <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-black text-slate-900 dark:text-white text-sm mb-1">فصول المنهج الدراسي</h3>
                  <p className="text-xs text-slate-900 dark:text-slate-100 font-semibold">اختر الفصل للبدء بدراسته خطوة بخطوة</p>
                </div>

                <div className="p-3 space-y-2">
                  {currentSyllabus.chapters.map((ch, idx) => {
                    const isSelected = activeChapterIndex === idx;
                    const isCompleted = (completedChapters[selectedCourseId] || []).includes(idx);

                    return (
                      <button
                        key={ch.id}
                        onClick={() => {
                          setActiveChapterIndex(idx);
                          setSelectedQuizAnswers({});
                          setShowQuizResult({});
                        }}
                        className={`w-full text-right p-3.5 rounded-2xl transition flex items-start gap-3 cursor-pointer ${
                          isSelected 
                            ? 'bg-primary text-white shadow-md shadow-primary/20' 
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-800'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isSelected ? 'bg-white text-primary' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          {isCompleted ? <Check className="w-4 h-4" /> : ch.chapterNumber}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold text-xs line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{ch.title}</h4>
                          <span className={`text-[10px] mt-1 block ${isSelected ? 'text-indigo-100' : 'text-slate-900 dark:text-slate-100 font-bold'}`}>{ch.duration}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Chapter Detailed Study Area */}
              {currentChapter && (
                <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-white dark:bg-slate-900">
                  <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
                    
                    {/* Chapter Header */}
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-primary/10 text-primary font-bold text-xs px-3 py-1 rounded-full">
                          الفصل {currentChapter.chapterNumber} من {currentSyllabus.totalChapters}
                        </span>
                        <span className="text-xs text-slate-900 dark:text-slate-100 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" /> {currentChapter.duration} للدراسة
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3">{currentChapter.title}</h2>
                      <p className="text-slate-900 dark:text-slate-100 text-sm md:text-base leading-relaxed font-semibold">
                        {currentChapter.summary}
                      </p>
                    </div>

                    {/* Chapter study tabs */}
                    <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                      {[
                        { 
                          id: 'explanation', 
                          label: (selectedCourseId === 'y1-s1-l7') 
                            ? 'التعريفات وترجمة المصطلحات (Définitions & Traduction)' 
                            : (selectedCourseId === 'y1-s2-l7')
                            ? 'التعريفات وترجمة المصطلحات (Definitions & Translation)'
                            : 'الشرح والملخص الأكاديمي', 
                          icon: BookOpen 
                        },
                        { id: 'concept', label: 'المفهوم القانوني', icon: FileText },
                        { id: 'characteristics', label: 'الخصائص والضوابط', icon: CheckCircle2 },
                        { id: 'examples', label: 'التطبيقات والأمثلة', icon: Award },
                        { id: 'methodology', label: 'منهجية الامتحان', icon: Sparkles },
                        { 
                          id: 'quizzes', 
                          label: (selectedCourseId === 'y1-s1-l7')
                            ? 'التمارين والتقييم الذاتي (Exercices)'
                            : (selectedCourseId === 'y1-s2-l7')
                            ? 'التمارين والتقييم الذاتي (Exercises)'
                            : 'التقييم والاختبارات الذاتية', 
                          icon: HelpCircle 
                        },
                      ].filter(tab => {
                        if (selectedCourseId === 'y1-s1-l7' || selectedCourseId === 'y1-s2-l7') {
                          return tab.id === 'explanation' || tab.id === 'quizzes';
                        }
                        return true;
                      }).map((tab) => {
                        const TabIcon = tab.icon;
                        const isSelected = chapterStudyTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setChapterStudyTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-primary text-white shadow-md shadow-primary/25'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            <TabIcon className="w-4 h-4" />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Tab contents */}
                    <div className="space-y-6">
                      {chapterStudyTab === 'explanation' && (
                        <div className="space-y-6 animate-fadeIn">
                          {/* Detailed Lecture Text */}
                          <div className="bg-slate-50 dark:bg-slate-800/60 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                              <FileText className="w-5 h-5 text-primary" /> الشرح المفصل للمحاضرة:
                            </h3>
                            <div className="whitespace-pre-wrap leading-loose text-slate-900 dark:text-slate-100 text-sm md:text-base font-semibold">
                              {currentChapter.detailedContent}
                            </div>
                          </div>

                          {/* Key Points */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> النقاط والمحاور الأساسية للاستيعاب:
                            </h3>
                            <div className="grid gap-3">
                              {currentChapter.keyPoints.map((kp, idx) => (
                                <div key={idx} className="bg-emerald-50/40 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-slate-900 dark:text-slate-100 text-sm font-bold flex items-start gap-3">
                                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs flex-shrink-0">✓</span>
                                  <p>{kp}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Legal Articles Reference Section */}
                          {currentChapter.legalArticles && currentChapter.legalArticles.length > 0 && (
                            <div className="space-y-4">
                              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> المواد القانونية المرجعية:
                              </h3>
                              <div className="grid gap-2.5">
                                {currentChapter.legalArticles.map((article, idx) => (
                                  <div key={idx} className="bg-indigo-50/70 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 text-slate-900 dark:text-slate-100 text-sm font-mono flex items-center gap-3 shadow-xs">
                                    <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-xl shrink-0">⚖️ مرجع قانوني</span>
                                    <span className="font-bold">{article}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {chapterStudyTab === 'concept' && (
                        <div className="space-y-6 animate-fadeIn">
                          <div className="bg-indigo-50/40 dark:bg-indigo-950/20 p-6 md:p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 space-y-4">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                              <FileText className="w-6 h-6 text-primary" /> التأصيل والمفهوم الأكاديمي:
                            </h3>
                            <p className="text-slate-900 dark:text-slate-100 text-base md:text-lg leading-relaxed font-semibold">
                              {(currentChapter as any).concept || "مفهوم المبادئ والضوابط القانونية في هذا المبحث يمثل حجر الأساس لتفهم الرابطة العادلة بين أطراف المعاملة القانونية في الجزائر..."}
                            </p>
                          </div>
                        </div>
                      )}

                      {chapterStudyTab === 'characteristics' && (
                        <div className="space-y-4 animate-fadeIn">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> الخصائص الجوهرية والضوابط القانونية:
                          </h3>
                          <div className="grid gap-4">
                            {((currentChapter as any).characteristics || []).map((char: string, idx: number) => (
                              <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm md:text-base font-bold flex items-start gap-4 shadow-xs">
                                <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">{idx + 1}</span>
                                <p className="leading-relaxed">{char}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {chapterStudyTab === 'examples' && (
                        <div className="space-y-4 animate-fadeIn">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" /> تطبيقات وأمثلة قضائية من الواقع الجزائري:
                          </h3>
                          <div className="grid gap-4">
                            {currentChapter.examples.map((ex, idx) => (
                              <div key={idx} className="bg-amber-50/40 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-slate-900 dark:text-slate-100 text-sm md:text-base font-bold flex items-start gap-3">
                                <span className="text-xl shrink-0">⚖️</span>
                                <p className="leading-relaxed">{ex}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {chapterStudyTab === 'methodology' && (
                        <div className="space-y-6 animate-fadeIn">
                          {/* Expected Exam Questions */}
                          <div className="bg-rose-50/40 dark:bg-rose-950/20 p-6 md:p-8 rounded-3xl border border-rose-100 dark:border-rose-900/30 space-y-4">
                            <h4 className="text-lg font-black text-rose-800 dark:text-rose-400 flex items-center gap-2">
                              🎯 الأسئلة المتوقعة في الامتحان الأكاديمي:
                            </h4>
                            <ul className="list-disc pr-6 space-y-2.5 text-slate-900 dark:text-slate-100 text-sm md:text-base font-bold">
                              {((currentChapter as any).examMethodology?.expectedQuestions || []).map((q: string, idx: number) => (
                                <li key={idx} className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">{q}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Model Answer Plan */}
                          <div className="bg-slate-50 dark:bg-slate-800/60 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
                            <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                              📝 خطة ومنهجية الإجابة النموذجية المعتمدة في التصحيح:
                            </h4>
                            <div className="whitespace-pre-wrap leading-relaxed text-slate-900 dark:text-slate-100 text-sm md:text-base font-bold">
                              {((currentChapter as any).examMethodology?.modelAnswerPlan) || "خطوات المنهجية الأكاديمية بالتحليل والتركيب..."}
                            </div>
                          </div>

                          {/* Bilingual Key Terms */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                              🗣️ المصطلحات القانونية بالفرنسية (مهمة للمقاييس):
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {((currentChapter as any).examMethodology?.keyTerms || []).map((term: any, idx: number) => (
                                <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-black text-slate-900 dark:text-white text-sm">{term.ar}</span>
                                    <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-primary px-2.5 py-0.5 rounded-lg font-mono font-bold">{term.fr}</span>
                                  </div>
                                  <p className="text-xs text-slate-900 dark:text-slate-100 font-semibold">{term.desc}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {chapterStudyTab === 'quizzes' && (
                        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-6 md:p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 space-y-6 animate-fadeIn">
                          {/* Title and Header */}
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-indigo-100 dark:border-indigo-950 pb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center font-black shrink-0">
                                <HelpCircle className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">التقييم الذاتي واختبار المعلومات</h3>
                                <p className="text-xs text-slate-900 dark:text-slate-100 font-semibold">تحقق من فهمك لمحتوى هذا الفصل عبر الأسئلة المتعددة المتوافقة مع منهجية المسابقات</p>
                              </div>
                            </div>
                          </div>

                          {/* Quiz List rendering */}
                          <div className="space-y-6 mt-6">
                            {(() => {
                              const quizzesList = currentChapter.quizzes && currentChapter.quizzes.length > 0 
                                ? currentChapter.quizzes 
                                : (currentChapter.quiz ? [currentChapter.quiz] : []);

                              if (!quizzesList || quizzesList.length === 0) {
                                return (
                                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xs">
                                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                                      <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1.5">
                                      <h4 className="font-black text-slate-900 dark:text-white text-base">تمارين المحاضرة</h4>
                                      <p className="text-xs text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                                        لا توجد تمارين معتمدة مضافة لهذه المحاضرة حالياً.
                                      </p>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div className="space-y-6">
                                  <div className="flex justify-between items-center bg-indigo-50/20 dark:bg-slate-800/40 px-4 py-2.5 rounded-xl border border-indigo-100/30 dark:border-slate-800">
                                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                      📚 التمارين القياسية المعتمدة للمحاضرة
                                    </span>
                                  </div>

                                  {quizzesList.map((quizItem: any, qIdx: number) => {
                                    const quizKey = `${currentChapter.id}-${qIdx}`;
                                    
                                    return (
                                      <div key={qIdx} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                                        <div className="flex items-start gap-2.5">
                                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{qIdx + 1}</span>
                                          <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base leading-relaxed">{quizItem.question}</p>
                                        </div>
                                        
                                        <div className="grid gap-2.5">
                                          {quizItem.options.map((opt: string, optIdx: number) => {
                                            const isSelected = selectedQuizAnswers[quizKey] === optIdx;
                                            const isAnswered = showQuizResult[quizKey];
                                            const isCorrect = optIdx === quizItem.correctIndex;

                                            let btnStyle = "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 hover:dark:bg-slate-800 transition-all";
                                            if (isAnswered) {
                                              if (isCorrect) btnStyle = "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                                              else if (isSelected) btnStyle = "bg-red-50 dark:bg-red-950/30 border-red-500 text-red-900 dark:text-red-200";
                                            } else if (isSelected) {
                                              btnStyle = "bg-primary text-white border-primary shadow-sm shadow-primary/20";
                                            }

                                            return (
                                              <button
                                                key={optIdx}
                                                onClick={() => {
                                                  if (!isAnswered) {
                                                    setSelectedQuizAnswers({ ...selectedQuizAnswers, [quizKey]: optIdx });
                                                  }
                                                }}
                                                className={`w-full text-right p-3.5 rounded-xl border text-xs md:text-sm transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                                              >
                                                <span>{opt}</span>
                                                {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                                              </button>
                                            );
                                          })}
                                        </div>

                                        {!showQuizResult[quizKey] ? (
                                          <button
                                            onClick={() => {
                                              if (selectedQuizAnswers[quizKey] !== undefined) {
                                                setShowQuizResult({ ...showQuizResult, [quizKey]: true });
                                                if (qIdx === quizzesList.length - 1) {
                                                  markChapterComplete(selectedCourseId, activeChapterIndex);
                                                }
                                              } else {
                                                showToast('الرجاء اختيار إجابة أولاً.');
                                              }
                                            }}
                                            className="bg-primary hover:bg-primary-light text-white font-black px-5 py-2.5 rounded-xl text-xs transition shadow-md shadow-primary/25 cursor-pointer"
                                          >
                                            تصحيح الإجابة
                                          </button>
                                        ) : (
                                          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs md:text-sm text-slate-900 dark:text-slate-100 font-semibold space-y-1 leading-relaxed">
                                            <p className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                              <span>💡 التوضيح القانوني المنهجي:</span>
                                            </p>
                                            <p className="text-slate-900 dark:text-slate-100">{quizItem.explanation}</p>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation between chapters */}
                    <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          if (activeChapterIndex > 0) {
                            setActiveChapterIndex(activeChapterIndex - 1);
                          }
                        }}
                        disabled={activeChapterIndex === 0}
                        className={`px-6 py-3 rounded-xl font-bold text-xs transition ${
                          activeChapterIndex === 0 
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                            : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white cursor-pointer'
                        }`}
                      >
                        ← الفصل السابق
                      </button>

                      <button
                        onClick={() => {
                          markChapterComplete(selectedCourseId, activeChapterIndex);
                          if (activeChapterIndex < currentSyllabus.chapters.length - 1) {
                            setActiveChapterIndex(activeChapterIndex + 1);
                            setSelectedQuizAnswers({});
                            setShowQuizResult({});
                          } else {
                            setCompletionModalOpen(true);
                          }
                        }}
                        className="bg-primary hover:bg-primary-light text-white font-black px-8 py-3 rounded-xl text-xs transition shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer"
                      >
                        {activeChapterIndex === currentSyllabus.chapters.length - 1 ? 'إتمام المقرر النهائي 🎉' : 'الفصل التالي ←'}
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* AI Explanation Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-scaleIn">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">المعلم الذكي</h3>
                    <span className="text-[10px] text-slate-900 dark:text-slate-100 block font-bold">مدعوم بـ Gemini AI</span>
                 </div>
              </div>
              <button onClick={() => setAiModalOpen(false)} className="bg-slate-50 dark:bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center text-slate-900 dark:text-slate-100 hover:bg-red-50 hover:text-red-500 transition cursor-pointer">✕</button>
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
                   <p className="text-slate-900 dark:text-slate-100 font-bold animate-pulse text-sm">جاري تحليل المحتوى وصياغة الشرح الأكاديمي...</p>
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                   <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">{modalContent.title.replace('شرح: ', '')}</h2>
                   <div className="whitespace-pre-wrap leading-loose text-slate-900 dark:text-slate-100 text-sm md:text-base font-semibold">
                      {modalContent.text}
                   </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 rounded-b-3xl text-center">
                <p className="text-xs text-slate-900 dark:text-slate-100 font-bold">مرجع معتمد لطلبة الحقوق الجزائريين.</p>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-slideIn">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
          <p className="text-xs font-black">{toastMessage}</p>
        </div>
      )}

      {/* Beautiful Completion Modal */}
      {completionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200 dark:border-slate-800 text-center animate-scaleIn animate-duration-300">
            <div className="w-20 h-20 mx-auto bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-indigo-100 dark:shadow-none">
              <Award className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">🎉 تهانينا الحارة!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              لقد أتممت بنجاح دراسة جميع فصول مقرر <span className="font-bold text-indigo-600 dark:text-indigo-400">"{currentSyllabus?.courseTitle}"</span>. 
              مثابرتك واجتهادك هما طريقك نحو التفوق والتميز في دراستك القانونية!
            </p>
            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl mb-6 border border-slate-100 dark:border-slate-800 flex justify-around text-slate-900 dark:text-slate-100">
              <div>
                <span className="block text-[10px] text-slate-400 mb-1">الفصول المنجزة</span>
                <span className="text-lg font-black">{currentSyllabus?.chapters.length || 0} / {currentSyllabus?.chapters.length || 0}</span>
              </div>
              <div className="border-l border-slate-200 dark:border-slate-800"></div>
              <div>
                <span className="block text-[10px] text-slate-400 mb-1">الحالة</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">مكتمل <Check className="w-3.5 h-3.5" /></span>
              </div>
            </div>
            <button
              onClick={() => setCompletionModalOpen(false)}
              className="w-full bg-primary hover:bg-primary-light text-white font-black py-3.5 rounded-2xl text-xs transition shadow-lg shadow-primary/20 cursor-pointer"
            >
              متابعة الرحلة الدراسية 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lessons;
