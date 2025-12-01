import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Don't use locale prefix for default locale
  localePrefix: 'as-needed',
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files
  // - _next
  // - favicon.ico
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
