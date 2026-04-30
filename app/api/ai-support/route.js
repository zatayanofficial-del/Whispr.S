export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || message.trim().length < 3) {
      return Response.json({ reply: 'أنا هنا معك. أخبرني أكثر.' });
    }

    const systemPrompt = `أنت مرافق نفسي داعم ومتعاطف على منصة Whispr المجهولة.

مهمتك:
- الاستماع بتعاطف عميق دون إصدار أحكام
- الرد بأسلوب دافئ وإنساني وطبيعي
- التحقق من مشاعر المستخدم وإظهار الفهم
- تشجيع المستخدم على التعبير والتحدث

قواعد صارمة:
- ردودك قصيرة جداً (2-3 جمل فقط)
- اللغة عربية دافئة وبسيطة
- إذا ذكر المستخدم إيذاء النفس: اطلب منه الاتصال بـ 920033360`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: systemPrompt,
        messages: [
          { role: 'user', content: message.trim() }
        ],
      }),
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'أنا هنا معك. أخبرني أكثر عما تشعر به.';

    return Response.json({ reply });

  } catch (error) {
    const fallback = [
      'أنا أسمعك. ما تشعر به مهم وأنت لست وحدك.',
      'شكراً لثقتك بمشاركة ما بداخلك. هذه شجاعة حقيقية.',
      'مشاعرك صحيحة ومفهومة. أخبرني أكثر إذا أردت.',
      'أنت في مكان آمن هنا. لا حكم، فقط استماع.',
    ];
    return Response.json({
      reply: fallback[Math.floor(Math.random() * fallback.length)]
    });
  }
}
