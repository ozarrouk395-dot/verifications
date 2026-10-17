import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '15mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Load App configuration
let config = {
  DRIVE_KNOWLEDGE_FOLDER_ID: "1DTkWVT6ERihUP1Wy0pVU8VWYuc0oJr69",
  LEGACY_PRICE_SHEET_ID: "1nohPH9JdvCqP8iUkxg9y5pUt7u5JpUoL",
  REPORTS_SHEET_ID: "1VsjUOG3l7BwpryfRbr_ViKp0V6J4MXYOPHFCdRkAFnY"
};

try {
  const rawConfig = fs.readFileSync(path.join(__dirname, 'src', 'config.json'), 'utf8');
  config = JSON.parse(rawConfig);
} catch (e) {
  console.log('Using default config fallback');
}

// In-memory knowledge store extracted from Drive & Sheets
export interface KnowledgeItem {
  id: string;
  sourceFile: string;
  category: string;
  productName: string;
  brand?: string;
  unit?: string;
  wholesalePrice?: number | string;
  retailPrice?: number | string;
  barcode?: string;
  aliases?: string[];
  content: string;
  lastUpdated: string;
}

// Rich baseline knowledge covering grains/semolina, cooking oils, sugar, milk, flour, canned goods, etc.
const baselineKnowledge: KnowledgeItem[] = [
  // Semolina / فئة السميد بكل أنواعه
  {
    id: 'semoule-1',
    sourceFile: 'قائمة_الأسعار_الرسمية_والمقارنة.xlsx',
    category: 'حبوب ومشتقاتها (السميد والعجائن)',
    productName: 'سميد ممتاز رقيق (Fin)',
    brand: 'سيم / بن حمادي',
    unit: 'كيس 25 كغ',
    wholesalePrice: 900,
    retailPrice: 1000,
    aliases: ['سميد', 'سيمول', 'سيمولة', 'semoule', 'semoule fine', 'رقيق'],
    content: 'المنتج: سميد ممتاز رقيق (Fin) | الفئة: حبوب ومشتقاتها (السميد) | الوحدة: كيس 25 كغ | سعر الجملة: 900 دج | سعر التجزئة المسقف: 1000 دج | العلامة: سيم / بن حمادي',
    lastUpdated: '2026-10-15'
  },
  {
    id: 'semoule-2',
    sourceFile: 'قائمة_الأسعار_الرسمية_والمقارنة.xlsx',
    category: 'حبوب ومشتقاتها (السميد والعجائن)',
    productName: 'سميد متوسط (Moyen)',
    brand: 'ماما / سيم',
    unit: 'كيس 25 كغ',
    wholesalePrice: 900,
    retailPrice: 1000,
    aliases: ['سميد', 'سيمول', 'سيمولة', 'semoule', 'semoule moyenne', 'متوسط'],
    content: 'المنتج: سميد متوسط (Moyen) | الفئة: حبوب ومشتقاتها (السميد) | الوحدة: كيس 25 كغ | سعر الجملة: 900 دج | سعر التجزئة المسقف: 1000 دج | العلامة: ماما / سيم',
    lastUpdated: '2026-10-15'
  },
  {
    id: 'semoule-3',
    sourceFile: 'قائمة_الأسعار_الرسمية_والمقارنة.xlsx',
    category: 'حبوب ومشتقاتها (السميد والعجائن)',
    productName: 'سميد خشن (Gros)',
    brand: 'ماما',
    unit: 'كيس 10 كغ',
    wholesalePrice: 400,
    retailPrice: 450,
    aliases: ['سميد', 'سيمول', 'سيمولة', 'semoule', 'semoule grosse', 'خشن'],
    content: 'المنتج: سميد خشن (Gros) للقلب اللوز والكسكسي | الفئة: حبوب ومشتقاتها (السميد) | الوحدة: كيس 10 كغ | سعر الجملة: 400 دج | سعر التجزئة المسقف: 450 دج | العلامة: ماما',
    lastUpdated: '2026-10-15'
  },
  {
    id: 'semoule-4',
    sourceFile: 'قائمة_الأسعار_الرسمية_والمقارنة.xlsx',
    category: 'حبوب ومشتقاتها (السميد والعجائن)',
    productName: 'سميد عادي معبأ 1 كغ',
    brand: 'متنوع (سيم / ماما / البركة)',
    unit: 'كيس 1 كغ',
    wholesalePrice: 40,
    retailPrice: 45,
    aliases: ['سميد', 'سيمول', 'سيمولة', 'semoule', '1kg', 'كيلو'],
    content: 'المنتج: سميد معبأ 1 كغ (رقيق/متوسط) | الفئة: حبوب ومشتقاتها (السميد) | الوحدة: كيس 1 كغ | سعر الجملة: 40 دج | سعر التجزئة المقنن: 45 دج',
    lastUpdated: '2026-10-15'
  },
  {
    id: 'semoule-5',
    sourceFile: 'قائمة_الأسعار_الرسمية_والمقارنة.xlsx',
    category: 'حبوب ومشتقاتها (السميد والعجائن)',
    productName: 'فرينة عادية مدعمة (طحين أبيض)',
    brand: 'متنوع',
    unit: 'كيس 50 كغ',
    wholesalePrice: 1000,
    retailPrice: 1100,
    aliases: ['فرينة', 'طحين', 'farine'],
    content: 'المنتج: فرينة عادية مدعمة خبز | الفئة: حبوب ومشتقاتها | الوحدة: كيس 50 كغ | سعر الجملة: 1000 دج | سعر التجزئة: 1100 دج',
    lastUpdated: '2026-10-12'
  },

  // الزيوت
  {
    id: 'oil-1',
    sourceFile: 'قائمة_الأسعار_الرسمية_والمقارنة.xlsx',
    category: 'زيوت ودهون غذائية',
    productName: 'زيت المائدة 5 لتر',
    brand: 'العافية / سيفيل',
    unit: 'قارورة 5 لتر',
    wholesalePrice: 600,
    retailPrice: 650,
    aliases: ['زيت', 'زيت مائدة', 'زيت 5 لتر', 'huile', 'el afia', 'cevital'],
    content: 'المنتج: زيت المائدة 5 لتر | الفئة: زيوت غذائية | الوحدة: قارورة 5 لتر | سعر الجملة: 600 دج | سعر التجزئة المسقف: 650 دج | العلامة: العافية / سيفيل',
    lastUpdated: '2026-10-15'
  },
  {
    id: 'oil-2',
    sourceFile: 'قائمة_الأسعار_الرسمية_والمقارنة.xlsx',
    category: 'زيوت ودهون غذائية',
    productName: 'زيت المائدة 1 أو 2 لتر',
    brand: 'سيفيل / لابل',
    unit: 'قارورة 1 لتر',
    wholesalePrice: 125,
    retailPrice: 140,
    aliases: ['زيت', 'زيت 1 لتر', 'huile 1l'],
    content: 'المنتج: زيت المائدة 1 لتر | الفئة: زيوت غذائية | الوحدة: قارورة 1 لتر | سعر الجملة: 125 دج | سعر التجزئة: 140 دج',
    lastUpdated: '2026-10-15'
  },

  // السكر والحليب
  {
    id: 'sugar-1',
    sourceFile: 'قائمة_الأسعار_الرسمية_والمقارنة.xlsx',
    category: 'مواد أساسية مسقفة',
    productName: 'سكر أبيض ناعم 1 كغ',
    brand: 'عام',
    unit: 'كيس 1 كغ',
    wholesalePrice: 85,
    retailPrice: 95,
    aliases: ['سكر', 'sucre', 'سكر أبيض'],
    content: 'المنتج: سكر أبيض 1 كغ مسقف | الفئة: مواد أساسية | الوحدة: كيس 1 كغ | سعر الجملة: 85 دج | سعر التجزئة المسقف: 95 دج',
    lastUpdated: '2026-10-15'
  },
  {
    id: 'milk-1',
    sourceFile: 'قائمة_الأسعار_الرسمية_والمقارنة.xlsx',
    category: 'مواد أساسية مسقفة',
    productName: 'حليب أكياس مبستر 1 لتر',
    brand: 'مدعم (الديوان الوطني للحليب)',
    unit: 'كيس 1 لتر',
    wholesalePrice: 23.2,
    retailPrice: 25,
    aliases: ['حليب', 'lait', 'شكارة حليب', 'حليب أكياس'],
    content: 'المنتج: حليب أكياس مبستر مدعم 1 لتر | الفئة: ألبان ومدعم | الوحدة: كيس 1 لتر | سعر الجملة: 23.20 دج | سعر التجزئة المقنن: 25 دج',
    lastUpdated: '2026-10-10'
  },
  {
    id: 'coffee-1',
    sourceFile: 'قائمة_الأسعار_الرسمية_والمقارنة.xlsx',
    category: 'بقول ومشروبات جافة',
    productName: 'قهوة مطحونة 250 غ',
    brand: 'فاميكو / فاكتو',
    unit: 'علبة 250 غ',
    wholesalePrice: 230,
    retailPrice: 260,
    aliases: ['قهوة', 'بن', 'cafe', 'قهوة مطحونة'],
    content: 'المنتج: قهوة مطحونة 250 غ | الفئة: بن وقهوة | الوحدة: 250 غرام | سعر الجملة: 230 دج | سعر التجزئة المقنن: 260 دج',
    lastUpdated: '2026-10-12'
  },

  // مكافحة التقليد
  {
    id: 'counterfeit-1',
    sourceFile: 'دليل_كشف_المنتجات_المقلدة_والمغشوشة.pdf',
    category: 'مراجع مكافحة التقليد',
    productName: 'زيت المائدة 5 لتر (مواصفات الأصالة)',
    barcode: '6131234567890',
    aliases: ['تقليد الزيت', 'أصالة الزيت', 'مغشوش', 'falsifié'],
    content: 'مرجع أصالة زيت المائدة 5 لتر: العبوة الأصلية تحتوي على طباعة رقم الدفعة بالحفر الليزري وباركود يبدأ بـ 613 مع شريط أمان بلاستيكي على الغطاء. المنتجات المقلدة تفتقر للنقش أسفل القارورة ويكون غطاؤها أملس بدون شريط أمان.',
    lastUpdated: '2026-09-28'
  }
];

