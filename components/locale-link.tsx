'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ComponentProps } from 'react';

type LocaleLinkProps = ComponentProps<typeof Link>;

export function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const locale = useLocale();
  
  // Convert href to string if it's an object
  const hrefString = typeof href === 'object' ? href.pathname || '' : href;
  
  // If it's an external URL or already has locale, don't modify
  if (hrefString.startsWith('http') || hrefString.startsWith(`/${locale}`)) {
    return <Link href={href} {...props} />;
  }
  
  // Add locale prefix to internal paths
  const localizedHref = `/${locale}${hrefString.startsWith('/') ? hrefString : `/${hrefString}`}`;
  
  return <Link href={localizedHref} {...props} />;
}