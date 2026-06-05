import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, XCircle, Search, Save, 
  ChevronRight, Calendar, Clock, BookOpen, LayoutGrid, 
  Sparkles, Filter, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AttendanceMarking = () => {
  const queryClient = useQueryClient();
  // Fetch real departments from the governance module
  const { data: departmentList } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => axios.get(`${API}/admin/departments`).then(r => r.data),
  });

  const departments = departmentList?.map((d: any) => d.name) || [];

  // Fetch staff profile to get assigned class
  const { data: profile } = useQuery({
    queryKey: ['staff-profile'],
    queryFn: async () => {
      const res = await axios.get(`${API}/staff/profile`);
      return res.data;
    }
  });

  const [filters, setFilters] = useState({
    department: '',
    year: '1st Year',
    section: 'A',
    subjectId: '',
    hour: 1,
    date: new Date().toISOString().split('T')[0]
  });

  // Sync filters with staff profile
  useEffect(() => {
    if (profile) {
      setFilters(prev => ({
        ...prev,
        department: profile.department || prev.department,
        year: profile.assignedYear || prev.year,
        section: profile.assignedSection || prev.section
      }));
    }
  }, [profile]);

  const [studentRecords, setStudentRecords] = useState<any[]>([]);
  const [isMarking, setIsMarking] = useState(false);

  // Fetch subjects for faculty
  const { data: subjects } = useQuery({
    queryKey: ['staff-subjects'],
    queryFn: async () => {
      const res = await axios.get(`${API}/staff/subjects`);
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  // Fetch student list based on filters
  const { data: students, isLoading: isStudentsLoading, refetch: fetchStudents } = useQuery({
    queryKey: ['attendance-students', filters.department, filters.year, filters.section],
    queryFn: async () => {
      const res = await axios.get(`${API}/attendance/students`, { 
        params: { department: filters.department, year: filters.year.match(/\d/)?.[0] || 1, section: filters.section } 
      });
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: false // Trigger manually or when filters are ready
  });

  useEffect(() => {
    if (Array.isArray(students)) {
      setStudentRecords(students.map((s: any) => ({
        studentId: s._id,
        name: s.name,
        sid: s.registerNo || s.studentId,
        status: 'present'
      })));
    }
  }, [students]);

  const handleStatusCycle = (id: string) => {
    setStudentRecords(prev => prev.map(s => {
      if (s.studentId !== id) return s;
      const nextStatus: any = {
        'present': 'absent',
        'absent': 'late',
        'late': 'present'
      };
      return { ...s, status: nextStatus[s.status] };
    }));
  };

  const markAllPresent = () => {
    setStudentRecords(prev => prev.map(s => ({ ...s, status: 'present' })));
    toast.success('All students marked as present');
  };

  const markAttendanceMutation = useMutation({
    mutationFn: async (payload: any) => {
      return axios.post(`${API}/attendance/submit`, payload);
    },
    onSuccess: () => {
      toast.success('Attendance session recorded successfully!');
      setIsMarking(false);
      queryClient.invalidateQueries({ queryKey: ['attendance-sessions'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to record attendance');
    }
  });

  const handleSubmit = () => {
    if (!filters.subjectId) return toast.error('Please select a subject');
    
    markAttendanceMutation.mutate({
      ...filters,
      students: studentRecords.map(s => ({ studentId: s.studentId, status: s.status }))
    });
  };

  const presentCount = studentRecords.filter(s => s.status === 'present').length;
  const lateCount = studentRecords.filter(s => s.status === 'late').length;
  const absentCount = studentRecords.length - presentCount - lateCount;

  return (
    <DashboardLayout title="Attendance Management" subtitle="Precision Daily Tracking & Analytics">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 -m-10 p-10 pb-32">
        
        <div className="grid grid-cols-12 gap-10">
            
            {/* ── Left Side: Filters ── */}
            <div className="col-span-12 lg:col-span-4 space-y-10">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="dash-card p-10 bg-white/80 backdrop-blur-xl border-white shadow-2xl shadow-slate-200/50 space-y-10 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-blue-600 rotate-12"><Filter size={180} /></div>
                    
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><LayoutGrid size={24} /></div>
                        <div>
                            <h4 className="text-xl font-black italic text-slate-800 tracking-tight">Session Parameters</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Select class configuration</p>
                        </div>
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-widest">Department</label>
                                <select 
                                    value={filters.department}
                                    onChange={e => setFilters({...filters, department: e.target.value})}
                                    className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 ring-blue-500/20 transition-all appearance-none"
                                >
                                    <option value="">Select Unit</option>
                                    {departments.map((dept: string) => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-widest">Academic Year</label>
                                <select 
                                    value={filters.year}
                                    onChange={e => setFilters({...filters, year: e.target.value})}
                                    className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 ring-blue-500/20 transition-all appearance-none"
                                >
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-widest">Section</label>
                                <select 
                                    value={filters.section}
                                    onChange={e => setFilters({...filters, section: e.target.value})}
                                    className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 ring-blue-500/20 transition-all appearance-none"
                                >
                                    {departmentList?.find((d: any) => d.name === filters.department)
                                      ? Array.from({ length: departmentList.find((d: any) => d.name === filters.department).totalSections || 1 }).map((_, i) => {
                                          const sectionLetter = String.fromCharCode(65 + i);
                                          return <option key={sectionLetter} value={sectionLetter}>Section {sectionLetter}</option>;
                                        })
                                      : <option value="A">Section A</option>
                                    }
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-widest">Period / Hour</label>
                                <select 
                                    value={filters.hour}
                                    onChange={e => setFilters({...filters, hour: parseInt(e.target.value)})}
                                    className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 ring-blue-500/20 transition-all appearance-none"
                                >
                                    {[1,2,3,4,5,6,7,8].map(h => <option key={h} value={h}>Hour {h}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-widest">Subject</label>
                            <select 
                                value={filters.subjectId}
                                onChange={e => setFilters({...filters, subjectId: e.target.value})}
                                className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 ring-blue-500/20 transition-all appearance-none"
                            >
                                <option value="">Select Subject</option>
                                {Array.isArray(subjects) && subjects.map((s: any) => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                            </select>
                        </div>

                        <button 
                            onClick={() => { setIsMarking(true); fetchStudents(); }}
                            className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                        >
                            <Users size={18} /> Initialize Student List
                        </button>
                    </div>
                </motion.div>

                {/* Quick Stats Dashboard */}
                {isMarking && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="dash-card p-10 bg-slate-900 text-white border-none relative overflow-hidden group shadow-2xl shadow-slate-900/40"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><CheckCircle size={150} /></div>
                        <div className="relative z-10 space-y-8">
                            <div className="flex justify-between items-center">
                                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Marking Overview</h5>
                                <Sparkles size={16} className="text-blue-400" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Total</p>
                                    <p className="text-2xl font-black">{studentRecords.length}</p>
                                </div>
                                <div className="text-center p-4 bg-amber-500/10 rounded-2xl border border-amber-500/10">
                                    <p className="text-[9px] font-black uppercase text-amber-500/60 mb-1">Late</p>
                                    <p className="text-2xl font-black text-amber-400">{lateCount}</p>
                                </div>
                                <div className="text-center p-4 bg-rose-500/10 rounded-2xl border border-rose-500/10">
                                    <p className="text-[9px] font-black uppercase text-rose-500/60 mb-1">Absent</p>
                                    <p className="text-2xl font-black text-rose-400">{absentCount}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* ── Right Side: Student List ── */}
            <div className="col-span-12 lg:col-span-8">
                <AnimatePresence mode="wait">
                    {isMarking ? (
                        <motion.div 
                            key="marking-list"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="dash-card p-12 space-y-12 min-h-[800px] bg-white/80 backdrop-blur-xl border-white shadow-2xl shadow-slate-200/50 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-blue-600 -rotate-6"><Users size={300} /></div>
                            
                            <div className="flex justify-between items-center relative z-10">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-3 h-10 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
                                        <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em]">Live Attendance Roll</p>
                                    </div>
                                    <h4 className="text-4xl font-black text-slate-800 italic tracking-tighter">
                                        Year {filters.year} • Section {filters.section}
                                    </h4>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={markAllPresent}
                                        className="px-8 py-4 bg-emerald-50 text-emerald-600 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                                    >
                                        <CheckCircle2 size={18} /> Mark All Present
                                    </button>
                                    <button 
                                        onClick={handleSubmit}
                                        className="px-10 py-4 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/30 active:scale-95"
                                    >
                                        <Save size={18} /> Commit Attendance
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {isStudentsLoading ? (
                                    [1,2,3,4,5].map(i => <div key={i} className="skeleton h-24 w-full rounded-[36px]" />)
                                ) : studentRecords.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {studentRecords.map((s, i) => (
                                            <motion.div 
                                                key={s.studentId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                                                onClick={() => handleStatusCycle(s.studentId)}
                                                className={`p-6 rounded-[32px] flex items-center justify-between cursor-pointer transition-all border group ${
                                                    s.status === 'present' ? 'bg-emerald-50/40 border-emerald-100/50' : 
                                                    s.status === 'late' ? 'bg-amber-50/40 border-amber-100/50' :
                                                    'bg-rose-50/40 border-rose-100/50 shadow-xl shadow-rose-500/10'
                                                }`}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center font-black italic text-sm transition-all ${s.status === 'present' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'}`}>
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h5 className={`text-base font-black italic tracking-tight transition-all ${s.status === 'absent' ? 'text-rose-900' : 'text-slate-800'}`}>{s.name}</h5>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.sid}</p>
                                                    </div>
                                                </div>
                                                <div className={`p-3 rounded-full transition-all ${
                                                    s.status === 'present' ? 'text-emerald-500 bg-emerald-100/50' : 
                                                    s.status === 'late' ? 'text-amber-500 bg-amber-100/50' :
                                                    'text-rose-500 bg-rose-100/50'
                                                }`}>
                                                    {s.status === 'present' ? <CheckCircle2 size={24} /> : s.status === 'late' ? <Clock size={24} /> : <XCircle size={24} />}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-32 text-center bg-slate-50/50 rounded-[64px] border-2 border-dashed border-slate-200/50">
                                        <Search size={48} className="mx-auto text-slate-200 mb-6" />
                                        <h5 className="text-xl font-black text-slate-400 italic">No Students Found</h5>
                                        <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest mt-3">Check your department and year filters</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[700px] bg-white/40 backdrop-blur-md rounded-[80px] border-2 border-dashed border-slate-200/50 shadow-inner">
                            <div className="text-center space-y-8 max-w-sm px-10">
                                <div className="w-32 h-32 bg-white rounded-[48px] flex items-center justify-center text-slate-200 mx-auto shadow-2xl border border-slate-100 relative group">
                                    <div className="absolute inset-0 bg-blue-50 rounded-[48px] scale-0 group-hover:scale-110 transition-transform duration-500 opacity-50" />
                                    <Users size={64} className="relative z-10 group-hover:text-blue-400 transition-colors duration-500" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-slate-400 italic tracking-tight">Portal Locked</h4>
                                    <p className="text-[11px] text-slate-300 font-bold uppercase tracking-[0.2em] mt-5 leading-loose">Configure the session parameters to the left to initialize the professional attendance roll.</p>
                                </div>
                                <div className="pt-4 flex justify-center gap-2">
                                    {[1,2,3].map(i => <div key={i} className="w-2 h-2 bg-slate-200 rounded-full" />)}
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceMarking;
