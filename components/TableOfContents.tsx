'use client';

import { useEffect, useState } from 'react';
import { Heading } from '@/types/post';
import { cn } from '@/lib/utils';

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -66%',
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="sticky top-20 hidden lg:block">
      <div className="border-l-2 border-gray-200 pl-4 dark:border-gray-800">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
          目录
        </h3>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={cn(
                  'block text-sm transition-colors',
                  heading.level === 2 && 'pl-0',
                  heading.level === 3 && 'pl-4',
                  heading.level === 4 && 'pl-8',
                  activeId === heading.id
                    ? 'font-medium text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                )}
                onClick={(e) => {
                  e.preventDefault();

                  // 尝试多种方式查找元素
                  let element = document.getElementById(heading.id);

                  // 如果直接找不到，尝试查找包含该 ID 的 anchor 标签（rehypeAutolinkHeadings 可能包裹了标题）
                  if (!element) {
                    const anchor = document.querySelector(
                      `a[id="${heading.id}"]`
                    );
                    if (anchor) {
                      element = anchor as HTMLElement;
                    }
                  }

                  // 如果还是找不到，尝试查找标题元素（可能 ID 在子元素上）
                  if (!element) {
                    const headings = document.querySelectorAll(
                      'h1, h2, h3, h4, h5, h6'
                    );
                    for (const h of Array.from(headings)) {
                      if (h.textContent?.trim() === heading.text) {
                        element = h as HTMLElement;
                        break;
                      }
                    }
                  }

                  if (element) {
                    // 使用 scrollIntoView，配合 CSS 的 scroll-mt-20 来正确偏移
                    element.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });

                    // 更新 URL hash
                    window.history.pushState(null, '', `#${heading.id}`);
                  } else {
                    // 如果还是找不到，尝试使用 hash 导航
                    window.location.hash = heading.id;
                  }
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
