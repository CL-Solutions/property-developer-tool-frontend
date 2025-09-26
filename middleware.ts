import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'de'],
 
  // Used when no locale matches
  defaultLocale: 'de'
});
 
export const config = {
  // Match all pathnames except for
  // - API routes (/api)
  // - Static files (/_next, /favicon.ico, etc.)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};