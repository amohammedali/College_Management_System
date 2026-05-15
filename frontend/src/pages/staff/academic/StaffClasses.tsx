import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { BookOpen, MapPin, Users, Clock, Calendar, ExternalLink, Sparkles, LayoutGrid } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StaffClasses = () => {
  const navigate = useNavigate();
  const { data: profile } = useQuery({
    queryKey: ['staff-profile'],
    queryFn: () => axios.get(`${API}/staff/profile`).then(r => r.data),
  });

  const myClasses = profile?.assignedClasses || [];
  const isCounselor = profile?.assignedYear && profile?.assignedSection;

  return (
    <DashboardLayout title="My Classes" subtitle="Manage your assigned subjects and teaching schedule">
      <div className="space-y-10">
        
        {isCounselor && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-indigo-900 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-900/20 overflow-hidden relative group"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><LayoutGrid size={120} /></div>
             <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-3xl backdrop-blur-md flex items-center justify-center text-indigo-400 border border-white/10">
                   <Sparkles size={32} />
                </div>
                <div>
                   <h3 className="text-2xl font-black italic">Section Blueprint</h3>
                   <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] mt-1">Master Schedule Orchestrator • {profile.department}</p>
                   <p className="text-xs text-indigo-100/60 mt-2 font-medium">As a Class Counselor for {profile.assignedYear} Section {profile.assignedSection}, you can build the master timetable.</p>
                </div>
             </div>
             <button 
               onClick={() => navigate('/staff/timetable-allocation')}
               className="px-10 py-4 bg-white text-indigo-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl relative z-10"
             >
                Open Blueprint Builder
             </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {myClasses.length > 0 ? myClasses.map((item: any, i: number) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="dash-card p-6 flex flex-col group hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 border-b-4 border-b-primary-500"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-primary-50 rounded-2xl text-primary-600 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                  <BookOpen size={24} />
                </div>
                <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">{item.split(' ')[0]}</span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-1">{item}</h3>
              <p className="text-sm font-semibold text-primary-500 mb-6">Regular Session</p>
              
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3 text-slate-500">
                  <Users size={16} />
                  <span className="text-xs font-medium">Enrolled Students Syncing...</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Clock size={16} />
                  <span className="text-xs font-medium">As per Timetable</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition">
                  View Class Details <ExternalLink size={14} />
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center dash-card bg-slate-50/50 border-dashed">
              <BookOpen size={48} className="text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium">You have no assigned classes at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffClasses;
