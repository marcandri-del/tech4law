import React from 'react';
import { Users, GraduationCap, Target, Cpu, Calendar, ArrowRight, Github, Linkedin, Mail } from 'lucide-react';

const Tech4Law: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-50 dark:bg-slate-900/50 -z-10 skew-y-3 transform origin-top-left scale-110"></div>
        <div className="container mx-auto px-4 text-center">
           <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-6">
              <Cpu className="w-3 h-3" />
              <span>النادي العلمي الأول للتقنية القانونية</span>
           </div>
           <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6">
              مجتمع <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Tech4Law</span>
           </h1>
           <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
             نحو رقمنة القطاع القانوني في الجزائر وتمكين طلبة الحقوق من أدوات المستقبل.
           </p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white/10 bg-slate-700 flex items-center justify-center text-4xl font-black shadow-xl">
                    HB
                </div>
                <div className="text-center md:text-right flex-1">
                    <h2 className="text-3xl font-bold mb-2">حيرش بلقاسم</h2>
                    <p className="text-primary-light font-bold mb-6 flex items-center justify-center md:justify-start gap-2">
                        <GraduationCap className="w-5 h-5" />
                        المؤسس & طالب حقوق
                    </p>
                    <p className="text-slate-300 leading-relaxed text-lg max-w-2xl mb-8">
                        مبتكر وطالب باحث في جامعة <strong className="text-white">زيان عاشور (الجلفة) - كلية الحقوق والعلوم السياسية</strong>.
                        يسعى من خلال Tech4Law إلى سد الفجوة بين العلوم القانونية التقليدية والذكاء الاصطناعي، لتطوير حلول تخدم العدالة في الجزائر.
                    </p>
                    <div className="flex gap-4 justify-center md:justify-start">
                        <button className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition"><Linkedin className="w-5 h-5"/></button>
                        <button className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition"><Github className="w-5 h-5"/></button>
                        <button className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition"><Mail className="w-5 h-5"/></button>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Mission Grid */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
          <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                          <Target className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">الرؤية</h3>
                      <p className="text-slate-500">جعل القانون في متناول الجميع من خلال التكنولوجيا، وتبسيط الإجراءات القانونية المعقدة.</p>
                  </div>
                  <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                          <Users className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">المجتمع</h3>
                      <p className="text-slate-500">بناء شبكة من الطلبة والمحامين والمطورين المهتمين بمجال Legal Tech في الجزائر.</p>
                  </div>
                  <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center mb-6">
                          <Calendar className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">النشاطات</h3>
                      <p className="text-slate-500">تنظيم ورشات عمل، هاكاثونات قانونية، وندوات حول أخلاقيات الذكاء الاصطناعي.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Join CTA */}
      <section className="py-20 container mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">هل أنت طالب حقوق مهتم بالتكنولوجيا؟</h2>
          <button className="bg-primary hover:bg-primary-light text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-primary/20 transition transform hover:-translate-y-1 inline-flex items-center gap-3">
              انضم إلينا الآن
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </button>
      </section>
    </div>
  );
};

export default Tech4Law;