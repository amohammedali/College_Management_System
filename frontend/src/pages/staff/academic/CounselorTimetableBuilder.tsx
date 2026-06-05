import React, { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { 
  Calendar, Clock, Users, Building2, 
  Plus, X, Info, Sparkles, Printer,
  BookOpen, AlertCircle, CheckCircle2,
  ChevronRight, ArrowRight, ShieldCheck,
  RefreshCw, Layers, HardDrive
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const CounselorTimetableBuilder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedCell, setSelectedCell] = useState<{day: string, period: number} | null>(null);
  const [assignmentData, setAssignmentData] = useState({ facultyId: '', roomId: '', subjectId: '' });
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [activeReg, setActiveReg] = useState('2023');
  const [facultyDeptFilter, setFacultyDeptFilter] = useState('');


  const [isTransposed, setIsTransposed] = useState(true);

  // 1. Fetch Staff Profile to get Counselor Assignment
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['staff-profile'],
    queryFn: () => axios.get(`${API}/staff/profile`).then(r => r.data),
  });

  const isCounselor = true; // profile?.assignedYear && profile?.assignedSection;
  const assignedDeptName = profile?.department || 'Computer Science and Engineering';
  const assignedSection = profile?.assignedSection || 'A';
  const assignedYearNum = profile?.assignedYear ? parseInt(profile.assignedYear.match(/\d+/) ? profile.assignedYear.match(/\d+/)[0] : '0') || 2 : 2;

  // 2. Fetch Department ID from Name (Use staff endpoint)
  const { data: departments } = useQuery({
    queryKey: ['staff-departments'],
    queryFn: () => axios.get(`${API}/staff/departments`).then(r => r.data),
  });

  const assignedDept = useMemo(() => {
    return departments?.find((d: any) => d.name.toLowerCase() === assignedDeptName?.toLowerCase());
  }, [departments, assignedDeptName]);

  // 3. Fetch Counselor's Subject Allocation Mapping
  const { data: allocations } = useQuery({
    queryKey: ['counselor-allocations'],
    queryFn: () => axios.get(`${API}/staff/my-class/subjects`).then(r => r.data),
    enabled: !!user?._id
  });

  const [selectedSem, setSelectedSem] = useState(assignedYearNum * 2 - 1); 
  
  useEffect(() => {
    if (assignedYearNum) setSelectedSem(assignedYearNum * 2 - 1);
  }, [assignedYearNum]);

  // Use allocated subjects as the primary source
  const allocatedSubjects = useMemo(() => {
    return allocations?.subjects?.map((s: any) => ({
      ...s.subject_id,
      assignedFaculty: s.faculty_id
    })) || [];
  }, [allocations]);

  // Fallback to general subjects and merge with allocations
  const { data: generalSubjects } = useQuery({
    queryKey: ['dept-subjects', assignedDeptName, activeReg, selectedSem],
    queryFn: () => axios.get(`${API}/staff/available-subjects?department=${assignedDeptName}&regulation=${activeReg}&semester=${selectedSem}`).then(r => r.data),
    enabled: !!assignedDeptName && !!activeReg
  });

  const displaySubjects = useMemo(() => {
    if (!generalSubjects) return allocatedSubjects;
    
    // Create a map of allocated subjects for quick lookup
    const allocatedMap = new Map(allocatedSubjects.map((s: any) => [s._id.toString(), s]));
    
    // Merge: Use allocated version if it exists, otherwise use general version
    const merged = generalSubjects.map((s: any) => {
      const allocated = allocatedMap.get(s._id.toString());
      return allocated ? { ...s, assignedFaculty: allocated.assignedFaculty } : s;
    });

    // Add any allocated subjects that might not be in the general list (unlikely but safe)
    allocatedSubjects.forEach((s: any) => {
      if (!merged.some(m => m._id.toString() === s._id.toString())) {
        merged.push(s);
      }
    });

    return merged.sort((a: any, b: any) => a.code.localeCompare(b.code));
  }, [generalSubjects, allocatedSubjects]);

  // 4. Fetch Existing Slots for the Section
  const { data: slots } = useQuery({
    queryKey: ['timetable-slots', assignedDept?._id, assignedSection, assignedYearNum, selectedSem, activeReg],
    queryFn: () => axios.get(`${API}/timetable?dept_id=${assignedDept?._id}&section=${assignedSection}&academic_year=${assignedYearNum}&semester=${selectedSem}&regulation_year=${activeReg}`).then(r => r.data),
    enabled: !!assignedDept?._id && !!assignedSection
  });

  // 5. Fetch Available Resources for selected cell
  const { data: resources, error: resourceError } = useQuery({
    queryKey: ['available-resources', selectedCell?.day, selectedCell?.period],
    queryFn: () => axios.get(`${API}/timetable/faculty/available?day=${selectedCell?.day}&period=${selectedCell?.period}`).then(async (facultyRes) => {
      const roomRes = await axios.get(`${API}/timetable/rooms/available?day=${selectedCell?.day}&period=${selectedCell?.period}`);
      return { 
        availableFaculty: Array.isArray(facultyRes.data) ? facultyRes.data : [], 
        availableRooms: Array.isArray(roomRes.data) ? roomRes.data : [] 
      };
    }),
    enabled: !!selectedCell
  });

  // Effect to auto-fill faculty when subject is selected based on allocation
  useEffect(() => {
    if (assignmentData.subjectId && allocatedSubjects.length > 0) {
      const allocation = allocatedSubjects.find((s: any) => s._id === assignmentData.subjectId);
      if (allocation?.assignedFaculty) {
        setAssignmentData(prev => ({
          ...prev,
          facultyId: allocation.assignedFaculty._id || allocation.assignedFaculty
        }));
        
        // Also set the department filter to the faculty's department to ensure they show in list
        if (allocation.assignedFaculty.department) {
          setFacultyDeptFilter(allocation.assignedFaculty.department);
        }
      }
    }
  }, [assignmentData.subjectId, allocatedSubjects]);

  // 6. Proactive Conflict Check (External Assignments for selected resource)
  const { data: facultySchedule } = useQuery({
    queryKey: ['resource-faculty-schedule', assignmentData.facultyId],
    queryFn: () => axios.get(`${API}/timetable/faculty/${assignmentData.facultyId}`).then(r => r.data),
    enabled: !!assignmentData.facultyId
  });

  const { data: roomSchedule } = useQuery({
    queryKey: ['resource-room-schedule', assignmentData.roomId],
    queryFn: () => axios.get(`${API}/timetable/room/${assignmentData.roomId}`).then(r => r.data),
    enabled: !!assignmentData.roomId
  });

  const externalOccupancy = useMemo(() => {
    const map: any = {};
    facultySchedule?.forEach((s: any) => {
       if (!map[s.day]) map[s.day] = {};
       map[s.day][s.period] = { type: 'faculty', ...s };
    });
    roomSchedule?.forEach((s: any) => {
       if (!map[s.day]) map[s.day] = {};
       // Room occupancy takes precedence or combines
       if (map[s.day][s.period]) map[s.day][s.period].type = 'both';
       else map[s.day][s.period] = { type: 'room', ...s };
    });
    return map;
  }, [facultySchedule, roomSchedule]);

  const allFacultyDepts = useMemo(() => {
    if (!departments) return [];
    return departments.map((d: any) => d.name).sort();
  }, [departments]);

  const availableFacultyDepts = useMemo(() => {
    if (!resources?.availableFaculty || !Array.isArray(resources.availableFaculty)) return [];
    const depts = resources.availableFaculty.map((f: any) => f.department).filter(Boolean);
    return [...new Set(depts)].sort() as string[];
  }, [resources?.availableFaculty]);

   const filteredFaculty = useMemo(() => {
    if (!resources?.availableFaculty) return [];
    if (!facultyDeptFilter) return [];
    return resources.availableFaculty
      .filter((f: any) => f.department === facultyDeptFilter)
      .sort((a: any, b: any) => (a.isAvailable === b.isAvailable ? 0 : a.isAvailable ? -1 : 1));
  }, [resources?.availableFaculty, facultyDeptFilter]);


  // Mutations
  const assignMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/timetable/slot`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-slots'] });
      setConflicts([]);
      setAssignmentData({ facultyId: '', roomId: '', subjectId: '' });
      setSelectedCell(null);
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        setConflicts([err.response.data]);
      } else {
        alert(err.response?.data?.message || 'Assignment failed');
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/timetable/slot/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timetable-slots'] }),
  });

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

  const pTimes: any = {
    1: '08:30 AM', 2: '09:25 AM', 3: '10:40 AM', 4: '11:35 AM', 
    5: '01:15 PM', 6: '02:10 PM', 7: '03:05 PM', 8: '04:00 PM'
  };

  // Dynamic Color Assignment based on Subject Code
  const getSubjectColor = (code: any) => {
    if (!code || typeof code !== 'string') return 'slate';
    const colors = ['indigo', 'emerald', 'amber', 'rose', 'violet', 'cyan', 'fuchsia'];
    const charSum = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  const colorClasses: any = {
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 shadow-indigo-500/5',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 shadow-emerald-500/5',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-600 shadow-amber-500/5',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-600 shadow-rose-500/5',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-600 shadow-violet-500/5',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600 shadow-cyan-500/5',
    fuchsia: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-600 shadow-fuchsia-500/5',
    slate: 'bg-slate-500/10 border-slate-500/20 text-slate-600 shadow-slate-500/5',
  };

  const handleAssign = () => {
    if (!selectedCell || !assignmentData.facultyId || !assignmentData.roomId || !assignmentData.subjectId) {
      alert('Please select a cell and all resources first.');
      return;
    }
    assignMutation.mutate({
      dept_id: assignedDept?._id,
      section: assignedSection,
      academic_year: assignedYearNum,
      semester: selectedSem,
      regulation_year: Number(activeReg),
      day: selectedCell.day,
      period: selectedCell.period,
      subject_id: assignmentData.subjectId,
      faculty_ids: [assignmentData.facultyId],
      room_id: assignmentData.roomId
    });
  };

  if (isProfileLoading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 uppercase tracking-widest">Initialising Blueprint Engine...</div>;

  if (!isCounselor) {
    return (
      <DashboardLayout title="Access Denied" subtitle="Counselor Privileges Required">
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[48px] border-2 border-dashed border-slate-100">
           <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-rose-500/10"><ShieldCheck size={48} /></div>
           <h3 className="text-3xl font-black text-slate-800 italic">Unauthorized Access</h3>
           <p className="text-sm text-slate-500 mt-4 max-w-sm text-center font-medium leading-relaxed">
             This module is exclusively for designated Class Counselors. Your current academic profile does not have an assigned year or section.
           </p>
           <button onClick={() => window.history.back()} className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">Go Back</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Section Blueprint" subtitle="Master Academic Schedule Orchestrator">
      <div className="space-y-10 pb-32">
        
        {/* Counselor Header */}
        <div className="relative overflow-hidden rounded-[48px] bg-indigo-950 p-12 text-white shadow-2xl no-print">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Layers size={300} className="-rotate-12" />
           </div>
           
           <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                 <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-full backdrop-blur-md">
                       <Sparkles size={14} className="text-indigo-400" />
                       <span className="text-[10px] font-black uppercase tracking-[3px] text-indigo-100">{assignedSection} Registry • Counselor Mode</span>
                    </div>
                    <p className="text-slate-400 font-bold flex items-center gap-2 text-sm">
                       <BookOpen size={18} className="text-indigo-400" /> Managing: <span className="text-white">{assignedYearNum} Year Academic Flow (Section {assignedSection})</span>
                    </p>
                 </div>
                 
                 <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => setIsTransposed(!isTransposed)}
                      className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md flex items-center gap-3 hover:bg-white/20 transition-all shadow-xl shadow-black/20"
                    >
                       <RefreshCw size={18} className={isTransposed ? 'rotate-180 transition-transform text-indigo-400' : 'text-slate-400'} />
                       <div className="text-left">
                          <p className="text-[8px] font-black uppercase tracking-widest text-indigo-300">Switch View</p>
                          <p className="text-[10px] font-bold text-white uppercase">{isTransposed ? 'Days as Rows' : 'Periods as Rows'}</p>
                       </div>
                    </button>

                    <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                       <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Regulation</p>
                       <select value={activeReg} onChange={e => setActiveReg(e.target.value)} className="bg-transparent text-xs font-black outline-none cursor-pointer">
                          <option value="2023" className="bg-slate-900">Regulation 2023</option>
                          <option value="2021" className="bg-slate-900">Regulation 2021</option>
                       </select>
                    </div>

                    <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                       <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Semester Cycle</p>
                       <select value={selectedSem} onChange={e => setSelectedSem(Number(e.target.value))} className="bg-transparent text-xs font-black outline-none cursor-pointer">
                          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="bg-slate-900">Semester {s} ({s % 2 === 0 ? 'Even' : 'Odd'})</option>)}
                       </select>
                    </div>

                    <button 
                      onClick={() => {
                        const url = `${API}/timetable/pdf?dept_id=${assignedDept?._id}&section=${assignedSection}&academic_year=${assignedYearNum}&semester=${selectedSem}&regulation_year=${activeReg}`;
                        const response = axios.get(url, { responseType: 'blob' }).then(res => {
                           const blob = new Blob([res.data], { type: 'application/pdf' });
                           const link = document.createElement('a');
                           link.href = window.URL.createObjectURL(blob);
                           link.download = `Official_Timetable_Sec${assignedSection}.pdf`;
                           link.click();
                        });
                      }}
                      className="px-8 py-4 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-600/40 hover:bg-indigo-500 transition-all flex items-center gap-3"
                    >
                       <Printer size={18} />
                       <div className="text-left">
                          <p className="text-[8px] font-black uppercase tracking-widest text-indigo-200">Export</p>
                          <p className="text-[10px] font-bold text-white uppercase">Official PDF</p>
                       </div>
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Schedule Matrix */}
        <div className="grid grid-cols-12 gap-10">
           <div className="col-span-12 xl:col-span-8">
              <div className="dash-card p-0 bg-white border border-slate-100 shadow-2xl rounded-[48px] overflow-hidden">
                 <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-indigo-600 border border-slate-50"><Calendar size={24} /></div>
                       <h3 className="text-xl font-black text-slate-800 italic uppercase">Schedule Matrix</h3>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                          <CheckCircle2 size={12} /> Live Sync Active
                       </div>
                    </div>
                 </div>

                 <div className="overflow-x-auto p-4">
                    <table className="w-full border-separate border-spacing-2">
                       <thead>
                          {isTransposed ? (
                            <tr>
                               <th className="p-4 bg-slate-50 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest w-24">Day</th>
                               {PERIODS.map(p => (
                                  <th key={p} className="p-4 bg-slate-50 rounded-2xl text-[9px] font-black text-slate-800 uppercase tracking-widest">
                                     P{p}
                                     <span className="block text-[7px] text-slate-400 font-medium mt-1">{pTimes[p]}</span>
                                  </th>
                               ))}
                            </tr>
                          ) : (
                            <tr>
                               <th className="p-4 bg-slate-50 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest w-24">Hour</th>
                               {DAYS.map(day => (
                                  <th key={day} className="p-4 bg-slate-50 rounded-2xl text-[9px] font-black text-slate-800 uppercase tracking-widest">{day}</th>
                               ))}
                            </tr>
                          )}
                       </thead>
                       <tbody>
                          {isTransposed ? (
                             DAYS.map(day => (
                                <tr key={day}>
                                   <td className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-center">
                                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{day}</span>
                                   </td>
                                   {PERIODS.map(p => {
                                      const slot = grid[day][p];
                                      const isSelected = selectedCell?.day === day && selectedCell?.period === p;
                                      const hasConflict = conflicts.find(c => c.day === day && c.period === p);
                                      const extOcc = externalOccupancy[day]?.[p];

                                      const isBusy = !!extOcc || !!hasConflict;
                                      const isAssigned = !!slot;
                                      const isSelectable = !isBusy;

                                      const subjectCode = slot ? slot.subject_id?.code : (hasConflict ? hasConflict.subject_id?.code : extOcc?.subject_id?.code);
                                      const colorKey = subjectCode ? getSubjectColor(subjectCode) : 'slate';

                                      return (
                                         <td 
                                           key={p} 
                                           onClick={() => isSelectable && setSelectedCell({ day, period: p })}
                                           className={`min-w-[140px] h-36 relative transition-all rounded-3xl border-2
                                             ${isSelected ? 'border-indigo-500 bg-indigo-50/30 shadow-lg' : 'border-transparent'}
                                             ${!isSelectable ? 'bg-slate-50/30 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-slate-50'}
                                             ${isBusy ? 'border-rose-100' : ''}
                                             ${isAssigned ? colorClasses[colorKey] : ''}
                                           `}
                                         >
                                            {slot ? (
                                               <div className="w-full h-full p-3 flex flex-col justify-between group">
                                                  <div className="flex justify-between items-start">
                                                     <div>
                                                        <p className="text-[7px] font-black uppercase text-indigo-600 mb-0.5">{slot.dept_id?.name}</p>
                                                        <p className="text-[8px] font-black uppercase opacity-60 mb-1">{slot.subject_id?.code}</p>
                                                        <h6 className="text-[10px] font-black leading-tight line-clamp-2">{slot.subject_id?.name}</h6>
                                                     </div>
                                                     <div className="px-2 py-0.5 bg-current/10 border border-current/20 text-[6px] rounded-md font-black uppercase tracking-widest">Assigned</div>
                                                  </div>
                                                   <div className="mt-auto pt-2 border-t border-current/20 flex items-center justify-between">
                                                     <div className="flex flex-col min-w-0">
                                                        <span className="text-[9px] font-black uppercase truncate leading-none mb-0.5">
                                                           {slot.faculty_ids?.[0]?.name || 'Unknown Staff'}
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                           <span className="text-[7px] font-bold opacity-60 uppercase">{slot.room_id?.name}</span>
                                                           <span className="text-[6px] font-black px-1.5 py-0.5 bg-current/10 rounded-md">ID: {slot.faculty_ids?.[0]?.staffId || 'N/A'}</span>
                                                        </div>
                                                     </div>
                                                     <button 
                                                       onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(slot._id); }}
                                                       className="p-1.5 bg-white/50 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                                                     >
                                                        <X size={10} />
                                                     </button>
                                                  </div>
                                               </div>
                                            ) : isBusy ? (
                                               <div className={`w-full h-full p-3 flex flex-col justify-between border-2 rounded-3xl ${colorClasses[colorKey]} opacity-60`}>
                                                  <div className="flex justify-between items-start">
                                                     <div className="px-2 py-0.5 bg-current/10 border border-current/20 text-[6px] rounded-md font-black uppercase tracking-widest">Busy</div>
                                                     <AlertCircle size={12} className="opacity-40" />
                                                  </div>
                                                  
                                                  <div className="space-y-1">
                                                     <p className="text-[9px] font-black line-clamp-1">{subjectCode} - {hasConflict ? hasConflict.subject_id?.name : extOcc?.subject_id?.name}</p>
                                                     <p className="text-[7px] font-bold opacity-60 uppercase">
                                                        {hasConflict ? 'Internal Clash' : `${extOcc?.dept_id?.name} • Sec ${extOcc?.section}`}
                                                     </p>
                                                  </div>

                                                  <div className="pt-1.5 border-t border-current/10 flex flex-col">
                                                     <span className="text-[8px] font-black truncate italic">
                                                        {hasConflict ? 'Current Section' : (extOcc?.faculty_ids?.[0]?.name || 'Resource Reserved')}
                                                     </span>
                                                     <span className="text-[6px] font-bold opacity-50">
                                                        ID: {hasConflict ? 'N/A' : (extOcc?.faculty_ids?.[0]?.staffId || 'SYS')}
                                                     </span>
                                                  </div>
                                               </div>
                                            ) : (
                                               <div className="w-full h-full flex flex-col items-center justify-center gap-2 transition-all">
                                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-400'}`}>
                                                     <Plus size={16} />
                                                  </div>
                                                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-400">Available</span>
                                               </div>
                                            )}
                                         </td>
                                      );
                                   })}
                                </tr>
                             ))
                          ) : (
                             PERIODS.map(p => (
                                <tr key={p}>
                                   <td className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-center">
                                      <span className="text-[10px] font-black text-slate-800">P{p}</span>
                                      <span className="block text-[7px] text-slate-400 font-medium mt-1 uppercase italic">{pTimes[p]}</span>
                                   </td>
                                   {DAYS.map(day => {
                                      const slot = grid[day][p];
                                      const isSelected = selectedCell?.day === day && selectedCell?.period === p;
                                      const hasConflict = conflicts.find(c => c.day === day && c.period === p);
                                      const extOcc = externalOccupancy[day]?.[p];

                                      const isBusy = !!extOcc || !!hasConflict;
                                      const isAssigned = !!slot;
                                      const isSelectable = !isBusy;

                                      const subjectCode = slot ? slot.subject_id?.code : (hasConflict ? hasConflict.subject_id?.code : extOcc?.subject_id?.code);
                                      const colorKey = subjectCode ? getSubjectColor(subjectCode) : 'slate';

                                      return (
                                         <td 
                                           key={day} 
                                           onClick={() => isSelectable && setSelectedCell({ day, period: p })}
                                           className={`min-w-[130px] h-36 relative transition-all rounded-3xl border-2
                                             ${isSelected ? 'border-indigo-500 bg-indigo-50/30 shadow-lg' : 'border-transparent'}
                                             ${!isSelectable ? 'bg-slate-50/30 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-slate-50'}
                                             ${isBusy ? 'border-rose-100' : ''}
                                             ${isAssigned ? colorClasses[colorKey] : ''}
                                           `}
                                         >
                                            {slot ? (
                                               <div className="w-full h-full p-3 flex flex-col justify-between group">
                                                  <div className="flex justify-between items-start">
                                                     <div>
                                                        <p className="text-[7px] font-black uppercase text-indigo-600 mb-0.5">{slot.dept_id?.name}</p>
                                                        <p className="text-[8px] font-black uppercase opacity-60 mb-1">{slot.subject_id?.code}</p>
                                                        <h6 className="text-[10px] font-black leading-tight line-clamp-2">{slot.subject_id?.name}</h6>
                                                     </div>
                                                     <div className="px-2 py-0.5 bg-current/10 border border-current/20 text-[6px] rounded-md font-black uppercase tracking-widest">Assigned</div>
                                                  </div>
                                                   <div className="mt-auto pt-2 border-t border-current/20 flex items-center justify-between">
                                                     <div className="flex flex-col min-w-0">
                                                        <span className="text-[9px] font-black uppercase truncate leading-none mb-0.5">
                                                           {slot.faculty_ids?.[0]?.name || 'Unknown Staff'}
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                           <span className="text-[7px] font-bold opacity-60 uppercase">{slot.room_id?.name}</span>
                                                           <span className="text-[6px] font-black px-1.5 py-0.5 bg-current/10 rounded-md">ID: {slot.faculty_ids?.[0]?.staffId || 'N/A'}</span>
                                                        </div>
                                                     </div>
                                                     <button 
                                                       onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(slot._id); }}
                                                       className="p-1.5 bg-white/50 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                                                     >
                                                        <X size={10} />
                                                     </button>
                                                  </div>
                                               </div>
                                            ) : isBusy ? (
                                               <div className={`w-full h-full p-3 flex flex-col justify-between border-2 rounded-3xl ${colorClasses[colorKey]} opacity-60`}>
                                                  <div className="flex justify-between items-start">
                                                     <div className="px-2 py-0.5 bg-current/10 border border-current/20 text-[6px] rounded-md font-black uppercase tracking-widest">Busy</div>
                                                     <AlertCircle size={12} className="opacity-40" />
                                                  </div>
                                                  
                                                  <div className="space-y-1">
                                                     <p className="text-[9px] font-black line-clamp-1">{subjectCode} - {hasConflict ? hasConflict.subject_id?.name : extOcc?.subject_id?.name}</p>
                                                     <p className="text-[7px] font-bold opacity-60 uppercase">
                                                        {hasConflict ? 'Internal Clash' : `${extOcc?.dept_id?.name} • Sec ${extOcc?.section}`}
                                                     </p>
                                                  </div>

                                                  <div className="pt-1.5 border-t border-current/10 flex flex-col">
                                                     <span className="text-[8px] font-black truncate italic">
                                                        {hasConflict ? 'Current Section' : (extOcc?.faculty_ids?.[0]?.name || 'Resource Reserved')}
                                                     </span>
                                                     <span className="text-[6px] font-bold opacity-50">
                                                        ID: {hasConflict ? 'N/A' : (extOcc?.faculty_ids?.[0]?.staffId || 'SYS')}
                                                     </span>
                                                  </div>
                                               </div>
                                            ) : (
                                               <div className="w-full h-full flex flex-col items-center justify-center gap-2 transition-all">
                                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-400'}`}>
                                                     <Plus size={16} />
                                                  </div>
                                                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-400">Available</span>
                                               </div>
                                            )}
                                         </td>
                                      );
                                   })}
                                </tr>
                             ))
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>

           {/* Allocation Sidebar */}
           <div className="col-span-12 lg:col-span-4 space-y-8">
              <div className="dash-card p-10 bg-white shadow-2xl rounded-[48px] border border-slate-100 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5"><Plus size={100} /></div>
                 
                 <div className="relative z-10 space-y-10">
                    <div>
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-2">Slot Allocation</h4>
                       <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
                    </div>

                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600"><Clock size={20} /></div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Slot</p>
                          <p className="text-base font-black text-slate-800 italic">
                             {selectedCell ? `${selectedCell.day} • P${selectedCell.period}` : 'Select a Slot'}
                          </p>
                          <p className="text-[8px] font-bold text-indigo-500 uppercase">{selectedCell ? pTimes[selectedCell.period] : 'Choose any period in the grid'}</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Curriculum</label>
                          <select 
                            value={assignmentData.subjectId} onChange={e => setAssignmentData({...assignmentData, subjectId: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-xs font-black outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                          >
                             <option value="">{displaySubjects === undefined ? '— synchronizing curriculum —' : displaySubjects.length === 0 ? '— no subjects mapped to this sem —' : '— select subject —'}</option>
                             {displaySubjects?.map((s: any) => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
                          </select>
                       </div>

                        <div className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Faculty Department</label>
                              <select 
                                value={facultyDeptFilter} 
                                onChange={e => {
                                  setFacultyDeptFilter(e.target.value);
                                  setAssignmentData(prev => ({ ...prev, facultyId: '' }));
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-xs font-black outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                              >
                                 <option value="">
                                    {allFacultyDepts.length === 0 ? '— loading departments —' : '— select department —'}
                                 </option>
                                 {allFacultyDepts.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Faculty Registry</label>
                              <select 
                                value={assignmentData.facultyId} 
                                onChange={e => setAssignmentData({...assignmentData, facultyId: e.target.value})}
                                disabled={!facultyDeptFilter}
                                className={`w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-xs font-black outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer ${!facultyDeptFilter ? 'opacity-50 grayscale' : ''}`}
                              >
                                 <option value="">
                                    {!selectedCell ? '— select a slot first —' :
                                     !facultyDeptFilter ? '— select department —' : 
                                     '— select faculty —'}
                                 </option>
                                 {filteredFaculty.map((f: any) => (
                                   <option key={f._id} value={f._id} disabled={!f.isAvailable} className={!f.isAvailable ? 'text-rose-400' : ''}>
                                     {f.name} ({f.staffId}) {!f.isAvailable ? `— BUSY (${f.occupiedBy?.dept} ${f.occupiedBy?.section})` : ''}
                                   </option>
                                 ))}
                              </select>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Room</label>
                           <select 
                             value={assignmentData.roomId} onChange={e => setAssignmentData({...assignmentData, roomId: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-xs font-black outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                           >
                              <option value="">
                                 {resourceError ? '— connection error —' :
                                  !selectedCell ? '— select a slot first —' : 
                                  !resources ? '— mapping available rooms —' : 
                                  resources.availableRooms?.length === 0 ? '— all rooms occupied —' : 
                                  '— select room —'}
                              </option>
                              {resources?.availableRooms?.map((r: any) => <option key={r._id} value={r._id}>{r.name} • {r.type}</option>)}
                           </select>
                        </div>

                       <button 
                         onClick={handleAssign}
                         disabled={assignMutation.isPending || !selectedCell}
                         className={`w-full py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[3px] transition-all shadow-2xl flex items-center justify-center gap-3 mt-4
                           ${assignMutation.isPending || !selectedCell ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-900/20'}`}
                       >
                          {assignMutation.isPending ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                          {assignMutation.isPending ? 'Synchronizing...' : 'Allocate Resources'}
                       </button>
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100/50 flex items-start gap-5">
                 <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm"><Info size={20} /></div>
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Conflict Detection</p>
                    <p className="text-[10px] text-slate-600 font-medium leading-relaxed italic">
                       "For different faculty the Schedule Builder will prevent assignment if another subject is already allocated to them during that hour."
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CounselorTimetableBuilder;