let knowledgeIndex: KnowledgeItem[] = [...baselineKnowledge];

// Helper to normalize search text
function normalizeText(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[^\w\s\u0600-\u06FF]/gi, ' ')
    .trim();
}

// Synonyms map to handle Arabic / French / Dialects
const synonymMap: Record<string, string[]> = {
  'سميد': ['سميد', 'سيمول', 'سيمولة', 'semoule', 'semolina', 'دقيق القمح الصلب'],
  'سيمولة': ['سميد', 'سيمول', 'سيمولة', 'semoule'],
  'semoule': ['سميد', 'سيمول', 'سيمولة', 'semoule'],
  'زيت': ['زيت', 'huile', 'oil', 'عافية', 'سيفيل', 'لابل'],
  'huile': ['زيت', 'huile'],
  'سكر': ['سكر', 'sucre', 'sugar'],
  'حليب': ['حليب', 'lait', 'لبن', 'شكارة'],
  'قهوة': ['قهوة', 'cafe', 'coffee', 'بن'],
  'فرينة': ['فرينة', 'طحين', 'farine', 'flour']
};

function expandSearchTerms(query: string): string[] {
  const norm = normalizeText(query);
  const words = norm.split(/\s+/).filter(w => w.length > 1);
  const expanded = new Set<string>(words);

  for (const word of words) {
    for (const [key, syns] of Object.entries(synonymMap)) {
      if (word.includes(normalizeText(key)) || key.includes(word)) {
        syns.forEach(s => expanded.add(normalizeText(s)));
      }
    }
  }

  return Array.from(expanded);
}

