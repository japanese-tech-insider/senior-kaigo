import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.REVALIDATE_SECRET_TOKEN;

    // トークン検証
    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { slug, category } = body;

    if (slug) {
      // 該当記事ページを再検証
      revalidatePath(`/articles/${slug}`);
    }

    if (category) {
      // 該当カテゴリページを再検証
      revalidatePath(`/category/${category}`);
    }

    // トップページと sitemap も再検証
    revalidatePath('/');
    revalidatePath('/sitemap.xml');

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: `Successfully revalidated paths for slug: ${slug}`,
    });
  } catch (err) {
    return NextResponse.json(
      { message: 'Error revalidating', error: String(err) },
      { status: 500 }
    );
  }
}
