import { NextResponse } from 'next/server';
import { generateSearchIndexJSON } from '@/lib/search';

export async function GET() {
  try {
    const index = await generateSearchIndexJSON();
    return new NextResponse(index, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating search index:', error);
    return NextResponse.json({ error: 'Failed to generate search index' }, { status: 500 });
  }
}

