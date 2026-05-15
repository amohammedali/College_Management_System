import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, Search, Filter, 
  Layers, ShieldAlert, Building2, Bookmark,
  ChevronRight, X, Trash2, Edit3, Save, 
  Upload, UserPlus, FileSpreadsheet, ListChecks, Target,
  Zap, Info, Sparkles, BookMarked, Download,
  CheckCircle2, AlertTriangle, Clock, UserCheck
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { exportToCSV } from '../../../utils/export';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminSubjects = () => {
  const queryClient = useQueryClient();
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [activeRegulation, setActiveRegulation] = useState<string>('2023');

  const [assignData, setAssignData] = useState<{ facultyIds: string[] }>({ facultyIds: [] });

  const [formData, setFormData] = useState({
    name: '', code: '', department: '', semester: 1, 
    type: 'Theory', regulation: '2023',
    credits: { lecture: 3, tutorial: 0, practical: 0, total: 3 },
    marks: { internalMax: 20, modelMax: 80, universityMax: 100, passingMarks: 50 },
    syllabus: [
       { unit: 1, title: 'Introduction', topics: ['Basic concepts', 'Historical background'], hours: 8 },
       { unit: 2, title: 'Core Concepts', topics: ['Fundamental theories', 'Core principles'], hours: 10 },
    ]
  });

  // Fetch Stats
  const { data: stats } = useQuery({
    queryKey: ['admin-subject-stats', activeRegulation],
    queryFn: () => axios.get(`${API}/admin/subjects/stats?regulation=${activeRegulation}`).then(r => r.data),
  });

  // Fetch Departments (from new model)
  const { data: departments } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => axios.get(`${API}/admin/departments`).then(r => r.data),
  });

  // Fetch Subjects
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['admin-subjects', selectedDept, semesterFilter, activeRegulation],
    queryFn: () => {
       let url = `${API}/admin/subjects?regulation=${activeRegulation}&`;
       if (selectedDept) url += `department=${selectedDept}&`;
       if (semesterFilter !== 'all') url += `semester=${semesterFilter}&`;
       return axios.get(url).then(r => r.data);
    },
    enabled: !!selectedDept
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/admin/subjects`, data),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-subjects'] });
       queryClient.invalidateQueries({ queryKey: ['admin-subject-stats'] });
       setShowAddModal(false);
    }
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, data }: any) => axios.put(`${API}/admin/subjects/assign/${id}`, data),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-subjects'] });
       setShowAssignModal(false);
       setAssignData({ facultyIds: [] });
    },
    onError: (err: any) => {
       alert(err.response?.data?.message || "Error assigning faculty");
    }
  });

  const { data: faculty } = useQuery({
    queryKey: ['admin-staff-list'],
    queryFn: () => axios.get(`${API}/admin/staff`).then(r => r.data),
  });

  const handleLTPCChange = (field: string, val: number) => {
     const newCredits = { ...formData.credits, [field]: val };
     newCredits.total = newCredits.lecture + newCredits.tutorial + newCredits.practical;
     setFormData({ ...formData, credits: newCredits });
  };

  return (
    <DashboardLayout title="Curriculum Orchestration" subtitle="Manage Institutional Syllabus, Credit Frameworks & Faculty Mapping">
      <div className="max-w-7xl mx-auto pb-32">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
           {/* High-Level Stats */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Subjects', value: Array.isArray(stats) ? stats.reduce((acc: number, curr: any) => acc + curr.count, 0) : 0, icon: BookOpen, color: 'indigo' },
                { label: 'Pending Approval', value: Array.isArray(stats) ? stats.reduce((acc: number, curr: any) => acc + curr.pending, 0) : 0, icon: ShieldAlert, color: 'amber' },
                { label: 'Active Depts', value: departments?.length || 0, icon: Building2, color: 'purple' },
                { label: 'System Regulation', value: activeRegulation, icon: Bookmark, color: 'emerald', isSelect: true }
              ].map((stat, i) => (
                <div key={i} className="dash-card p-6 flex items-center gap-4 group">
                   <div className={`p-3 bg-slate-50 text-slate-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all`}>
                      <stat.icon size={24} />
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">{stat.label}</p>
                      {stat.isSelect ? (
                         <select 
                           value={activeRegulation} onChange={e => setActiveRegulation(e.target.value)}
                           className="text-sm font-black text-slate-800 bg-transparent outline-none cursor-pointer italic"
                         >
                            <option value="2025">Regulation 2025</option>
                            <option value="2023">Regulation 2023</option>
                            <option value="2021">Regulation 2021</option>
                         </select>
                      ) : (
                         <p className="text-xl font-black text-slate-800 italic">{stat.value}</p>
                      )}
                   </div>
                </div>
              ))}
           </div>

           {/* Main Orchestration Grid */}
           <div className="grid grid-cols-12 gap-8">
              
              {/* Left: Department List */}
              <div className="col-span-12 lg:col-span-4 space-y-4">
                 <div className="flex items-center justify-between mb-2 px-2">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Departmental Hub</h3>
                    <Sparkles size={16} className="text-indigo-600" />
                 </div>
                 <div className="space-y-3">
                    {departments?.map((dept: any) => (
                       <button 
                         key={dept._id} onClick={() => setSelectedDept(dept.name)}
                         className={`w-full p-6 rounded-3xl text-left transition-all border flex items-center justify-between group ${selectedDept === dept.name ? 'bg-slate-900 border-slate-900 shadow-2xl shadow-slate-900/20 translate-x-2' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                       >
                          <div>
                             <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedDept === dept.name ? 'text-indigo-400' : 'text-slate-400'}`}>{dept.code}</p>
                             <h4 className={`text-sm font-black italic ${selectedDept === dept.name ? 'text-white' : 'text-slate-800'}`}>{dept.name}</h4>
                          </div>
                          <div className={`p-2 rounded-xl transition-all ${selectedDept === dept.name ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-300 group-hover:text-indigo-600'}`}>
                             <ChevronRight size={18} />
                          </div>
                       </button>
                    ))}
                 </div>
              </div>

              {/* Right: Subject Management */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                 {selectedDept ? (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                       <div className="dash-card p-8 bg-white border-none shadow-xl shadow-slate-200/50">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                             <div>
                                <h3 className="text-xl font-black text-slate-800 italic">{selectedDept}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Curriculum Master List • {activeRegulation}</p>
                             </div>
                             <div className="flex items-center gap-4">
                                <button 
                                  onClick={() => exportToCSV(subjects || [], `${selectedDept}_Subjects`)}
                                  className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                                >
                                   <Download size={16} /> Export Registry
                                </button>
                                <button 
                                  onClick={() => setShowAddModal(true)}
                                  className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-lg"
                                >
                                   <Plus size={18} /> <span className="font-bold text-sm">Add Subject</span>
                                </button>
                             </div>
                          </div>

                          {/* Search & Filter Bar */}
                          <div className="flex flex-col md:flex-row gap-4 mb-8">
                             <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                <input 
                                  type="text" placeholder="Quick search by code or name..."
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm"
                                />
                             </div>
                             <div className="flex gap-4">
                                <select className="px-6 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-600">
                                   <option>All Types</option>
                                   <option>Theory</option>
                                   <option>Lab</option>
                                   <option>Elective</option>
                                </select>
                             </div>
                          </div>

                          {/* Semester Tabs */}
                          <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar">
                             {['all', 1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                <button 
                                  key={sem} onClick={() => setSemesterFilter(sem.toString())}
                                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${semesterFilter === sem.toString() ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                >
                                   {sem === 'all' ? 'All Semesters' : `Semester ${sem}`}
                                </button>
                             ))}
                          </div>

                          <div className="space-y-4">
                             {subjectsLoading ? (
                                <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto" /></div>
                             ) : subjects?.map((sub: any, i: number) => (
                                <div 
                                   key={sub._id} 
                                   onClick={() => { setSelectedSubject(sub); setShowAssignModal(true); }}
                                   className="p-6 bg-slate-50 rounded-3xl flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer"
                                >
                                   <div className="flex items-center gap-6">
                                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm italic transition-all group-hover:scale-110 ${sub.type === 'Theory' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                         {sub.code}
                                      </div>
                                      <div>
                                         <h4 className="text-sm font-black text-slate-800">{sub.name}</h4>
                                         <div className="flex items-center gap-3 mt-1">
                                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-1">
                                                Faculty: {sub.faculties?.length > 0 
                                                   ? sub.faculties.map((f: any) => f.name).join(' & ') 
                                                   : 'Unassigned'}
                                             </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{sub.type}</span>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-8">
                                      <div className="text-right">
                                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Credits</p>
                                         <span className="text-sm font-black text-slate-800">{sub.credits?.total}</span>
                                      </div>
                                      <div className="p-3 bg-white text-slate-300 rounded-2xl group-hover:text-indigo-600 transition-all">
                                         <UserPlus size={18} />
                                      </div>
                                   </div>
                                </div>
                             ))}
                             {subjects?.length === 0 && (
                                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[40px]">
                                   <BookMarked className="mx-auto text-slate-200 mb-6" size={48} />
                                   <h4 className="text-lg font-black text-slate-400 italic">No Subjects Provisioned</h4>
                                   <p className="text-xs font-medium text-slate-400 mt-2">Start building the curriculum for {selectedDept}.</p>
                                </div>
                             )}
                          </div>
                       </div>
                    </motion.div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center p-20 dash-card border-dashed bg-slate-50/30">
                       <div className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center mb-8 text-slate-200">
                          <Layers size={48} />
                       </div>
                       <h3 className="text-2xl font-black text-slate-800 italic">Curriculum Control</h3>
                       <p className="text-sm font-medium text-slate-500 mt-2 text-center max-w-sm leading-relaxed">Select a department from the left panel to begin managing subject versions, credit hours, and syllabus mapping.</p>
                    </div>
                 )}
              </div>
           </div>
        </motion.div>

        {/* Add Subject Modal */}
        <AnimatePresence>
           {showAddModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-4xl bg-white rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                    <div className="p-12">
                       <div className="flex justify-between items-center mb-12">
                          <div>
                             <h3 className="text-3xl font-black text-slate-800 italic">Subject Provisioning</h3>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Curriculum Framework • {selectedDept}</p>
                          </div>
                          <button onClick={() => setShowAddModal(false)} className="w-14 h-14 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all"><X size={24} /></button>
                       </div>

                       <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...formData, department: selectedDept }); }} className="space-y-12">
                          {/* Step 1: Core Info */}
                          <div className="space-y-6">
                             <div className="flex items-center gap-3 text-indigo-600 mb-6">
                                <Info size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Basic Schema</span>
                             </div>
                             <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Name</label>
                                   <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Code (Auto-generated)</label>
                                   <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all uppercase" />
                                </div>
                             </div>
                             <div className="grid grid-cols-3 gap-8">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                                   <select value={formData.semester} onChange={e => setFormData({...formData, semester: Number(e.target.value)})} className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all">
                                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                   </select>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Type</label>
                                   <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all">
                                      <option value="Theory">Theory</option>
                                      <option value="Lab/Practical">Lab / Practical</option>
                                      <option value="Elective">Elective</option>
                                      <option value="Project">Project</option>
                                   </select>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Regulation</label>
                                   <select value={formData.regulation} onChange={e => setFormData({...formData, regulation: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all">
                                      <option value="2023">Regulation 2023</option>
                                      <option value="2021">Regulation 2021</option>
                                      <option value="2025">Regulation 2025</option>
                                   </select>
                                </div>
                             </div>
                          </div>

                          {/* Step 2: L-T-P-C Structure */}
                          <div className="space-y-6">
                             <div className="flex items-center gap-3 text-indigo-600 mb-6">
                                <Clock size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">L-T-P-C Framework</span>
                             </div>
                             <div className="grid grid-cols-4 gap-6">
                                {['lecture', 'tutorial', 'practical'].map(field => (
                                   <div key={field} className="space-y-2">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 capitalize">{field} Hours</label>
                                      <input 
                                        type="number" value={(formData.credits as any)[field]} 
                                        onChange={e => handleLTPCChange(field, Number(e.target.value))}
                                        className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none" 
                                      />
                                   </div>
                                ))}
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Total Credits</label>
                                   <div className="w-full px-8 py-5 bg-indigo-50 border border-indigo-100 rounded-[24px] text-sm font-black text-indigo-600">{formData.credits.total}</div>
                                </div>
                             </div>
                          </div>

                          {/* Step 3: Mark Schema */}
                          <div className="space-y-6">
                             <div className="flex items-center gap-3 text-indigo-600 mb-6">
                                <Target size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Assessment Schema</span>
                             </div>
                             <div className="grid grid-cols-4 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internals Max</label>
                                   <input type="number" value={formData.marks.internalMax} onChange={e => setFormData({...formData, marks: {...formData.marks, internalMax: Number(e.target.value)}})} className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-[24px] text-sm font-bold" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Model Max</label>
                                   <input type="number" value={formData.marks.modelMax} onChange={e => setFormData({...formData, marks: {...formData.marks, modelMax: Number(e.target.value)}})} className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-[24px] text-sm font-bold" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Univ Max</label>
                                   <input type="number" value={formData.marks.universityMax} onChange={e => setFormData({...formData, marks: {...formData.marks, universityMax: Number(e.target.value)}})} className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-[24px] text-sm font-bold" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1">Passing Marks</label>
                                   <input type="number" value={formData.marks.passingMarks} onChange={e => setFormData({...formData, marks: {...formData.marks, passingMarks: Number(e.target.value)}})} className="w-full px-8 py-5 bg-rose-50 border border-rose-100 rounded-[24px] text-sm font-black text-rose-600" />
                                </div>
                             </div>
                          </div>

                          <button 
                            type="submit" disabled={createMutation.isPending}
                            className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-900/30 flex items-center justify-center gap-4"
                          >
                             <CheckCircle2 size={20} /> Provision Subject Record
                          </button>
                       </form>
                    </div>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>

        {/* Assign Faculty Modal */}
        <AnimatePresence>
           {showAssignModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAssignModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden">
                    <div className="p-10">
                       <div className="flex justify-between items-center mb-10">
                          <div>
                             <h3 className="text-2xl font-black text-slate-800 italic">Faculty Mapping</h3>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{selectedSubject?.code} • {selectedSubject?.name}</p>
                          </div>
                          <button onClick={() => setShowAssignModal(false)} className="p-3 text-slate-400 hover:text-rose-600 transition-all"><X size={24} /></button>
                       </div>

                       <div className="space-y-8">
                          <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Faculty Team</label>
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                {assignData.facultyIds.map((fId: string) => {
                                  const staff = faculty?.find((s: any) => s._id === fId);
                                  return (
                                    <div key={fId} className="px-3 py-2 bg-indigo-600 text-white rounded-xl flex items-center gap-3 shadow-lg shadow-indigo-600/20">
                                      <span className="text-[10px] font-black uppercase tracking-tight">{staff?.name}</span>
                                      <button onClick={() => setAssignData({...assignData, facultyIds: assignData.facultyIds.filter((id: string) => id !== fId) })} className="hover:text-rose-200 transition-colors">
                                        <X size={14} />
                                      </button>
                                    </div>
                                  );
                                })}
                                {assignData.facultyIds.length === 0 && <p className="text-[10px] font-medium text-slate-300 italic px-2">No staff selected yet.</p>}
                              </div>

                              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto no-scrollbar border border-slate-50 rounded-2xl p-2 bg-slate-50/30">
                                {faculty?.map((f: any) => {
                                   const isSelected = assignData.facultyIds.includes(f._id);
                                   return (
                                     <button 
                                       key={f._id} 
                                       onClick={() => {
                                         if (isSelected) setAssignData({...assignData, facultyIds: assignData.facultyIds.filter((id: string) => id !== f._id) });
                                         else setAssignData({...assignData, facultyIds: [...assignData.facultyIds, f._id] });
                                       }}
                                       className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${isSelected ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-600/10' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                                     >
                                        <div className="flex items-center gap-4">
                                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{f.name.charAt(0)}</div>
                                           <div>
                                              <p className="text-[11px] font-black text-slate-800">{f.name}</p>
                                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{f.department} • {f.staffId}</p>
                                           </div>
                                        </div>
                                        {isSelected && <div className="text-indigo-600"><CheckCircle2 size={16} /></div>}
                                     </button>
                                   );
                                })}
                              </div>
                           </div>

                           <button 
                             onClick={() => assignMutation.mutate({ id: selectedSubject?._id, data: assignData })}
                             disabled={assignMutation.isPending || assignData.facultyIds.length === 0}
                             className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-900/20 flex items-center justify-center gap-3"
                           >
                              {assignMutation.isPending ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                              Provision Team Assignment
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

export default AdminSubjects;
