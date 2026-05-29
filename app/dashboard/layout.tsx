'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/dashboard/auth-context';
import { InventoryProvider } from '@/lib/dashboard/inventory-context';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loader2 } from 'lucide-react';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Don't redirect if on login page
  const isLoginPage = pathname === '/dashboard/login';

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push('/dashboard/login');
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    );
  }

  // Show login page without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) return null;

  return <DashboardShell>{children}</DashboardShell>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <InventoryProvider>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </InventoryProvider>
    </AuthProvider>
  );
}
