import type { IncomingMessage, ServerResponse } from "http";
import { GoogleGenAI } from "@google/genai";

// Standard Vercel req/res helpers or any Express-like request/response handler
export default async function handler(req: any, res: any) {
  // CORS configuration for Vercel
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { action, payload } = req.body || {};
    if (!action) {
      return res.status(400).json({ error: "Missing action in request body." });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "مفتاح API غير متوفر في الخادم." });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    let resultText = "";

    switch (action) {
      case "explain": {
        const { topic, context } = payload || {};
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `اشرح لي هذا الموضوع القانوني الجزائري بشكل مبسط للطلاب:
الموضوع: ${topic || ""}
السياق: ${context || ""}

اجعل الشرح باللغة العربية الواضحة مع أمثلة من الواقع الجزائري.`,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        let text = response.text || "لم يتم العثور على إجابة.";
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        if (groundingMetadata?.groundingChunks) {
          const sources = groundingMetadata.groundingChunks
            .filter((c: any) => c.web?.uri)
            .map((c: any) => `• [${c.web.title}](${c.web.uri})`)
            .join("\n");

          if (sources) {
            text += `\n\n**المصادر:**\n${sources}`;
          }
        }
        resultText = text;
        break;
      }

      case "plan": {
        const { title } = payload || {};
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `اقترح خطة بحث (Plan de recherche) لمذكرة تخرج حول الموضوع التالي: "${title || ""}".
يجب أن تكون الخطة ثنائية (مبحثين، كل مبحث مطلبين) وفق المنهجية القانونية الجزائرية.`,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
        resultText = response.text || "لم يتم إنشاء خطة.";
        break;
      }

      case "correct": {
        const { currentPlan, title } = payload || {};
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `بصفتك أستاذاً جامعياً في كلية الحقوق الجزائرية، قم بتصحيح وتقويم خطة البحث التالية:

عنوان المذكرة: "${title || ""}"
الخطة المقترحة من الطالب:
${currentPlan || ""}

المطلوب:
1. تقييم مدى احترام الخطة للمنهجية القانونية (التقسيم الثنائي المتوازن).
2. تصحيح العناوين لتكون دقيقة وقانونية.
3. اقتراح الخطة البديلة المصححة بالكامل (مبحثين، كل مبحث مطلبين).
4. إعطاء نصائح منهجية حول الموضوع.

استخدم أسلوباً أكاديمياً موجهاً للطالب.`,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
        resultText = response.text || "لم يتم إنشاء تصحيح.";
        break;
      }

      case "analyze": {
        const { imageBase64, mimeType, prompt } = payload || {};
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || "image/png",
                  data: imageBase64,
                },
              },
              {
                text: prompt || "قم بتحليل هذه الصورة واستخراج النصوص أو المعلومات القانونية منها وشرحها.",
              },
            ],
          },
        });
        resultText = response.text || "لم يتمكن النموذج من قراءة الصورة.";
        break;
      }

      case "chat": {
        const { message, history } = payload || {};
        const chat = ai.chats.create({
          model: "gemini-3.6-flash",
          history: history,
          config: {
            systemInstruction:
              "أنت مساعد قانوني ذكي متخصص في القانون الجزائري (DZLAW HUB). استخدم أداة البحث (Google Search) دائماً للتحقق من المعلومات القانونية وأرقام المواد والأحكام القضائية الجزائرية الحديثة. أجب باللغة العربية أو الدارجة الجزائرية المهذبة. قدم استشارات عامة دائماً مع التنويه بأنك ذكاء اصطناعي ويجب استشارة محامٍ في القضايا الحساسة.",
            tools: [{ googleSearch: {} }],
          },
        });

        const result = await chat.sendMessage({ message: message || "" });
        let text = result.text || "لا توجد إجابة";

        const groundingMetadata = result.candidates?.[0]?.groundingMetadata;
        if (groundingMetadata?.groundingChunks) {
          const sources = groundingMetadata.groundingChunks
            .filter((c: any) => c.web?.uri)
            .map((c: any) => `• [${c.web.title}](${c.web.uri})`)
            .join("\n");

          if (sources) {
            text += `\n\n**المصادر:**\n${sources}`;
          }
        }
        resultText = text;
        break;
      }

      default:
        return res.status(400).json({ error: "Invalid action." });
    }

    return res.status(200).json({ text: resultText });
  } catch (error: any) {
    console.error("Error in serverless api/gemini:", error);
    return res.status(500).json({ error: error.message || "حدث خطأ أثناء معالجة الطلب." });
  }
}
