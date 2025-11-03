'use client';

import { ReactNode, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useAuth } from '@/contexts/auth-context';
import { usePathname, useRouter } from 'next/navigation';

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname.includes('/dashboard/login') || pathname.includes('/dashboard/forgot-password');

  useEffect(() => {
    // Only redirect if not loading and in browser
    if (typeof window === 'undefined') return;
    
    if (!loading) {
      if (!isLoginPage && !user) {
        const locale = pathname.split('/')[1] || 'vi';
        router.push(`/${locale}/dashboard/login`);
      } else if (isLoginPage && user) {
        const locale = pathname.split('/')[1] || 'vi';
        router.push(`/${locale}/dashboard`);
      }
    }
  }, [user, loading, isLoginPage, router, pathname]);

  if (isLoginPage) {
    return children;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}

