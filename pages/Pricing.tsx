import React from 'react';
import { Check, X, Crown, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            <Crown className="w-4 h-4" />
            <span>خطط تناسب الجميع</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
            استثمر في مستقبلك <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">القانوني</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
            اختر الخطة المناسبة لاحتياجاتك الدراسية أو المهنية. ابدأ مجاناً وقم بالترقية عندما تكون مستعداً.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Free Plan */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 flex flex-col relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="mb-6">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">الباقة الأساسية</h3>
               <p className="text-slate-500 text-sm">للطلاب المبتدئين</p>
            </div>
            <div className="mb-8">
               <span className="text-4xl font-black text-slate-900 dark:text-white">مجاناً</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
               <FeatureItem text="الوصول لدروس السنة الأولى فقط" included={true} />
               <FeatureItem text="5 أسئلة يومية للمساعد الذكي" included={true} />
               <FeatureItem text="بطاقات مراجعة محدودة" included={true} />
               <FeatureItem text="اختبارات قصيرة بسيطة" included={true} />
               <FeatureItem text="تصحيح منهجية البحث" included={false} />
               <FeatureItem text="قاعدة بيانات الاجتهادات القضائية" included={false} />
            </ul>
            <Link to="/ai" className="w-full block text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-4 rounded-xl transition">
                ابدأ الآن
            </Link>
          </div>

          {/* Student Pro Plan */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-primary relative flex flex-col shadow-2xl shadow-primary/10 transform md:-translate-y-4">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                الأكثر طلباً
            </div>
            <div className="mb-6">
               <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mb-4 text-primary">
                  <Zap className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">الطالب المميز</h3>
               <p className="text-slate-500 text-sm">للتفوق الدراسي الشامل</p>
            </div>
            <div className="mb-8 flex items-end gap-1">
               <span className="text-4xl font-black text-slate-900 dark:text-white">1500</span>
               <span className="text-lg font-bold text-slate-500 mb-1">دج / شهر</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
               <FeatureItem text="جميع دروس الليسانس (L1, L2, L3)" included={true} highlight />
               <FeatureItem text="مساعد ذكي غير محدود (Gemini Pro)" included={true} highlight />
               <FeatureItem text="إنشاء وتصحيح خطط البحث" included={true} />
               <FeatureItem text="جميع الاختبارات وبطاقات المراجعة" included={true} />
               <FeatureItem text="تحميل الملخصات PDF" included={true} />
               <FeatureItem text="دعم فني خاص" included={false} />
            </ul>
            <button className="w-full bg-primary hover:bg-primary-light text-white font-bold py-4 rounded-xl transition shadow-lg shadow-primary/25">
                اشترك الآن
            </button>
          </div>

          {/* Professional Plan */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 flex flex-col group hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="mb-6">
               <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-slate-600 dark:text-slate-300">
                  <Shield className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">الباقة المهنية</h3>
               <p className="text-slate-500 text-sm">للمحامين والباحثين</p>
            </div>
            <div className="mb-8 flex items-end gap-1">
               <span className="text-4xl font-black text-slate-900 dark:text-white">4000</span>
               <span className="text-lg font-bold text-slate-500 mb-1">دج / شهر</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
               <FeatureItem text="كل مميزات باقة الطالب" included={true} />
               <FeatureItem text="قاعدة بيانات الاجتهادات القضائية" included={true} />
               <FeatureItem text="صياغة العقود والعرائض بالذكاء الاصطناعي" included={true} />
               <FeatureItem text="تحليل القضايا المعقدة" included={true} />
               <FeatureItem text="أولوية في الدعم الفني" included={true} />
               <FeatureItem text="شارات توثيق في المجتمع" included={true} />
            </ul>
            <button className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white font-bold py-4 rounded-xl transition">
                تواصل معنا
            </button>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="mt-20 text-center">
            <p className="text-slate-500 mb-4">هل لديك أسئلة؟</p>
            <Link to="/contact" className="text-primary font-bold hover:underline">تحدث مع فريق المبيعات</Link>
        </div>
      </div>
    </div>
  );
};

const FeatureItem: React.FC<{text: string, included: boolean, highlight?: boolean}> = ({text, included, highlight}) => (
    <li className={`flex items-start gap-3 text-sm ${!included ? 'opacity-50' : ''}`}>
        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${included ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            {included ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
        </div>
        <span className={`${highlight ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{text}</span>
    </li>
);

export default Pricing;