import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ExternalLink, AlertCircle, Plus, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

interface AcademicEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'exam' | 'deadline' | 'lecture' | 'holiday';
  description: string;
  googleCalendarUrl?: string;
}

const ALGERIAN_LAW_EVENTS: AcademicEvent[] = [
  {
    id: '1',
    title: 'امتحانات السداسي الأول (مقياس القانون المدني)',
    date: '2026-01-15',
    time: '09:00 - 11:00',
    location: 'مدرج 01 - كلية الحقوق',
    type: 'exam',
    description: 'امتحان السداسي الأول في مقياس القانون المدني (مصادر الالتزام). يرجى إحضار بطاقة الطالب واستدعاء الامتحان.',
    googleCalendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=امتحان+القانون+المدني&dates=20260115T080000Z/20260115T100000Z&details=امتحان+السداسي+الأول+لكلية+الحقوق'
  },
  {
    id: '2',
    title: 'امتحانات السداسي الأول (القانون الإداري)',
    date: '2026-01-18',
    time: '09:00 - 11:00',
    location: 'مدرج 02 - كلية الحقوق',
    type: 'exam',
    description: 'امتحان القانون الإداري (المنازعات الإدارية وتنظيم الإدارة العامة).',
    googleCalendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=امتحان+القانون+الإداري&dates=20260118T080000Z/20260118T100000Z'
  },
  {
    id: '3',
    title: 'آخر أجل لإيداع مذكرة التخرج (ليسانس / ماستر)',
    date: '2026-04-30',
    time: '16:00',
    location: 'أمانة قسم حقوق الإتقان',
    type: 'deadline',
    description: 'آخر موعد لتسليم النسخ الورقية والقرص المضغوط (CD) لمذكرات التخرج بعد موافقة الأستاذ المشرف.',
    googleCalendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=آخر+أجل+لإيداع+المذكرة&dates=20260430T150000Z/20260430T160000Z'
  },
  {
    id: '4',
    title: 'انطلاق امتحانات السداسي الثاني (دور العادية)',
    date: '2026-05-24',
    time: '08:30 - 17:00',
    location: 'كافة المدرجات والقاعات',
    type: 'exam',
    description: 'بداية جدول امتحانات الدورة العادية للسداسي الثاني لجميع مستويات الليسانس (L1, L2, L3) والماستر.',
    googleCalendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=امتحانات+الدورة+العادية+للسداسي+الثاني&dates=20260524T073000Z/20260524T160000Z'
  },
  {
    id: '5',
    title: 'عطلة الشتاء الجامعية',
    date: '2026-12-18',
    time: 'طوال اليوم',
    location: 'الجامعات الجزائرية',
    type: 'holiday',
    description: 'بداية عطلة الشتاء الرسمية للقطاع الجامعي.',
  },
  {
    id: '6',
    title: 'محاضرة تفاعلية: قانون الإجراءات المدنية والإدارية',
    date: '2026-08-10',
    time: '14:00 - 16:00',
    location: 'عبر منصة Google Meet / المساعد الذكي',
    type: 'lecture',
    description: 'محاضرة استدراكية ومراجعة شاملة لأهم تطبيقات قانون الإجراءات المدنية.',
    googleCalendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=محاضرة+الإجراءات+المدنية&dates=20260810T130000Z/20260810T150000Z'
  }
];

