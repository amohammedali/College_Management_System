import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Calendar, Clock, Users, Building2, 
  ChevronRight, Download, Plus, Search, Settings2,
  AlertCircle, CheckCircle2, X, Trash2, 
  Layers, Info, Sparkles, Printer,
  BookOpen, Bookmark
} from 'lucide-react';
import { 
  DndContext, 
  DragOverlay, 
  useSensor, 
  useSensors, 
  PointerSensor,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

// ── Components ─────────────────────────────────────────────

const DraggableSubject = ({ subject }: { subject: any }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `subject-${subject._id}`,
    data: subject
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} style={style} {...listeners} {...attributes}
      className={`p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all cursor-move ${isDragging ? 'opacity-50 ring-2 ring-indigo-500' : ''}`}
    >
       <div>
          <p className="text-[10px] font-black text-indigo-300">{subject.code}</p>
          <h5 className="text-xs font-bold truncate max-w-[120px]">{subject.name}</h5>
       </div>
       <div className="text-[9px] font-black bg-white/10 px-2 py-1 rounded-md">{subject.type[0]}</div>
    </div>
  );
};

const DroppableCell = ({ day, period, children, isSelected, conflict, onClick }: any) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `cell-${day}-${period}`,
    data: { day, period }
  });

  return (
    <td 
      ref={setNodeRef}
      onClick={onClick}
      className={`p-1 border border-slate-100 min-w-[120px] h-32 transition-all cursor-pointer relative group 
        ${isSelected ? 'ring-2 ring-inset ring-indigo-600 bg-indigo-50/30' : ''}
        ${isOver ? 'bg-indigo-100/50' : 'hover:bg-slate-50/50'}
        ${conflict ? 'bg-rose-50' : ''}
      `}
    >
       {children}
    </td>
  );
};

// ── Main Page ──────────────────────────────────────────────

