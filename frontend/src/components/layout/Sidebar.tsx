import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserCheck, BookOpen, CalendarCheck, Calendar,
  DollarSign, BarChart3, Settings, LogOut, GraduationCap,
  ChevronLeft, Menu, ClipboardList, Star, Briefcase, FileSpreadsheet, MessageSquare,
  Cpu, CalendarRange, Megaphone, DoorOpen, ShieldCheck, Award, Package, 
  UserPlus, FileText, Download, Database, 
  HelpCircle, Archive, Clock, CheckSquare, Phone, Map, 
  Library, Send, MapPin, Ticket, Search, Info, QrCode,
  Building2, Inbox, Zap, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const adminNav: NavItem[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/analytics', icon: Cpu, label: 'AI Insights' },
  { to: '/admin/departments', icon: Building2, label: 'Departments' },
  { to: '/admin/timetable', icon: CalendarRange, label: 'Timetable' },
  { to: '/staff/section-timetable', icon: Layers, label: 'Class Master' },
  { to: '/admin/subjects', icon: BookOpen, label: 'Subjects' },
  { to: '/admin/subjects/proposals', icon: Inbox, label: 'Approvals' },
  { to: '/admin/broadcast', icon: Megaphone, label: 'Messaging' },
  { to: '/admin/students', icon: GraduationCap, label: 'Students' },
  { to: '/admin/staff', icon: Users, label: 'Staff' },
  { to: '/admin/leaves', icon: DoorOpen, label: 'Leaves' },
  { to: '/admin/accreditation', icon: ShieldCheck, label: 'Compliance' },
  { to: '/admin/appraisal', icon: Award, label: 'Appraisals' },
  { to: '/admin/inventory', icon: Package, label: 'Assets' },
  { to: '/admin/recruitment', icon: UserPlus, label: 'Recruitment' },
  { to: '/admin/fees', icon: DollarSign, label: 'Fees' },
  { to: '/admin/fee-builder', icon: ShieldCheck, label: 'Fee Builder' },
  { to: '/admin/reports', icon: Download, label: 'Reports' },
  { to: '/admin/backup', icon: Database, label: 'Backups' },
  { to: '/admin/security', icon: ShieldCheck, label: 'Security' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const staffNav: NavItem[] = [
  { to: '/staff', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/staff/students', icon: GraduationCap, label: 'Students' },
  { to: '/staff/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/staff/questions', icon: HelpCircle, label: 'Questions' },
  { to: '/staff/subjects', icon: BookOpen, label: 'Curriculum' },
  { to: '/staff/lectures', icon: Archive, label: 'Lectures' },
  { to: '/staff/duty', icon: Clock, label: 'Duty' },
  { to: '/staff/counseling', icon: MessageSquare, label: 'Counseling' },
  { to: '/staff/assignments', icon: CheckSquare, label: 'Assignments' },
  { to: '/staff/marks-wizard', icon: FileSpreadsheet, label: 'Marks' },
  { to: '/staff/parent-comm', icon: Phone, label: 'Parents' },
  { to: '/staff/syllabus', icon: Map, label: 'Syllabus' },
  { to: '/staff/salary', icon: DollarSign, label: 'Salary' },
  { to: '/staff/appraisal', icon: Award, label: 'Appraisal' },
  { to: '/staff/tasks', icon: Briefcase, label: 'Tasks' },
  { to: '/staff/subject-allocation', icon: ClipboardList, label: 'Subject Allocation' },
  { to: '/staff/timetable', icon: CalendarRange, label: 'My Schedule' },
  { to: '/staff/timetable-allocation', icon: Calendar, label: 'Schedule Builder' },
  { to: '/staff/section-timetable', icon: Layers, label: 'Class Master' },
];


const nonTeachingNav: NavItem[] = [
  { to: '/staff', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/staff/profile', icon: UserCheck, label: 'My Profile' },
  { to: '/staff/salary', icon: DollarSign, label: 'Salary' },
  { to: '/staff/tasks', icon: Briefcase, label: 'Tasks' },
];

const studentNav: NavItem[] = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/library', icon: Library, label: 'Material Library' },
  { to: '/student/electives', icon: Zap, label: 'Elective Selection' },
  { to: '/student/submissions', icon: Send, label: 'Submissions' },
  { to: '/student/timetable', icon: MapPin, label: 'My Timetable' },
  { to: '/student/leaderboard', icon: Star, label: 'Leaderboard' },
  { to: '/student/grievance', icon: Ticket, label: 'Grievance' },
  { to: '/student/placement', icon: Briefcase, label: 'Placements' },
  { to: '/student/notifications', icon: MessageSquare, label: 'Inbox' },
  { to: '/student/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/student/id-card', icon: QrCode, label: 'Digital ID' },
];

const navByRole: Record<string, NavItem[]> = {
  admin: adminNav,
  staff: staffNav,
  'non-teaching': nonTeachingNav,
  student: studentNav,
};

const roleLabelMap: Record<string, string> = {
  admin: 'Administrator',
  staff: 'Faculty',
  'non-teaching': 'Staff',
  student: 'Student',
};

const roleColorMap: Record<string, string> = {
  admin: 'bg-purple-500',
  staff: 'bg-blue-500',
  'non-teaching': 'bg-orange-500',
  student: 'bg-green-500',
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = navByRole[user?.role || 'student'];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap size={16} className="text-white" />
              </div>
              <div className="overflow-hidden">
                <p className="text-white font-bold text-sm leading-tight">EduCMS</p>
                <p className="text-slate-500 text-[10px]">College Management</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 flex-shrink-0"
        >
          {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* User pill */}
      <div className="px-3 py-4 border-b border-white/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${roleColorMap[user?.role || 'student']}`}>
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-slate-200 text-xs font-semibold truncate max-w-[140px]">{user?.email}</p>
                <span className="text-[10px] text-slate-500">{roleLabelMap[user?.role || 'student']}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav items */}
      <nav className="p-3 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/staff' || item.to === '/student'}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="link-icon flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="link-label"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="link-icon flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="link-label">
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
