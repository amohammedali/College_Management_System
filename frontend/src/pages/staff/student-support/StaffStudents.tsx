import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Search, Plus, Eye, Edit, Trash2, Filter, GraduationCap, X, Mail, MapPin,
  User, Shield, Phone, Building2, ChevronRight, CheckCircle2, UserPlus,
  Briefcase, Award, Users, Star, Linkedin, Github, ArrowLeft, ArrowRight, Save, Info, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StaffStudents = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isSuccess, setIsSuccess] = useState(false);

  const tabOrder = ['personal', 'academic', 'contact', 'placement', 'performance'];

  const handleNext = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  const { data: profile } = useQuery({
    queryKey: ['staff-profile'],
    queryFn: () => axios.get(`${API}/staff/profile`).then(r => r.data),
  });

  const { data: students, isLoading } = useQuery({
    queryKey: ['staff-students-list'],
    queryFn: () => axios.get(`${API}/staff/my-students`).then(r => r.data),
    enabled: !!profile,
  });

  const [formData, setFormData] = useState({
    name: '', email: '', password: 'password123', studentId: '', registerNumber: '',
    gender: 'Male', dateOfBirth: '', bloodGroup: '',
    department: '', year: '1st Year', section: '', batchYear: '',
    phone: '', address: '',
    parentDetails: { fatherName: '', motherName: '', parentPhone: '', occupation: '' },
    placementDetails: { skills: '', certifications: '', internships: '', preferredRole: '', linkedInProfile: '' },
    performance: { tenthPercentage: 0, eleventhPercentage: 0, twelfthPercentage: 0, admissionCutoff: 0, currentCGPA: 0 },
    achievements: '',
  });

  useEffect(() => {
    if (profile && !isEditMode && !isViewOnly) {
      setFormData(prev => ({ ...prev, department: profile.department, section: profile.assignedSection || '' }));
    }
  }, [profile, isEditMode, isViewOnly]);

  const enrollStudentMutation = useMutation({
    mutationFn: (newStudent: any) => axios.post(`${API}/staff/students`, newStudent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-students-list'] });
      setIsSuccess(true);
      // Removed auto-close to let user "wait and see"
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to enroll student');
    }
  });

  const updateStudentMutation = useMutation({
    mutationFn: (updatedData: any) => axios.put(`${API}/staff/students/${selectedStudentId}`, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-students-list'] });
      setIsSuccess(true);
      // Removed auto-close to let user "wait and see"
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update student');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '', email: '', password: 'password123', studentId: '', registerNumber: '',
      gender: 'Male', dateOfBirth: '', bloodGroup: '',
      department: profile?.department || '', year: '1st Year', section: profile?.assignedSection || '', batchYear: '',
      phone: '', address: '',
      parentDetails: { fatherName: '', motherName: '', parentPhone: '', occupation: '' },
      placementDetails: { skills: '', certifications: '', internships: '', preferredRole: '', linkedInProfile: '' },
      performance: { tenthPercentage: 0, eleventhPercentage: 0, twelfthPercentage: 0, admissionCutoff: 0, currentCGPA: 0 },
      achievements: '',
    });
    setIsEditMode(false);
    setIsViewOnly(false);
    setIsSuccess(false);
    setSelectedStudentId(null);
    setActiveTab('personal');
  };

  const handleEditClick = (student: any) => {
    resetForm();
    setIsEditMode(true);
    setIsViewOnly(false);
    setSelectedStudentId(student._id);
    populateFormData(student);
    setIsModalOpen(true);
    setActiveTab('personal');
  };

  const handleViewClick = (student: any) => {
    resetForm();
    setIsEditMode(false);
    setIsViewOnly(true);
    setSelectedStudentId(student._id);
    populateFormData(student);
    setIsModalOpen(true);
    setActiveTab('personal');
  };

  const populateFormData = (student: any) => {
    setFormData({
      ...student,
      parentDetails: { ...(student.parentDetails || { fatherName: '', motherName: '', parentPhone: '', occupation: '' }) },
      placementDetails: {
        ...(student.placementDetails || {}),
        skills: student.placementDetails?.skills?.join(', ') || '',
        certifications: student.placementDetails?.certifications?.join(', ') || '',
        internships: student.placementDetails?.internships?.join(', ') || '',
      },
      achievements: student.achievements?.join(', ') || '',
      performance: { ...(student.performance || { tenthPercentage: 0, eleventhPercentage: 0, twelfthPercentage: 0, admissionCutoff: 0, currentCGPA: 0 }) }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly || isSuccess) return;

    const processed = {
      ...formData,
      mentor: profile._id,
      class: `${formData.year} - Section ${formData.section}`,
      placementDetails: {
        ...formData.placementDetails,
        skills: typeof formData.placementDetails.skills === 'string' ? formData.placementDetails.skills.split(',').map(s => s.trim()).filter(Boolean) : formData.placementDetails.skills
      }
    };

    if (isEditMode) {
      updateStudentMutation.mutate(processed);
    } else {
      enrollStudentMutation.mutate(processed);
    }
  };

  const filteredStudents = students?.filter((s: any) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'contact', label: 'Contact', icon: MapPin },
    { id: 'placement', label: 'Placement', icon: Briefcase },
    { id: 'performance', label: 'Performance', icon: Award }
  ];

  return (
    <DashboardLayout title="Student Maintenance" subtitle="Manage and enroll students assigned to your guidance">
      
      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="dash-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><Users size={24} /></div>
            <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Scholars</p>
               <p className="text-2xl font-black text-slate-800">{students?.length || 0}</p>
            </div>
         </div>
         <div className="dash-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm"><CheckCircle2 size={24} /></div>
            <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Avg. Attendance</p>
               <p className="text-2xl font-black text-slate-800">
                 {students?.length > 0 
                  ? Math.round(students.reduce((acc: number, s: any) => acc + (s.attendance?.percentage || 0), 0) / students.length)
                  : 0}%
               </p>
            </div>
         </div>
         <div className="dash-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm"><Shield size={24} /></div>
            <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Compliance</p>
               <p className="text-2xl font-black text-slate-800">100%</p>
            </div>
         </div>
      </div>
      
      <div className="dash-card p-0 overflow-hidden border-none shadow-2xl shadow-slate-200/50">
        <div className="p-8 bg-white border-b border-slate-100">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
            <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
              <div className="relative flex-1 md:w-96 group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search students by name or ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all shadow-sm"
                />
              </div>
            </div>
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="group flex items-center gap-3 px-8 py-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 active:scale-95"
            >
              <UserPlus size={18} /> <span className="font-bold text-sm">Enroll New Student</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-24 w-full rounded-3xl" />)}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="pl-8 py-5">Scholar Identity</th>
                  <th>Dept / Batch</th>
                  <th>Placement Status</th>
                  <th>Contact</th>
                  <th>CGPA</th>
                  <th className="pr-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents?.map((s: any, i: number) => (
                  <motion.tr
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    key={s._id} className="hover:bg-primary-50/30 transition-colors group border-b border-slate-50 last:border-0"
                  >
                    <td className="pl-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                          <GraduationCap size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">{s.name}</span>
                          <span className="font-mono text-[10px] font-black text-slate-400 group-hover:text-primary-500 transition-colors uppercase tracking-widest">{s.studentId}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                         <span className="text-[10px] uppercase font-bold text-slate-400">{s.department}</span>
                         <span className="text-xs font-black text-slate-700">{s.class}</span>
                      </div>
                    </td>
                    <td>
                      {s.placementDetails?.skills?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                           {s.placementDetails.skills.slice(0, 2).map((skill: string) => (
                             <span key={skill} className="px-2 py-0.5 bg-slate-100 text-[8px] font-black rounded text-slate-500">{skill}</span>
                           ))}
                           {s.placementDetails.skills.length > 2 && <span className="text-[8px] font-black text-slate-300">+{s.placementDetails.skills.length - 2}</span>}
                        </div>
                      ) : <span className="text-[8px] font-black text-slate-300 uppercase">Not Defined</span>}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <Mail size={12} className="text-slate-300" /> {s.user?.email}
                        </div>
                        {s.phone && <div className="flex items-center gap-2 text-[10px] text-slate-400"><Phone size={10}/> {s.phone}</div>}
                      </div>
                    </td>
                    <td>
                      <span className={`text-xs font-black ${s.performance?.currentCGPA > 8 ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {s.performance?.currentCGPA || 'N/A'}
                      </span>
                    </td>
                    <td className="pr-8 py-6 text-right">
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleViewClick(s)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:bg-indigo-500 hover:text-white transition-all shadow-sm border border-slate-100"
                          title="View Scholar Profile"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEditClick(s)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:bg-primary-500 hover:text-white transition-all shadow-sm border border-slate-100"
                          title="Edit Scholar Profile"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Unified Modal */}
      <AnimatePresence mode="wait">
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !enrollStudentMutation.isPending && setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
              
              <form onSubmit={handleSubmit} className="flex flex-col h-full relative">
                
                {/* Status Bar for Success/Error */}
                <AnimatePresence>
                  {isSuccess && (
                    <motion.div initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }} className="absolute top-0 inset-x-0 z-[70] bg-emerald-500 text-white py-3 px-8 flex items-center justify-between shadow-lg">
                       <div className="flex items-center gap-3">
                          <CheckCircle2 size={20} />
                          <span className="text-sm font-black uppercase tracking-widest">{isEditMode ? 'Changes Synchronized' : 'Enrollment Complete'}</span>
                       </div>
                       <button type="button" onClick={() => setIsModalOpen(false)} className="text-[10px] font-black bg-white/20 px-4 py-1.5 rounded-full hover:bg-white/30 transition-colors uppercase">Finish & Close</button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`p-8 ${isViewOnly ? 'bg-indigo-600' : isSuccess ? 'bg-emerald-600' : 'bg-slate-900'} text-white flex justify-between items-center transition-colors duration-500`}>
                  <div>
                    <div className="flex items-center gap-3">
                       <h3 className="text-2xl font-black italic">
                         {isViewOnly ? 'Scholar Dossier' : isEditMode ? 'Edit Scholar Profile' : 'Scholar Enrollment'}
                       </h3>
                       <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isViewOnly ? 'bg-indigo-400/20 text-indigo-200' : isEditMode ? 'bg-amber-400/20 text-amber-200' : 'bg-emerald-400/20 text-emerald-200'}`}>
                          {isViewOnly ? 'Read Only' : isEditMode ? 'Editing' : 'New Intake'}
                       </span>
                    </div>
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mt-1">
                      {isSuccess ? 'Data Integrity Verified' : 'Placement & Academic Intake System'}
                    </p>
                  </div>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition"><X size={20}/></button>
                </div>

                {/* Modal Tabs */}
                <div className="flex bg-slate-50 border-b border-slate-100 px-6 py-2 gap-2">
                  {tabs.map(tab => (
                    <button 
                      key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <tab.icon size={14} /> {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                  <fieldset disabled={isViewOnly} className="contents">
                    <AnimatePresence mode="wait">
                      {activeTab === 'personal' && (
                        <motion.div key="personal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label><input required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Smith" /></div>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student ID</label><input required className="form-input" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} placeholder="STU-001" /></div>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reg Number</label><input className="form-input" value={formData.registerNumber} onChange={e => setFormData({...formData, registerNumber: e.target.value})} /></div>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label><select className="form-input" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}><option>Male</option><option>Female</option></select></div>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</label><input type="date" className="form-input" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} /></div>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Group</label><select className="form-input" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}><option value="">Select</option>{['A+', 'B+', 'O+', 'AB+'].map(bg => <option key={bg} value={bg}>{bg}</option>)}</select></div>
                          </div>
                          {(!isEditMode && !isViewOnly) && (
                            <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-6">
                                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login Email</label><input required className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Password</label><input required className="form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {activeTab === 'academic' && (
                        <motion.div key="academic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label><input className="form-input bg-slate-50" readOnly value={formData.department} /></div>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Year</label><select className="form-input" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}><option value="1st Year">1st Year</option><option value="2nd Year">2nd Year</option><option value="3rd Year">3rd Year</option><option value="4th Year">4th Year</option></select></div>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section</label><input required className="form-input" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} placeholder="A" /></div>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch Year</label><input className="form-input" value={formData.batchYear} onChange={e => setFormData({...formData, batchYear: e.target.value})} placeholder="2024-2028" /></div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'contact' && (
                        <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-2 gap-10">
                          <div className="space-y-6">
                              <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Contact Info</h4>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label><input className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Address</label><textarea className="form-input h-24" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                          </div>
                          <div className="space-y-6">
                              <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Parent Details</h4>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Father's Name</label><input className="form-input" value={formData.parentDetails.fatherName} onChange={e => setFormData({...formData, parentDetails: {...formData.parentDetails, fatherName: e.target.value}})} /></div>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Mobile</label><input className="form-input" value={formData.parentDetails.parentPhone} onChange={e => setFormData({...formData, parentDetails: {...formData.parentDetails, parentPhone: e.target.value}})} /></div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'placement' && (
                        <motion.div key="placement" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skill Set (Comma separated)</label><input className="form-input" value={formData.placementDetails.skills} onChange={e => setFormData({...formData, placementDetails: {...formData.placementDetails, skills: e.target.value}})} placeholder="Java, SQL, React" /></div>
                          <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferred Role</label><input className="form-input" value={formData.placementDetails.preferredRole} onChange={e => setFormData({...formData, placementDetails: {...formData.placementDetails, preferredRole: e.target.value}})} /></div>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Linkedin size={12}/> LinkedIn</label><input className="form-input" value={formData.placementDetails.linkedInProfile} onChange={e => setFormData({...formData, placementDetails: {...formData.placementDetails, linkedInProfile: e.target.value}})} /></div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'performance' && (
                        <motion.div key="performance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <div className="grid grid-cols-3 gap-6">
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">10th %</label><input type="number" step="0.01" className="form-input" value={formData.performance.tenthPercentage} onChange={e => {setFormData({...formData, performance: {...formData.performance, tenthPercentage: e.target.value}}); setIsSuccess(false)}} /></div>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">11th %</label><input type="number" step="0.01" className="form-input" value={formData.performance.eleventhPercentage} onChange={e => {setFormData({...formData, performance: {...formData.performance, eleventhPercentage: e.target.value}}); setIsSuccess(false)}} /></div>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">12th %</label><input type="number" step="0.01" className="form-input" value={formData.performance.twelfthPercentage} onChange={e => {setFormData({...formData, performance: {...formData.performance, twelfthPercentage: e.target.value}}); setIsSuccess(false)}} /></div>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cutoff</label><input type="number" step="0.01" className="form-input" value={formData.performance.admissionCutoff} onChange={e => {setFormData({...formData, performance: {...formData.performance, admissionCutoff: e.target.value}}); setIsSuccess(false)}} /></div>
                              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current CGPA</label><input type="number" step="0.01" className="form-input" value={formData.performance.currentCGPA} onChange={e => {setFormData({...formData, performance: {...formData.performance, currentCGPA: e.target.value}}); setIsSuccess(false)}} /></div>
                          </div>
                          <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Achievements</label><textarea className="form-input h-24" value={formData.achievements} onChange={e => {setFormData({...formData, achievements: e.target.value}); setIsSuccess(false)}} /></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </fieldset>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors">
                    {isSuccess ? 'Exit Editor' : isViewOnly ? 'Close Dossier' : 'Cancel'}
                  </button>
                  
                  <div className="flex gap-4">
                    {!isSuccess && activeTab !== 'personal' && (
                      <button type="button" onClick={handleBack} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-slate-50 transition-all">
                        <ArrowLeft size={14} /> Previous
                      </button>
                    )}
                    
                    {activeTab !== 'performance' ? (
                      <button type="button" onClick={handleNext} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-200 flex items-center gap-2 hover:bg-indigo-700 transition-all">
                        {isViewOnly ? 'Review Next' : isSuccess ? 'View Summary' : 'Continue'} <ArrowRight size={14} />
                      </button>
                    ) : (
                      !isViewOnly && !isSuccess && (
                        <button 
                          type="submit" 
                          disabled={enrollStudentMutation.isPending || updateStudentMutation.isPending} 
                          className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/20 flex items-center gap-2 hover:bg-emerald-600 transition-all"
                        >
                          {(enrollStudentMutation.isPending || updateStudentMutation.isPending) ? (
                            <><Loader2 className="animate-spin" size={14} /> Syncing...</>
                          ) : (isEditMode ? <>Save Updates <Save size={14} /></> : <>Confirm Enrollment <CheckCircle2 size={14} /></>)}
                        </button>
                      )
                    )}
                    
                    {isSuccess && (
                       <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-200 flex items-center gap-2 hover:bg-emerald-700 transition-all">
                          Finish & Close <CheckCircle2 size={14} />
                       </button>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default StaffStudents;
