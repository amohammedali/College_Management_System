import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, BookOpen, User, MapPin, 
  Save, Trash2, Plus, Info, AlertCircle,
  ChevronRight, ArrowLeft, Loader2, Sparkles,
  LayoutGrid, ListChecks
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const TimetableAllocation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState<{ day: string, period: number } | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    subject_id: '',
    faculty_ids: [] as string[],
    room_id: '',
  });

  // 1. Fetch Staff Profile
  const { data: profile } = useQuery({
    queryKey: ['staff-profile'],
    queryFn: () => axios.get(`${API}/staff/profile`).then(r => r.data),
  });

  const isCounselor = !!profile?.assignedYear && !!profile?.assignedSection;
  const yearNum = parseInt(profile?.assignedYear?.match(/\d+/) ? profile.assignedYear.match(/\d+/)[0] : '1');

  // 2. Fetch Department ID (Since staff profile only has name)
  const { data: department } = useQuery({
    queryKey: ['dept-info', profile?.department],
    queryFn: async () => {
        const res = await axios.get(`${API}/staff/departments`);
        return res.data.find((d: any) => d.name.toLowerCase() === profile.department.toLowerCase());
    },
    enabled: !!profile?.department
  });


  // 3. Fetch Class Subjects (to get pre-allocated faculty mapping)
  const { data: classSubjects } = useQuery({
    queryKey: ['my-class-subjects'],
    queryFn: () => axios.get(`${API}/staff/my-class/subjects`).then(r => r.data),
    enabled: isCounselor
  });

  // 4. Fetch Timetable Slots for this Section
  const { data: slots, isLoading: isSlotsLoading } = useQuery({
    queryKey: ['timetable-slots', department?._id, profile?.assignedSection, yearNum],
    queryFn: () => axios.get(`${API}/timetable`, {
        params: {
            dept_id: department._id,
            section: profile.assignedSection,
            regulation_year: yearNum
        }
    }).then(r => r.data),
    enabled: !!department?._id && isCounselor
  });

  // 5. Fetch Available Rooms
  const { data: rooms } = useQuery({
    queryKey: ['available-rooms', selectedSlot?.day, selectedSlot?.period],
    queryFn: () => axios.get(`${API}/timetable/rooms/available`, {
        params: { day: selectedSlot?.day, period: selectedSlot?.period }
    }).then(r => r.data),
    enabled: !!selectedSlot
  });

  // Mutations
  const allocateMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/timetable/slot`, data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['timetable-slots'] });
        setSelectedSlot(null);
        toast.success('Slot allocated successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Allocation failed')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/timetable/slot/${id}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['timetable-slots'] });
        setSelectedSlot(null);
        toast.success('Slot cleared');
    }
  });

  // Grid Mapping
  const grid = useMemo(() => {
    const matrix: any = {};
    DAYS.forEach(day => {
      matrix[day] = {};
      PERIODS.forEach(p => matrix[day][p] = null);
    });
    slots?.forEach((slot: any) => {
      if (matrix[slot.day]) matrix[slot.day][slot.period] = slot;
    });
    return matrix;
  }, [slots]);

  const handleSlotClick = (day: string, period: number) => {
    const slot = grid[day][period];
    setSelectedSlot({ day, period });
    if (slot) {
        setFormData({
            subject_id: slot.subject_id?._id || '',
            faculty_ids: slot.faculty_ids?.map((f: any) => f._id) || [],
            room_id: slot.room_id?._id || '',
        });
    } else {
        setFormData({ subject_id: '', faculty_ids: [], room_id: '' });
    }
  };

  const handleSubjectChange = (subjectId: string) => {
    const allocated = classSubjects?.subjects?.find((s: any) => (s.subject_id?._id || s.subject_id) === subjectId);
    setFormData(prev => ({
        ...prev,
        subject_id: subjectId,
        faculty_ids: allocated?.faculty_id ? [allocated.faculty_id?._id || allocated.faculty_id] : []
    }));
  };

  const onSave = () => {
    if (!formData.subject_id || !formData.room_id) return toast.error('Subject and Room are required');
    allocateMutation.mutate({
        ...formData,
        day: selectedSlot?.day,
        period: selectedSlot?.period,
        dept_id: department._id,
        section: profile.assignedSection,
        regulation_year: yearNum
    });
  };

  if (!isCounselor) return (
    <DashboardLayout title="Timetable Allocation" subtitle="Class Schedule Management">
        <div className="min-h-screen flex items-center justify-center p-10">
            <div className="max-w-md w-full bg-white rounded-[48px] p-12 text-center shadow-2xl border border-slate-100">
                <AlertCircle size={64} className="mx-auto text-rose-500 mb-6" />
                <h3 className="text-2xl font-black text-slate-800 italic">Access Restricted</h3>
                <p className="text-slate-500 mt-4 leading-relaxed">Only designated Class Counselors can allocate timetables for their sections.</p>
                <button onClick={() => navigate('/staff')} className="mt-8 px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all">Return to Dashboard</button>
            </div>
        </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Timetable Orchestrator" subtitle={`Structuring ${profile.assignedYear} • Section ${profile.assignedSection}`}>
      <div className="min-h-screen bg-slate-50/50 -m-10 p-10 pb-32">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-6">
                <button onClick={() => navigate('/staff/subjects')} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-3xl font-black italic text-slate-800">Section Blueprint</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Master Academic Schedule • {profile.department}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="px-6 py-3 bg-white border border-slate-100 rounded-2xl flex items-center gap-3 shadow-sm">
                    <LayoutGrid size={16} className="text-indigo-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{profile.assignedSection} Registry</span>
                </div>
                <div className="px-6 py-3 bg-indigo-600 text-white rounded-2xl flex items-center gap-3 shadow-xl shadow-indigo-200">
                    <Sparkles size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Counselor Mode</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-12 gap-10">
            
            {/* ── Left Side: Timetable Grid ── */}
            <div className="col-span-12 lg:col-span-9">
                <div className="bg-white rounded-[48px] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-8 bg-slate-50/50 border-b border-r border-slate-100"></th>
                                    {DAYS.map(day => (
                                        <th key={day} className="p-8 bg-slate-50/50 border-b border-r border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</p>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PERIODS.map(p => (
                                    <tr key={p}>
                                        <td className="p-8 border-r border-b border-slate-50 bg-slate-50/30 text-center">
                                            <span className="text-xs font-black text-slate-400 italic">P{p}</span>
                                        </td>
                                        {DAYS.map(day => {
                                            const slot = grid[day][p];
                                            const isSelected = selectedSlot?.day === day && selectedSlot?.period === p;
                                            return (
                                                <td 
                                                    key={day} 
                                                    onClick={() => handleSlotClick(day, p)}
                                                    className={`p-2 border-r border-b border-slate-50 min-w-[160px] h-32 transition-all cursor-pointer relative group
                                                        ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50/80'}
                                                    `}
                                                >
                                                    {slot ? (
                                                        <motion.div 
                                                            initial={{ opacity: 0, scale: 0.95 }} 
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            whileHover={{ scale: 1.02, y: -4 }}
                                                            className="w-full h-full p-4 bg-slate-900 rounded-[24px] border border-white/5 shadow-2xl flex flex-col justify-between group-hover:border-indigo-500/50 transition-all relative overflow-hidden"
                                                        >
                                                            {/* Background Decorative Element */}
                                                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-indigo-500/10 blur-2xl rounded-full" />
                                                            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-indigo-500/5 blur-2xl rounded-full" />

                                                            <div className="relative z-10">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="px-2 py-0.5 bg-indigo-500/20 rounded-md border border-indigo-500/30">
                                                                        <span className="text-[7px] font-black text-indigo-300 uppercase tracking-widest">{slot.subject_id?.code}</span>
                                                                    </div>
                                                                    <Sparkles size={10} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                </div>
                                                                <h6 className="text-[11px] font-black text-white leading-tight uppercase tracking-tight line-clamp-2">{slot.subject_id?.name}</h6>
                                                            </div>

                                                            <div className="relative z-10 flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-5 h-5 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                                                                        <User size={10} className="text-slate-400" />
                                                                    </div>
                                                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-wider">{slot.faculty_ids?.[0]?.name?.split(' ')[0] || 'TBD'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/10 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all">
                                                                    <MapPin size={8} className="text-indigo-400" />
                                                                    <span className="text-[8px] font-black text-slate-400 group-hover:text-white transition-colors">{slot.room_id?.name}</span>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ) : (

                                                        <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                                <Plus size={20} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Right Side: Allocation Panel ── */}
            <div className="col-span-12 lg:col-span-3">
                <AnimatePresence mode="wait">
                    {selectedSlot ? (
                        <motion.div 
                            key="panel"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="bg-white rounded-[48px] shadow-2xl border border-white p-10 sticky top-10 space-y-8"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black italic text-slate-800">{selectedSlot.day}</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period {selectedSlot.period}</p>
                                    </div>
                                </div>
                                {grid[selectedSlot.day][selectedSlot.period] && (
                                    <button 
                                        onClick={() => deleteMutation.mutate(grid[selectedSlot.day][selectedSlot.period]._id)}
                                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            {(!formData.subject_id || !formData.room_id) && (
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                                    <AlertCircle size={16} className="text-amber-600" />
                                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Subject & Room Required</p>
                                </div>
                            )}


                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Subject</label>
                                    <div className="relative">
                                        <select 
                                            value={formData.subject_id}
                                            onChange={(e) => handleSubjectChange(e.target.value)}
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 appearance-none focus:ring-2 ring-indigo-500/20 outline-none"
                                        >
                                            <option value="">Choose Module...</option>
                                            {classSubjects?.subjects?.map((s: any) => (
                                                <option key={s.subject_id?._id || s.subject_id} value={s.subject_id?._id || s.subject_id}>
                                                    {s.subject_id?.name}
                                                </option>
                                            ))}
                                        </select>
                                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Handling Faculty</label>
                                    <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${formData.subject_id ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-700">
                                                {(() => {
                                                    const allocated = classSubjects?.subjects?.find((s: any) => (s.subject_id?._id || s.subject_id) === formData.subject_id);
                                                    return allocated?.faculty_id?.name || (formData.subject_id ? 'Unassigned' : 'Select Subject first');
                                                })()}
                                            </p>
                                            <p className="text-[9px] font-bold text-indigo-500 uppercase">Primary Instructor</p>
                                        </div>
                                    </div>
                                    {formData.subject_id && !classSubjects?.subjects?.find((s: any) => (s.subject_id?._id || s.subject_id) === formData.subject_id)?.faculty_id && (
                                        <p className="text-[9px] text-rose-500 font-bold italic px-1 flex items-center gap-1">
                                            <AlertCircle size={10} /> Faculty not yet allocated for this subject
                                        </p>
                                    )}
                                </div>


                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Room</label>
                                    <div className="relative">
                                        <select 
                                            value={formData.room_id}
                                            onChange={(e) => setFormData(p => ({ ...p, room_id: e.target.value }))}
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 appearance-none focus:ring-2 ring-indigo-500/20 outline-none"
                                        >
                                            <option value="">
                                                {!rooms ? 'Searching for rooms...' : rooms.length === 0 ? 'No rooms available' : 'Select Location...'}
                                            </option>
                                            {rooms?.map((r: any) => (
                                                <option key={r._id} value={r._id}>{r.name} ({r.block})</option>
                                            ))}
                                        </select>
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    </div>
                                </div>

                            </div>

                            <div className="pt-6 border-t border-slate-50 flex gap-4">
                                <button 
                                    onClick={() => setSelectedSlot(null)}
                                    className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={onSave}
                                    disabled={allocateMutation.isPending}
                                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
                                >
                                    {allocateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Commit Allocation
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="h-full bg-slate-50/50 rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-10 text-center space-y-6"
                        >
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 shadow-sm">
                                <ListChecks size={40} />
                            </div>
                            <div className="space-y-2">
                                <h5 className="text-xl font-black text-slate-400 italic tracking-tight">Select a Slot</h5>
                                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest leading-loose">Choose any period in the grid to start allocating subjects and faculty</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TimetableAllocation;
