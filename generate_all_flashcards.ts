import { GoogleGenAI, Type } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!apiKey) {
  console.error("CRITICAL ERROR: GEMINI_API_KEY is not set.");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

interface Module {
  year: number;
  semester: number;
  lessonNum: number;
  name: string;
}

const modules: Module[] = [
  // Year 1 S1
  { year: 1, semester: 1, lessonNum: 1, name: "مدخل للعلوم القانونية" },
  { year: 1, semester: 1, lessonNum: 2, name: "قانون دستوري" },
  { year: 1, semester: 1, lessonNum: 3, name: "مدخل للقانون الإداري" },
  { year: 1, semester: 1, lessonNum: 4, name: "تاريخ النظم القانونية" },
  { year: 1, semester: 1, lessonNum: 5, name: "القانون الدولي العام" },
  { year: 1, semester: 1, lessonNum: 6, name: "لغة قانونية فرنسية 1" },

  // Year 1 S2
  { year: 1, semester: 2, lessonNum: 1, name: "نظرية الحق" },
  { year: 1, semester: 2, lessonNum: 2, name: "لغة قانونية إنجليزية 2" },

  // Year 2 S1
  { year: 2, semester: 1, lessonNum: 1, name: "القانون المدني مصادر الالتزام" },
  { year: 2, semester: 1, lessonNum: 2, name: "القانون الجنائي العام" },
  { year: 2, semester: 1, lessonNum: 3, name: "القانون الإداري المتقدم" },
  { year: 2, semester: 1, lessonNum: 4, name: "علم الإجرام والعقاب" },
  { year: 2, semester: 1, lessonNum: 5, name: "لغة قانونية 3" },

  // Year 2 S2
  { year: 2, semester: 2, lessonNum: 1, name: "أحكام الالتزام" },
  { year: 2, semester: 2, lessonNum: 2, name: "قانون العقوبات الخاص" },
  { year: 2, semester: 2, lessonNum: 3, name: "قانون الأسرة" },
  { year: 2, semester: 2, lessonNum: 4, name: "الإجراءات المدنية" },

  // Year 3 S1
  { year: 3, semester: 1, lessonNum: 1, name: "القانون التجاري" },
  { year: 3, semester: 1, lessonNum: 2, name: "الإجراءات الجزائية" },
  { year: 3, semester: 1, lessonNum: 3, name: "قانون العمل" },
  { year: 3, semester: 1, lessonNum: 4, name: "القانون الدولي الخاص" },

  // Year 3 S2
  { year: 3, semester: 2, lessonNum: 1, name: "قانون الملكية الفكرية" },
  { year: 3, semester: 2, lessonNum: 2, name: "قانون الضرائب" },
  { year: 3, semester: 2, lessonNum: 3, name: "منهجية البحث القانوني" },
  { year: 3, semester: 2, lessonNum: 4, name: "قانون البيئة" }
];

const cacheFile = path.join(process.cwd(), "flashcards_cache.json");

// Helper to load cache
function loadCache(): Record<string, any[]> {
  if (fs.existsSync(cacheFile)) {
    try {
      return JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
    } catch (e) {
      console.error("Error reading cache file, starting fresh:", e);
      return {};
    }
  }
  return {};
}

// Helper to save cache
function saveCache(cache: Record<string, any[]>) {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), "utf-8");
}

