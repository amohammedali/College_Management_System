import React, { useState } from 'react';
import { 
  Users, BookOpen, Save, ChevronRight, Search, 
  Sparkles, Filter, CheckCircle, ClipboardList,
  UserCheck, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SubjectAllocation = () => {
  const queryClient = useQueryClient();
  
  // 1. Fetch Staff Profile (to get Counselor details)
  const { data: profile } = useQuery({
    queryKey: ['staff-profile'],
    queryFn: () => axios.get(`${API}/staff/profile`).then(r => r.data),
  });

  const { data: allocations, isLoading: isAllocationLoading } = useQuery({
    queryKey: ['my-class-subjects'],
    queryFn: () => axios.get(`${API}/staff/my-class/subjects`).then(r => r.data),
    enabled: !!profile?.department // Bypassed counselor check
  });

  // 3. Fetch All Subjects for this Department and Year (to allow selection if not allocated)
  const { data: allDepartmentSubjects } = useQuery({
    queryKey: ['dept-subjects', profile?.department, profile?.assignedYear || 'Year 2'],
    queryFn: async () => {
        // Infer semesters from year (e.g. 3rd Year = Sem 5 & 6)
        const yearStr = profile?.assignedYear || 'Year 2';
        const yearNum = parseInt(yearStr.match(/\d+/) ? yearStr.match(/\d+/)[0] : '1');
        const s1 = (yearNum * 2) - 1;
        const s2 = yearNum * 2;
        
        const res = await axios.get(`${API}/staff/available-subjects`, { 
            params: { department: profile.department } 
        });
        // Filter by semester
        return res.data.filter((s: any) => s.semester === s1 || s.semester === s2);
    },
    enabled: !!profile?.department
  });

  // 4. Fetch All Teaching Staff (to populate faculty dropdown)
  const { data: teachingStaff = [] } = useQuery({
    queryKey: ['teaching-staff-list', profile?.department],
    queryFn: () => axios.get(`${API}/staff/teaching-staff`, {
      params: { department: profile?.department }
    }).then(r => r.data),
    enabled: !!profile?.department
  });

  // 5. Allocation Mutation (Improved to create/update SectionSubject)
  const allocateMutation = useMutation({
    mutationFn: (payload: { subjectId: string, facultyId: string }) => 
      axios.post(`${API}/staff/my-class/subjects/allocate`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-class-subjects'] });
      toast.success('Faculty allocated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Allocation failed');
    }
  });

  const handleAllocate = (subjectId: string, facultyId: string) => {
    allocateMutation.mutate({ subjectId, facultyId });
  };

  const isCounselor = true; // !!profile?.assignedYear && !!profile?.assignedSection;

  // Merge allocated data with all potential subjects
  const subjectsToDisplay = allDepartmentSubjects?.map((sub: any) => {
    const allocated = allocations?.subjects?.find((a: any) => (a.subject_id?._id || a.subject_id) === sub._id);
    return {
      ...sub,
      faculty_id: allocated?.faculty_id
    };
  }) || [];

  console.log('Subject Allocation Debug:', {
    profileDept: profile?.department,
    profileYear: profile?.assignedYear,
    allDeptSubjectsCount: allDepartmentSubjects?.length,
    subjectsToDisplayCount: subjectsToDisplay.length,
    allocationsFound: !!allocations
  });

  return (
    <DashboardLayout 
        title="Subject Allocation" 
        subtitle="Manage Faculty Assignments for your Class"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 -m-10 p-10 pb-32">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-xl shadow-indigo-100 flex items-center justify-center border border-indigo-50 group">
                    <ClipboardList className="text-indigo-600 group-hover:scale-110 transition-transform" size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black italic text-slate-800 tracking-tight">Academic Orchestrator</h2>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                            Class Counselor Portal
                        </span>
                        {isCounselor && (
                            <span className="text-slate-400 text-xs font-bold italic">
                                Handling {profile.assignedYear} • Section {profile.assignedSection}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {!isCounselor ? (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto mt-20 p-12 bg-white rounded-[48px] border border-slate-100 shadow-2xl text-center space-y-8"
            >
                <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle size={48} />
                </div>
                <div className="space-y-4">
                    <h3 className="text-2xl font-black text-slate-800 italic">Access Restricted</h3>
                    <p className="text-slate-500 leading-relaxed max-w-sm mx-auto font-medium">
                        This interface is exclusively available to designated Class Counselors. Your profile is not currently assigned to a specific year and section.
                    </p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex justify-center gap-2">
                    {[1,2,3].map(i => <div key={i} className="w-2 h-2 bg-slate-100 rounded-full" />)}
                </div>
            </motion.div>
        ) : (
            <div className="grid grid-cols-12 gap-8">
                
                {/* ── Summary Stats ── */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="p-8 bg-slate-900 rounded-[40px] text-white relative overflow-hidden group shadow-2xl shadow-slate-900/30"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><BookOpen size={150} /></div>
                        <div className="relative z-10 space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Class Overview</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-3xl font-black">{subjectsToDisplay.length}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Total Subjects</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-indigo-400">
                                        {subjectsToDisplay.filter((s: any) => s.faculty_id).length}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Allocated</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="p-8 bg-white/60 backdrop-blur-xl border border-white rounded-[40px] shadow-xl shadow-slate-200/50 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Sparkles size={20} /></div>
                            <h5 className="font-bold text-slate-800">Counselor Instructions</h5>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Select a handling faculty for each subject listed. These assignments will be visible to students and used for attendance tracking.
                        </p>
                        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                            <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                                Tip: Ensure faculty specialization matches the subject domain for optimal results.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Subject List ── */}
                <div className="col-span-12 lg:col-span-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-xl border border-white rounded-[48px] shadow-2xl shadow-slate-200/50 overflow-hidden"
                    >
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h4 className="text-xl font-black italic text-slate-800 tracking-tight flex items-center gap-4">
                                <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                                Subject Faculty Mapping
                            </h4>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search</span>
                                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100">
                                    <Search size={14} />
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            {isAllocationLoading ? (
                                <div className="space-y-6">
                                    {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-50 rounded-3xl animate-pulse" />)}
                                </div>
                            ) : subjectsToDisplay.length > 0 ? (
                                <div className="space-y-6">
                                    {subjectsToDisplay.map((sub: any) => (
                                        <div 
                                            key={sub._id}
                                            className="p-6 rounded-[36px] bg-slate-50/50 border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                                    <BookOpen size={24} />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                        {sub.name}
                                                    </h5>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                        {sub.code} • {sub.type}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <select 
                                                        className="pl-12 pr-10 py-4 bg-white border border-slate-100 rounded-[20px] text-sm font-bold text-slate-700 focus:ring-2 ring-indigo-500/20 transition-all appearance-none shadow-sm min-w-[240px]"
                                                        value={sub.faculty_id?._id || sub.faculty_id || ''}
                                                        onChange={(e) => handleAllocate(sub._id, e.target.value)}
                                                    >
                                                        <option value="">Select Faculty</option>
                                                        {teachingStaff.map((s: any) => (
                                                            <option key={s._id} value={s._id}>{s.name} ({s.staffId})</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                                        <UserCheck size={18} />
                                                    </div>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                                        <ChevronRight size={14} className="rotate-90" />
                                                    </div>
                                                </div>
                                                
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${sub.faculty_id ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-300'}`}>
                                                    <CheckCircle size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center bg-slate-50/50 rounded-[64px] border-2 border-dashed border-slate-200/50">
                                    <BookOpen size={48} className="mx-auto text-slate-200 mb-6" />
                                    <h5 className="text-xl font-black text-slate-400 italic">No Subjects Defined</h5>
                                    <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest mt-3">Please ask Admin to assign subjects to this section</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

            </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubjectAllocation;
