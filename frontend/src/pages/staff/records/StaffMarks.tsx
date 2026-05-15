import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Award, CheckCircle2, ChevronRight, Filter, Search, 
  Save, AlertCircle, TrendingUp, Users, BookOpen,
  PieChart, BarChart2, Info, ArrowLeft, RefreshCw,
  Target, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StaffMarks = () => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [assessmentType, setAssessmentType] = useState('Internal Assessment 1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [marksData, setMarksData] = useState<any[]>([]);

  // 1. Fetch Staff Profile (to get their assigned subjects)
  const { data: profile } = useQuery({
    queryKey: ['staff-profile'],
    queryFn: () => axios.get(`${API}/staff/profile`).then(r => r.data),
  });

  // 2. Fetch Subjects Assigned to this Staff
  const { data: mySubjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['staff-assigned-subjects'],
    queryFn: () => axios.get(`${API}/staff/subjects`).then(r => r.data.filter((s: any) => s.faculty?._id === profile?._id)),
    enabled: !!profile
  });

  // 3. Fetch Students for the selected class (based on subject's year/dept)
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['class-students', selectedSubject?.department, selectedSubject?.semester],
    queryFn: () => axios.get(`${API}/admin/students?department=${selectedSubject.department}&year=${selectedSubject.semester}st Year`).then(r => r.data),
    enabled: step === 2 && !!selectedSubject
  });

  const calculateGrade = (score: number, total: number) => {
    const pct = (score / total) * 100;
    if (pct >= 90) return 'S';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  };

  const initializeMarks = () => {
    if (students) {
      setMarksData(students.map((s: any) => ({
        studentId: s._id,
        name: s.name,
        regNo: s.studentId,
        score: 0,
        grade: 'F'
      })));
      setStep(2);
    }
  };

  const handleScoreChange = (index: number, score: number) => {
    const maxMark = selectedSubject?.marks?.internal || 40;
    const cleanScore = Math.min(Math.max(0, score), maxMark);
    
    const updated = [...marksData];
    updated[index].score = cleanScore;
    updated[index].grade = calculateGrade(cleanScore, maxMark);
    setMarksData(updated);
  };

  const bulkMarksMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/staff/marks/bulk`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-marks'] });
      setStep(3);
    },
  });

  const submitMarks = () => {
    const payload = {
      subject: selectedSubject._id,
      type: assessmentType,
      semester: selectedSubject.semester,
      academicYear,
      marks: marksData.map(m => ({
        studentId: m.studentId,
        score: m.score,
        grade: m.grade,
        totalScore: selectedSubject.marks?.internal || 40
      }))
    };
    bulkMarksMutation.mutate(payload);
  };

  return (
    <DashboardLayout title="Performance Audit" subtitle="Institutional Examination Governance, Grade Mapping & Merit Analysis">
      <div className="max-w-6xl mx-auto pb-20">
        
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-12">
           <div className="flex items-center gap-4 bg-white p-2 rounded-[32px] border border-slate-100 shadow-sm">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`flex items-center gap-3 px-6 py-3 rounded-[24px] transition-all ${step === s ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-slate-400'}`}>
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] border ${step === s ? 'border-white/20 bg-white/10' : 'border-slate-200'}`}>{s}</div>
                   <span className="text-[10px] font-black uppercase tracking-widest">{s === 1 ? 'Configuration' : s === 2 ? 'Audit Entry' : 'Finalized'}</span>
                </div>
              ))}
           </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8"
            >
              {/* Configuration Panel */}
              <div className="md:col-span-8 space-y-8">
                 <div className="dash-card p-10">
                    <h3 className="text-lg font-black text-slate-800 italic mb-8 flex items-center gap-3">
                       <Target className="text-indigo-600" /> Assessment Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Subject Selection</label>
                          <select className="form-input" value={selectedSubject?._id || ''} onChange={e => setSelectedSubject(mySubjects?.find((s: any) => s._id === e.target.value))}>
                             <option value="">Select Target Subject</option>
                             {mySubjects?.map((s: any) => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Assessment Cycle</label>
                          <select className="form-input" value={assessmentType} onChange={e => setAssessmentType(e.target.value)}>
                             <option value="Internal Assessment 1">Internal Assessment 1</option>
                             <option value="Internal Assessment 2">Internal Assessment 2</option>
                             <option value="Model Exam">Model Exam</option>
                             <option value="Semester Exam">Semester Exam</option>
                          </select>
                       </div>
                    </div>
                 </div>

                 {selectedSubject && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="dash-card p-10 bg-indigo-600 text-white border-none relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-10 opacity-10"><BookOpen size={160} /></div>
                       <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-8">
                             <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20"><Info size={24} /></div>
                             <div>
                                <h4 className="text-xl font-black italic">Curriculum Validation</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Automatic Policy Enforcement Active</p>
                             </div>
                          </div>
                          <div className="grid grid-cols-3 gap-8">
                             <div>
                                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Max Marks Allowed</p>
                                <p className="text-2xl font-black">{selectedSubject.marks?.internal || 40} Units</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Regulation</p>
                                <p className="text-2xl font-black">{selectedSubject.regulation}</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Target Semester</p>
                                <p className="text-2xl font-black">S{selectedSubject.semester}</p>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                 )}
              </div>

              {/* Action Sidebar */}
              <div className="md:col-span-4 space-y-6">
                 <div className="dash-card p-8 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[32px] flex items-center justify-center mb-6">
                       <GraduationCap size={40} />
                    </div>
                    <h4 className="font-black text-slate-800 mb-2">Initialize Student Roll</h4>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed mb-8">System will automatically fetch the latest enrollment list for {selectedSubject?.department || 'selected department'}.</p>
                    <button 
                      disabled={!selectedSubject}
                      onClick={initializeMarks}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       Start Entry Wizard <ChevronRight size={16} />
                    </button>
                 </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <button onClick={() => setStep(1)} className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all">
                        <ArrowLeft size={20} />
                     </button>
                     <div>
                        <h2 className="text-xl font-black text-slate-800">{selectedSubject.name}</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{assessmentType} • {academicYear}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-3">
                        <TrendingUp size={18} />
                        <div>
                           <p className="text-[9px] font-black uppercase opacity-60">Class Average</p>
                           <p className="text-sm font-black">{(marksData.reduce((acc, curr) => acc + curr.score, 0) / marksData.length).toFixed(1)} / {selectedSubject.marks?.internal || 40}</p>
                        </div>
                     </div>
                     <button 
                       onClick={submitMarks}
                       disabled={bulkMarksMutation.isPending}
                       className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-3"
                     >
                        {bulkMarksMutation.isPending ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        Finalize Audit
                     </button>
                  </div>
               </div>

               <div className="dash-card overflow-hidden">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                           <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest w-1/3">Student Identity</th>
                           <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Registration No</th>
                           <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Score (Max: {selectedSubject.marks?.internal || 40})</th>
                           <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Auto Grade</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {marksData.map((student, idx) => (
                           <tr key={student.studentId} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-10 py-5">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs">
                                       {student.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="font-black text-slate-800">{student.name}</span>
                                 </div>
                              </td>
                              <td className="px-10 py-5 text-center font-black text-slate-400 text-xs uppercase tracking-widest">{student.regNo}</td>
                              <td className="px-10 py-5">
                                 <div className="flex justify-center">
                                    <input 
                                      type="number" 
                                      className="w-24 bg-white border border-slate-200 rounded-xl px-4 py-3 text-center font-black text-slate-800 focus:border-indigo-600 outline-none transition-all shadow-sm"
                                      value={student.score}
                                      onChange={(e) => handleScoreChange(idx, Number(e.target.value))}
                                    />
                                 </div>
                              </td>
                              <td className="px-10 py-5 text-center">
                                 <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${student.grade === 'F' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                    Grade {student.grade}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} 
              className="min-h-[50vh] flex items-center justify-center"
            >
               <div className="dash-card p-16 text-center max-w-md w-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                     <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 mb-4 italic">Audit Finalized!</h2>
                  <p className="text-slate-500 font-medium mb-10 leading-relaxed uppercase text-[10px] tracking-widest">Performance data has been synchronized with the institutional master ledger.</p>
                  <button 
                    onClick={() => { setStep(1); setSelectedSubject(null); }}
                    className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-900/20"
                  >
                     New Performance Audit
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default StaffMarks;
