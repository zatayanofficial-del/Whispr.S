import { useState, useEffect } from 'react';
import { CRISIS_RESOURCES, getRandomSupportMessage } from '@/lib/filter';

export const CrisisBanner = ({ onDismiss }) => {
  const support = getRandomSupportMessage();

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,107,107,0.08), rgba(255,107,107,0.03))',
      border: '1px solid rgba(255,107,107,0.25)',
      borderRadius: 16, padding: 20, marginTop: 16,
      animation: 'fadeIn 0.4s ease', position: 'relative',
    }}>
      <button onClick={onDismiss} style={{
        position: 'absolute', top: 12, left: 12,
        background: 'transparent', border: 'none',
        color: 'rgba(255,107,107,0.5)', cursor: 'pointer', fontSize: 16,
      }}>✕</button>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>{support.icon}</span>
        <div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#ff8a8a', marginBottom: 6, lineHeight: 1.5 }}>
            {support.text}
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,138,138,0.7)', lineHeight: 1.7 }}>
            ما تشعر به الآن مؤقت، والمساعدة موجودة. لا تواجه هذا وحدك.
          </p>
        </div>
      </div>

      <div style={{
        background: 'rgba(255,107,107,0.06)', borderRadius: 10,
        padding: '14px 16px', marginBottom: 12,
      }}>
        <p style={{ fontSize: 12, color: 'rgba(255,138,138,0.6)', marginBottom: 10 }}>
          خطوط مساعدة نفسية مجانية — متاحة الآن:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CRISIS_RESOURCES.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#ff8a8a' }}>{r.country} — {r.name}</span>
              {r.isLink ? (
                <a href={`https://${r.number}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: '#ff6b6b', textDecoration: 'underline' }}>
                  {r.number}
                </a>
              ) : (
                <a href={`tel:${r.number}`}
                  style={{ fontSize: 14, color: '#ff6b6b', fontWeight: 700, textDecoration: 'none' }}>
                  📞 {r.number}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'rgba(255,138,138,0.5)', textAlign: 'center' }}>
        💜 يمكنك نشر ما تشعر به هنا أيضاً — الجميع يستمع بدون حكم
      </p>
    </div>
  );
};

export const SolidarityBar = ({ onlineCount = 0 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'linear-gradient(180deg, transparent, rgba(10,10,15,0.95))',
      padding: '20px 16px 16px', textAlign: 'center',
      zIndex: 50, pointerEvents: 'none',
    }}>
      <p style={{ fontSize: 13, color: 'rgba(144,144,168,0.6)', fontFamily: 'monospace' }}>
        💜 {onlineCount > 0 ? `${onlineCount.toLocaleString('ar')} شخص` : 'أشخاص كثيرون'} يشاركونك هذه اللحظة
      </p>
    </div>
  );
};

export const WelcomeCard = ({ onDismiss }) => (
  <div style={{
    background: 'linear-gradient(135deg, rgba(124,106,247,0.08), rgba(91,79,212,0.03))',
    border: '1px solid rgba(124,106,247,0.15)',
    borderRadius: 20, padding: 24, marginBottom: 16,
    textAlign: 'center',
  }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>🌙</div>
    <h2 style={{ fontSize: 20, color: '#c4beff', marginBottom: 8, fontWeight: 700 }}>
      مرحباً في Whispr
    </h2>
    <p style={{ fontSize: 14, color: 'rgba(144,144,168,0.7)', lineHeight: 1.8, marginBottom: 20 }}>
      هذا مكان آمن للتعبير عن مشاعرك بدون حكم.<br />
      لا اسم، لا صورة، لا بيانات — فقط أنت وكلماتك.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
      {[
        { icon: '🔒', text: 'مجهول تماماً' },
        { icon: '💙', text: 'بدون حكم' },
        { icon: '🤝', text: 'مجتمع داعم' },
      ].map((f, i) => (
        <div key={i} style={{
          background: 'rgba(124,106,247,0.06)', borderRadius: 10,
          padding: '10px 8px', fontSize: 12, color: 'rgba(196,190,255,0.7)',
        }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>{f.icon}</div>
          {f.text}
        </div>
      ))}
    </div>
    <button onClick={onDismiss} style={{
      background: 'linear-gradient(135deg, #7c6af7, #5b4fd4)',
      border: 'none', color: 'white', padding: '12px 32px',
      borderRadius: 12, fontSize: 15, cursor: 'pointer', fontWeight: 600,
    }}>
      ابدأ الهمس 🌙
    </button>
  </div>
);
