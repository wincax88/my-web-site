import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // 不使用路由前缀，所有语言使用相同路径
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

