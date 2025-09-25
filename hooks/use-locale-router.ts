'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export function useLocaleRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  
  const push = (path: string) => {
    // If path doesn't start with locale, add it
    if (!path.startsWith(`/${locale}`) && !path.startsWith('http')) {
      path = `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
    }
    router.push(path);
  };
  
  const replace = (path: string) => {
    // If path doesn't start with locale, add it
    if (!path.startsWith(`/${locale}`) && !path.startsWith('http')) {
      path = `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
    }
    router.replace(path);
  };
  
  return {
    push,
    replace,
    back: router.back,
    forward: router.forward,
    refresh: router.refresh,
    prefetch: router.prefetch,
    locale,
    pathname
  };
}