import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const getPosts = async ({ sort = 'newest', category = null, page = 0 } = {}) => {
  let query = supabase
    .from('posts')
    .select('id, content, anonymous_name, category, votes_up, votes_down, comments_count, created_at')
    .eq('is_deleted', false)
    .range(page * 20, (page + 1) * 20 - 1);

  if (category && category !== 'الكل') {
    query = query.eq('category', category);
  }

  if (sort === 'popular') {
    query = query.order('votes_up', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw new Error('فشل جلب المنشورات');
  return data;
};

export const createPost = async ({ content, category, anonymousName }) => {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content: content.trim(),
      anonymous_name: anonymousName,
      category: category || 'مشاعر',
    })
    .select()
    .single();

  if (error) throw new Error('فشل النشر');
  return data;
};

export const getComments = async (postId) => {
  const { data, error } = await supabase
    .from('comments')
    .select('id, content, anonymous_name, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw new Error('فشل جلب التعليقات');
  return data;
};

export const addComment = async ({ postId, content, anonymousName }) => {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      content: content.trim(),
      anonymous_name: anonymousName,
    })
    .select()
    .single();

  if (error) throw new Error('فشل إضافة التعليق');
  return data;
};

export const votePost = async (postId, type) => {
  const field = type === 'up' ? 'votes_up' : 'votes_down';
  const { error } = await supabase.rpc('increment_vote', {
    post_id: postId,
    vote_field: field,
  });
  if (error) throw new Error('فشل التصويت');
};

export const reportPost = async (postId, reason) => {
  const { error } = await supabase
    .from('reports')
    .insert({ post_id: postId, reason: reason || 'محتوى مسيء' });
  if (error) throw new Error('فشل إرسال البلاغ');
};

export const adminDeletePost = async (postId) => {
  const { error } = await supabaseAdmin
    .from('posts')
    .update({ is_deleted: true })
    .eq('id', postId);
  if (error) throw new Error('فشل الحذف');
};

export const getBannedWords = async () => {
  const { data, error } = await supabaseAdmin
    .from('banned_words')
    .select('id, word')
    .order('added_at', { ascending: false });
  if (error) return [];
  return data;
};

export const addBannedWord = async (word) => {
  const { error } = await supabaseAdmin
    .from('banned_words')
    .insert({ word: word.trim().toLowerCase() });
  if (error) throw new Error('فشل إضافة الكلمة');
};

export const removeBannedWord = async (id) => {
  const { error } = await supabaseAdmin
    .from('banned_words')
    .delete()
    .eq('id', id);
  if (error) throw new Error('فشل حذف الكلمة');
};

export const getAdminStats = async () => {
  const [postsRes, reportsRes, commentsRes] = await Promise.all([
    supabaseAdmin.from('posts').select('id', { count: 'exact' }).eq('is_deleted', false),
    supabaseAdmin.from('reports').select('id', { count: 'exact' }).eq('reviewed', false),
    supabaseAdmin.from('comments').select('id', { count: 'exact' }),
  ]);
  return {
    totalPosts: postsRes.count || 0,
    pendingReports: reportsRes.count || 0,
    totalComments: commentsRes.count || 0,
  };
};
