'use client';

import { AuthProvider } from '@/lib/dashboard/auth-context';
import { InventoryProvider } from '@/lib/dashboard/inventory-context';
import { DashboardShell } from '@/components/dashboard-shell';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
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
