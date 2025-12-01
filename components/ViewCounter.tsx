'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

interface ViewCounterProps {
  slug: string;
  initialViews?: number;
}

export function ViewCounter({ slug, initialViews = 0 }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);
  const [hasTracked, setHasTracked] = useState(false);

  useEffect(() => {
    // 防止重复追踪
    if (hasTracked) return;

    // 使用 sessionStorage 防止同一会话内重复计数
    const viewedKey = `viewed_${slug}`;
    const hasViewed = sessionStorage.getItem(viewedKey);

    if (!hasViewed) {
      // 增加浏览量
      fetch(`/api/posts/${slug}/views`, { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (data.views) {
            setViews(data.views);
          }
        })
        .catch(console.error);

      sessionStorage.setItem(viewedKey, 'true');
    } else {
      // 只获取当前浏览量，不增加
      fetch(`/api/posts/${slug}/views`)
        .then((res) => res.json())
        .then((data) => {
          if (data.views) {
            setViews(data.views);
          }
        })
        .catch(console.error);
    }

    setHasTracked(true);
  }, [slug, hasTracked]);

  return (
    <span className="flex items-center gap-1">
      <Eye className="h-3 w-3" />
      <span>{views.toLocaleString()} 次浏览</span>
    </span>
  );
}
