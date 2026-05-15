import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/shared/StatCard';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, CalendarCheck, DollarSign, 
  ChevronRight, Save, Clock, Info, CheckCircle, Search, GraduationCap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StaffDashboard = () => {
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['staff-profile'],
    queryFn: () => axios.get(`${API}/staff/profile`).then(r => r.data),
    retry: 1,
    retryDelay: 500,
  });

  const { data: counselingLogs } = useQuery({
    queryKey: ['counseling-logs'],
    queryFn: () => axios.get(`${API}/staff/counseling`).then(r => r.data),
    enabled: !!profile,
  });

  const { data: myStudents } = useQuery({
    queryKey: ['my-students'],
    queryFn: () => axios.get(`${API}/staff/my-students`).then(r => r.data),
    enabled: !!profile,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (profileError) {
    const errStatus = (profileError as any)?.response?.status;
    let errMsg = 'Your faculty account exists but isn\'t linked to a staff profile. Contact your administrator.';
    let errDetail = 'Error: 404 - Staff Profile Not Found';
    let errTitle = 'Academic Profile Mismatch';

    if (errStatus === 401) {
      errMsg = 'Your session has expired. Please log out and sign in again.';
      errDetail = 'Error: 401 - Session Expired';
      errTitle = 'Session Expired';
    } else if (errStatus === 503) {
      errMsg = 'The system is currently under maintenance for essential updates. Please try again in a few minutes.';
      errDetail = 'Error: 503 - System Maintenance';
      errTitle = 'Maintenance Mode';
    }
    
    return (
      <DashboardLayout title="System Status" subtitle="Connectivity & Profile Synchronization Information">
        <div className="max-w-xl mx-auto mt-20 p-12 bg-white rounded-[40px] shadow-2xl border border-rose-100 text-center">
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Info size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 italic mb-4">{errTitle}</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-8">{errMsg}</p>
          <div className="p-6 bg-slate-50 rounded-2xl text-left border border-slate-100 mb-8">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Diagnostic Info</p>
            <p className="text-xs font-mono text-slate-600">{errDetail}</p>
            <p className="text-xs font-mono text-slate-600">Logged in as: {localStorage.getItem('cms_user') ? JSON.parse(localStorage.getItem('cms_user')!).email : 'Unknown'}</p>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
            Retry Connection
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  // Mocking the count for now, will be dynamic when a class is selected
  const markedCount = 0;
  const totalStudents = myStudents?.length || 0;

  return (
    <DashboardLayout title="Faculty Intel" subtitle={`Welcome back, ${profile?.name || 'Faculty Member'} — Dept. of ${profile?.department || 'Institution'}`}>
      
      {/* ── High-Impact Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Assigned Subjects" value={profile?.assignedSubjectsCount || 0} icon={BookOpen} accent="blue" 
          subtitle="Active Registry" delay={0} 
        />
        <StatCard 
          title="Counseling Unit" value={profile?.counselorForClass || "None"} icon={Users} accent="indigo" 
          subtitle="Assigned Section" delay={0.08} 
        />
        <StatCard 
          title="Today's Status" value={markedCount > 0 ? "Complete" : "Pending"} icon={CalendarCheck} 
          accent={markedCount > 0 ? "green" : "orange"} subtitle="Attendance Sync" delay={0.16} 
        />
        <StatCard 
          title="Monthly Pay" value={`₹${(profile?.salary?.net || 0).toLocaleString()}`} icon={DollarSign} accent="purple" 
          subtitle="Net Salary" delay={0.24} 
        />
      </div>

      <div className="grid grid-cols-12 gap-8 mb-8">
        
        {/* Main Operational Zone (8 columns) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Attendance Marker */}
          <div className="dash-card overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-start justify-between">
                <div>
                   <h2 className="text-lg font-black text-slate-800">Operational Attendance</h2>
                   <p className="text-xs text-slate-400 font-medium mt-0.5">{today}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Marked Precision</p>
                   <p className="text-2xl font-black text-slate-800">{markedCount} <span className="text-slate-300 text-sm">/ {totalStudents || '0'}</span></p>
                </div>
              </div>
              <div className="mt-6 bg-slate-200/50 rounded-full h-3 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-primary-500 to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: totalStudents > 0 ? `${(markedCount / totalStudents) * 100}%` : '0%' }}
                  transition={{ duration: 1.2, ease: "circOut" }}
                />
              </div>
            </div>
            
            <div className="p-8 flex items-center justify-center min-h-[200px] bg-white border-b border-slate-50">
               <div className="text-center max-w-sm">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Users size={32} />
                  </div>
                  <p className="font-bold text-slate-800">Waiting for Course Selection</p>
                  <p className="text-xs text-slate-400 mt-1">Please select a class from your assigned schedule to begin marking attendance.</p>
               </div>
            </div>
            
            <div className="p-6 bg-slate-50/30 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Class: Not Scheduled</span>
              <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/20">
                Switch Module
              </button>
            </div>
          </div>

          {/* Counseling Action Center */}
          <div className="dash-card p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><GraduationCap size={24} /></div>
                <div>
                   <h2 className="text-lg font-black text-slate-800">Student Maintenance</h2>
                   <p className="text-xs text-slate-400 font-medium">Assigned Mentees: {myStudents?.length || 0} Scholars</p>
                </div>
              </div>
              <button 
                onClick={() => window.location.href = '/staff/students'}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
              >
                Open Registry
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {myStudents?.length > 0 ? myStudents.map((s: any, i: number) => (
                <div key={i} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 font-black text-sm">{s.name?.charAt(0)}</div>
                    <div>
                       <p className="font-bold text-slate-800 text-xs leading-tight">{s.name}</p>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{s.studentId}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] font-bold text-slate-400 uppercase">Attendance</span>
                       <span className={`text-xs font-black ${s.attendance?.percentage < 75 ? 'text-red-500' : 'text-slate-700'}`}>{s.attendance?.percentage || 0}%</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No assigned mentees found in database</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Intelligence (4 columns) */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* Identity & Workload */}
          <div className="dash-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8" />
            <div className="relative">
               <div className="flex items-center gap-4 mb-8">
                 <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-500/30">
                   {profile?.name?.split(' ').map((n: string) => n[0]).join('') || 'FX'}
                 </div>
                 <div>
                   <h3 className="text-xl font-black text-slate-800 leading-tight">{profile?.name || 'Loading...'}</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{profile?.designation || 'Faculty'}</p>
                   <div className="flex gap-2 mt-3">
                     <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-tighter border border-emerald-100">Verified</span>
                   </div>
                 </div>
               </div>
               
               <div className="space-y-4">
                  {[
                    { label: 'Academic Load', value: profile?.academicLoad || '0%', color: 'bg-indigo-500' },
                    { label: 'Counseling Rate', value: profile?.counselingRate || '0%', color: 'bg-emerald-500' },
                    { label: 'Research Score', value: profile?.researchScore || '0.0', color: 'bg-amber-500' }
                  ].map((metric, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                         <span>{metric.label}</span>
                         <span className="text-slate-700">{metric.value}</span>
                       </div>
                       <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: metric.value.includes('%') ? metric.value : '0%' }} className={`h-full ${metric.color}`} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Interactive To-Do */}
          <div className="dash-card p-8 bg-slate-900 text-white border-none shadow-2xl shadow-indigo-500/20">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-black">Agenda Today</h3>
               <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/20">
                 <Save size={16} />
               </div>
            </div>
            
            <div className="space-y-5">
               <div className="text-center py-6">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No tasks scheduled</p>
               </div>
            </div>
            
            <button className="w-full mt-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
               Manage Tasks
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
