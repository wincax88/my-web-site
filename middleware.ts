import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  // 不使用路由前缀，所有语言使用相同路径
  localePrefix: 'never',
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files
  // - _next
  // - favicon.ico
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
