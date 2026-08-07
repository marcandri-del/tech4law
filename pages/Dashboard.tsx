import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Bookmark, BarChart2, GraduationCap, ArrowRight, Sparkles, Target, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loadTracking } from '../lib/trackingService';
import { LESSONS } from '../constants';
import { AcademicCalendar } from '../src/components/AcademicCalendar';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userYear = (Number(user?.studyYear) || 1) as 1 | 2 | 3;

  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    loadTracking(user.uid).then((data) => {
      setTracking(data);
      setLoading(false);
    });
  }, [user?.uid]);

  // Real stats from Firestore
  const completedLessonsCount = tracking
    ? Object.keys(tracking.completedChapters || {}).length
    : 0;

  const totalChaptersCompleted = tracking
    ? Object.values(tracking.completedChapters || {}).reduce(
        (acc: number, arr: any) => acc + arr.length, 0
      )
    : 0;

  const bookmarkedCount = tracking
    ? (tracking.bookmarkedLessons || []).length
    : 0;

  const quizScoresArr = tracking
    ? (Object.values(tracking.quizScores || {}) as { score: number; total: number; date: string }[])
    : [];

  const avgQuizScore =
    quizScoresArr.length > 0
      ? Math.round(
          quizScoresArr.reduce((a, q) => a + (q.score / q.total) * 100, 0) /
            quizScoresArr.length
        )
      : 0;

  const totalLessonsForYear = LESSONS.filter(l => l.year === userYear).length;

  const progressPercent =
    totalLessonsForYear > 0
      ? Math.min(100, Math.round((completedLessonsCount / totalLessonsForYear) * 100))
      : 0;

  const firstName = user?.name?.split(' ')[0] || 'الطالب';

  const yearLabel = userYear === 1 ? 'L1' : userYear === 2 ? 'L2' : 'L3';

  const quickLinks = [
    { label: 'المحاضرات', icon: <BookOpen className="w-5 h-5" />, path: '/lessons', color: 'bg-indigo-500' },
    { label: 'الاختبارات', icon: <Target className="w-5 h-5" />, path: '/quizzes', color: 'bg-emerald-500' },
    { label: 'البطاقات', icon: <Sparkles className="w-5 h-5" />, path: '/flashcards', color: 'bg-amber-500' },
    { label: 'البحث', icon: <BarChart2 className="w-5 h-5" />, path: '/research', color: 'bg-rose-500' },
  ];

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">

      {/* Welcome */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            أهلاً، {firstName} 👋
          </h1>
          <span className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-bold border border-indigo-200 dark:border-indigo-700/50">
            <GraduationCap className="w-4 h-4" />
            {yearLabel}
          </span>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          {loading ? 'جاري تحميل بياناتك...' : 'إليك ملخص تقدمك الدراسي.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          loading={loading}
          title="دروس مكتملة"
          value={completedLessonsCount.toString()}
          icon={<BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          bg="bg-indigo-50 dark:bg-indigo-900/20"
        />
        <StatCard
          loading={loading}
          title="فصول مكتملة"
          value={totalChaptersCompleted.toString()}
          icon={<CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          bg="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <StatCard
          loading={loading}
          title="دروس محفوظة"
          value={bookmarkedCount.toString()}
          icon={<Bookmark className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          bg="bg-amber-50 dark:bg-amber-900/20"
        />
        <StatCard
          loading={loading}
          title="متوسط الاختبارات"
          value={quizScoresArr.length > 0 ? `${avgQuizScore}%` : '—'}
          icon={<Target className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          bg="bg-rose-50 dark:bg-rose-900/20"
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 mb-8 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            تقدمك في {yearLabel}
          </h3>
          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
            {loading ? '...' : `${progressPercent}%`}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
            style={{ width: loading ? '0%' : `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {loading ? '' : `${completedLessonsCount} من أصل ${totalLessonsForYear} درس`}
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickLinks.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="flex flex-col items-center gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
          >
            <div className={`${link.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg`}>
              {link.icon}
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {link.label}
            </span>
            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
          </button>
        ))}
      </div>

      {/* Academic Calendar */}
      <AcademicCalendar />

    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  bg: string;
  loading?: boolean;
}> = ({ title, value, icon, bg, loading }) => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <p className="text-xs text-slate-400 font-semibold mb-1">{title}</p>
    {loading ? (
      <div className="h-7 w-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
    ) : (
      <h4 className="text-2xl font-black text-slate-800 dark:text-white">{value}</h4>
    )}
  </div>
);

export default Dashboard;