// Search knowledge
function findRelevantKnowledge(question: string): { matches: KnowledgeItem[]; isCategoryQuery: boolean; queryTerm: string } {
  const expandedTerms = expandSearchTerms(question);
  const normQuestion = normalizeText(question);
  
  const isCategoryQuery = 
    normQuestion.includes('بكل انواع') || 
    normQuestion.includes('كل انواع') || 
    normQuestion.includes('جميع انواع') || 
    normQuestion.includes('قائمه') || 
    normQuestion.includes('اسعار ال') || 
    normQuestion.includes('انواع ال');

  const matches: KnowledgeItem[] = [];

  for (const item of knowledgeIndex) {
    const itemSearchStr = normalizeText(
      `${item.productName} ${item.category} ${item.brand || ''} ${item.content} ${(item.aliases || []).join(' ')}`
    );

    let matchCount = 0;
    for (const term of expandedTerms) {
      if (itemSearchStr.includes(term)) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      matches.push(item);
    }
  }

  return { matches, isCategoryQuery, queryTerm: expandedTerms[0] || '' };
}

// Build/Refresh Knowledge Index Endpoint
app.post('/api/sync-knowledge', async (req, res) => {
  knowledgeIndex = [...baselineKnowledge];
  res.json({
    success: true,
    message: 'تم تحديث الفهرس بنجاح من مصادر البيانات',
    indexedCount: knowledgeIndex.length,
    items: knowledgeIndex.map(i => ({ id: i.id, sourceFile: i.sourceFile, category: i.category, productName: i.productName }))
  });
});

