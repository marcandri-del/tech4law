import React from 'react';
import { FileText, CheckCircle, Scale, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Navigation back to login */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition font-bold text-sm">
            <ArrowLeft className="w-4 h-4 rotate-180" />
            العودة لصفحة تسجيل الدخول
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 text-center">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/40 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
            شروط وأحكام الاستخدام
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            تاريخ التحديث الأخير: 6 أوت 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <CheckCircle className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. قبول الشروط والأحكام</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              باستخدامك لمنصة وتطبيق <span className="font-bold text-primary">DZLAW HUB</span>، فإنك توافق تماماً على الالتزام بجميع هذه الشروط والأحكام والسياسات المذكورة هنا. إذا كنت لا توافق على أي جزء من هذه الشروط، فيرجى عدم استخدام خدماتنا أو تصفح منصتنا.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <Scale className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. حقوق الملكية الفكرية والمحتوى التعليمي</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              جميع المحتويات التعليمية المتوفرة على المنصة من دروس ومحاضرات، وبطاقات استذكارية (Flashcards)، وأسئلة واختبارات (Quizzes) هي ملكية فكرية خاصة بـ <span className="font-bold text-primary">DZLAW HUB</span> أو مرخصة للاستخدام الشخصي غير التجاري فقط للطلبة. يمنع منعاً باتاً استنساخ أو توزيع أو بيع هذا المحتوى التعليمي دون إذن مسبق.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <AlertTriangle className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. الاستخدام المقبول وإخلاء المسؤولية القانونية</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              تم تطوير هذه المنصة لأغراض تعليمية بحتة لمساعدة طلبة الحقوق والقانون في الجزائر على الاستذكار والفهم. ولا يعتبر المحتوى المقدم بأي حال من الأحوال استشارات قانونية مهنية معتمدة. استخدامك للمعلومات والمواد القانونية يقع على مسؤوليتك الشخصية والمهنية الكاملة.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <FileText className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. تعديل الخدمات والبنود</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              نحتفظ بكامل الحق في تعديل، أو تعليق، أو إيقاف أي جزء من الخدمات التعليمية أو تحديث هذه الشروط في أي وقت دون إشعار مسبق. ننصح بمراجعة هذه الصفحة بشكل دوري للوقوف على آخر التعديلات والتحديثات لضمان التوافق التام.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
