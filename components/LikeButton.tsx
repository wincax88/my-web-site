'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  slug: string;
  initialLikes?: number;
}

export function LikeButton({ slug, initialLikes = 0 }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    // 检查 localStorage 看用户是否已点赞
    const likedKey = `liked_${slug}`;
    const liked = localStorage.getItem(likedKey) === 'true';
    setHasLiked(liked);

    // 获取当前点赞数
    fetch(`/api/posts/${slug}/likes`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.likes === 'number') {
          setLikes(data.likes);
        }
      })
      .catch(console.error);
  }, [slug]);

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const likedKey = `liked_${slug}`;
    const action = hasLiked ? 'unlike' : 'like';

    try {
      const res = await fetch(`/api/posts/${slug}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (typeof data.likes === 'number') {
        setLikes(data.likes);
        setHasLiked(!hasLiked);

        if (!hasLiked) {
          localStorage.setItem(likedKey, 'true');
        } else {
          localStorage.removeItem(likedKey);
        }
      }
    } catch (error) {
      console.error('Error updating like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 避免服务端/客户端 hydration 不匹配
  if (!hasMounted) {
    return (
      <button
        className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400"
        disabled
      >
        <Heart className="h-4 w-4" />
        <span>{initialLikes}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
        hasLiked
          ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
          : 'border-gray-200 text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-red-800 dark:hover:bg-red-900/20 dark:hover:text-red-400'
      } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      title={hasLiked ? '取消点赞' : '点赞'}
    >
      <Heart
        className={`h-4 w-4 transition-transform ${hasLiked ? 'fill-current scale-110' : ''}`}
      />
      <span>{likes.toLocaleString()}</span>
    </button>
  );
}
