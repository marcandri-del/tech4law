# DZ LAW HUB 🏛️

منصة تعليمية قانونية ذكية للطلاب الجزائريين

---

## ✅ الإصلاحات المُطبَّقة في هذا الإصدار

| المشكلة | الحل |
|---|---|
| نموذج `gemini-3-pro-preview` غير موجود | تم التغيير إلى `gemini-1.5-flash` ✅ |
| نموذج `gemini-2.5-flash` مدفوع | تم التغيير إلى `gemini-1.5-flash` (مجاني) ✅ |
| انتهاء الجلسة عند تحديث الصفحة | تم حفظ الجلسة في localStorage ✅ |
| رسائل خطأ غير واضحة | رسائل خطأ عربية واضحة ✅ |
| مفتاح API مكشوف في المتصفح | تم إنشاء backend proxy ✅ |

---

## 🚀 تشغيل المشروع

### 1. إعداد مفتاح API (مجاني)

1. اذهب إلى https://aistudio.google.com/app/apikey
2. أنشئ مفتاح API جديد
3. في ملف `.env.local` في المجلد الرئيسي، ضع:

```
GEMINI_API_KEY=your_actual_key_here
```

### 2. تشغيل الواجهة الأمامية

```bash
npm install
npm run dev
```

الموقع سيعمل على: http://localhost:3000

### 3. (اختياري للإنتاج) تشغيل الـ Backend Proxy

```bash
cd backend
npm install
# أنشئ ملف .env من .env.example وضع مفتاحك فيه
npm start
```

---

## 💡 النماذج المجانية المتاحة

| النموذج | الاستخدام | الحد المجاني |
|---|---|---|
| `gemini-1.5-flash` ✅ | كل الميزات | 1500 طلب/يوم |
| `gemini-1.5-pro` | للمهام المعقدة | 50 طلب/يوم |

---

## 🔐 الأمان

- **لا تضع مفتاح API في الكود مباشرة**
- **لا ترفع ملف `.env.local` على GitHub** (موجود في `.gitignore`)
- للإنتاج: استخدم backend proxy الموجود في مجلد `/backend`

---

## 🌐 النشر المجاني

- **الواجهة**: [Vercel](https://vercel.com) أو [Netlify](https://netlify.com)
- **الـ Backend**: [Render](https://render.com) أو [Railway](https://railway.app)
