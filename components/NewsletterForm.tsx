'use client';

import { useState } from 'react';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

interface NewsletterFormProps {
  className?: string;
  compact?: boolean;
}

export function NewsletterForm({ className = '', compact = false }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatus('error');
      setMessage('请输入邮箱地址');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || '订阅成功！');
        setEmail('');
        setName('');
      } else {
        setStatus('error');
        setMessage(data.error || '订阅失败，请稍后重试');
      }
    } catch (error) {
      setStatus('error');
      setMessage('网络错误，请稍后重试');
    }
  };

  if (status === 'success') {
    return (
      <div className={`rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20 ${className}`}>
        <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500" />
        <p className="text-green-700 dark:text-green-300">{message}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {!compact && (
        <div className="mb-4 text-center">
          <Mail className="mx-auto mb-3 h-10 w-10 text-blue-500" />
          <h3 className="mb-2 text-xl font-bold">订阅 Newsletter</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            获取最新的技术文章、教程更新和精选内容
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {!compact && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="您的名字（可选）"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800"
          />
        )}
        <div className={compact ? 'flex gap-2' : ''}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="输入您的邮箱"
            required
            className={`${compact ? 'flex-1' : 'w-full'} rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800`}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className={`${compact ? '' : 'w-full'} inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>订阅中...</span>
              </>
            ) : (
              <span>订阅</span>
            )}
          </button>
        </div>
        {status === 'error' && (
          <p className="text-center text-sm text-red-600 dark:text-red-400">
            {message}
          </p>
        )}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          我们尊重您的隐私，随时可以退订
        </p>
      </form>
    </div>
  );
}
