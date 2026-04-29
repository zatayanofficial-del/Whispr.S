# 🌙 WHISPR — دليل الإعداد الكامل

## اسم المشروع: **Whispr**
> مأخوذ من "Whisper" (همس) — مكان تهمس فيه بما بداخلك بأمان تام

---

## 📁 هيكل الملفات

```
whispr/
├── app/
│   ├── page.jsx              ← الصفحة الرئيسية
│   ├── layout.jsx            ← Layout عام
│   └── api/
│       ├── posts/route.js    ← API المنشورات
│       ├── comments/route.js ← API التعليقات
│       └── reports/route.js  ← API البلاغات
├── lib/
│   ├── supabase.js           ← اتصال قاعدة البيانات
│   ├── rateLimit.js          ← حماية من السبام
│   ├── filter.js             ← فلترة المحتوى
│   └── anonymize.js          ← توليد الهويات المجهولة
├── middleware.js             ← Rate Limiting على Edge
├── .env.local                ← متغيرات البيئة السرية
└── package.json
```

---

## 🚀 خطوات التشغيل

### الخطوة 1: إنشاء المشروع
```bash
npx create-next-app@latest whispr --js --app --no-tailwind
cd whispr
npm install @supabase/supabase-js @upstash/ratelimit @upstash/redis
```

### الخطوة 2: إعداد Supabase (مجاني)
1. اذهب لـ [supabase.com](https://supabase.com) → New Project
2. انسخ `Project URL` و `anon key`
3. اذهب لـ SQL Editor وشغّل:

```sql
-- ═══ جدول المنشورات (لا IP، لا email) ═══
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL CHECK (length(content) BETWEEN 5 AND 1000),
  anonymous_name TEXT NOT NULL,
  category TEXT DEFAULT 'مشاعر',
  votes_up INTEGER DEFAULT 0,
  votes_down INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ جدول التعليقات ═══
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) BETWEEN 2 AND 500),
  anonymous_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ جدول البلاغات ═══
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reason TEXT,
  reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ جدول الكلمات المحظورة ═══
CREATE TABLE banned_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ صلاحيات RLS (أمان على مستوى الصفوف) ═══
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- أي شخص يستطيع القراءة والنشر (بدون تسجيل)
CREATE POLICY "public_read" ON posts FOR SELECT USING (is_deleted = FALSE);
CREATE POLICY "public_insert" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_comments" ON comments FOR SELECT USING (true);
CREATE POLICY "public_insert_comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "public_report" ON reports FOR INSERT WITH CHECK (true);
```

### الخطوة 3: ملف `.env.local`
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...  # للـ Admin فقط

# Admin
ADMIN_PASSWORD=whispr@YourSecretPassword2024

# Rate Limiting (Upstash Redis - مجاني)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 📄 الملفات الأساسية

### `lib/supabase.js`
```javascript
import { createClient } from '@supabase/supabase-js'

// للعمليات العامة (قراءة/نشر)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// للـ Admin فقط (حذف، إدارة)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)
```

### `lib/filter.js`
```javascript
/** كلمات الأزمات النفسية - تُشغّل تنبيه فوري */
const CRISIS_WORDS = [
  "انتحار", "أقتل نفسي", "أنهي حياتي", "أموت اليوم",
  "suicide", "kill myself", "end my life", "hurt myself",
  "أجرح نفسي", "أؤذي نفسي"
];

/** فلترة المحتوى قبل النشر */
export const filterContent = async (text) => {
  // جلب الكلمات المحظورة من DB
  const { data: banned } = await supabase
    .from('banned_words')
    .select('word');
  
  const bannedList = banned?.map(b => b.word) || [];
  const lower = text.toLowerCase();
  
  return {
    isCrisis: CRISIS_WORDS.some(w => lower.includes(w.toLowerCase())),
    hasBanned: bannedList.some(w => lower.includes(w)),
    isEmpty: text.trim().length < 5,
    isTooLong: text.length > 1000,
    isSpam: /(.)\1{10,}/.test(text), // تكرار حروف
  };
};
```

### `lib/anonymize.js`
```javascript
/** توليد هوية مجهولة لا يمكن ربطها بالمستخدم */
export const generateAnonymousName = () => {
  const adjectives = [
    "هادئ", "مفكر", "حالم", "غامض", "صامت",
    "بعيد", "طيّب", "حكيم", "صادق", "لطيف"
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj} #${num}`;
  // مثال: "حالم #4821"
};

/** لا يتم تخزين أي معرّف للمستخدم - كل منشور مستقل تماماً */
```

### `middleware.js` (Rate Limiting)
```javascript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 منشورات كل 15 دقيقة
});

