import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Languages, Moon, Sun, Shield, 
  Layout, Palette, Globe, CheckCircle, Smartphone,
  Database, Bell, Lock, Users, Save, Plus, Trash2,
  RefreshCw, TrendingUp, Award, BarChart, BookOpen, XCircle
} from 'lucide-react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => axios.get(`${API}/admin/settings`).then(r => r.data),
  });

  const updateSettings = useMutation({
    mutationFn: (updates: any) => axios.post(`${API}/admin/settings`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState<any>({
    departments: ['Computer Science and Engineering', 'Civil Engineering'],
    degrees: ['BE', 'B.Tech'],
    subjects: ['Theory of Computation', 'OS', 'DBMS', 'Data Structures'],
    regulations: ['2023', '2021', '2019']
  });

  useEffect(() => {
    if (config) {
      setFormData({
        ...config,
        regulations: config.regulations || ['2023', '2021', '2019']
      });
    }
  }, [config]);

  const handleSave = () => {
    setIsSaving(true);
    updateSettings.mutate(formData);
  };

  const handleDiscard = () => {
    setFormData(config || {
      departments: ['Computer Science and Engineering', 'Civil Engineering'],
      degrees: ['BE', 'B.Tech'],
      subjects: ['Theory of Computation', 'OS', 'DBMS', 'Data Structures'],
      regulations: ['2023', '2021', '2019']
    });
  };

  const handleAddDept = (dept: string) => {
    if (!dept) return;
    const updatedDepts = [...(formData.departments || []), dept];
    setFormData({ ...formData, departments: updatedDepts });
  };

  const handleRemoveDept = (dept: string) => {
    const updatedDepts = (formData.departments || []).filter((d: string) => d !== dept);
    setFormData({ ...formData, departments: updatedDepts });
  };

  const handleAddDegree = (degree: string) => {
    if (!degree) return;
    const updatedDegrees = [...(formData.degrees || []), degree];
    setFormData({ ...formData, degrees: updatedDegrees });
  };

  const handleRemoveDegree = (degree: string) => {
    const updatedDegrees = (formData.degrees || []).filter((d: string) => d !== degree);
    setFormData({ ...formData, degrees: updatedDegrees });
  };

  const handleAddSubject = (subject: string) => {
    if (!subject) return;
    const updatedSubjects = [...(formData.subjects || []), subject];
    setFormData({ ...formData, subjects: updatedSubjects });
  };

  const handleRemoveSubject = (subject: string) => {
    const updatedSubjects = (formData.subjects || []).filter((s: string) => s !== subject);
    setFormData({ ...formData, subjects: updatedSubjects });
  };

  const handleAddRegulation = (reg: string) => {
    if (!reg) return;
    const updated = [...(formData.regulations || []), reg];
    setFormData({ ...formData, regulations: updated });
  };

  const handleRemoveRegulation = (reg: string) => {
    const updated = (formData.regulations || []).filter((r: string) => r !== reg);
    setFormData({ ...formData, regulations: updated });
  };

  return (
    <DashboardLayout title="Universal Orchestration" subtitle="Institutional Personalization, Security Configuration, and Global Branding Controls">
      
      <div className="grid grid-cols-12 gap-8 pb-32">
        {/* Navigation / Categories */}
        <div className="col-span-12 lg:col-span-3 space-y-3">
           {[
             { id: 'general', label: 'General Settings', icon: Globe },
             { id: 'branding', label: 'Visual Branding', icon: Palette },
             { id: 'notifications', label: 'Messaging Center', icon: Bell },
             { id: 'security', label: 'Security Protocols', icon: Shield },
             { id: 'system', label: 'System Engine', icon: Database },
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
             >
               <tab.icon size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
           
           <AnimatePresence mode="wait">
             {activeTab === 'general' && (
               <motion.div 
                 key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                 className="space-y-8"
               >
                 {/* Academic Structure */}
                 <div className="dash-card p-10">
                    <h3 className="text-lg font-black text-slate-800 italic mb-8 flex items-center gap-3">
                       <Layout className="text-indigo-600" /> Academic Hierarchy
                    </h3>
                    
                    <div className="space-y-10">
                       {/* Departments */}
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Managed Departments</label>
                          <div className="flex flex-wrap gap-2">
                             {formData.departments?.map((dept: string) => (
                                <div key={dept} className="flex items-center gap-3 pl-5 pr-2 py-2 bg-slate-50 border border-slate-100 rounded-full group hover:border-indigo-200 transition-all">
                                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{dept}</span>
                                   <button onClick={() => handleRemoveDept(dept)} className="w-6 h-6 rounded-full bg-white text-slate-300 hover:text-rose-500 hover:shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                      <XCircle size={14} />
                                   </button>
                                </div>
                             ))}
                             <button 
                               onClick={() => {
                                  const dept = prompt("Enter Department Name:");
                                  if (dept) handleAddDept(dept);
                               }}
                               className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 text-slate-300 flex items-center justify-center hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                             >
                                <Plus size={18} />
                             </button>
                          </div>
                       </div>

                       {/* Degrees */}
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Offered Degrees</label>
                          <div className="flex flex-wrap gap-2">
                             {formData.degrees?.map((deg: string) => (
                                <div key={deg} className="flex items-center gap-3 pl-5 pr-2 py-2 bg-slate-50 border border-slate-100 rounded-full group hover:border-indigo-200 transition-all">
                                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{deg}</span>
                                   <button onClick={() => handleRemoveDegree(deg)} className="w-6 h-6 rounded-full bg-white text-slate-300 hover:text-rose-500 hover:shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                      <XCircle size={14} />
                                   </button>
                                </div>
                             ))}
                             <button 
                               onClick={() => {
                                  const deg = prompt("Enter Degree (e.g. B.Tech):");
                                  if (deg) handleAddDegree(deg);
                               }}
                               className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 text-slate-300 flex items-center justify-center hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                             >
                                <Plus size={18} />
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Global Standards */}
                 <div className="dash-card p-10">
                    <h3 className="text-lg font-black text-slate-800 italic mb-8 flex items-center gap-3">
                       <Globe className="text-indigo-600" /> Global Standards
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Institutional Timezone</label>
                          <select value={formData.localization?.timezone || 'UTC'} onChange={e => setFormData({...formData, localization: { ...(formData.localization || {}), timezone: e.target.value }})} className="form-input appearance-none">
                             <option value="IST">Asia/Kolkata (IST)</option>
                             <option value="UTC">Universal Coordinated Time (UTC)</option>
                             <option value="EST">Eastern Standard Time (EST)</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Default Currency</label>
                          <select value={formData.localization?.currency || 'INR'} onChange={e => setFormData({...formData, localization: { ...(formData.localization || {}), currency: e.target.value }})} className="form-input appearance-none">
                             <option value="INR">Indian Rupee (₹)</option>
                             <option value="USD">US Dollar ($)</option>
                          </select>
                       </div>
                    </div>
                 </div>

                 {/* Regulations Management */}
                 <div className="dash-card p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 text-indigo-500/5 rotate-12 group-hover:rotate-0 transition-transform"><BookOpen size={120} /></div>
                    <div className="relative z-10">
                       <h3 className="text-xl font-black text-slate-800 mb-2">Academic Regulations</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Define institutional curriculum cycles (e.g. 2023, 2021)</p>
                       
                       <div className="flex flex-wrap gap-3">
                          {formData.regulations?.map((reg: string) => (
                             <div key={reg} className="flex items-center gap-3 pl-5 pr-2 py-2 bg-slate-50 border border-slate-100 rounded-full group/item hover:border-indigo-200 transition-all">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{reg}</span>
                                <button type="button" onClick={() => handleRemoveRegulation(reg)} className="w-6 h-6 rounded-full bg-white text-slate-300 hover:text-rose-500 hover:shadow-sm flex items-center justify-center transition-all opacity-0 group-hover/item:opacity-100">
                                   <XCircle size={14} />
                                </button>
                             </div>
                          ))}
                          <button 
                            type="button"
                            onClick={() => {
                               const reg = prompt("Enter Regulation Year (e.g. 2024):");
                               if (reg) handleAddRegulation(reg);
                            }}
                            className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 text-slate-300 flex items-center justify-center hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          >
                             <Plus size={18} />
                          </button>
                       </div>
                    </div>
                 </div>
               </motion.div>
             )}

             {activeTab === 'notifications' && (
                <div className="dash-card p-10">
                   <h3 className="text-lg font-black text-slate-800 italic mb-8 flex items-center gap-3">
                      <Bell className="text-indigo-600" /> Messaging Controls
                   </h3>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl">
                         <div>
                            <p className="text-sm font-bold">Auto-SMS for Attendance</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Alert parents on student absence</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={formData.notifications?.smsAlerts || false} onChange={e => setFormData({...formData, notifications: { ...(formData.notifications || {}), smsAlerts: e.target.checked }})} />
                            <div className="w-14 h-8 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                         </label>
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'system' && (
                <div className="dash-card p-10">
                   <h3 className="text-lg font-black text-slate-800 italic mb-8 flex items-center gap-3">
                      <Database className="text-indigo-600" /> Engine Integrity
                   </h3>
                   <div className="p-8 bg-slate-900 text-white rounded-[32px] border-none">
                      <div className="flex items-center gap-6 mb-8">
                         <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20"><CheckCircle size={24} /></div>
                         <div>
                            <p className="text-lg font-black italic">Database Connection Stable</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">MongoDB Atlas • Primary Cluster</p>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500">
                            <span>Storage Utilization</span>
                            <span className="text-white">12.4 GB / 50 GB</span>
                         </div>
                         <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="w-1/4 h-full bg-emerald-500" />
                         </div>
                      </div>
                   </div>
                </div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
         <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-900 text-white p-4 rounded-[32px] shadow-2xl flex items-center gap-6 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col px-4 border-r border-white/10">
               <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Universal Config</span>
               <span className="text-xs font-bold italic">Changes unsaved</span>
            </div>
            <div className="flex items-center gap-3 pr-2">
               <button onClick={handleDiscard} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:text-indigo-400 transition-all">Discard Changes</button>
               <button 
                 onClick={handleSave}
                 disabled={isSaving}
                 className="px-8 py-3 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center gap-2"
               >
                  {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                  Synchronize System
               </button>
            </div>
         </motion.div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
         {showToast && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-xl flex items-center gap-3">
               <CheckCircle size={20} />
               <span className="text-[10px] font-black uppercase tracking-widest">Configuration Synchronized Globally</span>
            </motion.div>
         )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default AdminSettings;