async function generateModuleFlashcards(mod: Module): Promise<any[]> {
  console.log(`\nGenerating flashcards for: "${mod.name}" (Year ${mod.year}, Sem ${mod.semester}, Index ${mod.lessonNum})...`);
  
  const isLanguageModule = mod.name.includes("لغة");
  const isFrench = mod.name.includes("فرنسية") || mod.name === "لغة قانونية 3";
  
  let prompt = "";
  if (isLanguageModule) {
    prompt = `You are a distinguished Algerian Law Professor specialized in the university LMD curriculum.
Your task is to generate EXACTLY 45 unique, high-quality, authentic study flashcards for the module: "${mod.name}".

Since this is a legal language module, we want the cards to act as a translation dictionary for legal terms.
STRICT CARD GENERATION RULES:
1. Generate EXACTLY 45 flashcards.
2. "id": must follow this pattern: "f_y${mod.year}s${mod.semester}l${mod.lessonNum}_X" where X is the card number from 1 to 45. E.g., f_y${mod.year}s${mod.semester}l${mod.lessonNum}_1, f_y${mod.year}s${mod.semester}l${mod.lessonNum}_2, etc.
3. "term": must be the Arabic legal term ONLY (e.g., 'القاعدة القانونية', 'الدعوى العمومية', 'العقد', 'شخص معنوي', 'مسؤولية تقصيرية', 'أهلية الأداء', 'إجراءات مدنية'). No translation or description here.
4. "definition": must be ONLY the exact, standard ${isFrench ? 'French' : 'English'} translation of that Arabic legal term. Do not add any explanation or description! E.g., for 'القاعدة القانونية' the definition must be strictly '${isFrench ? 'La règle de droit' : 'The legal rule'}' or similar. Keep it capitalized and formal.
5. "lawReference": must be strictly '${isFrench ? 'ترجمة قانونية فرنسية' : 'ترجمة قانونية إنجليزية'}'.
6. "year": must be the integer ${mod.year}.
7. "module": must be the exact string "${mod.name}".
8. "semester": must be the integer ${mod.semester}.
9. Ensure terms are extremely accurate legal vocabulary useful for an Algerian university student prepping for exams or magistrate competitions. No placeholders!`;
  } else {
    prompt = `You are a distinguished Algerian Law Professor specialized in the university LMD curriculum.
Your task is to generate EXACTLY 45 unique, high-quality, authentic study flashcards in Arabic for the module: "${mod.name}".

RESOURCES TO USE:
- القانون المدني الجزائري الأمر 75-58
- قانون العقوبات الجزائري الأمر 66-156
- قانون الإجراءات الجزائية
- قانون الأسرة الجزائري 84-11
- الدستور الجزائري 2020
- القانون التجاري الجزائري
- Vocabulaire Juridique Capitant
- Dalloz
- Black's Law Dictionary

STRICT CARD GENERATION RULES:
1. Generate EXACTLY 45 flashcards.
2. The cards must be sorted logically from basic definitions and terms to more advanced applications, exceptions, and procedural steps (1 to 45).
3. "id": must follow this pattern: "f_y${mod.year}s${mod.semester}l${mod.lessonNum}_X" where X is the card number from 1 to 45. E.g., f_y${mod.year}s${mod.semester}l${mod.lessonNum}_1, f_y${mod.year}s${mod.semester}l${mod.lessonNum}_2, etc.
4. "term": must be the Arabic legal term ONLY. No explanation or translation in the term itself.
5. "definition": must be exactly one clear Arabic sentence explaining the term, maximum 20 words. Must be extremely accurate legally.
6. "lawReference": must specify the exact Algerian legal article number and the specific code (e.g., 'المادة 54 من القانون المدني', 'المادة 5 من قانون العقوبات') or 'فقه قانوني' (if it is a general legal concept with no single direct article).
7. "year": must be the integer ${mod.year}.
8. "module": must be the exact string "${mod.name}".
9. "semester": must be the integer ${mod.semester}.
10. Ensure absolute educational value for an Algerian university student prepping for exams or magistrate competitions. No placeholders or mock/filler terms!`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            term: { type: Type.STRING },
            definition: { type: Type.STRING },
            lawReference: { type: Type.STRING },
            year: { type: Type.INTEGER },
            module: { type: Type.STRING },
            semester: { type: Type.INTEGER }
          },
          required: ["id", "term", "definition", "lawReference", "year", "module", "semester"]
        }
      }
    }
  });

  const text = response.text || "[]";
  const result = JSON.parse(text);
  if (!Array.isArray(result)) {
    throw new Error("Response is not a valid JSON array.");
  }
  if (result.length < 40) {
    console.warn(`Warning: Expected 45 flashcards, but model returned only ${result.length}. Retrying or padding...`);
  }
  return result;
}

async function run() {
  const cache = loadCache();
  
  for (const mod of modules) {
    const key = `${mod.year}_${mod.semester}_${mod.lessonNum}`;
    if (cache[key] && cache[key].length >= 40) {
      console.log(`[Cache Hit] Already generated ${cache[key].length} cards for "${mod.name}".`);
      continue;
    }

    let success = false;
    let attempts = 0;
    while (!success && attempts < 3) {
      try {
        attempts++;
        const cards = await generateModuleFlashcards(mod);
        cache[key] = cards;
        saveCache(cache);
        success = true;
        console.log(`Successfully generated ${cards.length} cards for "${mod.name}" and saved to cache.`);
        
        // Brief pause to respect API rate limits nicely
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err: any) {
        console.error(`Attempt ${attempts} failed for "${mod.name}":`, err.message || err);
        if (attempts >= 3) {
          console.error(`Skipping "${mod.name}" after 3 failed attempts.`);
        } else {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
  }

  // Compile all flashcards into a single file
  console.log("\nCompiling all cached flashcards into /constants_flashcards.ts...");
  const finalCache = loadCache();
  const allCards: any[] = [];
  for (const key of Object.keys(finalCache)) {
    allCards.push(...finalCache[key]);
  }

  console.log(`Total compiled flashcards: ${allCards.length}`);

  const outputContent = `// Auto-generated flashcards dataset
import { Flashcard } from './types';

export const ALL_FLASHCARDS: Flashcard[] = ${JSON.stringify(allCards, null, 2)};
`;

  fs.writeFileSync(path.join(process.cwd(), "constants_flashcards.ts"), outputContent, "utf-8");
  console.log("constants_flashcards.ts written successfully!");
}

run().then(() => {
  console.log("All tasks completed successfully.");
}).catch(err => {
  console.error("General Failure:", err);
});
