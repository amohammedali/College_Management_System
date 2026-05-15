import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent: 'blue' | 'indigo' | 'green' | 'emerald' | 'orange' | 'purple' | 'red';
  trend?: { value: number; label: string };
  delay?: number;
  onClick?: () => void;
}

const accentMap = {
  blue:    { bg: 'stat-blue',   icon: 'text-blue-600',   iconBg: 'bg-blue-100' },
  indigo:  { bg: 'stat-indigo', icon: 'text-indigo-600', iconBg: 'bg-indigo-100' },
  green:   { bg: 'stat-green',  icon: 'text-green-600',  iconBg: 'bg-green-100' },
  emerald: { bg: 'stat-emerald',icon: 'text-emerald-600',iconBg: 'bg-emerald-100' },
  orange:  { bg: 'stat-orange', icon: 'text-orange-500', iconBg: 'bg-orange-100' },
  purple:  { bg: 'stat-purple', icon: 'text-purple-600', iconBg: 'bg-purple-100' },
  red:     { bg: 'stat-red',    icon: 'text-red-500',    iconBg: 'bg-red-100' },
};

const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, icon: Icon, accent, trend, delay = 0, onClick
}) => {
  const s = accentMap[accent] || accentMap.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={onClick}
      className={`dash-card p-5 ${s.bg} ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-semibold mt-2 ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={`${s.iconBg} p-3 rounded-xl`}>
          <Icon className={`${s.icon}`} size={22} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