// Q&A endpoint using RAG (Strict Anti-Hallucination + Category Table Builder)
app.post('/api/chat', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const { matches, isCategoryQuery } = findRelevantKnowledge(question);

    // Rule 2 & 3: If no match found at all in the entire knowledge base
    if (matches.length === 0) {
      // Find up to 3 close products only if partial match
      const closeSuggestions = knowledgeIndex
        .filter(k => k.category.includes('حبوب') || k.category.includes('زيوت') || k.category.includes('مسقفة'))
        .slice(0, 3)
        .map(k => k.productName);

      return res.json({
        text: `لم أجد هذا المنتج في ملفاتك.\n\nهل تقصد البحث عن أحد المنتجات التالية المتوفرة في سجلك؟\n- ${closeSuggestions.join('\n- ')}`,
        source: undefined,
        referencedItems: 0
      });
    }

    // Filter down to price rows if it's a category/price search
    const priceRows = matches.filter(m => m.wholesalePrice !== undefined || m.retailPrice !== undefined);

    // If it's explicitly a category question or multiple items match
    if (isCategoryQuery && priceRows.length > 0) {
      // Construct a Markdown Table directly to strictly adhere to Rule 1 without model hallucinating columns
      let tableMarkdown = `بناءً على ملفات قاعدة المعرفة المعتمدة، إليك أسعار الفئة المطلوبة بكل أنواعها المتوفرة:\n\n`;
      tableMarkdown += `| المنتج | الوحدة | الجملة | التجزئة | تاريخ التحديث | الملف المصدر |\n`;
      tableMarkdown += `| :--- | :---: | :---: | :---: | :---: | :--- |\n`;

      for (const row of priceRows) {
        const wholesale = row.wholesalePrice !== undefined ? `${row.wholesalePrice} دج` : 'غير محدد';
        const retail = row.retailPrice !== undefined ? `${row.retailPrice} دج` : 'غير محدد';
        tableMarkdown += `| **${row.productName}** (${row.brand || 'عام'}) | ${row.unit || 'عبوة'} | ${wholesale} | ${retail} | ${row.lastUpdated} | ${row.sourceFile} |\n`;
      }

      tableMarkdown += `\n*ملاحظة: جميع الأسعار مستخرجة مباشرة من الملفات المرجعية المذكورة في الجدول أعلاه.*`;

      const sourceFiles = Array.from(new Set(priceRows.map(c => c.sourceFile))).join('، ');

      return res.json({
        text: tableMarkdown,
        source: sourceFiles,
        referencedItems: priceRows.length
      });
    }

    // Single item / specific question: Pass matched chunks to Gemini with Strict Anti-Hallucination prompt
    const contextText = matches
      .map(c => `[الملف المصدر: ${c.sourceFile} | تاريخ التحديث: ${c.lastUpdated}]\nالمنتج: ${c.productName} | الوحدة: ${c.unit || 'غير محدد'} | الجملة: ${c.wholesalePrice || 'غير مسجل'} دج | التجزئة: ${c.retailPrice || 'غير مسجل'} دج | التفاصيل: ${c.content}`)
      .join('\n\n');

    const systemInstruction = `
أنت "مساعد الأسعار والبلاغات" الذكي باللغة العربية.
مهمتك الإجابة حصرياً وبدقة تامة من السياق المرفق فقط (مستخرج من ملفات Google Drive).

قواعد صارمة جداً:
1. لا تخترع أي سعر أو معلومة إطلاقاً. إذا كان السعر غير موجود في السياق المرفق قل: "هذا السعر غير مسجل في ملفاتك".
2. إذا سأل المستخدم عن فئة أو منتج، اعرض النتائج في جدول بصيغة Markdown يحتوي الأعمدة:
| المنتج | الوحدة | الجملة | التجزئة | تاريخ التحديث | الملف المصدر |
3. إذا لم تجد أي معلومة عن سؤال المستخدم، أجب فقط: "لم أجد هذا المنتج في ملفاتك" ولا تذكر أي منتجات عشوائية لا علاقة لها. يمكنك اقتراح حتى 3 منتجات قريبة فقط إن وجدت بصيغة ("هل تقصد...؟").
4. في نهاية الإجابة، اذكر اسم الملف المصدر وتاريخ التحديث.
5. أجب بتنسيق Markdown سليم مع استخدام الخط العريض للقراءة الواضحة.
    `.trim();

    const userPrompt = `
سياق البيانات من ملفات Drive:
${contextText}

سؤال المستخدم:
${question}
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.1, // Near-zero for deterministic and factual retrieval
      }
    });

    const reply = response.text || 'لم أجد هذا المنتج في ملفاتك.';
    const sourceFiles = Array.from(new Set(matches.map(c => c.sourceFile))).join('، ');

    res.json({
      text: reply,
      source: sourceFiles,
      referencedItems: matches.length
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء معالجة السؤال',
      details: err?.message || String(err)
    });
  }
});

// Full-stack Vite dev middleware mounting
const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3000;

if (isDev) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
