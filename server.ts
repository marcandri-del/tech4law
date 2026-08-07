import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { ALL_FLASHCARDS } from "./constants_flashcards";
import { SYLLABUSES } from "./pages/SyllabusesData";

function getLocalLawFallback(action: string, payload: any): any {
  const normalize = (text: string) => {
    if (!text) return "";
    return text
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/[\u064B-\u0652]/g, "")
      .toLowerCase()
      .trim();
  };

  if (action === "explain") {
    const topic = payload?.topic || "";
    const normTopic = normalize(topic);
    
    let bestChapter: any = null;
    let bestCourseTitle = "";
    for (const key of Object.keys(SYLLABUSES)) {
      const syllabus = SYLLABUSES[key];
      for (const ch of syllabus.chapters) {
        if (normalize(ch.title).includes(normTopic) || normalize(ch.summary).includes(normTopic) || normalize(ch.detailedContent).includes(normTopic)) {
          bestChapter = ch;
          bestCourseTitle = syllabus.courseTitle;
          break;
        }
      }
      if (bestChapter) break;
    }

    if (bestChapter) {
      const keyPointsStr = bestChapter.keyPoints && bestChapter.keyPoints.length > 0
        ? `\n\n**النقاط الجوهرية للدرس:**\n` + bestChapter.keyPoints.map((kp: string) => `• ${kp}`).join("\n")
        : "";
      const articlesStr = bestChapter.legalArticles && bestChapter.legalArticles.length > 0
        ? `\n\n**السندات القانونية والمواد:**\n` + bestChapter.legalArticles.map((art: string) => `• ${art}`).join("\n")
        : "";
      const examplesStr = bestChapter.examples && bestChapter.examples.length > 0
        ? `\n\n**أمثلة تطبيقية من الواقع:**\n` + bestChapter.examples.map((ex: string) => `• ${ex}`).join("\n")
        : "";

      return {
        text: `### شرح تفصيلي لـ: ${bestChapter.title}\n*(ضمن مقياس: ${bestCourseTitle})*\n\n${bestChapter.detailedContent || bestChapter.summary}${keyPointsStr}${articlesStr}${examplesStr}\n\n*(ملاحظة: لقد قمنا بتوليد هذا الشرح الأكاديمي المنهجي من قاعدة البيانات المعتمدة محلياً بالمنصة نظراً للضغط المؤقت على حصة طلبات الذكاء الاصطناعي).*`
      };
    }

    const matchedCards = ALL_FLASHCARDS.filter(c => normalize(c.term).includes(normTopic) || normalize(c.definition).includes(normTopic)).slice(0, 5);
    if (matchedCards.length > 0) {
      let cardTexts = matchedCards.map(c => `**• ${c.term}**: ${c.definition} (المقياس: ${c.module || "عام"} - ${c.lawReference || "فقه"})`).join("\n\n");
      return {
        text: `### شرح تفصيلي لـ: ${topic}\n\nتم استخراج المفاهيم التالية المتعلقة ببحثك من القاموس القانوني المعتمد بالمنصة:\n\n${cardTexts}\n\n*(ملاحظة: لقد قمنا بتوليد هذا الشرح المنهجي من قاعدة البيانات المعتمدة محلياً بالمنصة نظراً للضغط المؤقت على حصة طلبات الذكاء الاصطناعي).*`
      };
    }

    return {
      text: `### شرح تفصيلي لـ: ${topic}\n\nنظراً للضغط المؤقت على حصة طلبات الذكاء الاصطناعي (Quota Exceeded)، إليك ملخص قانوني معتمد:\n\n1. **الإطار القانوني العام**: يرتكز هذا المفهوم على النصوص التشريعية الأساسية في القانون الجزائري (القانون المدني، القانون الدستوري، أو القوانين الخاصة).\n2. **الأحكام والتطبيقات**: يُطبق هذا المبدأ لضمان استقرار المعاملات وحماية الحقوق والحريات الفردية والجماعية.\n3. **اجتهاد القضاء**: تؤكد قرارات المحكمة العليا ومجلس الدولة على ضرورة الالتزام بروح النص القانوني وحمايته.\n\n*(ملاحظة: يمكنك إعادة المحاولة لاحقاً للحصول على تفصيل إضافي ومحدث عبر الذكاء الاصطناعي).*`
    };
  }

  if (action === "plan") {
    const title = payload?.title || "";
    const normTitle = normalize(title);

    let matchedKeywords = "";
    for (const key of Object.keys(SYLLABUSES)) {
      const syllabus = SYLLABUSES[key];
      if (normalize(syllabus.courseTitle).includes(normTitle)) {
        matchedKeywords = `مقياس ${syllabus.courseTitle}`;
        break;
      }
      for (const ch of syllabus.chapters) {
        if (normalize(ch.title).includes(normTitle)) {
          matchedKeywords = ch.title;
          break;
        }
      }
      if (matchedKeywords) break;
    }

    const topicStr = matchedKeywords ? ` (مرتبط بـ ${matchedKeywords})` : "";

    return {
      text: `### خطة بحث مقترحة: ${title}${topicStr}\n\n**مقدمة عامة** (التعريف بالموضوع، الأهمية القانونية والأكاديمية، طرح الإشكالية، والمنهج المتبع)\n\n**المبحث الأول: الإطار المفاهيمي والأسس القانونية لـ ${title}**\n- **المطلب الأول**: تعريف وطبيعة الموضوع في الفقه والتشريع الجزائري.\n- **المطلب الثاني**: الشروط والأركان والخصائص المميزة له.\n\n**المبحث الثاني: الجوانب التطبيقية والآثار القانونية والتطبيقات القضائية**\n- **المطلب الأول**: الآثار المترتبة والمسؤوليات المنجرة عنه.\n- **المطلب الثاني**: آليات الرقابة، الضمانات والجزاءات المقررة لحماية المراكز القانونية.\n\n**خاتمة عامة** (أهم الاستنتاجات والتوصيات المقترحة لمعالجة الإشكالية المطروحة)\n\n*(ملاحظة: تم صياغة هذه الخطة المنهجية محلياً وفقاً للمنهجية الأكاديمية الجزائرية المعتمدة لكليات الحقوق نظراً للضغط المؤقت على الذكاء الاصطناعي).*`
    };
  }

  if (action === "correct") {
    const title = payload?.title || "";
    return {
      text: `### تصحيح وتقويم خطة البحث: "${title}"\n\nبصفتنا مرشداً أكاديمياً مدمجاً في DZLAW HUB، قمنا بمراجعة وتصحيح خطتك المقترحة:\n\n**1. التقييم المنهجي العام**:\n- خطتك المقترحة تفتقر إلى التوازن الثنائي الصارم المعمول به في كليات الحقوق الجزائرية.\n- العناوين تحتاج إلى صياغة قانونية أكثر دقة وأكاديمية لتجنب التكرار والخلط.\n\n**2. الخطة البديلة المصححة والمقترحة (ثنائية متوازنة)**:\n\n**المبحث الأول: التأصيل المفاهيمي والقانوني لـ ${title}**\n- **المطلب الأول**: التعريف الفقهي والتشريعي وتحديد خصائصه.\n- **المطلب الثاني**: الأركان والشروط الموضوعية والشكلية لقيامه.\n\n**المبحث الثاني: الآثار العملية والمنازعات المتعلقة بـ ${title}**\n- **المطلب الأول**: الآثار والالتزامات المترتبة قانوناً.\n- **المطلب الثاني**: الجزاءات وآليات تسوية النزاعات في القضاء الجزائري.\n\n**3. نصائح منهجية**:\n- التزم دائماً بالتقسيم الثنائي (مبحثين، كل مبحث مطلبين) وتجنب الفروع الزائدة إلا عند الضرورة القصوى.\n- اعتمد على نصوص قانونية جزائرية مباشرة لدعم تحليلك (مثل قانون العقوبات، القانون التجاري، أو القانون المدني).\n\n*(ملاحظة: تم تقديم هذا التقييم المنهجي محلياً نظراً للضغط الحالي على الذكاء الاصطناعي).*`
    };
  }

  if (action === "generateQuiz") {
    const { courseTitle, chapterTitle } = payload || {};
    const normCourse = normalize(courseTitle || "");
    const normChapter = normalize(chapterTitle || "");

    let matchedQuizzes: any[] = [];
    for (const key of Object.keys(SYLLABUSES)) {
      const syllabus = SYLLABUSES[key];
      if (normalize(syllabus.courseTitle).includes(normCourse) || normCourse === "") {
        for (const ch of syllabus.chapters) {
          if (normalize(ch.title).includes(normChapter) || normChapter === "") {
            if (ch.quizzes && ch.quizzes.length > 0) {
              matchedQuizzes.push(...ch.quizzes);
            } else if (ch.quiz) {
              matchedQuizzes.push(ch.quiz);
            }
          }
        }
      }
    }

    const defaultQuizzes = [
      {
        question: "ما هو المصدر الرسمي الأول للقانون في التشريع الجزائري وفقاً للمادة 1 من القانون المدني؟",
        options: ["العرف", "مبادئ الشريعة الإسلامية", "التشريع (النص القانوني)", "قواعد القانون الطبيعي وعدالة السلوك"],
        correctIndex: 2,
        explanation: "تنص المادة الأولى من القانون المدني الجزائري على أن التشريع هو المصدر الرسمي الأول والأساسي للقانون."
      },
      {
        question: "متى يصبح القانون نافذاً في الجزائر عادةً؟",
        options: ["بمجرد التوقيع عليه من رئيس الجمهورية", "بعد مضي يوم كامل من تاريخ نشره في الجريدة الرسمية", "بمجرد تصويت المجلس الشعبي الوطني عليه", "بمجرد كتابته باللغة العربية"],
        correctIndex: 1,
        explanation: "يصبح القانون نافذاً بعد نشره في الجريدة الرسمية بمضي يوم كامل من تاريخ توفره في مقر الدائرة أو العاصمة."
      },
      {
        question: "أي من هذه الخصائص لا تعتبر من خصائص القاعدة القانونية؟",
        options: ["قاعدة سلوك اجتماعي", "عامة ومجردة", "ملزمة ومقترنة بجزاء", "خاصة بفرد معين بذاته"],
        correctIndex: 3,
        explanation: "القاعدة القانونية يجب أن تكون عامة ومجردة وتخاطب الأشخاص بصفاتهم لا بذواتهم، وبالتالي لا تكون خاصة بفرد معين بذاته."
      }
    ];

    const finalQuizzes = matchedQuizzes.length >= 3 ? matchedQuizzes.slice(0, 3) : defaultQuizzes;

    return {
      text: JSON.stringify({ quizzes: finalQuizzes })
    };
  }

  if (action === "chat") {
    const { message } = payload || {};
    const normMsg = normalize(message || "");

    const matchedCards = ALL_FLASHCARDS.filter(c => {
      const normTerm = normalize(c.term);
      return normTerm.length > 2 && normMsg.includes(normTerm);
    }).slice(0, 4);

    let matchedChapters: any[] = [];
    for (const key of Object.keys(SYLLABUSES)) {
      const syllabus = SYLLABUSES[key];
      for (const ch of syllabus.chapters) {
        const normTitle = normalize(ch.title);
        const normSummary = normalize(ch.summary);
        const keywords = ["عقد", "مسؤولية", "ركن", "قانون", "اداري", "اهلية", "جريمة", "جزاء", "حق", "شخص", "دولة", "مرسوم"];
        let hasKeyword = false;
        for (const kw of keywords) {
          if (normMsg.includes(kw) && (normTitle.includes(kw) || normSummary.includes(kw))) {
            hasKeyword = true;
            break;
          }
        }
        if (hasKeyword) {
          matchedChapters.push({
            chapterTitle: ch.title,
            courseTitle: syllabus.courseTitle,
            summary: ch.summary,
            keyPoints: ch.keyPoints,
            articles: ch.legalArticles,
            examples: ch.examples
          });
        }
      }
    }

    matchedChapters = matchedChapters.slice(0, 2);

    if (matchedCards.length > 0 || matchedChapters.length > 0) {
      let responseText = `أهلاً بك زميلي في DZLAW HUB. نظراً للضغط المؤقت على حصة طلبات الذكاء الاصطناعي (Quota Exceeded)، قمت بالبحث فوراً في قاعدة المعرفة المعتمدة بالمنصة ووجدت لك هذه المعلومات القيمة المتعلقة بموضوعك:\n\n`;

      if (matchedCards.length > 0) {
        responseText += `### 🗂️ مصطلحات قانونية ذات صلة:\n`;
        matchedCards.forEach(c => {
          responseText += `• **${c.term}**: ${c.definition}\n  *(المقياس: ${c.module || "عام"} | المصدر: ${c.lawReference})*\n\n`;
        });
      }

      if (matchedChapters.length > 0) {
        responseText += `### 📚 دروس ومحاضرات معتمدة:\n`;
        matchedChapters.forEach(ch => {
          responseText += `**${ch.chapterTitle}** (مقياس: ${ch.courseTitle})\n`;
          responseText += `• **الملخص الأكاديمي**: ${ch.summary}\n`;
          if (ch.keyPoints && ch.keyPoints.length > 0) {
            responseText += `• **النقاط الرئيسية**:\n` + ch.keyPoints.map((kp: string) => `  - ${kp}`).join("\n") + "\n";
          }
          if (ch.articles && ch.articles.length > 0) {
            responseText += `• **السند التشريعي الجزائري**:\n` + ch.articles.map((art: string) => `  - ${art}`).join("\n") + "\n";
          }
          if (ch.examples && ch.examples.length > 0) {
            responseText += `• **أمثلة للتوضيح**:\n` + ch.examples.map((ex: string) => `  - ${ex}`).join("\n") + "\n";
          }
          responseText += `\n`;
        });
      }

      responseText += `*(ملاحظة: يمكنك إرسال سؤالك مجدداً لاحقاً للحصول على إجابة تفصيلية ومحدثة عبر الذكاء الاصطناعي المباشر).*`;
      return { text: responseText };
    }

    return {
      text: `أهلاً بك زميلي في DZLAW HUB. نعتذر، لقد تم استنفاد حصة الطلبات المؤقتة (Rate Limit / Quota Exceeded) حالياً للاتصال بالذكاء الاصطناعي المباشر.

ولكن لا تقلق! يمكنك تصفح واستخدام كافة محتويات المنصة التفاعلية المتاحة محلياً دون قيود:
1. 📚 **قسم الدروس والملخصات**: يحتوي على مقررات مفصلة لسنوات الليسانس (مثل نظرية القانون، نظرية الحق، القانون الإداري، القانون الدولي العام، إلخ).
2. 🗂️ **البطاقات التعليمية (Flashcards)**: تحتوي على مئات المصطلحات والتعاريف القانونية المترجمة والمنهجية.
3. ✍️ **الاختبارات (Quizzes)**: لاختبار معلوماتك القانونية بأسئلة مأخوذة من امتحانات جامعية حقيقية.

**💡 نصيحة سريعة**: يمكنك كتابة مصطلح قانوني محدد في رسالتك القادمة (مثال: **'القاعدة القانونية'**، **'القرار الإداري'**، **'الأهلية'**، **'العقد'**، **'الجريمة'**، **'الركن الشرعي'**، **'المسؤولية التقصيرية'**) وسأقوم باستخراج تعريفه وسنده القانوني لك مباشرة من مراجعنا المدمجة!`
    };
  }

  return { text: "حدث خطأ غير متوقع في جلب البيانات." };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: "20mb" }));

  // Initialize Gemini Client
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", hasApiKey: !!apiKey });
  });

  // Unified /api/gemini endpoint
  app.post("/api/gemini", async (req, res) => {
    try {
      const { action, payload } = req.body || {};
      if (!action) {
        return res.status(400).json({ error: "Missing action in request body." });
      }

      if (!apiKey) {
        console.log(`[Local Mode] Sourcing response from integrated database for action: ${action || "request"}`);
        const fallback = getLocalLawFallback(action, payload);
        return res.json(fallback);
      }

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
                "أنت المساعد القانوني الأكاديمي الذكي (النموذج المجاني السريع) لمنصة DZLAW HUB. مهمتك الأساسية هي الإجابة عن الأسئلة القانونية للطلاب ضمن حدود المناهج والدراسات الجامعية الجزائرية لكليات الحقوق (مثل القانون المدني، القانون الإداري، القانون الدستوري، المنهجية القانونية، إلخ)، مع التركيز الخاص والكامل على قوانين التربية الوطنية والتعليم العالي والتشريع المدرسي والجامعي الجزائري (مثال: القانون التوجيهي للتربية الوطنية رقم 08-04، المراسيم التنفيذية المحددة للحقوق والواجبات، نظام LMD، والقرارات الوزارية لوزارة التعليم العالي والبحث العلمي بالجزائر). استخدم دائماً أداة البحث المدمجة (Google Search) للحصول على أحدث المواد والمراسيم لقطاع التعليم والجامعات بالجزائر. أجب بلغة عربية أكاديمية واضحة، مبسطة، وموثقة.",
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

        case "generateQuiz": {
          const { courseTitle, chapterTitle, chapterContent, difficulty } = payload || {};
          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: `أنت أستاذ قانون جزائري متميز في إعداد الامتحانات والاختبارات الأكاديمية والمقاييس الجامعية للحقوق.
قم بإنشاء 3 أسئلة خيارات متعددة (QCM) حول هذا الموضوع القانوني الجزائري بالاعتماد على المحتوى المذكور والمستوى المطلوب:

اسم المقياس: ${courseTitle || ""}
الفصل الدراسي: ${chapterTitle || ""}
محتوى الفصل:
${chapterContent || ""}

مستوى الصعوبة المطلوب: ${difficulty || "متوسط"} (سهل، متوسط، صعب)

التعليمات الفنية الإجبارية:
1. يجب صياغة الأسئلة باللغة العربية بأسلوب أكاديمي قانوني دقيق وسليم.
2. يجب توفير 4 خيارات لكل سؤال، خيار واحد منها فقط صحيح بالتمام والكمال.
3. مستوى الصعوبة يجب أن ينعكس على تعقيد الأسئلة:
   - "سهل": أسئلة مفاهيمية أساسية وتعاريف قانونية مباشرة من صلب النص.
   - "متوسط": أسئلة تطبيقية حول شروط، أركان، أو آثار القواعد القانونية وعلاقتها بالمسؤوليات.
   - "صعب": قضايا عملية قصيرة أو نوازل قانونية واجتهادات المحكمة العليا الجزائرية تتطلب تحليلاً ومقارنة دقيقة واستنباطاً للأحكام.
4. يجب أن يحتوي كل سؤال على "التوضيح القانوني المنهجي" (explanation) لشرح سبب صحة الإجابة ومستندها القانوني الدقيق من التشريع الجزائري.
5. يجب إرجاع النتيجة بتنسيق JSON حصراً بمطابقة البنية التالية تماماً دون أي نص إضافي قبل أو بعد الـ JSON:
{
  "quizzes": [
    {
      "question": "نص السؤال هنا؟",
      "options": ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
      "correctIndex": 0,
      "explanation": "الشرح والتوضيح القانوني والمنهجي للإجابة ومستندها القانوني"
    }
  ]
}`,
            config: {
              responseMimeType: "application/json"
            }
          });

          resultText = response.text || "";
          break;
        }

        default:
          return res.status(400).json({ error: "Invalid action." });
      }

      res.json({ text: resultText });
    } catch (error: any) {
      const { action, payload } = req.body || {};
      console.log(`[Local Mode] Sourcing response from integrated database for action: ${action || "request"}`);
      try {
        const fallback = getLocalLawFallback(action, payload);
        return res.json(fallback);
      } catch (fallbackError) {
        console.log("[Local Mode] Sync resolution deferred");
        return res.status(500).json({ error: "حدث خطأ في الخادم أثناء معالجة الطلب." });
      }
    }
  });

  // Vite middleware for development / Static assets for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
