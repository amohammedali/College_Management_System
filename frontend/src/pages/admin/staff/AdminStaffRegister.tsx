import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, Lock, Building2, 
  GraduationCap, Shield, ChevronRight, CheckCircle2, ShieldAlert,
  Eye, EyeOff, DollarSign, Users, Calendar, Briefcase, 
  BookOpen, Award, UserCircle, Save, Camera, Sparkles,
  CheckCircle, Plus, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminStaffRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch managed settings (subjects)
  const { data: settings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => axios.get(`${API}/admin/settings`).then(r => r.data),
  });

  // Fetch real departments from the governance module
  const { data: departmentList } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => axios.get(`${API}/admin/departments`).then(r => r.data),
  });

  const [formData, setFormData] = useState({
    // Step 1: Essentials
    name: '', email: '', password: 'password123', staffId: '',
    type: 'teaching', department: '', designation: 'Asst. Professor', 
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: 'Full-time',
    counselorYear: '1st Year',
    counselorSection: 'A',
    assignedYear: 'All',
    assignedSection: 'All',
    salary: { base: '', allowances: '', deductions: '' },
    phone: '',

    // Step 2: Academic Profile
    qualification: '', experience: '', specialization: '', 
    subjects: [] as string[], gender: 'Male', dob: '', profileImage: ''
  });

  const departments = departmentList?.map((d: any) => d.name) || [];
  const selectedDepartmentData = departmentList?.find((d: any) => d.name === formData.department);
  const totalSectionsCount = Number(selectedDepartmentData?.totalSections) || 4;
  const availableSections = Array.from({ length: totalSectionsCount }).map((_, i) => String.fromCharCode(65 + i));
  const masterSubjects = settings?.subjects || [];

  const createStaffMutation = useMutation({
    mutationFn: (newStaff: any) => {
      const data = {
        ...newStaff,
        counselorForClass: `${newStaff.counselorYear} - Section ${newStaff.counselorSection}`
      };
      return axios.post(`${API}/admin/staff`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff-list'] });
      setIsSuccess(true);
      setTimeout(() => navigate('/admin/staff'), 2000);
    },
    onError: (error: any) => {
       alert(error.response?.data?.message || "Error provisioning staff. Please check for duplicate IDs or emails.");
    }
  });

  // Fetch all staff to check for occupied counselor slots
  const { data: staffList } = useQuery({
    queryKey: ['admin-staff-list'],
    queryFn: () => axios.get(`${API}/admin/staff`).then(r => r.data),
  });

  const occupiedSlots = staffList
    ?.filter((s: any) => s.department === formData.department)
    .map((s: any) => s.counselorForClass) || [];
    
  const currentSlot = `${formData.counselorYear} - Section ${formData.counselorSection}`;
  const isOccupied = occupiedSlots.includes(currentSlot);

  // Check if primary assignment is already occupied
  const primaryOccupiedSlots = staffList
    ?.filter((s: any) => s.department === formData.department)
    .map((s: any) => `${s.assignedYear} - ${s.assignedSection}`) || [];
  
  const currentPrimarySlot = `${formData.assignedYear} - ${formData.assignedSection}`;
  const isPrimaryOccupied = formData.assignedYear !== 'All' && 
                             formData.assignedSection !== 'All' && 
                             primaryOccupiedSlots.includes(currentPrimarySlot);

  const toggleSubject = (subject: string) => {
     setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.includes(subject) 
           ? prev.subjects.filter(s => s !== subject)
           : [...prev.subjects, subject]
     }));
  };

  const handleContinue = () => {
     const requiredFields = ['name', 'email', 'staffId', 'department', 'phone'];
     const isValid = requiredFields.every(field => (formData as any)[field]);
     if (isValid) {
        setStep(2);
        window.scrollTo(0, 0);
     } else {
        alert("Please fill all essential fields in Step 1 before continuing.");
     }
  };

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    createStaffMutation.mutate({ ...formData, onboardingStatus: 'complete' });
  };

  if (isSuccess) {
    return (
      <DashboardLayout title="Registration Status" subtitle="Finalizing institutional provisioning">
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="dash-card p-12 text-center max-w-md w-full">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Success!</h2>
            <p className="text-slate-500 font-medium mb-8">Faculty credentials and HR profile provisioned. Redirecting...</p>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} className="h-full bg-green-500" />
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Faculty Provisioning" subtitle="Onboard new academic members with comprehensive HR & Academic profiles">
      <div className="max-w-5xl mx-auto pb-20">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-12 relative">
           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
           <div 
             onClick={() => setStep(1)}
             className={`relative z-10 flex items-center gap-4 bg-white pr-8 transition-all cursor-pointer ${step === 1 ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black border-2 transition-all ${step === 1 ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' : 'border-slate-200 bg-white'}`}>1</div>
              <span className="text-[10px] font-black uppercase tracking-widest">Essential Setup</span>
           </div>
           <div 
             onClick={handleContinue}
             className={`relative z-10 flex items-center gap-4 bg-white pl-8 transition-all cursor-pointer ${step === 2 ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black border-2 transition-all ${step === 2 ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' : 'border-slate-200 bg-white'}`}>2</div>
              <span className="text-[10px] font-black uppercase tracking-widest">Academic Profile</span>
           </div>
        </div>

        <form onSubmit={handleFinalize} className="space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Profile Identity */}
                <div className="dash-card p-8 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
                    <h3 className="font-bold text-slate-800">Profile Identity</h3>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Legal Name</label>
                      <input required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Dr. Jane Doe" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff ID</label>
                      <input required className="form-input" value={formData.staffId} onChange={e => setFormData({...formData, staffId: e.target.value})} placeholder="STF-2024-001" />
                    </div>
                  </div>
                </div>

                {/* Auth & Login */}
                <div className="dash-card p-8 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Lock size={20} /></div>
                    <h3 className="font-bold text-slate-800">Portal Access</h3>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institutional Email</label>
                      <input required type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@college.com" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Password</label>
                      <div className="relative">
                        <input required type={showPassword ? "text" : "password"} className="form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HR & Deployment */}
                <div className="dash-card p-8 md:col-span-full grid grid-cols-1 md:grid-cols-4 gap-8">
                   <div className="md:col-span-4 pb-4 border-b border-slate-50 flex items-center gap-3">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Briefcase size={20} /></div>
                      <h3 className="font-bold text-slate-800">Institutional Deployment & Financials</h3>
                   </div>
                   
                   <div className="space-y-5">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                         <select required className="form-input" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                            <option value="">Select Unit</option>
                            {departments.map((dept: string) => <option key={dept} value={dept}>{dept}</option>)}
                         </select>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employment Type</label>
                         <select required className="form-input" value={formData.employmentType} onChange={e => setFormData({...formData, employmentType: e.target.value})}>
                            <option value="Full-time">Full-time (Permanent)</option>
                            <option value="Contract">Contract (Visiting)</option>
                         </select>
                      </div>
                   </div>

                   <div className="space-y-5">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Joining</label>
                         <input required type="date" className="form-input" value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</label>
                         <input required className="form-input" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                      </div>
                   </div>

                   <div className="space-y-5">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                            Assigned Academic Year
                            {isPrimaryOccupied && <span className="text-rose-500 flex items-center gap-1 font-bold italic">Already Assigned</span>}
                         </label>
                         <select className={`form-input ${isPrimaryOccupied ? 'border-rose-200 bg-rose-50/30' : ''}`} value={formData.assignedYear} onChange={e => setFormData({...formData, assignedYear: e.target.value, counselorYear: e.target.value})}>
                            <option value="All">All Years</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                         </select>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                            Assigned Section
                            {isPrimaryOccupied && <span className="text-rose-500 font-bold italic">Conflict</span>}
                         </label>
                         <select className={`form-input ${isPrimaryOccupied ? 'border-rose-200 bg-rose-50/30' : ''}`} value={formData.assignedSection} onChange={e => setFormData({...formData, assignedSection: e.target.value, counselorSection: e.target.value})}>
                            <option value="All">All Sections</option>
                            {availableSections.map(section => (
                               <option key={section} value={section}>Section {section}</option>
                            ))}
                         </select>
                      </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Contact (Phone)</label>
                            <input required className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91" />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Salary</label>
                            <input type="number" className="form-input" value={formData.salary.base} onChange={e => setFormData({...formData, salary: {...formData.salary, base: e.target.value}})} placeholder="0.00" />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allowances</label>
                            <input type="number" className="form-input" value={formData.salary.allowances} onChange={e => setFormData({...formData, salary: {...formData.salary, allowances: e.target.value}})} placeholder="0.00" />
                         </div>
                   </div>
                </div>

              </motion.div>
            ) : (
              <motion.div 
                key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {/* Academic Qualifications */}
                <div className="dash-card p-8 md:col-span-2 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><GraduationCap size={20} /></div>
                       <h3 className="font-bold text-slate-800">Academic Background</h3>
                    </div>
                    <span className="px-3 py-1 bg-slate-50 text-[9px] font-black text-slate-400 uppercase rounded-full">Compliance Tier</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Highest Qualification</label>
                       <input className="form-input" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} placeholder="e.g. Ph.D in Computer Science" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teaching Experience (Years)</label>
                       <input type="number" className="form-input" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="0" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization Area</label>
                       <input className="form-input" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} placeholder="e.g. Artificial Intelligence, Data Structures" />
                    </div>
                    
                    {/* Subject Selector */}
                    <div className="space-y-3 md:col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                          <span>Institutional Subject Vault</span>
                          <span className="text-indigo-600">{formData.subjects.length} Selected</span>
                       </label>
                       <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 min-h-[160px]">
                          {masterSubjects.length === 0 ? (
                             <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                <ShieldAlert className="text-amber-400 mb-2" size={24} />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Subjects Defined in Settings</p>
                             </div>
                          ) : (
                             <div className="flex flex-wrap gap-2">
                                {masterSubjects.map((subject: string) => {
                                   const isSelected = formData.subjects.includes(subject);
                                   return (
                                      <button
                                         type="button"
                                         key={subject}
                                         onClick={() => toggleSubject(subject)}
                                         className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-white text-slate-500 border border-slate-100 hover:border-indigo-200'}`}
                                      >
                                         {isSelected ? <CheckCircle size={12} /> : <Plus size={12} />}
                                         {subject}
                                      </button>
                                   );
                                })}
                             </div>
                          )}
                       </div>
                       <p className="text-[9px] text-slate-400 italic px-1">Selected subjects will be used for automated attendance and marks modules.</p>
                    </div>
                  </div>
                </div>

                {/* Personal Profile */}
                <div className="dash-card p-8 space-y-6">
                   <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><UserCircle size={20} /></div>
                      <h3 className="font-bold text-slate-800">Personal Details</h3>
                   </div>
                   <div className="space-y-5">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
                         <div className="flex gap-2">
                            {['Male', 'Female', 'Other'].map(g => (
                              <button type="button" key={g} onClick={() => setFormData({...formData, gender: g})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.gender === g ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}`}>{g}</button>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</label>
                         <input type="date" className="form-input" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                      </div>
                      <div className="pt-4">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Profile Photo</label>
                         <div 
                           onClick={() => document.getElementById('staff-photo-upload')?.click()}
                           className="w-full aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-200 transition-all overflow-hidden relative"
                         >
                            {formData.profileImage ? (
                               <img src={formData.profileImage} className="w-full h-full object-cover" alt="Profile Preview" />
                            ) : (
                               <>
                                  <div className="p-4 bg-white rounded-2xl text-slate-300 shadow-sm group-hover:text-indigo-500 group-hover:scale-110 transition-all"><Camera size={24} /></div>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600">Upload Identity Photo</span>
                               </>
                            )}
                            <input 
                              id="staff-photo-upload"
                              type="file" 
                              accept="image/*"
                              className="hidden" 
                              onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                       setFormData({ ...formData, profileImage: reader.result as string });
                                    };
                                    reader.readAsDataURL(file);
                                 }
                              }}
                            />
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-10 border-t border-slate-100">
             {step === 2 ? (
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-black text-[10px] uppercase tracking-widest">
                   <ArrowLeft size={16} /> Back to Essentials
                </button>
             ) : (
                <button type="button" onClick={() => navigate('/admin/staff')} className="text-slate-400 hover:text-rose-500 transition-colors font-black text-[10px] uppercase tracking-widest">
                   Discard Onboarding
                </button>
             )}

             <div className="flex items-center gap-4">
                {step === 1 && (
                   <button 
                     type="button"
                     onClick={() => {
                        const requiredFields = ['name', 'email', 'staffId', 'department', 'phone'];
                        const isValid = requiredFields.every(field => (formData as any)[field]);
                        if (isValid) {
                           createStaffMutation.mutate({ ...formData, onboardingStatus: 'incomplete' });
                        } else {
                           alert("Please fill all essential fields (Name, Email, Staff ID, Dept, Phone) before fast-track provisioning.");
                        }
                     }}
                     disabled={createStaffMutation.isPending || isOccupied}
                     className="px-8 py-5 bg-indigo-50 text-indigo-600 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-3 disabled:opacity-50"
                   >
                      <Save size={18} /> Save & Provision Now
                   </button>
                )}
                <button 
                  disabled={createStaffMutation.isPending || isOccupied}
                  type="button" 
                  onClick={step === 1 ? handleContinue : (e) => handleFinalize(e as any)}
                  className="px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-900/20 flex items-center gap-3 disabled:opacity-50"
                >
                   {createStaffMutation.isPending ? 'Synchronizing...' : step === 1 ? (
                      <>Continue to Academic Profile <ChevronRight size={18} /></>
                   ) : (
                      <>Finalize & Provision Staff <CheckCircle size={18} /></>
                   )}
                </button>
             </div>
          </div>
        </form>

        {/* Status Help */}
        <div className="mt-12 p-8 bg-indigo-50/50 rounded-[40px] border border-indigo-100/50 flex items-center gap-6">
           <div className="p-4 bg-white rounded-2xl text-indigo-600 shadow-sm"><Sparkles size={24} /></div>
           <div>
              <h4 className="text-sm font-black text-slate-800">Smart Onboarding Intelligent System</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Completing Step 2 ensures full compliance with NAAC, NBA, and UGC statutory reporting requirements.</p>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminStaffRegister;
