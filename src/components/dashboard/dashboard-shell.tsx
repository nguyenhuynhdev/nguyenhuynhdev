'use client';

import { ReactNode, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useAuth } from '@/contexts/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeSwitcher } from '@/components/theme-switcher';

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
        router.push('/dashboard/login');
      } else if (isLoginPage && user) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, isLoginPage, router]);

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors">
        <div className="absolute top-4 right-4 z-50">
          <ThemeSwitcher />
        </div>
        {children}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground transition-colors">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected
  }

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

