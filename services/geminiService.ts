// Client-side Service to call secure backend APIs instead of direct client-side Gemini execution

export const generateExplanation = async (topic: string, context: string): Promise<string> => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "explain",
        payload: { topic, context },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `خطأ في الخادم: ${response.status}`);
    }

    const data = await response.json();
    return data.text || "لم يتم العثور على إجابة.";
  } catch (error: any) {
    console.error("Error generating explanation:", error);
    return `حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: ${error.message || "فشل الاتصال بالخادم"}`;
  }
};

export const generateResearchPlan = async (title: string): Promise<string> => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "plan",
        payload: { title },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `خطأ في الخادم: ${response.status}`);
    }

    const data = await response.json();
    return data.text || "لم يتم إنشاء خطة.";
  } catch (error: any) {
    console.error("Error generating plan:", error);
    return `حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: ${error.message || "فشل الاتصال بالخادم"}`;
  }
};

export const correctResearchMethodology = async (currentPlan: string, title: string): Promise<string> => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "correct",
        payload: { currentPlan, title },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `خطأ في الخادم: ${response.status}`);
    }

    const data = await response.json();
    return data.text || "لم يتم إنشاء تصحيح.";
  } catch (error: any) {
    console.error("Error correcting plan:", error);
    return `حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: ${error.message || "فشل الاتصال بالخادم"}`;
  }
};

export const analyzeDocumentImage = async (imageBase64: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "analyze",
        payload: { imageBase64, mimeType, prompt },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `خطأ في الخادم: ${response.status}`);
    }

    const data = await response.json();
    return data.text || "لم يتمكن النموذج من قراءة الصورة.";
  } catch (error: any) {
    console.error("Error analyzing image:", error);
    return `حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: ${error.message || "فشل الاتصال بالخادم"}`;
  }
};

export const chatWithLegalAI = async (message: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "chat",
        payload: { message, history },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `خطأ في الخادم: ${response.status}`);
    }

    const data = await response.json();
    return data.text || "لا توجد إجابة";
  } catch (error: any) {
    console.error("Chat Error:", error);
    return `حدث خطأ في النظام: ${error.message || "فشل الاتصال بالخادم"}`;
  }
};
