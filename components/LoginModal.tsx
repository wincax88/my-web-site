'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const VALID_EMAIL = 'wincax@hotmail.com';
const VALID_PASSWORD = 'Huang@021130';

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 模拟验证延迟
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      // 保存登录状态到 sessionStorage
      sessionStorage.setItem('adminLoggedIn', 'true');
      setEmail('');
      setPassword('');
      onSuccess();
      onClose();
    } else {
      setError('邮箱或密码错误');
    }

    setLoading(false);
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex h-screen items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          aria-label="关闭"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-2xl font-bold">管理员登录</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="请输入邮箱"
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