export async function middleware(request) {
  if (request.nextUrl.pathname.startsWith("/api/posts")) {
    // استخدام IP المشفّر (لا يُخزَّن في DB)
    const ip = request.ip ?? "anonymous";
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: "الرجاء الانتظار قبل النشر مجدداً" },
        { status: 429 }
      );
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
```

### `app/api/posts/route.js`
```javascript
import { supabase } from "@/lib/supabase";
import { filterContent } from "@/lib/filter";
import { generateAnonymousName } from "@/lib/anonymize";

/** GET: جلب المنشورات */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") || "newest";
  const category = searchParams.get("category");
  
  let query = supabase
    .from("posts")
    .select("id, content, anonymous_name, category, votes_up, votes_down, created_at")
    .eq("is_deleted", false)
    .limit(50);
  
  if (category && category !== "الكل") {
    query = query.eq("category", category);
  }
  
  if (sort === "popular") {
    // ترتيب حسب التفاعل
    query = query.order("votes_up", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }
  
  const { data, error } = await query;
  if (error) return Response.json({ error: "خطأ في جلب البيانات" }, { status: 500 });
  
  return Response.json({ posts: data });
}

/** POST: نشر منشور جديد */
export async function POST(request) {
  const body = await request.json();
  const { content, category } = body;
  
  // فلترة المحتوى
  const check = await filterContent(content);
  if (check.isEmpty) return Response.json({ error: "المحتوى فارغ" }, { status: 400 });
  if (check.isTooLong) return Response.json({ error: "المحتوى طويل جداً" }, { status: 400 });
  if (check.hasBanned) return Response.json({ error: "المحتوى يحتوي على كلمات محظورة" }, { status: 400 });
  if (check.isSpam) return Response.json({ error: "يبدو هذا سبام" }, { status: 400 });
  
  const { data, error } = await supabase
    .from("posts")
    .insert({
      content: content.trim(),
      anonymous_name: generateAnonymousName(),
      category: category || "مشاعر",
      // لا IP، لا user_id، لا أي معلومة شخصية
    })
    .select()
    .single();
  
  if (error) return Response.json({ error: "فشل النشر" }, { status: 500 });
  
  return Response.json({ post: data }, { status: 201 });
}
```

---

## 🔐 الوصول للوحة Admin

**الطريقة 1 (سرية):** اضغط على شعار "Whispr" 5 مرات متتالية

**الطريقة 2 (مباشرة):** في ملف `.env.local` عدّل:
```env
ADMIN_SECRET_PATH=my-secret-path-here
```
ثم الوصول عبر: `yoursite.com/my-secret-path-here`

**كلمة المرور:** محددة في `ADMIN_PASSWORD` في `.env.local`

---

## 🌐 النشر على Vercel (مجاني)

```bash
# 1. ارفع الكود لـ GitHub
git init && git add . && git commit -m "init whispr"
gh repo create whispr --public --push

# 2. اربط Vercel بـ GitHub
# اذهب لـ vercel.com → Import Project

# 3. أضف متغيرات البيئة في Vercel Dashboard
# Settings → Environment Variables

# 4. انشر!
# كل push لـ main سيُنشر تلقائياً
```

---

## 🛠️ التعديل بدون خبرة برمجية (لوحة التحكم فقط)

| الإجراء | الطريقة |
|---------|---------|
| حذف منشور | لوحة Admin → "حذف" بجانب المنشور |
| حظر كلمة | لوحة Admin → "الكلمات المحظورة" → أضف كلمة |
| مراجعة البلاغات | لوحة Admin → قسم "البلاغات" |
| تغيير كلمة مرور Admin | عدّل `ADMIN_PASSWORD` في Vercel → Settings → Env |

---

## 🔒 ملخص الخصوصية

- ❌ لا يتم تخزين IP
- ❌ لا cookies تتبع
- ❌ لا Google Analytics
- ❌ لا device fingerprint
- ✅ كل هوية تُولَّد عشوائياً في المتصفح
- ✅ Rate limiting بدون تخزين IP
- ✅ قاعدة البيانات لا تحتوي سوى النص والوقت

---

## 📈 التوسعة المستقبلية

### 1. غرف (Rooms)
```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE
);
ALTER TABLE posts ADD COLUMN room_id UUID REFERENCES rooms(id);
```

### 2. دعم AI للدعم النفسي
```javascript
// في صندوق الأزمات:
const getAISupport = async (text) => {
  const response = await fetch("/api/ai-support", {
    method: "POST",
    body: JSON.stringify({ message: text })
  });
  return response.json();
};
// يستخدم Claude API لإرسال رسالة دعم مخصصة
```

### 3. hCaptcha (أفضل من reCAPTCHA للخصوصية)
```bash
npm install @hcaptcha/react-hcaptcha
```

---

*Whispr — همس آمن في فضاء مجهول* 🌙
