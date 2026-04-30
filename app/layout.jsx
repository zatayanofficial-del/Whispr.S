export const metadata = {
  title: 'Whispr — همس آمن في فضاء مجهول',
  description: 'منصة تواصل اجتماعي مجهولة تماماً. شارك مشاعرك بدون اسم أو بيانات.',
  keywords: 'مجهول, خصوصية, مشاعر, دعم نفسي',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0a0a0f' }}>
        {children}
      </body>
    </html>
  );
}
