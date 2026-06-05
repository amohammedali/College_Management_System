import React, { useState } from 'react';
import { Search, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import NotificationBell from '../shared/NotificationBell';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const getBackgroundImage = (path: string) => {
  // Students & Student Support
  if (path.includes('/students')) return 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
  
  // Finance & Salary
  if (path.includes('/fees') || path.includes('/fee-builder') || path.includes('/salary')) return 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
  
  // Academics & Curriculum
  if (path.includes('/academics') || path.includes('/timetable') || path.includes('/subjects') || path.includes('/departments') || path.includes('/syllabus') || path.includes('/classes') || path.includes('/lectures') || path.includes('/assignments') || path.includes('/questions') || path.includes('/marks')) return 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
  
  // Infrastructure
  if (path.includes('/assets') || path.includes('/inventory')) return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
  
  // HR & Operations
  if (path.includes('/hr') || path.includes('/leaves') || path.includes('/attendance') || path.includes('/recruitment') || path.includes('/appraisal') || path.includes('/duty') || path.includes('/staff/profile') || path.endsWith('/admin/staff')) return 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
  
  // Communications & Counseling
  if (path.includes('/broadcast') || path.includes('/counseling') || path.includes('/parent-comm')) return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
  
  // System & IT
  if (path.includes('/system') || path.includes('/settings') || path.includes('/security') || path.includes('/backup')) return 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
  
  // Default (Dashboard / Analytics)
  return 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, subtitle }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const bgImage = getBackgroundImage(location.pathname);

  return (
    <div 
      className="flex min-h-screen bg-slate-900 bg-fixed bg-cover bg-center relative"
      style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url("${bgImage}")` }}
    >
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={`main-content flex-1 flex flex-col ${collapsed ? 'collapsed' : ''}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-slate-900/40 backdrop-blur-md border-b border-white/10 shadow-sm"
          style={{ height: 'var(--header-height)' }}>
          <div className="page-container flex items-center justify-between h-full gap-4">
            {/* Page title */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 -ml-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-black text-white leading-tight tracking-tight">{title}</h1>
                {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 hidden sm:block">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search…"
                  className="pl-10 pr-4 py-2 text-xs font-semibold bg-white/5 rounded-2xl border border-white/10 focus:border-primary-400 focus:bg-white/10 outline-none transition w-64 text-white placeholder-slate-400"
                />
              </div>

              {/* Notifications */}
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 py-8 overflow-auto">
          <div className="page-container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
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
