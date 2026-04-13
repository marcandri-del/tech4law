import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, BookOpen, Layers, ArrowRight, Star, Users, Lightbulb, Scale } from 'lucide-react';
import { DAILY_TIPS } from '../constants';

const Home: React.FC = () => {
  // Get a tip based on the day of the year (simulated daily rotation)
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const tipIndex = dayOfYear % DAILY_TIPS.length;
  const dailyTip = DAILY_TIPS[tipIndex];

  return (
    <div className="overflow-hidden relative">
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-4 min-h-[650px] flex flex-col justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-50/80 to-transparent dark:from-slate-900/80 dark:to-transparent -z-10 pointer-events-none"></div>

        <div className="container mx-auto flex flex-col items-center relative z-10">
          <div className="max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-50/80 dark:bg-indigo-900/50 backdrop-blur-sm text-primary dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 px-4 py-2 rounded-full text-sm font-bold mb-8 shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                المنصة الأولى لطلبة الحقوق في الجزائر
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-relaxed lg:leading-normal">
              تفوّق في دراستك <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent px-2">القانونية</span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto backdrop-blur-sm p-2 rounded-xl">
              دروس مبسطة، تمارين تفاعلية، ومساعد ذكي يجيب على كل تساؤلاتك. 
              DZ LAW HUB هو رفيقك من السنة الأولى حتى التخرج.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link to="/lessons" className="bg-primary hover:bg-primary-light text-white font-bold py-3 px-8 rounded-xl shadow-xl shadow-primary/20 transition transform hover:-translate-y-1 flex items-center justify-center gap-2 text-base">
                <BookOpen className="w-5 h-5" />
                ابدأ المذاكرة مجاناً
              </Link>
              <Link to="/ai" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 font-bold py-3 px-8 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2 text-base">
                <Brain className="w-5 h-5 text-accent" />
                اسأل المساعد الذكي
              </Link>
            </div>

            {/* Daily Tip Card */}
            <div className="max-w-3xl mx-auto bg-amber-50/90 dark:bg-amber-900/20 backdrop-blur-md border border-amber-100 dark:border-amber-800 rounded-3xl p-6 md:p-8 relative text-right shadow-sm hover:shadow-md transition-shadow">
               <div className="absolute -top-5 right-8 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 p-2 rounded-xl shadow-sm">
                  <Lightbulb className="w-6 h-6" />
               </div>
               <div className="flex flex-col md:flex-row gap-6 items-start">
                   <div className="flex-1">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full mb-3 inline-block">
                        💡 معلومة اليوم: {dailyTip.category}
                      </span>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{dailyTip.title}</h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                          {dailyTip.content}
                      </p>
                      {dailyTip.reference && (
                          <div className="flex items-center gap-2 text-xs text-amber-600/80 dark:text-amber-500/80 font-bold">
                              <Scale className="w-3 h-3" />
                              <span>{dailyTip.reference}</span>
                          </div>
                      )}
                   </div>
               </div>
            </div>
            
            <div className="mt-16 flex items-center justify-center gap-8 text-sm text-slate-500 font-medium">
               <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  +5000 طالب
               </div>
               <div className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
               <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  +200 درس
               </div>
                <div className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
               <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  4.9/5 تقييم
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-20 bg-white dark:bg-slate-950 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">اختر طريقتك في التعلم</h2>
            <p className="text-slate-500 text-lg leading-relaxed">سواء كنت تفضل القراءة، الحفظ السريع، أو الاختبارات، لدينا الأدوات المناسبة لك.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <PathCard 
                icon={<BookOpen className="w-8 h-8 text-white"/>}
                bg="bg-primary"
                title="دروس ومحاضرات"
                desc="شرح مفصل للمقاييس الجامعية مقسمة حسب السنوات الدراسية."
                action="تصفح الدروس"
                link="/lessons"
            />
            <PathCard 
                icon={<Layers className="w-8 h-8 text-white"/>}
                bg="bg-accent"
                title="بطاقات المراجعة"
                desc="راجع المصطلحات والمواد القانونية بسرعة باستخدام البطاقات."
                action="ابدأ المراجعة"
                link="/flashcards"
            />
            <PathCard 
                icon={<Brain className="w-8 h-8 text-white"/>}
                bg="bg-purple-600"
                title="مدرس الذكاء الاصطناعي"
                desc="اسأل عن أي غموض قانوني واحصل على شرح فوري مع الأمثلة."
                action="تحدث الآن"
                link="/ai"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const PathCard: React.FC<{ icon: React.ReactNode, bg: string, title: string, desc: string, action: string, link: string }> = ({ icon, bg, title, desc, action, link }) => (
  <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 transition hover:shadow-xl hover:-translate-y-2 border border-slate-100 dark:border-slate-800 group relative overflow-hidden">
    <div className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-500 mb-8 leading-relaxed h-20">{desc}</p>
    
    <Link to={link} className="inline-flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition">
      {action} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
    </Link>
    
    {/* Decorative Blob */}
    <div className={`absolute -right-10 -bottom-10 w-32 h-32 ${bg} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition duration-500`}></div>
  </div>
);

export default Home;