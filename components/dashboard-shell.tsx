'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/dashboard/auth-context';
import {
  LayoutDashboard,
  Car,
  PlusCircle,
  BarChart3,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Car, label: 'Inventory', href: '/dashboard/inventory' },
  { icon: PlusCircle, label: 'Add Vehicle', href: '/dashboard/add' },
  { icon: TrendingUp, label: 'Analyze', href: '/dashboard/analyze' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push('/dashboard/login');
  }

  return (
    <div className="min-h-[100dvh] bg-[#050505] flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-[100dvh] w-64 bg-[#0a0a0a]/80 backdrop-blur-2xl border-r border-white/[0.06] z-50 flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/[0.06]">
            <Search className="w-5 h-5 text-indigo-400" strokeWidth={1} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">AutoTrace</h2>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Dealer Portal</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            <X className="w-4 h-4" strokeWidth={1} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isActive
                    ? 'bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            <LogOut className="w-4 h-4" strokeWidth={1} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-white/[0.06]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center text-white/60 hover:text-white/90 hover:bg-white/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            <Menu className="w-5 h-5" strokeWidth={1} />
          </button>
          <h2 className="text-sm font-semibold text-white tracking-tight">AutoTrace Dealer</h2>
        </div>

        <main className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