const TimetableBuilder = () => {
  const queryClient = useQueryClient();
  const [selectedDept, setSelectedDept] = useState('Computer Science');
  const [selectedSem, setSelectedSem] = useState(3);
  const [selectedSection, setSelectedSection] = useState('Section A');
  const [activeReg, setActiveReg] = useState('2023');
  
  const [selectedCell, setSelectedCell] = useState<{day: string, period: number} | null>(null);
  const [assignmentData, setAssignmentData] = useState({ facultyId: '', roomId: '', subjectId: '' });
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [activeDragItem, setActiveDragItem] = useState<any>(null);
  const [showAudit, setShowAudit] = useState(false);
  const [showClone, setShowClone] = useState(false);
  const [cloneTargetReg, setCloneTargetReg] = useState('2024');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Data Fetching
  const { data: departments } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => axios.get(`${API}/admin/departments`).then(r => r.data),
  });

  const { data: subjects } = useQuery({
    queryKey: ['dept-subjects', selectedDept, activeReg, selectedSem],
    queryFn: () => axios.get(`${API}/admin/subjects?department=${selectedDept}&regulation=${activeReg}&semester=${selectedSem}`).then(r => r.data),
    enabled: !!selectedDept
  });

  const { data: slots } = useQuery({
    queryKey: ['timetable-slots', selectedDept, selectedSem, selectedSection, activeReg],
    queryFn: () => {
      const d = departments?.find((d: any) => d.name === selectedDept);
      return axios.get(`${API}/timetable?dept_id=${d?._id}&section=${selectedSection}&regulation_year=${activeReg}`).then(r => r.data);
    },
    enabled: !!selectedDept && !!departments
  });

  const { data: resources } = useQuery({
    queryKey: ['available-resources', selectedCell?.day, selectedCell?.period],
    queryFn: () => axios.get(`${API}/timetable/faculty/available?day=${selectedCell?.day}&period=${selectedCell?.period}`).then(async (facultyRes) => {
      const roomRes = await axios.get(`${API}/timetable/rooms/available?day=${selectedCell?.day}&period=${selectedCell?.period}`);
      return { availableFaculty: facultyRes.data, availableRooms: roomRes.data };
    }),
    enabled: !!selectedCell
  });

  const { data: auditTrail } = useQuery({
    queryKey: ['timetable-audit', selectedDept, selectedSection, activeReg],
    queryFn: () => {
      const d = departments?.find((d: any) => d.name === selectedDept);
      return axios.get(`${API}/timetable/audit?dept_id=${d?._id}&section=${selectedSection}&regulation_year=${activeReg}`).then(r => r.data);
    },
    enabled: showAudit && !!selectedDept
  });

  const assignMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/timetable/slot`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-slots'] });
      setConflicts([]);
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        setConflicts([error.response.data]);
      } else {
        alert(error.response?.data?.message || 'Assignment failed');
      }
    }
  });

  const cloneMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/timetable/clone`, data),
    onSuccess: (res) => {
      alert(res.data.message);
      setShowClone(false);
      queryClient.invalidateQueries({ queryKey: ['timetable-slots'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/timetable/slot/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timetable-slots'] }),
  });

  // Derived Grid State
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

  if (!departments) return (
    <DashboardLayout title="Institutional Orchestrator" subtitle="Initializing Master Grid...">
       <div className="flex items-center justify-center h-[600px] bg-[#1e1e1e] rounded-[40px]">
          <div className="text-center space-y-4">
             <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Loading Departmental Data...</p>
          </div>
       </div>
    </DashboardLayout>
  );

  const handleManualAssign = () => {
    if (!selectedCell || !assignmentData.facultyId || !assignmentData.roomId || !assignmentData.subjectId) {
      alert('Please select a cell and all resources first.');
      return;
    }
    const d = departments?.find((d: any) => d.name === selectedDept);
    assignMutation.mutate({
      dept_id: d?._id,
      section: selectedSection,
      regulation_year: Number(activeReg),
      day: selectedCell.day,
      period: selectedCell.period,
      subject_id: assignmentData.subjectId,
      faculty_id: assignmentData.facultyId,
      room_id: assignmentData.roomId
    });
  };

  const handleDownloadPDF = async () => {
    const d = departments?.find((d: any) => d.name === selectedDept);
    window.open(`${API}/timetable/pdf?dept_id=${d?._id}&section=${selectedSection}&regulation_year=${activeReg}`, '_blank');
  };

  const handleClone = () => {
    const d = departments?.find((d: any) => d.name === selectedDept);
    cloneMutation.mutate({
      dept_id: d?._id,
      section: selectedSection,
      from_regulation: Number(activeReg),
      to_regulation: Number(cloneTargetReg)
    });
  };

  const pTimes: any = {
    1: '8:00', 2: '9:00', 3: '10:00', 4: '11:15', 5: '12:10', 6: '2:00', 7: '3:00', 8: '4:00'
  };

  return (
    <DashboardLayout title="Institutional Orchestrator" subtitle="Master Timetable & Resource Conflict Engine">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .dash-card { border: 1px solid #eee !important; box-shadow: none !important; margin: 0 !important; }
          body { background: white !important; }
          .orchestration-grid { width: 100% !important; margin: 0 !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          td { height: auto !important; padding: 10px !important; }
        }
      `}</style>

      <div className="bg-[#1e1e1e] text-[#e0e0e0] p-8 rounded-[40px] shadow-2xl space-y-8 font-sans">
        
        {/* Top Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 no-print">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[2px]">Dept</label>
              <select 
                value={selectedDept} onChange={e => setSelectedDept(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/5 rounded-2xl py-4 px-6 text-xs font-black outline-none appearance-none hover:border-white/10 transition-all"
              >
                 {departments?.map((d: any) => <option key={d._id} value={d.name}>{d.name}</option>)}
              </select>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[2px]">Year</label>
              <select 
                value={selectedSem} onChange={e => setSelectedSem(Number(e.target.value))}
                className="w-full bg-[#2a2a2a] border border-white/5 rounded-2xl py-4 px-6 text-xs font-black outline-none appearance-none"
              >
                 <option value="3">3rd Year</option>
                 <option value="4">4th Year</option>
              </select>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[2px]">Section</label>
              <select 
                value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/5 rounded-2xl py-4 px-6 text-xs font-black outline-none appearance-none"
              >
                 <option value="Section A">Section A</option>
                 <option value="Section B">Section B</option>
              </select>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[2px]">Regulation</label>
              <select 
                value={activeReg} onChange={e => setActiveReg(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/5 rounded-2xl py-4 px-6 text-xs font-black outline-none appearance-none"
              >
                 <option value="2023">2023</option>
                 <option value="2025">2025</option>
              </select>
           </div>
        </div>

        <div className="flex justify-between items-center no-print">
           <div className="flex gap-4 items-center">
              <span className="bg-[#1a2b4b] text-[#5c92ff] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/10">
                 {conflicts.length} conflicts
              </span>
              <button onClick={() => setShowAudit(true)} className="p-3 bg-[#2a2a2a] text-slate-400 rounded-xl hover:text-white transition-all"><Clock size={16} /></button>
              <button onClick={() => setShowClone(true)} className="px-4 py-2 bg-[#2a2a2a] text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Clone Cycle</button>
           </div>
           <div className="flex gap-4">
              <button className="bg-[#2a2a2a] border border-white/10 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#333] transition-all shadow-xl">Auto-schedule</button>
              <button onClick={handleDownloadPDF} className="bg-white text-slate-900 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl">Export PDF</button>
           </div>
        </div>

        {/* Main Orchestration Area */}
        <div className="grid grid-cols-12 gap-8">
           
           {/* Subject Pool */}
           <div className="col-span-12 lg:col-span-2 space-y-4 no-print">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-6 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> Subject Pool
              </h4>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                 {subjects?.map((sub: any) => (
                    <div key={sub._id} className="bg-[#2a2a2a] p-5 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all cursor-move shadow-lg">
                       <h5 className="text-[11px] font-black leading-tight mb-2 text-white">{sub.name}</h5>
                       <div className="flex justify-between items-center">
                          <p className="text-[8px] text-slate-400 font-bold uppercase">Dr. Meena</p>
                          <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded text-slate-500">{sub.credits?.total} CR</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Grid Matrix */}
           <div className="col-span-12 lg:col-span-7">
               <div className="bg-[#262626] rounded-[32px] overflow-hidden border border-white/5 shadow-2xl overflow-x-auto">
                  <table className="w-full border-collapse min-w-[1000px]">
                     <thead>
                        <tr className="bg-[#2a2a2a]">
                           <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-r border-white/5 w-24 sticky left-0 bg-[#2a2a2a] z-30">Day / Period</th>
                           {[1, 2, 3].map(p => (
                              <th key={p} className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                 <p className="text-white">P{p}</p>
                                 <p className="text-[8px] mt-1 opacity-50">{pTimes[p]}</p>
                              </th>
                           ))}
                           <th className="p-5 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5 bg-[#1a1a1a]">Break</th>
                           {[4, 5].map(p => (
                              <th key={p} className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                 <p className="text-white">P{p}</p>
                                 <p className="text-[8px] mt-1 opacity-50">{pTimes[p]}</p>
                              </th>
                           ))}
                           <th className="p-5 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5 bg-[#1a1a1a]">Lunch</th>
                           {[6, 7].map(p => (
                              <th key={p} className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                 <p className="text-white">P{p}</p>
                                 <p className="text-[8px] mt-1 opacity-50">{pTimes[p]}</p>
                              </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                           <tr key={day}>
                              <td className="p-5 bg-[#2a2a2a] border-b border-r border-white/5 text-center sticky left-0 z-20">
                                 <p className="text-[10px] font-black text-white uppercase tracking-widest">{day}</p>
                              </td>
                              {[1, 2, 3, 'break', 4, 5, 'lunch', 6, 7].map((p, idx) => {
                                 if (p === 'break' || p === 'lunch') {
                                    return (
                                       <td key={idx} className="p-1.5 border-b border-white/5 bg-[#1a1a1a]/30">
                                          <div className="w-full h-full flex items-center justify-center">
                                             <div className="rotate-90 text-[9px] font-black text-slate-700 uppercase tracking-[4px]">{p}</div>
                                          </div>
                                       </td>
                                    );
                                 }

                                 const period = p as number;
                                 const slot = grid[day][period];
                                 const isSelected = selectedCell?.day === day && selectedCell?.period === period;
                                 const conflict = conflicts.find(c => c.day === day && c.period === period);

                                 return (
                                    <td 
                                      key={period} 
                                      onClick={() => setSelectedCell({ day, period })}
                                      className={`p-1.5 border-b border-white/5 min-w-[140px] h-32 transition-all cursor-pointer relative group
                                        ${isSelected ? 'bg-indigo-500/10' : ''}
                                        ${conflict ? 'bg-rose-500/10' : ''}
                                      `}
                                    >
                                       {isSelected && <div className="absolute inset-0 ring-2 ring-indigo-500/50 rounded-lg z-10" />}
                                       {conflict && <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 z-20 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />}
                                       
                                       {slot ? (
                                          <div className="w-full h-full p-3 bg-[#2d2d2d] rounded-2xl border border-white/5 flex flex-col justify-between shadow-lg group-hover:bg-[#333] transition-all">
                                             <div>
                                                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter mb-1">{slot.subject_id?.code}</p>
                                                <h6 className="text-[10px] font-black text-white leading-tight line-clamp-2">{slot.subject_id?.name}</h6>
                                             </div>
                                             <div className="mt-2 pt-2 border-t border-white/5">
                                                <span className="text-[8px] font-bold text-slate-400 block truncate">{slot.faculty_id?.name}</span>
                                                <div className="flex items-center gap-1 mt-1">
                                                   <Building2 size={8} className="text-slate-500" />
                                                   <span className="text-[8px] font-bold text-slate-500 block uppercase">{slot.room_id?.name}</span>
                                                </div>
                                             </div>
                                          </div>
                                       ) : conflict ? (
                                          <div className="w-full h-full flex flex-col p-3 bg-rose-500/5 rounded-2xl">
                                             <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-1 animate-pulse">Conflict</p>
                                             <span className="text-[10px] font-black text-rose-300">{conflict.type.toUpperCase()}</span>
                                             <span className="text-[8px] font-bold text-rose-300/60 mt-auto leading-tight">{conflict.message}</span>
                                          </div>
                                       ) : (
                                          <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all no-print">
                                             <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-white/20"><Plus size={16} /></div>
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

           {/* Assign Slot Sidebar */}
           <div className="col-span-12 lg:col-span-3 space-y-8 no-print">
              <div className="bg-[#262626] p-8 rounded-[32px] border border-white/5 space-y-8 shadow-2xl">
                 <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] mb-2">Assign Slot</h4>
                    <div className="h-1 w-12 bg-indigo-500 rounded-full" />
                 </div>

                 <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target</p>
                    <p className="text-sm font-black text-white">{selectedCell ? `${selectedCell.day} ${pTimes[selectedCell.period]} Period` : 'Select cell...'}</p>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject</label>
                       <select 
                         value={assignmentData.subjectId} onChange={e => setAssignmentData({...assignmentData, subjectId: e.target.value})}
                         className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl py-4 px-6 text-xs font-black outline-none appearance-none text-slate-200 hover:border-white/10 transition-all"
                       >
                          <option value="">— select —</option>
                          {subjects?.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Faculty</label>
                       <select 
                         value={assignmentData.facultyId} onChange={e => setAssignmentData({...assignmentData, facultyId: e.target.value})}
                         className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl py-4 px-6 text-xs font-black outline-none appearance-none text-slate-200 hover:border-white/10 transition-all"
                       >
                          <option value="">— select —</option>
                          {resources?.availableFaculty?.map((f: any) => <option key={f._id} value={f._id}>{f.name}</option>)}
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Room</label>
                       <select 
                         value={assignmentData.roomId} onChange={e => setAssignmentData({...assignmentData, roomId: e.target.value})}
                         className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl py-4 px-6 text-xs font-black outline-none appearance-none text-slate-200 hover:border-white/10 transition-all"
                       >
                          <option value="">— select —</option>
                          {resources?.availableRooms?.map((r: any) => <option key={r._id} value={r._id}>{r.name} ({r.type})</option>)}
                       </select>
                    </div>

                    <button 
                      onClick={handleManualAssign}
                      disabled={assignMutation.isPending}
                      className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all mt-4 shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                    >
                       {assignMutation.isPending ? 'Processing...' : 'Assign slot'}
                    </button>
                 </div>
              </div>

              <div className="bg-[#262626] p-8 rounded-[32px] border border-white/5 shadow-2xl">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] mb-6">Legend</h4>
                 <div className="space-y-4">
                    <div className="flex items-center gap-4 group">
                       <div className="w-5 h-5 bg-[#2d2d2d] border border-white/10 rounded-lg group-hover:border-indigo-500/50 transition-all" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-all">Assigned</span>
                    </div>
                    <div className="flex items-center gap-4 group">
                       <div className="w-5 h-5 bg-rose-500/20 border border-rose-500/30 rounded-lg" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-rose-400 transition-all">Conflict</span>
                    </div>
                    <div className="flex items-center gap-4 group">
                       <div className="w-5 h-5 bg-[#1e1e1e] border border-white/5 rounded-lg border-dashed" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-all">Empty</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Audit Trail Drawer */}
        <AnimatePresence>
           {showAudit && (
              <>
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAudit(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]" />
                 <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 20 }} className="fixed inset-y-0 right-0 w-[450px] bg-[#1a1a1a] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-[200] border-l border-white/5 overflow-y-auto">
                    <div className="p-10 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#1a1a1a]/80 backdrop-blur-2xl">
                       <div>
                          <h4 className="text-2xl font-black text-white italic">Audit Log</h4>
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Registry Compliance Trail</p>
                       </div>
                       <button onClick={() => setShowAudit(false)} className="p-4 bg-white/5 text-slate-400 rounded-2xl hover:text-rose-500 transition-all"><X size={20} /></button>
                    </div>
                    <div className="p-10 space-y-8">
                       {auditTrail?.length > 0 ? auditTrail.map((log: any, idx: number) => (
                          <div key={idx} className="relative pl-8 border-l-2 border-white/5">
                             <div className="absolute -left-[9px] top-0 w-4 h-4 bg-indigo-600 rounded-full border-4 border-[#1a1a1a] shadow-[0_0_15px_rgba(79,70,229,0.4)]" />
                             <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                   <span className="text-[10px] font-black text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded">{log.action}</span>
                                   <span className="text-[9px] font-bold text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-sm font-black text-slate-200 leading-snug">{log.details}</p>
                                <div className="flex items-center gap-2 pt-1">
                                   <div className="w-4 h-4 bg-slate-700 rounded-full" />
                                   <p className="text-[10px] font-black text-slate-500 uppercase">Actor: {log.user?.name}</p>
                                </div>
                             </div>
                          </div>
                       )) : (
                          <div className="py-20 text-center space-y-4">
                             <Clock size={48} className="text-slate-800 mx-auto" />
                             <p className="text-[10px] font-black text-slate-600 uppercase">No audit events recorded for this cycle.</p>
                          </div>
                       )}
                    </div>
                 </motion.div>
              </>
           )}
        </AnimatePresence>

        {/* Regulation Clone Modal */}
        <AnimatePresence>
           {showClone && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-8">
                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#222] rounded-[48px] p-16 max-w-lg w-full shadow-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                    <div className="text-center mb-12">
                       <div className="w-24 h-24 bg-indigo-500/10 text-indigo-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/20">
                          <Layers size={40} />
                       </div>
                       <h3 className="text-3xl font-black text-white italic">Curriculum Sync</h3>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] mt-3">Replicate Master Cycle R{activeReg}</p>
                    </div>
                    <div className="space-y-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Regulation Year</label>
                          <select value={cloneTargetReg} onChange={e => setCloneTargetReg(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/5 rounded-3xl py-5 px-8 text-sm font-black outline-none appearance-none text-white focus:ring-2 focus:ring-indigo-500 transition-all">
                             {['2023', '2024', '2025'].filter(r => r !== activeReg).map(r => <option key={r} value={r}>R{r} Regulation Cycle</option>)}
                          </select>
                       </div>
                       <div className="p-8 bg-rose-500/5 rounded-[32px] border border-rose-500/10 flex items-start gap-4">
                          <AlertCircle size={20} className="text-rose-500 shrink-0" />
                          <p className="text-[11px] font-black text-rose-300 uppercase leading-relaxed tracking-tighter">
                             CRITICAL: Cloned data will overwrite all existing slots in R{cloneTargetReg} for {selectedDept}. This action is irreversible.
                          </p>
                       </div>
                       <div className="flex gap-6 pt-4">
                          <button onClick={() => setShowClone(false)} className="flex-1 py-5 text-slate-500 text-[10px] font-black uppercase hover:text-white transition-all">Abort Sync</button>
                          <button onClick={handleClone} disabled={cloneMutation.isPending} className="flex-1 py-5 bg-white text-slate-900 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl">
                             {cloneMutation.isPending ? 'Syncing...' : 'Confirm Sync'}
                          </button>
                       </div>
                    </div>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default TimetableBuilder;
