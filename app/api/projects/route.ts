import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/projects';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 从查询参数中获取是否使用 GitHub API（默认为 true）
    // 可以通过 ?useGitHub=false 来禁用 GitHub API
    const useGitHub = process.env.USE_GITHUB_API !== 'false';

    const projects = await getProjects(useGitHub);
    return NextResponse.json(projects, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: '获取项目列表失败' }, { status: 500 });
  }
}
