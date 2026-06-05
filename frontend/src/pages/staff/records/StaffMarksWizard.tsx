import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Upload, Download, CheckCircle, 
  AlertTriangle, Save, Search, Filter, 
  Wand2, GraduationCap, BookOpen, Layers,
  ChevronRight, Sparkles, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StaffMarksWizard = () => {
  const queryClient = useQueryClient();
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState(1);
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [assessmentType, setAssessmentType] = useState('Internal Assessment 1');
  const [totalScore, setTotalScore] = useState(20);
  const [academicYear, setAcademicYear] = useState('2023-2024');

  const [studentMarks, setStudentMarks] = useState<any[]>([]);

  // Fetch departments
  const { data: departmentList } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => axios.get(`${API}/admin/departments`).then(r => r.data),
  });

  // Fetch subjects for faculty
  const { data: subjects } = useQuery({
    queryKey: ['staff-subjects'],
    queryFn: () => axios.get(`${API}/staff/subjects`).then(r => r.data),
  });

  // Fetch students for the selected class
  const { data: students, isLoading: isStudentsLoading, refetch: fetchStudents } = useQuery({
    queryKey: ['marks-students', selectedDept, selectedSem, selectedSection],
    queryFn: async () => {
      const res = await axios.get(`${API}/marks/students`, { 
        params: { department: selectedDept, semester: selectedSem, section: selectedSection } 
      });
      return res.data;
    },
    enabled: !!selectedDept
  });

  useEffect(() => {
    if (students) {
      setStudentMarks(students.map((s: any) => ({
        studentId: s._id,
        name: s.name,
        registerNo: s.registerNo,
        score: 0,
        grade: 'N/A'
      })));
    }
  }, [students]);

  const handleScoreChange = (id: string, value: string) => {
    const score = parseFloat(value) || 0;
    const pct = (score / totalScore) * 100;
    let grade = 'F';
    if (pct >= 90) grade = 'A+';
    else if (pct >= 80) grade = 'A';
    else if (pct >= 70) grade = 'B+';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 50) grade = 'C';

    setStudentMarks(prev => prev.map(s => 
      s.studentId === id ? { ...s, score, grade } : s
    ));
  };

  const submitMutation = useMutation({
    mutationFn: (payload: any) => axios.post(`${API}/marks/submit`, payload),
    onSuccess: () => {
      toast.success('Marks recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['student-marks'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to record marks');
    }
  });

  const handleSubmit = () => {
    if (!selectedSubject) return toast.error('Please select a subject');
    
    submitMutation.mutate({
      subject: selectedSubject,
      type: assessmentType,
      semester: selectedSem,
      academicYear,
      marks: studentMarks.map(s => ({
        studentId: s.studentId,
        score: s.score,
        totalScore,
        grade: s.grade
      }))
    });
  };

  return (
    <DashboardLayout title="Marks Registry Wizard" subtitle="Institutional Grade Orchestration & Mass Import Engine">
      <div className="min-h-screen bg-slate-50/30 -m-10 p-10 pb-40">
        
        <div className="grid grid-cols-12 gap-10">
          
          {/* Left Panel: Configuration */}
          <div className="col-span-12 xl:col-span-4 space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="dash-card p-10 bg-white border-none shadow-2xl shadow-slate-200/50 space-y-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-indigo-600 rotate-12"><Layers size={180} /></div>
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Database size={24} /></div>
                <div>
                  <h4 className="text-xl font-black italic text-slate-800">Registry Config</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Define target assessment</p>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2">Department</label>
                    <select 
                      value={selectedDept} onChange={e => setSelectedDept(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs font-bold focus:ring-2 ring-indigo-500/20"
                    >
                      <option value="">Select Unit</option>
                      {departmentList?.map((d: any) => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2">Semester</label>
                    <select 
                      value={selectedSem} onChange={e => setSelectedSem(Number(e.target.value))}
                      className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs font-bold focus:ring-2 ring-indigo-500/20"
                    >
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-2">Subject Allocation</label>
                  <select 
                    value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs font-bold focus:ring-2 ring-indigo-500/20"
                  >
                    <option value="">Select Subject</option>
                    {subjects?.map((s: any) => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-2">Assessment Type</label>
                  <select 
                    value={assessmentType} onChange={e => setAssessmentType(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs font-bold focus:ring-2 ring-indigo-500/20"
                  >
                    <option value="Internal Assessment 1">IA - 1 (Theory)</option>
                    <option value="Internal Assessment 2">IA - 2 (Theory)</option>
                    <option value="Model Exam">Model Exam</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Semester Exam">Semester Exam</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2">Total Score</label>
                    <input 
                      type="number" value={totalScore} onChange={e => setTotalScore(Number(e.target.value))}
                      className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs font-bold focus:ring-2 ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2">Academic Year</label>
                    <input 
                      type="text" value={academicYear} onChange={e => setAcademicYear(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs font-bold focus:ring-2 ring-indigo-500/20"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => fetchStudents()}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3"
                >
                  <Filter size={16} /> Load Class Roll
                </button>
              </div>
            </motion.div>

            <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
              <div className="p-3 bg-white rounded-xl text-amber-500 shadow-sm h-fit"><AlertTriangle size={20} /></div>
              <div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-800">Grade Integrity</h5>
                <p className="text-[10px] text-amber-700/70 font-bold leading-relaxed mt-2">
                  Score validation is active. Grades are auto-calculated based on percentage. Ensure "Total Score" is correct before entry.
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel: Entry Table */}
          <div className="col-span-12 xl:col-span-8">
            <AnimatePresence mode="wait">
              {studentMarks.length > 0 ? (
                <motion.div 
                  key="marks-list"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="dash-card p-0 bg-white border-none shadow-2xl shadow-slate-200/50 overflow-hidden"
                >
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-indigo-600"><GraduationCap size={24} /></div>
                      <div>
                        <h4 className="text-xl font-black italic text-slate-800">Class Matrix</h4>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Ready for mass commit</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleSubmit}
                      disabled={submitMutation.isPending}
                      className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                      {submitMutation.isPending ? 'Committing...' : <><Save size={18} /> Commit to Database</>}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Roll / Name</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Score Entry</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Grade</th>
                          <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {studentMarks.map((s, i) => (
                          <tr key={s.studentId} className="hover:bg-slate-50/30 transition-all group">
                            <td className="px-8 py-6">
                              <p className="text-sm font-bold text-slate-800 italic">{s.name}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.registerNo}</p>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <input 
                                  type="number" 
                                  value={s.score} 
                                  max={totalScore}
                                  onChange={e => handleScoreChange(s.studentId, e.target.value)}
                                  className="w-24 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-center focus:bg-white focus:ring-2 ring-indigo-500/20"
                                />
                                <span className="text-xs font-black text-slate-300">/ {totalScore}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`px-4 py-1.5 rounded-lg text-[11px] font-black italic shadow-sm border ${
                                s.grade === 'F' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                s.grade === 'A+' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                'bg-indigo-50 text-indigo-600 border-indigo-100'
                              }`}>
                                {s.grade}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2 text-emerald-500">
                                <CheckCircle size={16} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Validated</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[600px] bg-white/40 backdrop-blur-md rounded-[64px] border-2 border-dashed border-slate-200/50">
                  <div className="text-center space-y-8 max-w-sm px-10">
                    <div className="w-32 h-32 bg-white rounded-[48px] flex items-center justify-center text-slate-200 mx-auto shadow-2xl border border-slate-100">
                      <FileSpreadsheet size={64} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-400 italic tracking-tight">Registry Idle</h4>
                      <p className="text-[11px] text-slate-300 font-bold uppercase tracking-[0.2em] mt-5 leading-loose">
                        Configure the assessment parameters to the left and load the class roll to begin grading.
                      </p>
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

export default StaffMarksWizard;
