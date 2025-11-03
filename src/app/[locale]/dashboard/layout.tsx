'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Toaster } from '@/components/ui/sonner';
import { i18n, type Locale } from "@/i18n/i18n-config";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>
        {children}
      </DashboardShell>
      <Toaster />
    </AuthProvider>
  );
}

