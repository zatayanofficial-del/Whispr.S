import { useState, useEffect } from "react";

const CRISIS_KEYWORDS = [
  "انتحار", "أقتل نفسي", "أموت", "أنهي حياتي",
  "suicide", "kill myself", "end my life", "self harm",
  "أؤذي نفسي", "جرح نفسي"
];

const BANNED_WORDS = [];

const analyzeContent = (text) => {
  const lower = text.toLowerCase();
  const isCrisis = CRISIS_KEYWORDS.some(w => lower.includes(w.toLowerCase()));
  const hasBanned = BANNED_WORDS.some(w => lower.includes(w.toLowerCase()));
  const isEmpty = text.trim().length < 5;
  const isTooLong = text.length > 1000;
  return { isCrisis, hasBanned, isEmpty, isTooLong };
};

const generateAnonymousId = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  const adjectives = ["هادئ", "مفكر", "حالم", "غامض", "صامت", "بعيد", "طيّب", "شجاع"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  return `${adj} #${num}`;
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${days} يوم`;
};

const DEMO_POSTS = [
  {
    id: "1",
    content: "أحياناً أشعر أن أحداً لا يفهمني حقاً، حتى أقرب الناس إليّ.",
    author: "غامض #4821",
    timestamp: new Date(Date.now() - 3600000),
    votes: { up: 234, down: 12 },
    comments: 18,
    category: "مشاعر",
    userVote: null,
  },
  {
    id: "2",
    content: "فشلت في امتحان التخرج للمرة الثالثة. لا أعرف ماذا أقول لعائلتي.",
    author: "صامت #7103",
    timestamp: new Date(Date.now() - 7200000),
    votes: { up: 189, down: 5 },
    comments: 42,
    category: "ضغوط",
    userVote: null,
  },
  {
    id: "3",
    content: "اكتشفت أن صديقي المقرب كان يكذب عليّ طوال سنتين.",
    author: "بعيد #2956",
    timestamp: new Date(Date.now() - 10800000),
    votes: { up: 312, down: 8 },
    comments: 67,
    category: "علاقات",
    userVote: null,
  },
  {
    id: "4",
    content: "أشعر بالوحدة الشديدة رغم أنني محاط بناس كثيرين.",
    author: "حالم #5544",
    timestamp: new Date(Date.now() - 18000000),
    votes: { up: 445, down: 3 },
    comments: 89,
    category: "مشاعر",
    userVote: null,
  },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@300;400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg-primary: #0a0a0f;
    --bg-secondary: #111118;
    --bg-card: #16161f;
    --bg-card-hover: #1c1c28;
    --border: #2a2a3a;
    --border-bright: #3a3a55;
    --accent: #7c6af7;
    --accent-soft: #5b4fd4;
    --accent-glow: rgba(124, 106, 247, 0.15);
    --text-primary: #e8e8f0;
    --text-secondary: #9090a8;
    --text-muted: #55556a;
    --success: #4ade80;
    --danger: #f87171;
    --warning: #fbbf24;
    --crisis: #ff6b6b;
    --up-vote: #4ade80;
    --down-vote: #f87171;
    --radius: 16px;
    --radius-sm: 10px;
    --shadow: 0 4px 24px rgba(0,0,0,0.4);
    --shadow-accent: 0 0 40px rgba(124, 106, 247, 0.1);
    font-family: 'Noto Naskh Arabic', serif;
  }
  html { direction: rtl; scroll-behavior: smooth; }
  body { background: var(--bg-primary); color: var(--text-primary); min-height: 100vh; line-height: 1.7; overflow-x: hidden; }
  body::before { content: ''; position: fixed; inset: 0; background: radial-gradient(ellipse at 20% 50%, rgba(124,106,247,0.04) 0%, transparent 60%); pointer-events: none; z-index: 0; }
  .app { position: relative; z-index: 1; }
  .container { max-width: 680px; margin: 0 auto; padding: 0 16px; }
  .header { position: sticky; top: 0; z-index: 100; background: rgba(10,10,15,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); padding: 14px 0; }
  .header-inner { display: flex; align-items: center; justify-content: space-between; }
  .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--text-primary); cursor: pointer; }
  .logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg, var(--accent), var(--accent-soft)); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .logo-text { font-size: 22px; font-weight: 700; font-family: 'IBM Plex Mono', monospace; letter-spacing: -1px; }
  .logo-text span { color: var(--accent); }
  .header-badge { font-size: 11px; color: var(--text-muted); background: var(--bg-card); border: 1px solid var(--border); padding: 4px 10px; border-radius: 20px; }
  .privacy-bar { background: rgba(124,106,247,0.05); border-top: 1px solid var(--border); padding: 10px 0; text-align: center; }
  .privacy-text { font-size: 12px; color: var(--text-muted); font-family: 'IBM Plex Mono', monospace; }
  .privacy-text span { color: var(--accent); }
  .compose-section { padding: 24px 0 8px; }
  .compose-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; transition: border-color 0.2s; }
  .compose-card:focus-within { border-color: var(--accent); box-shadow: var(--shadow-accent); }
  .compose-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .anon-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #2a2a3a, #1a1a28); border: 1px solid var(--border-bright); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .compose-label { font-size: 13px; color: var(--text-muted); }
  .compose-label strong { display: block; color: var(--text-secondary); font-size: 14px; }
  .compose-textarea { width: 100%; background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 15px; font-family: 'Noto Naskh Arabic', serif; resize: none; line-height: 1.8; min-height: 100px; direction: rtl; }
  .compose-textarea::placeholder { color: var(--text-muted); }
  .compose-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); }
  .char-count { font-size: 12px; font-family: 'IBM Plex Mono', monospace; color: var(--text-muted); }
  .char-count.warning { color: var(--warning); }
  .char-count.danger { color: var(--danger); }
  .category-select { background: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-secondary); padding: 6px 10px; border-radius: 8px; font-size: 13px; font-family: 'Noto Naskh Arabic', serif; cursor: pointer; }
  .submit-btn { background: linear-gradient(135deg, var(--accent), var(--accent-soft)); color: white; border: none; padding: 10px 22px; border-radius: 10px; font-size: 14px; font-family: 'Noto Naskh Arabic', serif; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .crisis-banner { background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.3); border-radius: var(--radius-sm); padding: 14px 16px; margin-top: 12px; display: flex; gap: 12px; align-items: flex-start; animation: fadeIn 0.3s ease; }
  .crisis-banner p { font-size: 14px; color: var(--crisis); line-height: 1.7; }
  .crisis-banner a { color: var(--crisis); font-weight: 600; text-decoration: underline; }
  .filters { display: flex; gap: 8px; padding: 16px 0; overflow-x: auto; scrollbar-width: none; }
  .filter-btn { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-secondary); padding: 8px 16px; border-radius: 20px; font-size: 13px; font-family: 'Noto Naskh Arabic', serif; cursor: pointer; white-space: nowrap; transition: all 0.2s; flex-shrink: 0; }
  .filter-btn.active { background: var(--accent-glow); border-color: var(--accent); color: var(--accent); }
  .posts-feed { display: flex; flex-direction: column; gap: 12px; padding-bottom: 60px; }
  .post-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; transition: all 0.2s; cursor: pointer; animation: slideIn 0.3s ease; }
  .post-card:hover { background: var(--bg-card-hover); border-color: var(--border-bright); }
  .post-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .post-author { display: flex; align-items: center; gap: 10px; }
  .post-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #2a2a45, #1e1e35); border: 1px solid var(--border-bright); display: flex; align-items: center; justify-content: center; font-size: 15px; }
  .author-name { font-size: 13px; color: var(--text-secondary); font-family: 'IBM Plex Mono', monospace; }
  .post-time { font-size: 12px; color: var(--text-muted); }
  .category-tag { font-size: 11px; padding: 3px 10px; border-radius: 12px; background: rgba(124,106,247,0.1); color: var(--accent); border: 1px solid rgba(124,106,247,0.2); }
  .post-content { font-size: 15px; line-height: 1.85; color: var(--text-primary); margin-bottom: 16px; }
  .post-actions { display: flex; align-items: center; gap: 16px; }
  .vote-group { display: flex; align-items: center; gap: 4px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 20px; padding: 4px; }
  .vote-btn { display: flex; align-items: center; gap: 5px; background: transparent; border: none; padding: 5px 10px; border-radius: 16px; font-size: 13px; cursor: pointer; transition: all 0.15s; color: var(--text-secondary); }
  .vote-btn.up.active { background: rgba(74,222,128,0.1); color: var(--up-vote); }
  .vote-btn.down.active { background: rgba(248,113,113,0.1); color: var(--down-vote); }
  .action-btn { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--text-muted); font-size: 13px; cursor: pointer; padding: 6px 10px; border-radius: 8px; transition: all 0.15s; font-family: 'Noto Naskh Arabic', serif; }
  .action-btn:hover { color: var(--text-secondary); background: var(--bg-secondary); }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: flex-end; animation: fadeIn 0.2s ease; }
  .modal-sheet { background: var(--bg-secondary); border-top: 1px solid var(--border); border-radius: 24px 24px 0 0; width: 100%; max-height: 85vh; overflow-y: auto; padding: 20px; animation: slideUp 0.3s ease; }
  .modal-handle { width: 40px; height: 4px; background: var(--border-bright); border-radius: 2px; margin: 0 auto 20px; }
  .comments-list { margin-top: 20px; display: flex; flex-direction: column; gap: 12px; }
  .comment-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; }
  .comment-author { font-size: 12px; color: var(--text-muted); font-family: 'IBM Plex Mono', monospace; margin-bottom: 8px; }
  .comment-text { font-size: 14px; color: var(--text-primary); line-height: 1.7; }
  .comment-compose { margin-top: 16px; display: flex; gap: 10px; align-items: flex-end; }
  .comment-input { flex: 1; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 14px; color: var(--text-primary); font-size: 14px; font-family: 'Noto Naskh Arabic', serif; resize: none; outline: none; direction: rtl; }
  .comment-submit { background: var(--accent); border: none; color: white; width: 40px; height: 40px; border-radius: 10px; cursor: pointer; font-size: 16px; flex-shrink: 0; }
  .admin-overlay { position: fixed; inset: 0; background: #050508; z-index: 500; overflow-y: auto; }
  .admin-login { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .admin-login-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 32px; width: 100%; max-width: 360px; }
  .admin-title { font-family: 'IBM Plex Mono', monospace; font-size: 18px; color: var(--accent); margin-bottom: 6px; }
  .admin-subtitle { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; }
  .admin-input { width: 100%; background: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-primary); padding: 12px 14px; border-radius: 10px; font-size: 15px; outline: none; margin-bottom: 12px; font-family: 'IBM Plex Mono', monospace; direction: ltr; }
  .admin-btn { width: 100%; background: var(--accent); border: none; color: white; padding: 12px; border-radius: 10px; font-size: 15px; font-family: 'Noto Naskh Arabic', serif; font-weight: 600; cursor: pointer; }
  .admin-panel { padding: 20px; max-width: 800px; margin: 0 auto; }
  .admin-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 24px; }
  .stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px; text-align: center; }
  .stat-num { font-size: 28px; font-weight: 700; font-family: 'IBM Plex Mono', monospace; color: var(--accent); }
  .stat-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
  .section-title { font-size: 16px; color: var(--text-secondary); margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
  .admin-post-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
  .admin-post-text { flex: 1; font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
  .delete-btn { background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.3); color: var(--danger); padding: 6px 12px; border-radius: 8px; font-size: 13px; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
  .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--bg-card); border: 1px solid var(--border-bright); color: var(--text-primary); padding: 12px 20px; border-radius: 20px; font-size: 14px; z-index: 1000; white-space: nowrap; box-shadow: var(--shadow); animation: toastIn 0.3s ease; }
  .welcome-card { background: linear-gradient(135deg, rgba(124,106,247,0.08), rgba(91,79,212,0.03)); border: 1px solid rgba(124,106,247,0.15); border-radius: 20px; padding: 24px; margin-bottom: 16px; text-align: center; animation: fadeIn 0.5s ease; }
  @keyframes slideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
  @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 2px; }
`;

const ADMIN_PASSWORD = "whispr@admin2024";

const PostModal = ({ post, onClose }) => {
  const [comments, setComments] = useState([
    { id: "c1", author: generateAnonymousId(), text: "أنت لست وحدك 💜", timestamp: new Date(Date.now() - 1800000) },
    { id: "c2", author: generateAnonymousId(), text: "شكراً لشجاعتك على المشاركة", timestamp: new Date(Date.now() - 900000) },
  ]);
  const [newComment, setNewComment] = useState("");

  const submitComment = () => {
    if (newComment.trim().length < 2) return;
    setComments(prev => [...prev, {
      id: Date.now().toString(),
      author: generateAnonymousId(),
      text: newComment.trim(),
      timestamp: new Date(),
    }]);
    setNewComment("");
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <button onClick={onClose} style={{ float: "left", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>✕</button>
        <div style={{ clear: "both", marginBottom: 20 }}>
          <div className="post-meta">
            <div className="post-author">
              <div className="post-avatar">👤</div>
              <div>
                <div className="author-name">{post.author}</div>
                <div className="post-time">{timeAgo(post.timestamp)}</div>
              </div>
            </div>
            <span className="category-tag">{post.category}</span>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.85 }}>{post.content}</p>
        </div>
        <div className="section-title">التعليقات ({comments.length})</div>
        <div className="comments-list">
          {comments.map(c => (
            <div key={c.id} className="comment-card">
              <div className="comment-author">{c.author} · {timeAgo(c.timestamp)}</div>
              <div className="comment-text">{c.text}</div>
            </div>
          ))}
        </div>
        <div className="comment-compose">
          <textarea className="comment-input" placeholder="اكتب تعليقاً مجهولاً..." rows={2} value={newComment} onChange={e => setNewComment(e.target.value)} />
          <button className="comment-submit" onClick={submitComment}>↑</button>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = ({ posts, onDeletePost, onClose }) => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [bannedWords, setBannedWords] = useState([]);
  const [newWord, setNewWord] = useState("");

  const login = () => {
    if (password === ADMIN_PASSWORD) { setAuthed(true); }
    else { setError("كلمة المرور غير صحيحة"); setTimeout(() => setError(""), 3000); }
  };

  if (!authed) return (
    <div className="admin-overlay">
      <div className="admin-login">
        <div className="admin-login-card">
          <div className="admin-title">// WHISPR ADMIN</div>
          <div className="admin-subtitle">وصول مقيّد</div>
          <input type="password" className="admin-input" placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} autoFocus />
          {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button className="admin-btn" onClick={login}>دخول</button>
          <button onClick={onClose} style={{ width: "100%", background: "transparent", border: "none", color: "var(--text-muted)", marginTop: 12, cursor: "pointer", fontSize: 13 }}>رجوع</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-overlay">
      <div className="admin-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
          <div className="admin-title">// WHISPR ADMIN PANEL</div>
          <button onClick={onClose} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)", padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}>خروج</button>
        </div>
        <div className="admin-stats">
          <div className="stat-card"><div className="stat-num">{posts.length}</div><div className="stat-label">منشور</div></div>
          <div className="stat-card"><div className="stat-num">0</div><div className="stat-label">بلاغ</div></div>
          <div className="stat-card"><div className="stat-num">{bannedWords.length}</div><div className="stat-label">محظور</div></div>
        </div>
        <div className="section-title">جميع المنشورات</div>
        {posts.map(p => (
          <div key={p.id} className="admin-post-item">
            <div className="admin-post-text"><span style={{ color: "var(--text-muted)", fontSize: 12 }}>{p.author} · </span>{p.content.substring(0, 80)}...</div>
            <button className="delete-btn" onClick={() => onDeletePost(p.id)}>حذف</button>
          </div>
        ))}
        <div className="section-title" style={{ marginTop: 24 }}>الكلمات المحظورة</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input className="admin-input" style={{ flex: 1, marginBottom: 0 }} placeholder="أضف كلمة..." value={newWord} onChange={e => setNewWord(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newWord.trim()) { setBannedWords(p => [...p, newWord.trim()]); setNewWord(""); } }} />
          <button className="admin-btn" style={{ width: "auto", padding: "0 16px" }} onClick={() => { if (newWord.trim()) { setBannedWords(p => [...p, newWord.trim()]); setNewWord(""); } }}>إضافة</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {bannedWords.map((w, i) => (
            <span key={i} onClick={() => setBannedWords(p => p.filter((_, j) => j !== i))} style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "var(--danger)", padding: "4px 12px", borderRadius: 12, fontSize: 13, cursor: "pointer" }}>{w} ✕</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Whispr() {
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [newPost, setNewPost] = useState("");
  const [category, setCategory] = useState("مشاعر");
  const [filter, setFilter] = useState("الأحدث");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [toast, setToast] = useState(null);
  const [anonId] = useState(generateAnonymousId);
  const [clickCount, setClickCount] = useState(0);

  const analysis = analyzeContent(newPost);
  const charClass = newPost.length > 900 ? "danger" : newPost.length > 700 ? "warning" : "";

  const filteredPosts = [...posts]
    .sort((a, b) => filter === "الأكثر تفاعلاً"
      ? (b.votes.up - b.votes.down) - (a.votes.up - a.votes.down)
      : new Date(b.timestamp) - new Date(a.timestamp)
    );

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const submitPost = () => {
    if (analysis.isEmpty || analysis.isTooLong || analysis.hasBanned) return;
    setPosts(prev => [{
      id: Date.now().toString(),
      content: newPost.trim(),
      author: anonId,
      timestamp: new Date(),
      votes: { up: 0, down: 0 },
      comments: 0,
      category,
      userVote: null,
    }, ...prev]);
    setNewPost("");
    showToast("✓ تم النشر بشكل مجهول");
  };

  const handleVote = (postId, type) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const wasVoted = p.userVote === type;
      return {
        ...p, userVote: wasVoted ? null : type,
        votes: {
          up: type === "up" ? (wasVoted ? p.votes.up - 1 : p.votes.up + 1) : p.votes.up,
          down: type === "down" ? (wasVoted ? p.votes.down - 1 : p.votes.down + 1) : p.votes.down,
        }
      };
    }));
  };

  const handleLogoClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 5) { setShowAdmin(true); setClickCount(0); }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="header">
          <div className="container">
            <div className="header-inner">
              <div className="logo" onClick={handleLogoClick}>
                <div className="logo-icon">🌙</div>
                <div className="logo-text">Whi<span>spr</span></div>
              </div>
              <div className="header-badge">🔒 مجهول تماماً</div>
            </div>
          </div>
        </header>

        <div className="privacy-bar">
          <div className="container">
            <div className="privacy-text">لا يتم تسجيل أي <span>بيانات شخصية</span> · هويتك: <span>{anonId}</span></div>
          </div>
        </div>

        <main>
          <div className="container">
            {showWelcome && (
              <div style={{ paddingTop: 24 }}>
                <div className="welcome-card">
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🌙</div>
                  <h2 style={{ fontSize: 20, color: "#c4beff", marginBottom: 8, fontWeight: 700 }}>مرحباً في Whispr</h2>
                  <p style={{ fontSize: 14, color: "rgba(144,144,168,0.7)", lineHeight: 1.8, marginBottom: 20 }}>
                    هذا مكان آمن للتعبير عن مشاعرك بدون حكم.<br />لا اسم، لا صورة، لا بيانات — فقط أنت وكلماتك.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 20 }}>
                    {[{ icon: "🔒", text: "مجهول تماماً" }, { icon: "💙", text: "بدون حكم" }, { icon: "🤝", text: "مجتمع داعم" }].map((f, i) => (
                      <div key={i} style={{ background: "rgba(124,106,247,0.06)", borderRadius: 10, padding: "10px 8px", fontSize: 12, color: "rgba(196,190,255,0.7)" }}>
                        <div style={{ fontSize: 18, marginBottom: 4 }}>{f.icon}</div>{f.text}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setShowWelcome(false)} style={{ background: "linear-gradient(135deg,#7c6af7,#5b4fd4)", border: "none", color: "white", padding: "12px 32px", borderRadius: 12, fontSize: 15, cursor: "pointer", fontWeight: 600 }}>
                    ابدأ الهمس 🌙
                  </button>
                </div>
              </div>
            )}

            {!showWelcome && (
              <>
                <div className="compose-section">
                  <div className="compose-card">
                    <div className="compose-header">
                      <div className="anon-avatar">🌫️</div>
                      <div className="compose-label">
                        <strong>{anonId}</strong>
                        شارك ما تشعر به بأمان...
                      </div>
                    </div>
                    <textarea className="compose-textarea" placeholder="ما الذي يدور في ذهنك الآن؟ لا أحد يعرف من أنت..." value={newPost} onChange={e => setNewPost(e.target.value)} maxLength={1000} />
                    <div className="compose-footer">
                      <div className={`char-count ${charClass}`}>{newPost.length}/1000</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <select className="category-select" value={category} onChange={e => setCategory(e.target.value)}>
                          {["مشاعر", "علاقات", "ضغوط", "عمل", "صحة", "أخرى"].map(c => <option key={c}>{c}</option>)}
                        </select>
                        <button className="submit-btn" onClick={submitPost} disabled={analysis.isEmpty || analysis.isTooLong || analysis.hasBanned}>نشر 🌙</button>
                      </div>
                    </div>
                  </div>
                  {analysis.isCrisis && (
                    <div className="crisis-banner">
                      <span style={{ fontSize: 20 }}>💙</span>
                      <p>يبدو أنك تمر بوقت صعب. أنت لست وحدك.<br />
                        <a href="tel:920033360">📞 خط دعم نفسي مجاني — 920033360</a>
                      </p>
                    </div>
                  )}
                </div>

                <div className="filters">
                  {["الأحدث", "الأكثر تفاعلاً", "مشاعر", "علاقات", "ضغوط"].map(f => (
                    <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
                  ))}
                </div>

                <div className="posts-feed">
                  {filteredPosts.map(post => (
                    <div key={post.id} className="post-card" onClick={() => setSelectedPost(post)}>
                      <div className="post-meta">
                        <div className="post-author">
                          <div className="post-avatar">👤</div>
                          <div>
                            <div className="author-name">{post.author}</div>
                            <div className="post-time">{timeAgo(post.timestamp)}</div>
                          </div>
                        </div>
                        <span className="category-tag">{post.category}</span>
                      </div>
                      <p className="post-content">{post.content}</p>
                      <div className="post-actions" onClick={e => e.stopPropagation()}>
                        <div className="vote-group">
                          <button className={`vote-btn up ${post.userVote === "up" ? "active" : ""}`} onClick={() => handleVote(post.id, "up")}>▲ {post.votes.up}</button>
                          <button className={`vote-btn down ${post.userVote === "down" ? "active" : ""}`} onClick={() => handleVote(post.id, "down")}>▼ {post.votes.down}</button>
                        </div>
                        <button className="action-btn" onClick={() => setSelectedPost(post)}>💬 {post.comments}</button>
                        <button className="action-btn" onClick={() => showToast("📋 تم إرسال البلاغ")} style={{ marginRight: "auto" }}>⚑ بلاغ</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>

        <div style={{ textAlign: "center", padding: 20, borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>Whispr © 2024 · مجهول · مجاني · آمن</p>
        </div>
      </div>

      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      {showAdmin && <AdminPanel posts={posts} onDeletePost={(id) => { setPosts(p => p.filter(x => x.id !== id)); showToast("🗑 تم الحذف"); }} onClose={() => setShowAdmin(false)} />}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
