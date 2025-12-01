'use client';

import { Twitter, Facebook, Linkedin, Link2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
  slug?: string;
}

export function ShareButtons({ title, url, description, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [shareStats, setShareStats] = useState<Record<string, number>>({});
  const [totalShares, setTotalShares] = useState(0);
  const fullUrl = typeof window !== 'undefined' ? window.location.href : url;

  // 从 URL 中提取 slug（如果没有直接传入）
  const postSlug = slug || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '');

  useEffect(() => {
    if (postSlug) {
      fetch(`/api/posts/${postSlug}/share`)
        .then((res) => res.json())
        .then((data) => {
          if (data.stats) {
            setShareStats(data.stats);
            setTotalShares(data.total || 0);
          }
        })
        .catch(console.error);
    }
  }, [postSlug]);

  const trackShare = async (platform: string) => {
    if (!postSlug) return;

    try {
      const res = await fetch(`/api/posts/${postSlug}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      const data = await res.json();
      if (data.success) {
        setShareStats((prev) => ({
          ...prev,
          [platform]: data.count,
        }));
        setTotalShares((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedTitle = encodeURIComponent(title);

    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      trackShare(platform);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    trackShare('copy');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">
        分享{totalShares > 0 ? ` (${totalShares})` : ''}：
      </span>
      <button
        onClick={() => handleShare('twitter')}
        className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="分享到 Twitter"
        title={`Twitter${shareStats.twitter ? ` (${shareStats.twitter})` : ''}`}
      >
        <Twitter className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleShare('facebook')}
        className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="分享到 Facebook"
        title={`Facebook${shareStats.facebook ? ` (${shareStats.facebook})` : ''}`}
      >
        <Facebook className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleShare('linkedin')}
        className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="分享到 LinkedIn"
        title={`LinkedIn${shareStats.linkedin ? ` (${shareStats.linkedin})` : ''}`}
      >
        <Linkedin className="h-5 w-5" />
      </button>
      <button
        onClick={handleCopyLink}
        className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="复制链接"
        title={`复制链接${shareStats.copy ? ` (${shareStats.copy})` : ''}`}
      >
        {copied ? (
          <Check className="h-5 w-5 text-green-600" />
        ) : (
          <Link2 className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
