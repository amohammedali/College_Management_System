import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, CheckCircle2, UserCheck, Users, 
  BookOpen, Clock, Target, AlertCircle,
  ChevronRight, Bookmark, ArrowRight, Zap,
  Layers, Lock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentElectives = () => {
  const queryClient = useQueryClient();

  const { data: available, isLoading: availableLoading } = useQuery({
    queryKey: ['student-available-electives'],
    queryFn: () => axios.get(`${API}/student/electives/available`).then(r => r.data),
  });

  const { data: myChoice, isLoading: choiceLoading } = useQuery({
    queryKey: ['student-my-elective'],
    queryFn: () => axios.get(`${API}/student/electives/my-choice`).then(r => r.data),
  });

  const selectMutation = useMutation({
    mutationFn: (subjectId: string) => axios.post(`${API}/student/electives/select`, { subjectId }),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['student-available-electives'] });
       queryClient.invalidateQueries({ queryKey: ['student-my-elective'] });
    },
    onError: (err: any) => {
       alert(err.response?.data?.message || "Selection failed");
    }
  });

  if (availableLoading || choiceLoading) return <div className="p-20 text-center"><div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto" /></div>;

  return (
    <DashboardLayout title="Elective Selection" subtitle="Architect your academic journey by selecting professional electives for the current semester">
      <div className="max-w-7xl mx-auto pb-32">
        
        {/* Status Banner */}
        <div className="mb-12">
           {myChoice ? (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="dash-card p-10 bg-emerald-600 text-white border-none overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CheckCircle2 size={120} />
                 </div>
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-2">Selection Confirmed</p>
                       <h3 className="text-3xl font-black italic">{myChoice.subject.name}</h3>
                       <p className="text-sm font-medium text-emerald-100 mt-2">Subject Code: {myChoice.subject.code} • Enrolled for Semester {myChoice.semester}</p>
                    </div>
                    <div className="px-8 py-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Registration ID</span>
                       <p className="text-xl font-black italic">EL-{myChoice._id.slice(-6).toUpperCase()}</p>
                    </div>
                 </div>
              </motion.div>
           ) : (
              <div className="dash-card p-8 border-indigo-100 bg-indigo-50/30 flex items-center gap-6">
                 <div className="p-4 bg-white text-indigo-600 rounded-2xl shadow-sm"><Sparkles size={24} /></div>
                 <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Selection Window Active</h4>
                    <p className="text-xs font-medium text-slate-500 mt-1">Please select one elective from the options below. Seats are allocated on a first-come-first-served basis.</p>
                 </div>
              </div>
           )}
        </div>

        {/* Available Electives */}
        {!myChoice && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {available?.map((sub: any, i: number) => {
                 const isFull = sub.seatsRemaining <= 0;
                 return (
                    <motion.div 
                      key={sub._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                      className={`dash-card p-8 group transition-all relative overflow-hidden ${isFull ? 'opacity-60 grayscale' : 'hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-200/50 cursor-pointer'}`}
                    >
                       <div className="flex justify-between items-start mb-8">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm italic transition-all group-hover:scale-110 ${isFull ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white shadow-sm'}`}>
                             {sub.code}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isFull ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                             {isFull ? 'Seats Full' : 'Available'}
                          </div>
                       </div>

                       <div className="space-y-2 mb-8">
                          <h4 className="text-lg font-black text-slate-800 leading-tight">{sub.name}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department: {sub.department}</p>
                       </div>

                       {/* Seat Progress */}
                       <div className="space-y-3 mb-8">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                             <span className="text-slate-400">Seat Occupancy</span>
                             <span className={isFull ? 'text-rose-600' : 'text-indigo-600'}>{sub.totalSeats - sub.seatsRemaining} / {sub.totalSeats}</span>
                          </div>
                          <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }} animate={{ width: `${((sub.totalSeats - sub.seatsRemaining) / sub.totalSeats) * 100}%` }} 
                               className={`h-full rounded-full ${isFull ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                             />
                          </div>
                       </div>

                       <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                          <div className="flex items-center gap-4">
                             <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Credits</span>
                                <span className="text-xs font-black text-slate-800">{sub.credits.total}</span>
                             </div>
                             <div className="w-px h-6 bg-slate-100" />
                             <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">L-T-P</span>
                                <span className="text-xs font-black text-slate-800">{sub.credits.lecture}-{sub.credits.tutorial}-{sub.credits.practical}</span>
                             </div>
                          </div>
                          <button 
                            onClick={() => !isFull && selectMutation.mutate(sub._id)}
                            disabled={selectMutation.isPending || isFull}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isFull ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-slate-900/20'}`}
                          >
                             {selectMutation.isPending ? 'Processing...' : isFull ? <Lock size={14} /> : <>Select Elective <ArrowRight size={14} /></>}
                          </button>
                       </div>
                    </motion.div>
                 );
              })}

              {available?.length === 0 && (
                 <div className="col-span-full py-32 text-center dash-card border-dashed bg-slate-50/20">
                    <Zap className="mx-auto text-slate-200 mb-6" size={48} />
                    <h4 className="text-xl font-black text-slate-400 italic">No Electives Found</h4>
                    <p className="text-xs font-medium text-slate-400 mt-2 max-w-xs mx-auto">Either the selection window is closed or no electives are offered for your current semester.</p>
                 </div>
              )}
           </div>
        )}

        {myChoice && (
           <div className="mt-12 dash-card p-10 bg-slate-50/50 border-none">
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-white text-slate-400 rounded-2xl shadow-sm"><Layers size={20} /></div>
                 <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Curriculum Integration</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance Status</p>
                    <div className="p-4 bg-white rounded-2xl flex items-center gap-3">
                       <Clock size={16} className="text-amber-500" />
                       <span className="text-xs font-black text-slate-800">Awaiting Faculty Mapping</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">L-T-P-C Credits</p>
                    <div className="p-4 bg-white rounded-2xl flex items-center gap-3">
                       <Target size={16} className="text-indigo-600" />
                       <span className="text-xs font-black text-slate-800">Earned Credits: 0 / {myChoice.subject.credits.total}</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syllabus Access</p>
                    <div className="p-4 bg-white rounded-2xl flex items-center gap-3 group cursor-pointer hover:bg-indigo-50 transition-all">
                       <BookOpen size={16} className="text-indigo-600" />
                       <span className="text-xs font-black text-slate-800 group-hover:text-indigo-600">Open Digital Syllabus</span>
                    </div>
                 </div>
              </div>
           </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default StudentElectives;
