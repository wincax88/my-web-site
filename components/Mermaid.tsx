'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidProps {
  chart: string;
  id?: string;
}

export function Mermaid({ chart, id }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const chartId = id || `mermaid-${Math.random().toString(36).substr(2, 9)}`;

  // 确保只在客户端挂载
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // 只在客户端且已挂载时执行
    if (!isMounted || typeof window === 'undefined' || !ref.current || !chart) {
      return;
    }

    const renderChart = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 动态导入 mermaid，确保只在客户端加载
        const mermaid = (await import('mermaid')).default;

        // 初始化 Mermaid
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
          themeVariables: {
            fontFamily: 'inherit',
          },
        });

        // 清空容器
        if (ref.current) {
          ref.current.innerHTML = '';
        }

        // 渲染图表
        const { svg } = await mermaid.render(chartId, chart);
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid 渲染错误:', err);
        setError(
          err instanceof Error ? err.message : '渲染 Mermaid 图表时出错'
        );
      } finally {
        setIsLoading(false);
      }
    };

    renderChart();
  }, [chart, chartId, isMounted]);

  if (error) {
    return (
      <div className="my-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm font-semibold text-red-800 dark:text-red-400">
          Mermaid 图表渲染错误
        </p>
        <p className="mt-1 text-xs text-red-700 dark:text-red-300">
          {error}
        </p>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-red-600 dark:text-red-400">
            查看原始代码
          </summary>
          <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs text-red-900 dark:bg-red-900/40 dark:text-red-200">
            {chart}
          </pre>
        </details>
      </div>
    );
  }

  // 在服务端或未挂载时显示占位符
  if (!isMounted) {
    return (
      <div className="my-4 flex justify-center overflow-x-auto rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300" />
          正在加载图表...
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 flex justify-center overflow-x-auto rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300" />
          正在渲染图表...
        </div>
      )}
      <div ref={ref} className="mermaid-container" />
    </div>
  );
}

