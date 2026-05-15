import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import NotificationBell from '../shared/NotificationBell';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, subtitle }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />

      <div className={`main-content flex-1 flex flex-col ${collapsed ? 'collapsed' : ''}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-100"
          style={{ height: 'var(--header-height)' }}>
          <div className="page-container flex items-center justify-between h-full gap-4">
            {/* Page title */}
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">{title}</h1>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search…"
                  className="pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-xl border border-transparent focus:border-primary-400 focus:bg-white outline-none transition w-52 text-slate-700"
                />
              </div>

              {/* Notifications */}
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 py-8 overflow-auto">
          <div className="page-container">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
