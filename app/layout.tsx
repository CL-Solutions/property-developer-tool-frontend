import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Property Developer Tool',
  description: 'Comprehensive property developer management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is just a pass-through layout since the [locale]/layout.tsx handles the actual HTML structure
  return children;
}