import React, { useState } from 'react';
import { Users, GraduationCap, Target, Cpu, Calendar, ArrowRight, Github, Linkedin, Mail, Check, X, Send, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const Tech4Law: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Join Modal State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [university, setUniversity] = useState('');
  const [year, setYear] = useState('السنة الأولى');
  const [skills, setSkills] = useState('');
  const [motivation, setMotivation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!university.trim() || !motivation.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'tech4law_members'), {
        userId: user?.uid || 'guest',
        userName: user?.name || 'زائر',
        userEmail: user?.email || '',
        university: university.trim(),
        year: year,
        skills: skills.trim(),
        motivation: motivation.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Error submitting club registration:', err);
      setError('حدث خطأ أثناء إرسال طلب الانضمام. يرجى المحاولة لاحقاً.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-50 dark:bg-slate-900/50 -z-10 skew-y-3 transform origin-top-left scale-110"></div>
        <div className="container mx-auto px-4 text-center">
           <div className="inline-flex items-center gap-2 bg-slate-900 text-white dark:bg-slate-800 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
              <Cpu className="w-3 h-3 text-primary animate-pulse" />
              <span>النادي العلمي الأول للتقنية القانونية</span>
           </div>
           <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6">
              مجتمع <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Tech4Law</span>
           </h1>
           <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
             نحو رقمنة القطاع القانوني في الجزائر وتمكين طلبة الحقوق من أدوات المستقبل.
           </p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white/10 bg-slate-700 text-white flex items-center justify-center text-4xl font-black shadow-xl flex-shrink-0">
                    HB
                </div>
                <div className="text-center md:text-right flex-1">
                    <h2 className="text-3xl font-bold mb-2">حيرش بلقاسم</h2>
                    <p className="text-primary-light font-bold mb-6 flex items-center justify-center md:justify-start gap-2">
                        <GraduationCap className="w-5 h-5" />
                        المؤسس & طالب حقوق
                    </p>
                    <p className="text-slate-300 dark:text-slate-400 leading-relaxed text-lg max-w-2xl mb-8">
                        مبتكر وطالب باحث في جامعة <strong className="text-white">زيان عاشور (الجلفة) - كلية الحقوق والعلوم السياسية</strong>.
                        يسعى من خلال Tech4Law إلى سد الفجوة بين العلوم القانونية التقليدية والذكاء الاصطناعي، لتطوير حلول تخدم العدالة في الجزائر.
                    </p>
                    <div className="flex gap-4 justify-center md:justify-start">
                        <button 
                          onClick={() => navigate('/contact?subject=مراسلة نادي Tech4Law العلمي')}
                          className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition text-white cursor-pointer"
                          aria-label="تواصل مع المؤسس بريدياً"
                        >
                          <Mail className="w-5 h-5"/>
                        </button>
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
                      <p className="text-slate-500 dark:text-slate-400">جعل القانون في متناول الجميع من خلال التكنولوجيا، وتبسيط الإجراءات القانونية المعقدة.</p>
                  </div>
                  <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                          <Users className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">المجتمع</h3>
                      <p className="text-slate-500 dark:text-slate-400">بناء شبكة من الطلبة والمحامين والمطورين المهتمين بمجال Legal Tech في الجزائر.</p>
                  </div>
                  <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center mb-6">
                          <Calendar className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">النشاطات</h3>
                      <p className="text-slate-500 dark:text-slate-400">تنظيم ورشات عمل، هاكاثونات قانونية، وندوات حول أخلاقيات الذكاء الاصطناعي.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Join CTA */}
      <section className="py-20 container mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">هل أنت طالب حقوق مهتم بالتكنولوجيا؟</h2>
          <button 
            onClick={() => { setShowJoinModal(true); setSuccess(false); setError(''); }}
            className="bg-primary hover:bg-primary-light text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-primary/20 transition transform hover:-translate-y-1 inline-flex items-center gap-3 cursor-pointer"
          >
              انضم إلينا الآن
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </button>
      </section>

      {/* Join Club Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scaleIn">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-6 relative">
              <button 
                onClick={() => setShowJoinModal(false)} 
                className="absolute left-6 top-6 text-white/80 hover:text-white transition cursor-pointer"
                aria-label="إغلاق النافذة"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <Cpu className="w-6 h-6 text-primary-light" />
                <h3 className="text-xl font-black">طلب انضمام لنادي Tech4Law</h3>
              </div>
              <p className="text-white/80 text-sm">كن جزءاً من الجيل القادم لرقمنة القانون والعدالة في الجزائر.</p>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {success ? (
                <div className="text-center py-8 animate-fadeIn">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">تم إرسال طلب الانضمام!</h4>
                  <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-8">
                    مرحباً بك! لقد استلمنا طلب انضمامك إلى النادي العلمي للتقنية القانونية. سيقوم فريق النادي بمراجعة طلبك والتواصل معك قريباً للمشاركة في الأنشطة والورشات.
                  </p>
                  <button 
                    onClick={() => setShowJoinModal(false)}
                    className="bg-primary hover:bg-primary-light text-white font-bold py-3 px-8 rounded-xl transition cursor-pointer"
                  >
                    رائع، إغلاق
                  </button>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold border border-red-200 dark:border-red-800">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="university-name" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الجامعة أو الكلية التابع لها *</label>
                      <input 
                        id="university-name"
                        type="text" 
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="مثال: جامعة الجزائر 1 - يوسف بن خدة"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="academic-year" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">السنة الدراسية</label>
                        <select 
                          id="academic-year"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                        >
                          <option>السنة الأولى</option>
                          <option>السنة الثانية</option>
                          <option>السنة الثالثة</option>
                          <option>ماستر 1</option>
                          <option>ماستر 2</option>
                          <option>دكتوراه</option>
                          <option>محام ممارس</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="tech-skills" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">المهارات والاهتمامات (اختياري)</label>
                        <input 
                          id="tech-skills"
                          type="text" 
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          placeholder="مثال: برمجة، صياغة بحوث، تصميم"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="join-motivation" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">لماذا ترغب في الانضمام إلى Tech4Law؟ *</label>
                      <textarea 
                        id="join-motivation"
                        value={motivation}
                        onChange={(e) => setMotivation(e.target.value)}
                        placeholder="اكتب نبذة قصيرة عن اهتمامك بالتقنية والعلوم القانونية وطموحك في النادي..."
                        rows={4}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowJoinModal(false)}
                      className="w-1/3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold py-3.5 rounded-xl transition cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="w-2/3 bg-primary hover:bg-primary-light text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>جاري الإرسال...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>إرسال الطلب</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tech4Law;
