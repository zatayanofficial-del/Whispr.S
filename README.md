# 🌙 Whispr — همس آمن في فضاء مجهول

> منصة تواصل اجتماعي مجهولة تماماً · لا IP · لا بيانات · فقط أنت وكلماتك

---

## ✨ المميزات

- 🔒 مجهول بالكامل — لا تسجيل، لا بيانات شخصية
- 💙 كشف تلقائي لمحتوى الأزمات + خطوط مساعدة فورية
- 🤖 مساعد AI نفسي يرد بتعاطف
- 🛡️ لوحة Admin مخفية للإشراف
- ⚡ Rate Limiting ضد السبام

## 🚀 تشغيل المشروع

```bash
npm install
cp .env.example .env.local
# أضف بياناتك في .env.local
npm run dev
```

راجع `whispr-setup-guide.md` للتفاصيل الكاملة.

## 🏗️ هيكل المشروع

```
whispr/
├── app/
│   ├── page.jsx              ← الواجهة الرئيسية
│   ├── layout.jsx            ← Layout
│   └── api/
│       ├── posts/route.js    ← API المنشورات
│       └── ai-support/route.js ← AI النفسي
├── components/
│   └── SupportWidget.jsx     ← مكوّنات الدعم النفسي
├── lib/
│   ├── supabase.js           ← قاعدة البيانات
│   └── filter.js             ← فلترة المحتوى
├── middleware.js             ← الحماية
└── .env.example              ← قالب المتغيرات
```

## 📄 الرخصة

MIT License — © 2024 Whispr
