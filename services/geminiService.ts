import { GoogleGenAI } from "@google/genai";

// ✅ API key from environment - never hardcode it
const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) ||
               (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
               '';

const ai = new GoogleGenAI({ apiKey });

// ✅ FREE tier model: gemini-1.5-flash = 1500 free requests/day
const FREE_MODEL = 'gemini-1.5-flash';

export const generateExplanation = async (topic: string, context: string): Promise<string> => {
  if (!apiKey) return "عذراً، مفتاح API غير متوفر. يرجى إضافة GEMINI_API_KEY في ملف .env.local";
  try {
    const response = await ai.models.generateContent({
      model: FREE_MODEL,
      contents: `اشرح لي هذا الموضوع القانوني الجزائري بشكل مبسط للطلاب:\nالموضوع: ${topic}\nالسياق: ${context}\n\nاجعل الشرح باللغة العربية الواضحة مع أمثلة من الواقع الجزائري.`,
    });
    return response.text || "لم يتم العثور على إجابة.";
  } catch (error: any) {
    console.error("Error generating explanation:", error);
    if (error?.status === 429) return "⚠️ تم تجاوز حد الطلبات المجانية. يرجى المحاولة لاحقاً.";
    if (error?.status === 400) return "⚠️ مفتاح API غير صالح.";
    return "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.";
  }
};

export const generateResearchPlan = async (title: string): Promise<string> => {
  if (!apiKey) return "عذراً، مفتاح API غير متوفر.";
  try {
    const response = await ai.models.generateContent({
      model: FREE_MODEL,
      contents: `اقترح خطة بحث (Plan de recherche) لمذكرة تخرج حول الموضوع التالي: "${title}".\nيجب أن تكون الخطة ثنائية (مبحثين، كل مبحث مطلبين) وفق المنهجية القانونية الجزائرية.`,
    });
    return response.text || "لم يتم إنشاء خطة.";
  } catch (error: any) {
    if (error?.status === 429) return "⚠️ تم تجاوز حد الطلبات المجانية. يرجى المحاولة لاحقاً.";
    return "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.";
  }
};

export const correctResearchMethodology = async (currentPlan: string, title: string): Promise<string> => {
  if (!apiKey) return "عذراً، مفتاح API غير متوفر.";
  try {
    const response = await ai.models.generateContent({
      model: FREE_MODEL,
      contents: `بصفتك أستاذاً جامعياً في كلية الحقوق الجزائرية، قم بتصحيح وتقويم خطة البحث التالية:\n\nعنوان المذكرة: "${title}"\nالخطة المقترحة:\n${currentPlan}\n\nالمطلوب:\n1. تقييم مدى احترام الخطة للمنهجية القانونية.\n2. تصحيح العناوين.\n3. اقتراح الخطة البديلة المصححة (مبحثين، كل مبحث مطلبين).\n4. نصائح منهجية.`,
    });
    return response.text || "لم يتم إنشاء تصحيح.";
  } catch (error: any) {
    if (error?.status === 429) return "⚠️ تم تجاوز حد الطلبات المجانية. يرجى المحاولة لاحقاً.";
    return "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.";
  }
};

// ✅ FIXED: was 'gemini-3-pro-preview' (doesn't exist!) → gemini-1.5-flash supports vision
export const analyzeDocumentImage = async (imageBase64: string, mimeType: string, prompt: string): Promise<string> => {
  if (!apiKey) return "عذراً، مفتاح API غير متوفر.";
  try {
    const response = await ai.models.generateContent({
      model: FREE_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: prompt || "قم بتحليل هذه الصورة واستخراج النصوص أو المعلومات القانونية منها وشرحها." }
        ]
      } as any
    });
    return response.text || "لم يتمكن النموذج من قراءة الصورة.";
  } catch (error: any) {
    if (error?.status === 429) return "⚠️ تم تجاوز حد الطلبات المجانية.";
    return "حدث خطأ أثناء تحليل الصورة. تأكد من أن الصورة واضحة وبصيغة JPG أو PNG.";
  }
};

export const chatWithLegalAI = async (message: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  if (!apiKey) return "عذراً، الخدمة غير متوفرة حالياً. يرجى إضافة مفتاح API.";
  try {
    const chat = ai.chats.create({
      model: FREE_MODEL,
      history,
      config: {
        systemInstruction: `أنت مساعد قانوني ذكي متخصص في القانون الجزائري (DZ LAW HUB).
- أجب باللغة العربية الفصحى أو الدارجة الجزائرية المهذبة.
- تخصصك: القانون المدني الجزائري، قانون الأسرة، القانون التجاري، الإداري، الجنائي.
- استند إلى القوانين الجزائرية (الأمر 75-58، قانون الأسرة 84-11، إلخ).
- إذا لم تكن متأكداً من رقم مادة، قل ذلك بصراحة.
- نوّه دائماً بأنك ذكاء اصطناعي ويجب استشارة محامٍ في القضايا الحساسة.`,
      }
    });
    const result = await chat.sendMessage({ message });
    return result.text || "لا توجد إجابة";
  } catch (error: any) {
    if (error?.status === 429) return "⚠️ تم تجاوز حد الطلبات المجانية (1500/يوم). حاول غداً.";
    if (error?.status === 400) return "⚠️ مفتاح API غير صالح. تحقق من ملف .env.local";
    return "حدث خطأ في النظام. يرجى المحاولة مرة أخرى.";
  }
};
