import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Award, TrendingUp, BookOpen, CheckCircle, Zap } from 'lucide-react';
import { LESSONS, QUIZ_CATEGORIES, FLASHCARDS } from '../constants';

// --- DATA CALCULATION ---
const totalLessons = LESSONS.length;
const totalQuizzes = QUIZ_CATEGORIES.reduce((acc, cat) => acc + cat.questions.length, 0);
const totalFlashcards = FLASHCARDS.length;

// Distribution by Subject (Derived from Lessons titles/categories roughly)
const subjectsCount = {
    'مدني': LESSONS.filter(l => l.title.includes('مدني') || l.title.includes('التزامات') || l.title.includes('عقود')).length,
    'جنائي': LESSONS.filter(l => l.title.includes('جنائي') || l.title.includes('عقوبات')).length,
    'إداري': LESSONS.filter(l => l.title.includes('إداري') || l.title.includes('دستوري')).length,
    'تجاري': LESSONS.filter(l => l.title.includes('تجاري') || l.title.includes('أعمال')).length,
    'أسرة': LESSONS.filter(l => l.title.includes('أسرة')).length,
};

const dataProgress = [
  { name: 'مدني', value: subjectsCount['مدني'] },
  { name: 'إداري', value: subjectsCount['إداري'] },
  { name: 'جنائي', value: subjectsCount['جنائي'] },
  { name: 'تجاري', value: subjectsCount['تجاري'] },
].filter(item => item.value > 0);

// Weekly Activity (Simulated for Demo - as we don't have user history backend)
const dataActivity = [
    { name: 'السبت', lessons: 2, quizzes: 5 },
    { name: 'الأحد', lessons: 4, quizzes: 3 },
    { name: 'الاثنين', lessons: 1, quizzes: 8 },
    { name: 'الثلاثاء', lessons: 5, quizzes: 2 },
    { name: 'الأربعاء', lessons: 3, quizzes: 6 },
    { name: 'الخميس', lessons: 6, quizzes: 4 },
    { name: 'الجمعة', lessons: 1, quizzes: 1 },
];

const COLORS = ['#4338ca', '#0ea5e9', '#f59e0b', '#10b981'];

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white">أهلاً، أيها الطالب المجتهد! 👋</h1>
           <p className="text-slate-500 mt-1">إليك إحصائيات المحتوى المتوفر لك في المنصة.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 px-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span>محتوى متجدد</span>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <StatCard title="دروس متوفرة" value={totalLessons.toString()} icon={<BookOpen className="w-5 h-5 text-white"/>} color="bg-blue-500" />
         <StatCard title="أسئلة اختبار" value={totalQuizzes.toString()} icon={<CheckCircle className="w-5 h-5 text-white"/>} color="bg-green-500" />
         <StatCard title="مصطلح قانوني" value={totalFlashcards.toString()} icon={<Award className="w-5 h-5 text-white"/>} color="bg-yellow-500" />
         <StatCard title="ساعات المحتوى" value={`${totalLessons * 2}h`} icon={<TrendingUp className="w-5 h-5 text-white"/>} color="bg-purple-500" />
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Activity Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 md:col-span-2">
            <h3 className="font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
                نشاط المنصة الأسبوعي
            </h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataActivity} barGap={8}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} 
                            itemStyle={{ color: '#fff' }}
                            cursor={{fill: '#f1f5f9'}}
                        />
                        <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                        <Bar dataKey="lessons" name="دروس جديدة" fill="#4338ca" radius={[6, 6, 6, 6]} barSize={12} />
                        <Bar dataKey="quizzes" name="تحديات" fill="#0ea5e9" radius={[6, 6, 6, 6]} barSize={12} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Distribution */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
            <h3 className="font-bold mb-6 text-slate-800 dark:text-white">توزيع المحتوى حسب المادة</h3>
            <div className="flex-1 min-h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={dataProgress}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {dataProgress.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                         <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-slate-800 dark:text-white">{totalLessons}</span>
                    <span className="text-xs text-slate-400">درس</span>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
                {dataProgress.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        {entry.name}
                    </div>
                ))}
            </div>
          </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{title: string, value: string, icon: React.ReactNode, color: string}> = ({title, value, icon, color}) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg shadow-gray-200 dark:shadow-none`}>
            {icon}
        </div>
        <div>
            <p className="text-xs text-slate-400 font-bold mb-1">{title}</p>
            <h4 className="text-2xl font-black text-slate-800 dark:text-white">{value}</h4>
        </div>
    </div>
);

export default Dashboard;
