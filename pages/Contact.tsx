import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, MessageSquare } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const Contact: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [plan, setPlan] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Prefill fields from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const planParam = params.get('plan');
    if (planParam) {
      setPlan(planParam);
    }
    const sub = params.get('subject');
    if (sub) {
      setSubject(sub);
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // 1. Write the query/contact form message to Firestore for history
      await addDoc(collection(db, 'contacts'), {
        name,
        email,
        subject,
        plan,
        message,
        userId: user?.uid || 'guest',
        createdAt: new Date().toISOString(),
      });

      // 2. Build and trigger mailto link to support@dzlawhub.com
      const mailtoSubject = `${subject} [${plan || 'استفسار عام'}]`;
      const mailtoBody = `الاسم الكامل: ${name}\nالبريد الإلكتروني: ${email}\nالباقة المهتم بها: ${plan || 'لا يوجد / استفسار عام'}\n\nالرسالة:\n${message}`;
      
      const mailtoLink = `mailto:support@dzlawhub.com?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`;
      
      // Open default email client
      window.location.href = mailtoLink;

      setSuccess(true);
      setSubject('');
      setMessage('');
    } catch (err: any) {
      console.error('Error saving contact message:', err);
      setError('حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
            تواصل <span className="text-primary">معنا</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            فريق منصة DZLAW HUB هنا للإجابة على جميع استفساراتك واقتراحاتك. لا تتردد في الاتصال بنا.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Info cards */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-4 shadow-sm">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-primary rounded-xl">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">البريد الإلكتروني</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">support@dzlawhub.com</p>
                <p className="text-slate-400 text-xs mt-1">نرد خلال 24 ساعة</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-4 shadow-sm">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-primary rounded-xl">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">الهاتف</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm" dir="ltr">+213 (0) 555 12 34 56</p>
                <p className="text-slate-400 text-xs mt-1">الأحد - الخميس (09:00 - 17:00)</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-4 shadow-sm">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-primary rounded-xl">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">المقر</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">الجزائر العاصمة، الجزائر</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">أرسل لنا رسالة</h2>
              </div>

              {success && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800 text-sm font-bold animate-fadeIn">
                  تم حفظ رسالتك بنجاح وسيتم فتح برنامج البريد الإلكتروني لإرسالها. شكراً لتواصلك معنا!
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-sm font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الاسم الكامل</label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="اسمح لنا بمعرفتك"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">البريد الإلكتروني</label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الموضوع</label>
                    <input
                      id="contact-subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="عنوان استفسارك"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-plan" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الباقة المهتم بها</label>
                    <select
                      id="contact-plan"
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    >
                      <option value="">لا يوجد / استفسار عام</option>
                      <option value="student-pro">الطالب المميز (Student Pro)</option>
                      <option value="professional">الباقة المهنية (Professional)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الرسالة</label>
                  <textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب تفاصيل رسالتك هنا..."
                    rows={5}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                    required
                  />
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl text-amber-800 dark:text-amber-300 text-sm">
                  ⚠️ <strong>ملاحظة:</strong> عند الضغط على إرسال، سيتم فتح تطبيق البريد الإلكتروني الخاص بك تلقائياً لإرسال الرسالة إلى بريد الدعم لدينا (support@dzlawhub.com).
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white font-bold py-3.5 px-8 rounded-xl transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري المعالجة...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>إرسال الرسالة</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
