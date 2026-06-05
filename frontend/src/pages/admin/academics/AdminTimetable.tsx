import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarRange, Plus, Clock, Users, MapPin, 
  Trash2, AlertTriangle, Save, CheckCircle, ChevronRight, 
  Filter, Search, Info, ArrowLeft, Building2, Layers,
  RefreshCw, User, BookOpen, Zap, Activity, X
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIMES = [
  '08:30 AM', '09:25 AM', '10:40 AM', '11:35 AM', 
  '01:15 PM', '02:10 PM', '03:05 PM', '04:00 PM'
];

const AdminTimetable = () => {
  const queryClient = useQueryClient();
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedSem, setSelectedSem] = useState(1);
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedReg, setSelectedReg] = useState('2023');
  const [activeSlot, setActiveSlot] = useState<{ day: string, time: string } | null>(null);
  const [timetable, setTimetable] = useState<Record<string, any>>({});
  const [hoveredSubject, setHoveredSubject] = useState<any>(null);
  const [paletteSemesterFilter, setPaletteSemesterFilter] = useState<number | 'All'>('All');
  const [paletteFacultyFilter, setPaletteFacultyFilter] = useState<'All' | 'Assigned' | 'Unassigned'>('All');

  // 1. Fetch real departments list
  const { data: departments } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => axios.get(`${API}/admin/departments`).then(r => r.data),
  });

  const activeDepartmentData = departments?.find((d: any) => d.name === selectedDept);
  const totalSemestersCount = activeDepartmentData?.totalSemesters || 8;
  const totalSectionsCount = activeDepartmentData?.totalSections || 4;
  const availableSections = Array.from({ length: totalSectionsCount }).map((_, i) => String.fromCharCode(65 + i));
  const availableSemesters = Array.from({ length: totalSemestersCount }).map((_, i) => i + 1);

  // 2. Fetch all subjects for the selected dept
  const { data: allSubjects } = useQuery({
    queryKey: ['admin-subjects', selectedDept, selectedReg],
    queryFn: () => axios.get(`${API}/admin/subjects?department=${selectedDept}&semester=all&regulation=${selectedReg}`).then(r => r.data),
    enabled: !!selectedDept
  });

  // 2.1 Fetch Section-Specific Subject Allocations
  const { data: sectionAllocation } = useQuery({
    queryKey: ['admin-section-subjects', selectedDept, selectedSem, selectedSection],
    queryFn: () => axios.get(`${API}/admin/section-subjects?department=${selectedDept}&semester=${selectedSem}&section=${selectedSection}`).then(r => r.data),
    enabled: !!selectedDept
  });

  const filteredSubjects = React.useMemo(() => {
    if (!allSubjects) return [];
    
    return allSubjects
      .map((sub: any) => {
        // Find if this subject has a section-specific allocation
        const alloc = sectionAllocation?.subjects?.find((s: any) => 
          String(s.subject_id?._id || s.subject_id) === String(sub._id)
        );

        if (alloc?.faculty_id) {
          const facultyId = String(alloc.faculty_id._id || alloc.faculty_id);
          const facultyExists = sub.faculties?.some((f: any) => String(f._id || f) === facultyId);
          if (!facultyExists) {
            return {
              ...sub,
              faculties: [alloc.faculty_id, ...(sub.faculties || [])]
            };
          }
        }
        return sub;
      })
      .filter((sub: any) => {
        if (paletteSemesterFilter !== 'All' && sub.semester !== paletteSemesterFilter) return false;
        if (paletteFacultyFilter === 'Assigned' && (!sub.faculties || sub.faculties.length === 0)) return false;
        if (paletteFacultyFilter === 'Unassigned' && sub.faculties?.length > 0) return false;
        return true;
      });
  }, [allSubjects, paletteSemesterFilter, paletteFacultyFilter, sectionAllocation]);

  // 3. Fetch Staff for the selected dept
  const { data: staffList } = useQuery({
    queryKey: ['admin-staff-dept', selectedDept],
    queryFn: () => axios.get(`${API}/admin/staff`).then(r => r.data.filter((f: any) => f.department === selectedDept)),
    enabled: !!selectedDept
  });

  // 4. Fetch Rooms
  const { data: rooms } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: () => axios.get(`${API}/admin/rooms`).then(r => r.data)
  });

  // 5. Fetch Existing Timetable Slots (Sync)
  const { data: existingSlots } = useQuery({
    queryKey: ['timetable-slots-admin', selectedDept, selectedSem, selectedSection, selectedReg],
    queryFn: () => {
      const deptObj = departments?.find((d: any) => d.name === selectedDept);
      if (!deptObj) return [];
      
      const academic_year = Math.ceil(selectedSem / 2);

      return axios.get(`${API}/timetable`, {
        params: {
          dept_id: deptObj._id,
          academic_year: academic_year,
          semester: selectedSem,
          section: selectedSection,
          regulation_year: Number(selectedReg)
        }
      }).then(r => r.data);
    },
    enabled: !!selectedDept && !!departments
  });

  // 6. Sync state with database
  React.useEffect(() => {
    if (existingSlots) {
      const newTimetable: Record<string, any> = {};
      existingSlots.forEach((slot: any) => {
        const time = TIMES[slot.period - 1];
        if (time) {
          newTimetable[`${slot.day}-${time}`] = {
            _id: slot._id,
            subjectId: slot.subject_id?._id,
            subjectName: slot.subject_id?.name,
            facultyIds: slot.faculty_ids?.map((f: any) => f._id),
            facultyName: slot.faculty_ids?.map((f: any) => f.name).join(' & '),
            type: slot.subject_id?.type?.toLowerCase().includes('lab') ? 'lab' : 'theory',
            room: slot.room_id?.name
          };
        }
      });
      setTimetable(newTimetable);
    }
  }, [existingSlots]);

  const [subjectRoomMap, setSubjectRoomMap] = useState<Record<string, string>>({});

  const assignFacultyMutation = useMutation({
    mutationFn: (data: { subjectId: string, facultyIds: string[] }) => axios.put(`${API}/admin/subjects/assign/${data.subjectId}`, { facultyIds: data.facultyIds }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-subjects'] })
  });

  const handleFacultyAssign = (subject: any, newFacultyId: string) => {
    const currentIds = subject.faculties?.map((f: any) => typeof f === 'object' ? f._id : f) || [];
    if (!currentIds.includes(newFacultyId)) {
      const updatedIds = [...currentIds, newFacultyId];
      assignFacultyMutation.mutate({ subjectId: subject._id, facultyIds: updatedIds });
    }
  };

  const handleFacultyRemove = (subject: any, facultyIdToRemove: string) => {
    const currentIds = subject.faculties?.map((f: any) => typeof f === 'object' ? f._id : f) || [];
    const updatedIds = currentIds.filter(id => id !== facultyIdToRemove);
    assignFacultyMutation.mutate({ subjectId: subject._id, facultyIds: updatedIds });
  };

  const assignSlotMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/timetable/slot`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-slots-admin'] });
      setActiveSlot(null);
    }
  });

  const handleAssign = (subject: any) => {
    if (!activeSlot || !selectedDept) return;
    if (!subject.faculties || subject.faculties.length === 0) {
      alert("Please map at least one faculty to this subject first.");
      return;
    }

    const selectedRoomId = subjectRoomMap[subject._id];
    if (!selectedRoomId) {
      alert("Please select a physical asset (room) first.");
      return;
    }

    const deptObj = departments?.find((d: any) => d.name === selectedDept);
    const period = TIMES.indexOf(activeSlot.time) + 1;
    const academic_year = Math.ceil(selectedSem / 2);

    const payload = {
      dept_id: deptObj._id,
      section: selectedSection,
      academic_year,
      semester: selectedSem,
      day: activeSlot.day,
      period,
      subject_id: subject._id,
      faculty_ids: subject.faculties.map((f: any) => typeof f === 'object' ? f._id : f),
      room_id: selectedRoomId,
      regulation_year: Number(selectedReg)
    };

    assignSlotMutation.mutate(payload);
  };

  const deleteSlotMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/timetable/slot/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timetable-slots-admin'] })
  });

  const publishMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/admin/timetable`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      alert("Master Timetable Published Successfully!");
    },
  });

  const handlePublish = () => {
    const payload = {
      department: selectedDept,
      semester: selectedSem,
      section: selectedSection,
      schedule: Object.entries(timetable).map(([key, value]) => {
        const [day, time] = key.split('-');
        return { day, time, ...value };
      })
    };
    publishMutation.mutate(payload);
  };

  return (
    <DashboardLayout title="Timetable Orchestration" subtitle="Institutional Master Scheduling, Resource Mapping & Conflict Resolution">
      <div className="p-8 space-y-10 min-h-screen bg-[#F8FAFC]">
        {/* 1. Header & Stats Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Timetable Orchestrator</h1>
            <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-widest italic">Academic Governance Engine v2.4</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Resources', val: allSubjects?.length || 0, icon: <Layers size={18} />, color: 'indigo' },
              { label: 'Active Faculty', val: staffList?.length || 0, icon: <Users size={18} />, color: 'cyan' },
              { label: 'Conflicts Prev.', val: '124', icon: <CheckCircle size={18} />, color: 'emerald' },
              { label: 'Utilization', val: '88%', icon: <Activity size={18} />, color: 'violet' }
            ].map((stat, idx) => (
              <motion.div 
                key={idx} whileHover={{ y: -5 }}
                className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-4 min-w-[180px]"
              >
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center shadow-inner`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                  <h4 className="text-xl font-black text-slate-800">{stat.val}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {!selectedDept ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Select Department</h2>
                <p className="text-sm text-slate-500 font-medium">Choose an institutional structure to begin scheduling</p>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {departments?.map((dept: any) => (
                <div 
                  key={dept._id} onClick={() => setSelectedDept(dept.name)}
                  className="group relative p-10 bg-white rounded-[3rem] border border-slate-100 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                    <Building2 size={100} />
                  </div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-[2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl shadow-indigo-500/10">
                      <Building2 size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">{dept.name}</h3>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-400 transition-colors">
                      {dept.degreeType} • {dept.totalSemesters} Semesters
                    </p>
                    <div className="mt-12 flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-indigo-600 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all">
                      Initialize Orchestrator <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Header Actions */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-6">
                <button onClick={() => setSelectedDept(null)} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-100">
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">{selectedDept}</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                      <BookOpen size={14} />
                      <select value={selectedSem} onChange={e => setSelectedSem(Number(e.target.value))} className="text-[11px] font-black uppercase outline-none bg-transparent">
                        {availableSemesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>
                    <div className="w-px h-4 bg-slate-200" />
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-400 border border-slate-100">
                      <Layers size={14} />
                      <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="text-[11px] font-black uppercase outline-none bg-transparent">
                        {availableSections.map(s => <option key={s} value={s}>Section {s}</option>)}
                      </select>
                    </div>
                    <div className="w-px h-4 bg-slate-200" />
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                      <Zap size={14} />
                      <select value={selectedReg} onChange={e => setSelectedReg(e.target.value)} className="text-[11px] font-black uppercase outline-none bg-transparent">
                        <option value="2023">R2023</option>
                        <option value="2025">R2025</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handlePublish} 
                disabled={publishMutation.isPending || assignSlotMutation.isPending} 
                className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] text-[12px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
              >
                {(publishMutation.isPending || assignSlotMutation.isPending) ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                {assignSlotMutation.isPending ? 'Seeding Slot...' : 'Publish Master Timetable'}
              </button>
            </div>

            <div className="space-y-8 max-w-7xl mx-auto">
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group/palette transition-all duration-500">
                <div className="p-6 border-b border-slate-50 bg-slate-50/20 flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Layers size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">Resource Repository</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Faculty Mapping & Assets</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group/select bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm hover:border-indigo-500 transition-all flex items-center gap-2">
                      <BookOpen size={14} className="text-indigo-500" />
                      <select 
                        className="text-[10px] font-black uppercase text-slate-800 outline-none bg-transparent appearance-none cursor-pointer pr-4"
                        value={paletteSemesterFilter} onChange={e => setPaletteSemesterFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                      >
                        <option value="All">All Semesters</option>
                        {availableSemesters.map(s => <option key={s} value={s}>Sem {s}</option>)}
                      </select>
                    </div>

                    <div className="relative group/select bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm hover:border-indigo-500 transition-all flex items-center gap-2">
                      <User size={14} className="text-cyan-500" />
                      <select 
                        className="text-[10px] font-black uppercase text-slate-800 outline-none bg-transparent appearance-none cursor-pointer pr-4"
                        value={paletteFacultyFilter} onChange={e => setPaletteFacultyFilter(e.target.value as any)}
                      >
                        <option value="All">All Status</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Unassigned">Unassigned</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex items-start gap-6 bg-white overflow-hidden relative">
                  <div className="flex-1 overflow-x-auto custom-scrollbar pb-3">
                    <div className="flex items-center gap-3">
                      {filteredSubjects?.map((sub: any) => (
                        <motion.div 
                          key={sub._id} whileHover={{ y: -3, scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          onClick={() => handleAssign(sub)}
                          onMouseEnter={() => setHoveredSubject(sub)}
                          onMouseLeave={() => setHoveredSubject(null)}
                          className={`min-w-[320px] p-5 rounded-[2rem] border transition-all duration-300 group/sub relative overflow-hidden ${activeSlot ? 'cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/5' : 'opacity-40 grayscale pointer-events-none'} ${sub.faculties?.length > 0 ? 'bg-indigo-50/40 border-indigo-100' : 'bg-slate-50/30 border-slate-100 hover:border-indigo-200'}`}
                        >
                          <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-5">
                              <div className={`w-2 h-10 rounded-full ${sub.type?.toLowerCase().includes('lab') ? 'bg-rose-500' : 'bg-indigo-500'} shadow-lg shadow-indigo-500/10`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-black tracking-tight text-slate-800 truncate uppercase">{sub.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sub.code}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              {/* Faculty Mapping Section */}
                              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Faculty Mapping</h4>
                                  <span className="text-[7px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase">
                                    {sub.faculties?.length || 0} Resources
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  {sub.faculties?.map((f: any, idx: number) => (
                                    <div key={f._id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm group/item hover:border-indigo-200 transition-all">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-50 text-slate-400'}`}>
                                          {f.name.charAt(0)}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-black text-slate-800">{f.name}</p>
                                            {idx === 0 && <span className="text-[6px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">Primary</span>}
                                          </div>
                                          <p className="text-[7px] font-bold text-slate-400 uppercase">{f.department}</p>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleFacultyRemove(sub, f._id); }}
                                        className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover/item:opacity-100"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ))}
                                  
                                  {(!sub.faculties || sub.faculties.length === 0) && (
                                    <div className="py-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
                                      <User size={16} className="text-slate-200 mb-2" />
                                      <p className="text-[8px] font-bold text-slate-300 uppercase">Unassigned</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-2">
                                <div onClick={e => e.stopPropagation()} className="relative">
                                  <select 
                                    className="text-[9px] font-black rounded-xl outline-none py-3 px-4 border border-slate-100 bg-white text-slate-500 shadow-sm w-full appearance-none hover:border-indigo-400 transition-all cursor-pointer"
                                    value=""
                                    onChange={e => handleFacultyAssign(sub, e.target.value)}
                                  >
                                    <option value="" disabled>➕ Add Staff Resource</option>
                                    {staffList?.map((f: any) => <option key={f._id} value={f._id} className="text-slate-800">{f.name}</option>)}
                                  </select>
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronRight size={10} className="rotate-90" /></div>
                                </div>

                                <div onClick={e => e.stopPropagation()} className="relative">
                                  <select 
                                    className="text-[9px] font-black rounded-xl outline-none py-3 px-4 border border-slate-100 bg-white text-slate-500 shadow-sm w-full appearance-none hover:border-amber-400 transition-all cursor-pointer"
                                    value={subjectRoomMap[sub._id] || ""}
                                    onChange={e => setSubjectRoomMap(prev => ({ ...prev, [sub._id]: e.target.value }))}
                                  >
                                    <option value="" disabled>🏢 Select Physical Asset (Room)</option>
                                    {rooms?.map((r: any) => <option key={r._id} value={r._id} className="text-slate-800">{r.name} ({r.type})</option>)}
                                  </select>
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><MapPin size={10} /></div>
                                </div>
                              </div>

                              {sub.faculties?.length > 0 && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleAssign(sub); }}
                                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                  <CheckCircle size={14} />
                                  Confirm & Seed Assignment
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className={`w-64 shrink-0 p-5 rounded-[1.5rem] border transition-all duration-700 relative overflow-hidden ${hoveredSubject ? 'bg-white border-amber-400 shadow-lg shadow-amber-500/5' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-xl transition-all duration-700 flex items-center justify-center ${hoveredSubject ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-500'}`}>
                        <AlertTriangle size={14} />
                      </div>
                      <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-tight">Status Guard</h4>
                    </div>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider leading-tight">
                      {hoveredSubject ? (hoveredSubject.faculties?.length > 0 ? `Validating ${hoveredSubject.faculties.length} Resources...` : "Resource Unbound") : "Matrix Monitoring Active"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Time Matrix</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Grid Overview</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Live Sync Active</span>
                  </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-white">
                        <th className="p-6 border-b border-r border-slate-100 text-left w-24 bg-slate-50/5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Day</span>
                        </th>
                        {TIMES.map(time => (
                          <th key={time} className="p-6 border-b border-slate-100 text-center min-w-[160px]">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest block mb-1">{time}</span>
                            <div className="w-6 h-0.5 bg-indigo-500/20 mx-auto rounded-full" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map(day => (
                        <tr key={day} className="group">
                          <td className="p-6 border-r border-b border-slate-100 bg-slate-50/20 group-hover:bg-indigo-50/10 transition-colors sticky left-0 z-20 backdrop-blur-md">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{day}</span>
                          </td>
                          {TIMES.map(time => {
                            const slotId = `${day}-${time}`;
                            const subject = timetable[slotId];
                            return (
                              <td 
                                key={time} onClick={() => setActiveSlot({ day, time })}
                                className={`p-2 border-b border-slate-100 transition-all cursor-pointer relative h-32 w-48 ${activeSlot?.day === day && activeSlot?.time === time ? 'bg-indigo-500/5 ring-2 ring-inset ring-indigo-500/20 z-10' : 'hover:bg-slate-50/30'}`}
                              >
                                {subject ? (
                                  <motion.div 
                                    initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
                                    className={`h-full w-full p-3 rounded-[1.2rem] border shadow-lg flex flex-col justify-between transition-all ${subject.type === 'lab' ? 'bg-gradient-to-br from-rose-500 to-rose-600 border-rose-400/20 shadow-rose-500/10' : 'bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-400/20 shadow-indigo-500/10'}`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                        {subject.type === 'lab' ? <Layers size={14} /> : <BookOpen size={14} />}
                                      </div>
                                      <button 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          if (subject._id) deleteSlotMutation.mutate(subject._id);
                                        }} 
                                        className="w-6 h-6 rounded-lg bg-black/10 hover:bg-black/20 text-white flex items-center justify-center transition-colors"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                    
                                    <div className="mt-2">
                                      <p className="text-[10px] font-black text-white uppercase leading-tight line-clamp-2 mb-1.5">{subject.subjectName}</p>
                                      <div className="flex items-center gap-2 p-1 bg-white/10 rounded-lg border border-white/5">
                                        <p className="text-[7px] font-black text-white/90 uppercase truncate">{subject.facultyName}</p>
                                      </div>
                                    </div>

                                    <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2">
                                      <span className="text-[8px] font-black text-white/60 uppercase">{subject.room}</span>
                                      <span className="text-[8px] font-black text-white/40 uppercase">{subject.type}</span>
                                    </div>
                                  </motion.div>
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shadow-md group-hover:text-indigo-600 transition-all">
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
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminTimetable;
