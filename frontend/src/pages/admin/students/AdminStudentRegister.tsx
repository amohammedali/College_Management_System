import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, Lock, Building2, 
  GraduationCap, Shield, ChevronRight, CheckCircle2,
  MapPin, Users, Calendar, Briefcase, Award, 
  HeartPulse, ClipboardList, BookOpen, Star, Linkedin, Github, ArrowRight, Download, UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminStudentRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const tabOrder = ['personal', 'academic', 'contact', 'placement', 'performance'];

  const handleNext = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Fetch real departments from the governance module
  const { data: departmentList } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => axios.get(`${API}/admin/departments`).then(r => r.data),
  });

  // Fetch staff for mentor assignment
  const { data: staffList } = useQuery({
    queryKey: ['admin-staff-list'],
    queryFn: () => axios.get(`${API}/admin/staff`).then(r => r.data),
  });

  const departments = departmentList?.map((d: any) => d.name) || [];

  const [formData, setFormData] = useState({
    // Basic & Personal
    name: '', email: '', password: 'password123', studentId: '', registerNumber: '',
    gender: 'Male', dateOfBirth: '', bloodGroup: '',
    
    // Academic
    department: '', course: '', year: '1st Year', semester: 1, section: 'A', batchYear: '', admissionType: 'Regular',
    
    // Contact & Parent
    phone: '', alternatePhone: '', address: '',
    parentDetails: {
      fatherName: '', motherName: '', parentPhone: '', occupation: ''
    },
    
    // Placement
    placementDetails: {
      skills: '', certifications: '', internships: '', preferredRole: '', willingToRelocate: false,
      linkedInProfile: '', githubProfile: '', resumeLink: '', placementEligibilityStatus: true
    },
    
    // Performance
    performance: {
      tenthPercentage: '', eleventhPercentage: '', twelfthPercentage: '', admissionCutoff: '', currentCGPA: '', arrearHistory: 0, activeBacklogs: 0
    },
    
    // Additional
    mentor: '', achievements: '', extracurricular: '',
    fees: { total: 50000, paid: 0, balance: 50000 }
  });

  const currentClass = `${formData.year} - Section ${formData.section}`;
  const currentMentor = staffList?.find((s: any) => 
     s.department === formData.department && 
     (s.counselorForClass === currentClass || 
      (s.assignedYear === formData.year && s.assignedSection === formData.section))
  );

  const createStudentMutation = useMutation({
    mutationFn: (newStudent: any) => axios.post(`${API}/admin/students`, newStudent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students-list'] });
      setIsSuccess(true);
      setTimeout(() => navigate('/admin/students'), 2000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-detect assigned mentor for this class
    const classString = `${formData.year} - Section ${formData.section}`;
    const matchedMentor = staffList?.find((s: any) => 
       s.department === formData.department && 
       (s.counselorForClass === classString || 
        (s.assignedYear === formData.year && s.assignedSection === formData.section))
    );

    // Process comma separated strings into arrays
    const processedData = {
      ...formData,
      mentor: matchedMentor?._id || '',
      class: classString,
      placementDetails: {
        ...formData.placementDetails,
        skills: formData.placementDetails.skills.split(',').map(s => s.trim()).filter(Boolean),
        certifications: formData.placementDetails.certifications.split(',').map(s => s.trim()).filter(Boolean),
        internships: formData.placementDetails.internships.split(',').map(s => s.trim()).filter(Boolean),
      },
      achievements: formData.achievements.split(',').map(s => s.trim()).filter(Boolean),
      extracurricular: formData.extracurricular.split(',').map(s => s.trim()).filter(Boolean),
    };

    createStudentMutation.mutate(processedData);
  };

  if (isSuccess) {
    return (
      <DashboardLayout title="Provisioning Successful" subtitle="Finalizing student profile and fee ledger">
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="dash-card p-12 text-center max-w-md w-full">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Scholar Enrolled!</h2>
            <p className="text-slate-500 font-medium mb-8">The student portal credentials have been sent to their email. Redirecting...</p>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} className="h-full bg-emerald-500" />
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'contact', label: 'Contact & Family', icon: Users },
    { id: 'placement', label: 'Placement & Skills', icon: Briefcase },
    { id: 'performance', label: 'Performance', icon: Award }
  ];

  return (
    <DashboardLayout title="Student Enrollment" subtitle="Comprehensive scholar onboarding with step-by-step guidance">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/admin/students')} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-bold text-sm group">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-indigo-50 transition-colors">
              <ArrowLeft size={18} />
            </div>
            Back to Directory
          </button>
          <div className="flex items-center gap-2">
             {tabOrder.map((tid, idx) => (
               <div key={tid} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${activeTab === tid ? 'bg-indigo-600 w-8' : idx < tabOrder.indexOf(activeTab) ? 'bg-emerald-400' : 'bg-slate-200'}`} />
             ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-100/50 p-2 rounded-2xl border border-slate-200/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-indigo-600 shadow-lg shadow-slate-200/50' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-32">
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div key="personal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="dash-card p-10 space-y-8">
                <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
                   <h3 className="font-bold text-slate-800">Basic & Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input required type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Smith" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student ID</label>
                    <input required type="text" className="form-input" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} placeholder="STU-2024-001" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Register Number</label>
                    <input type="text" className="form-input" value={formData.registerNumber} onChange={e => setFormData({...formData, registerNumber: e.target.value})} placeholder="2024CS001" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
                    <select className="form-input" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</label>
                    <input type="date" className="form-input" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Group</label>
                    <select className="form-input" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                      <option value="">Select</option>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Lock size={20} /></div>
                     <h3 className="font-bold text-slate-800">Account Credentials</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scholar Email</label>
                      <input required type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john.s@edu.com" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal Password</label>
                      <input required type="text" className="form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'academic' && (
              <motion.div key="academic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="dash-card p-10 space-y-8">
                <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><GraduationCap size={20} /></div>
                   <h3 className="font-bold text-slate-800">Academic Placement</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                    <select required className="form-input" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                      <option value="">Select Department</option>
                      {departments.map((dept: string) => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course</label>
                    <input type="text" className="form-input" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} placeholder="e.g. B.E Computer Science" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Year</label>
                    <select required className="form-input" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester</label>
                    <select className="form-input" value={formData.semester} onChange={e => setFormData({...formData, semester: Number(e.target.value)})}>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section</label>
                    <select required className="form-input" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})}>
                      {departmentList?.find((d: any) => d.name === formData.department)
                        ? Array.from({ length: departmentList.find((d: any) => d.name === formData.department).totalSections || 1 }).map((_, i) => {
                            const sectionLetter = String.fromCharCode(65 + i);
                            return <option key={sectionLetter} value={sectionLetter}>Section {sectionLetter}</option>;
                          })
                        : <option value="A">Section A</option>
                      }
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch Year</label>
                    <input type="text" className="form-input" value={formData.batchYear} onChange={e => setFormData({...formData, batchYear: e.target.value})} placeholder="2024-2028" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admission Type</label>
                    <select className="form-input" value={formData.admissionType} onChange={e => setFormData({...formData, admissionType: e.target.value})}>
                      <option>Regular</option>
                      <option>Lateral Entry</option>
                      <option>Transfer</option>
                    </select>
                  </div>
                </div>

                {/* Assigned Mentor Display */}
                {formData.department && formData.year && formData.section && (
                  <div className="mt-8">
                     <div className={`p-6 rounded-[32px] border flex items-center justify-between transition-all ${currentMentor ? 'bg-indigo-50/50 border-indigo-100 shadow-sm shadow-indigo-100/50' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                        <div className="flex items-center gap-4">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border transition-all ${currentMentor ? 'bg-white text-indigo-600 border-indigo-100' : 'bg-white text-slate-300 border-slate-100'}`}>
                              {currentMentor?.profileImage ? (
                                <img src={currentMentor.profileImage} className="w-full h-full object-cover rounded-2xl" alt="" />
                              ) : (
                                <UserCircle size={28} />
                              )}
                           </div>
                           <div>
                              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${currentMentor ? 'text-indigo-400' : 'text-slate-400'}`}>Class Mentor (Faculty Advisor)</p>
                              <h4 className={`font-bold text-lg ${currentMentor ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                                {currentMentor ? currentMentor.name : 'System: No Faculty Assigned to this Class'}
                              </h4>
                           </div>
                        </div>
                        {currentMentor && (
                           <div className="flex flex-col items-end gap-1">
                              <span className="px-4 py-1.5 bg-white rounded-full border border-indigo-100 shadow-sm text-[10px] font-black text-indigo-600 uppercase tracking-widest">{currentMentor.designation}</span>
                              <span className="text-[9px] text-indigo-400 font-bold italic pr-2">Institutional In-charge</span>
                           </div>
                        )}
                     </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'contact' && (
              <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="dash-card p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Phone size={20} /></div>
                       <h3 className="font-bold text-slate-800">Student Contact</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</label>
                        <input type="text" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 00000 00000" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alternate Number</label>
                        <input type="text" className="form-input" value={formData.alternatePhone} onChange={e => setFormData({...formData, alternatePhone: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Address</label>
                        <textarea className="form-input h-24" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Users size={20} /></div>
                       <h3 className="font-bold text-slate-800">Parent / Guardian</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Father's Name</label>
                        <input type="text" className="form-input" value={formData.parentDetails.fatherName} onChange={e => setFormData({...formData, parentDetails: {...formData.parentDetails, fatherName: e.target.value}})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mother's Name</label>
                        <input type="text" className="form-input" value={formData.parentDetails.motherName} onChange={e => setFormData({...formData, parentDetails: {...formData.parentDetails, motherName: e.target.value}})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Mobile</label>
                        <input type="text" className="form-input" value={formData.parentDetails.parentPhone} onChange={e => setFormData({...formData, parentDetails: {...formData.parentDetails, parentPhone: e.target.value}})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupation</label>
                        <input type="text" className="form-input" value={formData.parentDetails.occupation} onChange={e => setFormData({...formData, parentDetails: {...formData.parentDetails, occupation: e.target.value}})} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'placement' && (
              <motion.div key="placement" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="dash-card p-10 space-y-8">
                <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Briefcase size={20} /></div>
                   <h3 className="font-bold text-slate-800">Placement & Skills</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skill Set (Comma separated)</label>
                    <input type="text" className="form-input" value={formData.placementDetails.skills} onChange={e => setFormData({...formData, placementDetails: {...formData.placementDetails, skills: e.target.value}})} placeholder="React, Node.js, Python, AWS" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certifications</label>
                    <input type="text" className="form-input" value={formData.placementDetails.certifications} onChange={e => setFormData({...formData, placementDetails: {...formData.placementDetails, certifications: e.target.value}})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internships</label>
                    <input type="text" className="form-input" value={formData.placementDetails.internships} onChange={e => setFormData({...formData, placementDetails: {...formData.placementDetails, internships: e.target.value}})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferred Job Role</label>
                    <input type="text" className="form-input" value={formData.placementDetails.preferredRole} onChange={e => setFormData({...formData, placementDetails: {...formData.placementDetails, preferredRole: e.target.value}})} />
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Willing to Relocate?</label>
                    <div className="flex items-center gap-4">
                       <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                          <input type="radio" checked={formData.placementDetails.willingToRelocate} onChange={() => setFormData({...formData, placementDetails: {...formData.placementDetails, willingToRelocate: true}})} /> Yes
                       </label>
                       <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                          <input type="radio" checked={!formData.placementDetails.willingToRelocate} onChange={() => setFormData({...formData, placementDetails: {...formData.placementDetails, willingToRelocate: false}})} /> No
                       </label>
                    </div>
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Placement Eligibility</label>
                    <div className="flex items-center gap-4">
                       <label className="flex items-center gap-2 text-xs font-bold text-emerald-600 cursor-pointer">
                          <input type="radio" checked={formData.placementDetails.placementEligibilityStatus} onChange={() => setFormData({...formData, placementDetails: {...formData.placementDetails, placementEligibilityStatus: true}})} /> Eligible
                       </label>
                       <label className="flex items-center gap-2 text-xs font-bold text-rose-600 cursor-pointer">
                          <input type="radio" checked={!formData.placementDetails.placementEligibilityStatus} onChange={() => setFormData({...formData, placementDetails: {...formData.placementDetails, placementEligibilityStatus: false}})} /> Not Eligible
                       </label>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Linkedin size={12} /> LinkedIn Profile</label>
                    <input type="text" className="form-input" value={formData.placementDetails.linkedInProfile} onChange={e => setFormData({...formData, placementDetails: {...formData.placementDetails, linkedInProfile: e.target.value}})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Github size={12} /> GitHub Profile</label>
                    <input type="text" className="form-input" value={formData.placementDetails.githubProfile} onChange={e => setFormData({...formData, placementDetails: {...formData.placementDetails, githubProfile: e.target.value}})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Download size={12} /> Resume Link (PDF/Drive)</label>
                    <input type="text" className="form-input" value={formData.placementDetails.resumeLink} onChange={e => setFormData({...formData, placementDetails: {...formData.placementDetails, resumeLink: e.target.value}})} placeholder="https://drive.google.com/..." />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'performance' && (
              <motion.div key="performance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="dash-card p-10 space-y-8">
                <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Award size={20} /></div>
                   <h3 className="font-bold text-slate-800">Academic Performance</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">10th Percentage</label>
                    <input type="number" step="0.01" className="form-input" value={formData.performance.tenthPercentage} onChange={e => setFormData({...formData, performance: {...formData.performance, tenthPercentage: Number(e.target.value)}})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">11th Percentage</label>
                    <input type="number" step="0.01" className="form-input" value={formData.performance.eleventhPercentage} onChange={e => setFormData({...formData, performance: {...formData.performance, eleventhPercentage: Number(e.target.value)}})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">12th Percentage</label>
                    <input type="number" step="0.01" className="form-input" value={formData.performance.twelfthPercentage} onChange={e => setFormData({...formData, performance: {...formData.performance, twelfthPercentage: Number(e.target.value)}})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admission Cutoff</label>
                    <input type="number" step="0.01" className="form-input" value={formData.performance.admissionCutoff} onChange={e => setFormData({...formData, performance: {...formData.performance, admissionCutoff: Number(e.target.value)}})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current CGPA</label>
                    <input type="number" step="0.01" className="form-input" value={formData.performance.currentCGPA} onChange={e => setFormData({...formData, performance: {...formData.performance, currentCGPA: Number(e.target.value)}})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arrear History</label>
                    <input type="number" className="form-input" value={formData.performance.arrearHistory} onChange={e => setFormData({...formData, performance: {...formData.performance, arrearHistory: Number(e.target.value)}})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Backlogs</label>
                    <input type="number" className="form-input" value={formData.performance.activeBacklogs} onChange={e => setFormData({...formData, performance: {...formData.performance, activeBacklogs: Number(e.target.value)}})} />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Star size={20} /></div>
                     <h3 className="font-bold text-slate-800">Additional Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Achievements (Comma separated)</label>
                      <textarea className="form-input h-24" value={formData.achievements} onChange={e => setFormData({...formData, achievements: e.target.value})} placeholder="National Level Hackathon Winner, Best Student Award..." />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extracurricular</label>
                      <textarea className="form-input h-24" value={formData.extracurricular} onChange={e => setFormData({...formData, extracurricular: e.target.value})} placeholder="NSS Volunteer, College Football Team Captain..." />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4">
            <button type="button" onClick={() => navigate('/admin/students')} className="px-8 py-4 bg-white text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">Cancel Enrollment</button>
            
            <div className="flex gap-4">
              {activeTab !== 'personal' && (
                <button type="button" onClick={handleBack} className="px-8 py-4 bg-white text-slate-600 rounded-2xl font-bold text-sm border border-slate-100 flex items-center gap-2 hover:bg-slate-50 transition-colors">
                  <ArrowLeft size={18} /> Previous
                </button>
              )}
              
              {activeTab !== 'performance' ? (
                <button type="button" onClick={handleNext} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-2">
                  Continue to Next Step <ArrowRight size={18} />
                </button>
              ) : (
                <button 
                  disabled={createStudentMutation.isPending}
                  type="submit" 
                  className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/20 flex items-center gap-2"
                >
                  {createStudentMutation.isPending ? 'Syncing Records...' : <>Complete Enrollment <CheckCircle2 size={18} /></>}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AdminStudentRegister;
