import { createPost, getPosts } from '@/lib/supabase';
import { analyzeContent, generateAnonymousName } from '@/lib/filter';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const posts = await getPosts({
      sort:     searchParams.get('sort')     || 'newest',
      category: searchParams.get('category') || null,
      page:     parseInt(searchParams.get('page') || '0'),
    });

    return Response.json(
      { posts, count: posts.length },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    return Response.json(
      { error: 'فشل جلب المنشورات. حاول مجدداً.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { content, category } = body;

    const check = analyzeContent(content || '');

    if (check.isEmpty) {
      return Response.json({ error: 'المحتوى فارغ أو قصير جداً' }, { status: 400 });
    }
    if (check.isTooLong) {
      return Response.json({ error: 'المحتوى يتجاوز 1000 حرف' }, { status: 400 });
    }
    if (check.isSpam) {
      return Response.json({ error: 'يبدو هذا المحتوى سبام' }, { status: 400 });
    }
    if (check.hasBanned) {
      return Response.json({ error: 'المحتوى يحتوي على كلمات غير مسموح بها' }, { status: 400 });
    }

    const anonymousName = generateAnonymousName();

    const post = await createPost({
      content,
      category: category || 'مشاعر',
      anonymousName,
    });

    return Response.json(
      { post, isCrisis: check.isCrisis },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { error: 'فشل النشر. حاول مجدداً.' },
      { status: 500 }
    );
  }
}