export const AcademicCalendar: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [events, setEvents] = useState<AcademicEvent[]>(() => {
    try {
      const saved = localStorage.getItem('dz_law_academic_events');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return ALGERIAN_LAW_EVENTS;
  });
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    location: 'كلية الحقوق',
    type: 'exam' as 'exam' | 'deadline' | 'lecture' | 'holiday',
    description: ''
  });

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.type === filter);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;

    const created: AcademicEvent = {
      id: Date.now().toString(),
      ...newEvent,
      googleCalendarUrl: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(newEvent.title)}&dates=${newEvent.date.replace(/-/g, '')}T090000Z&details=${encodeURIComponent(newEvent.description)}`
    };

    const updated = [created, ...events];
    setEvents(updated);
    try {
      localStorage.setItem('dz_law_academic_events', JSON.stringify(updated));
    } catch (err) {}
    setShowAddModal(false);
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      location: 'كلية الحقوق',
      type: 'exam',
      description: ''
    });
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'exam':
        return <span className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> امتحان</span>;
      case 'deadline':
        return <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> موعد نهائي</span>;
      case 'lecture':
        return <span className="bg-indigo-150 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> محاضرة</span>;
      case 'holiday':
        return <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> عطلة</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8 transition-all">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
               <CalendarIcon className="w-5 h-5" />
             </div>
             <div>
               <h2 className="text-xl font-black text-slate-900 dark:text-white">التقويم الأكاديمي لطلبة الحقوق</h2>
               <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">الامتحانات، المهل النهائية، والمواعيد الرسمية للجامعات الجزائرية (متصل بـ Google Calendar)</p>
             </div>
           </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            فتح في Google Calendar
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary-light text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-primary/20 transition"
          >
            <Plus className="w-4 h-4" /> إضافة حدث
          </button>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold">بيانات توضيحية / تجريبية</span>
            <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">تنبيه هام حول المواعيد والامتحانات</h4>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
            الجدول أدناه يحتوي على مواعيد وأحداث توضيحية/تجريبية لا تعبر بالضرورة عن التواريخ الرسمية الدقيقة الصادرة عن كافة الجامعات الجزائرية. يرجى مراجعة الإعلانات الرسمية لكلية الحقوق المعنية أو استخدام زر "إضافة حدث" لتسجيل مواعيدك الدراسية الخاصة.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${filter === 'all' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
        >
          الكل ({events.length})
        </button>
        <button
          onClick={() => setFilter('exam')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${filter === 'exam' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
        >
          الامتحانات
        </button>
        <button
          onClick={() => setFilter('deadline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${filter === 'deadline' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
        >
          المواعيد النهائية
        </button>
        <button
          onClick={() => setFilter('lecture')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${filter === 'lecture' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
        >
          المحاضرات
        </button>
        <button
          onClick={() => setFilter('holiday')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${filter === 'holiday' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
        >
          العطل
        </button>
      </div>

      {/* Events List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((item) => (
          <div key={item.id} className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:border-primary/50 transition-all group">
            <div>
              <div className="flex justify-between items-start gap-2 mb-3">
                {getTypeBadge(item.type)}
                <span className="text-xs font-mono font-bold text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                  {item.date}
                </span>
              </div>
              <h4 className="font-black text-slate-800 dark:text-white mb-2 text-base group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-slate-900 dark:text-slate-100 mb-4 line-clamp-2 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{item.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                <span className="truncate max-w-[120px]">{item.location}</span>
              </div>
              {item.googleCalendarUrl && (
                <a
                  href={item.googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-light font-bold flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
                  title="إضافة إلى تقويم جوجل"
                >
                  <span>أضف لـ Google</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-fade-in-up" dir="rtl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">إضافة موعد أكاديمي جديد</h3>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">عنوان الموعد / الامتحان</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: امتحان القانون التجاري"
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">التاريخ</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الوقت</label>
                  <input
                    type="text"
                    required
                    placeholder="09:00 - 11:00"
                    value={newEvent.time}
                    onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">النوع</label>
                  <select
                    value={newEvent.type}
                    onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                  >
                    <option value="exam">امتحان</option>
                    <option value="deadline">موعد نهائي</option>
                    <option value="lecture">محاضرة</option>
                    <option value="holiday">عطلة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">المكان / القاعة</label>
                  <input
                    type="text"
                    required
                    placeholder="مدرج 01"
                    value={newEvent.location}
                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">التفاصيل</label>
                <textarea
                  rows={3}
                  placeholder="ملاحظات حول الموعد أو الامتحان..."
                  value={newEvent.description}
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl text-sm transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-primary/20"
                >
                  حفظ الحدث
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
