import React from 'react';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
            سياسة الخصوصية
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            تاريخ التحديث الأخير: 6 أوت 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <Lock className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. التزامنا بحماية خصوصيتك</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              تعتبر خصوصية مستخدمينا ذات أهمية بالغة لمنصة <span className="font-bold text-primary">DZLAW HUB</span>. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وتأمين معلوماتك الشخصية عند استخدامك لمنصتنا وتطبيقاتنا التعليمية. نحن ملتزمون بحماية بياناتك والامتثال للتشريعات والقوانين السارية.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <Eye className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. المعلومات التي نجمعها وكيفية جمعها</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              نقوم بجمع معلومات محدودة لتقديم تجربة تعليمية مخصصة ومحسنة، وهي تشمل:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 text-sm space-y-2 mr-4">
              <li><strong>معلومات الحساب المباشرة:</strong> مثل اسمك الكامل وبريدك الإلكتروني وسنتك الدراسية عند التسجيل.</li>
              <li><strong>التقدم الأكاديمي والتعليمي:</strong> الفصول التي أنجزتها، والاختبارات التي أكملتها، والمصطلحات التي قمت بحفظها لتوفير مزامنة حية لتقدمك.</li>
              <li><strong>بيانات الدعم التقني:</strong> الاستفسارات والرسائل التي ترسلها إلينا عبر نماذج الاتصال لحل مشاكلك.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <FileText className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. مشاركة وحماية البيانات الشخصية</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              نحن لا نقوم ببيع، أو تأجير، أو مشاركة بياناتك الشخصية مع أي أطراف ثالثة لأغراض تجارية أو تسويقية على الإطلاق. يتم استخدام تقنيات التشفير المتقدمة (مثل SSL) وقواعد بيانات Firebase الآمنة لضمان حماية بياناتك من أي وصول غير مصرح به.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <Shield className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. حقوقك في إدارة بياناتك</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              بصفتك مستخدماً لمنصتنا، فإنك تمتلك كامل الحق في تعديل بيانات حسابك الشخصي (مثل الاسم والسنة الدراسية) من لوحة التحكم، كما يمكنك الاتصال بفريق الدعم لدينا في أي وقت لطلب حذف حسابك وكافة البيانات المرتبطة به نهائياً من خوادمنا.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
