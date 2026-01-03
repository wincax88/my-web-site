'use client';

export function ReloadButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
    >
      重新加载
    </button>
  );
}
