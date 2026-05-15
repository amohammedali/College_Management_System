import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Archive, Plus, Search, Filter, FileText, 
  Video, Globe, Trash2, Eye, Download, Info, HardDrive,
  UploadCloud, CheckCircle, RefreshCw, X, Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StaffLectures = () => {
  const queryClient = useQueryClient();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [targetYear, setTargetYear] = useState('1st Year');
  const [targetSection, setTargetSection] = useState('A');
  const [accessLevel, setAccessLevel] = useState<'Internal' | 'Public'>('Internal');
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterYear, setFilterYear] = useState('All');

  // Fetch Staff Profile (contains aggregated subjects from backend)
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['staff-profile'],
    queryFn: () => axios.get(`${API}/staff/profile`).then(r => r.data),
  });

  // Fetch Storage Telemetry
  const { data: storage } = useQuery({
    queryKey: ['storage-usage'],
    queryFn: () => axios.get(`${API}/staff/lectures/storage`).then(r => r.data),
  });

  // Pull materials from Database
  const { data: materials, isLoading: isMaterialsLoading } = useQuery({
    queryKey: ['staff-materials'],
    queryFn: () => axios.get(`${API}/staff/lectures`).then(r => r.data),
    initialData: []
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync selected subject
  useEffect(() => {
    if (profile?.subjects?.length > 0 && !selectedSubject) {
      setSelectedSubject(profile.subjects[0].name);
    }
  }, [profile, selectedSubject]);

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => axios.post(`${API}/staff/lectures`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-materials'] });
      queryClient.invalidateQueries({ queryKey: ['storage-usage'] });
      setIsUploading(false);
      setSelectedFile(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (err: any) => {
      setIsUploading(false);
      alert(err.response?.data?.message || 'Upload failed');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/staff/lectures/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-materials'] });
      queryClient.invalidateQueries({ queryKey: ['storage-usage'] });
    },
  });

  const handleUpload = () => {
    const subjects = profile?.subjects || [];
    const subObj = subjects.find((s: any) => s.name === selectedSubject);
    
    if (!selectedSubject || !selectedFile || !targetYear || !targetSection) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('subject', selectedSubject);
    if (subObj) formData.append('subject_id', subObj._id);
    formData.append('year', targetYear);
    formData.append('section', targetSection);
    formData.append('accessLevel', accessLevel);
    formData.append('title', selectedFile.name.replace(/\.[^/.]+$/, ""));
    
    uploadMutation.mutate(formData);
  };

  const subjects = profile?.subjects || [];

  const filteredMaterials = (materials || []).filter((m: any) => {
    const subMatch = filterSubject === 'All' || m.subject === filterSubject;
    const yearMatch = filterYear === 'All' || m.year === filterYear;
    return subMatch && yearMatch;
  });

  const canUpload = selectedFile && selectedSubject && targetYear && targetSection && !isUploading;

  const getFileIcon = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('PDF')) return <FileText size={28} />;
    if (t.includes('PPT') || t.includes('SLIDE')) return <Archive size={28} />;
    if (t.includes('MP4') || t.includes('VIDEO')) return <Video size={28} />;
    if (t.includes('JPG') || t.includes('PNG') || t.includes('IMG')) return <Archive size={28} />;
    return <FileText size={28} />;
  };

  const getIconColor = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('PDF')) return 'from-rose-50 to-rose-100 text-rose-500 shadow-rose-100';
    if (t.includes('PPT')) return 'from-orange-50 to-orange-100 text-orange-500 shadow-orange-100';
    if (t.includes('VIDEO')) return 'from-blue-50 to-blue-100 text-blue-500 shadow-blue-100';
    return 'from-indigo-50 to-indigo-100 text-indigo-500 shadow-indigo-100';
  };

  return (
    <DashboardLayout title="Lecture Upload Portal" subtitle="Share Academic Resources with Students and Manage Course Material Access">
      
      <div className="grid grid-cols-12 gap-10">
        {/* ── Upload & Storage ── */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="dash-card p-10 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white border-none shadow-2xl shadow-indigo-600/30 overflow-hidden relative rounded-[48px]">
              <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none"><UploadCloud size={120} /></div>
              
              <div className="relative z-10">
                 <div className="p-4 bg-white/10 rounded-[24px] w-fit mb-8 border border-white/5 backdrop-blur-md shadow-xl">
                    <Archive size={32} className="text-indigo-400" />
                  </div>
                 <h2 className="text-2xl font-black mb-10 italic tracking-tight">Publish Material</h2>
                 
                 <div className="space-y-8">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-[40px] p-10 text-center transition-all cursor-pointer group active:scale-95 ${selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:bg-white/5'}`}
                    >
                       <input 
                         type="file" 
                         ref={fileInputRef} 
                         className="hidden" 
                         onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && file.size > 100 * 1024 * 1024) return alert("Max size 100MB");
                            setSelectedFile(file || null);
                         }}
                       />
                       <div className={`p-5 rounded-3xl w-fit mx-auto mb-5 group-hover:scale-110 transition-transform shadow-lg border ${selectedFile ? 'bg-emerald-500/20 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
                          {selectedFile ? <CheckCircle size={28} className="text-emerald-400" /> : <Plus size={28} className="text-indigo-400" />}
                       </div>
                       <p className="text-sm font-bold text-slate-300">
                         {selectedFile ? selectedFile.name : 'Click to select material'}
                       </p>
                       <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.2em] font-black">
                         {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF, PPTX, MP4, IMAGES'}
                       </p>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest px-1">Target Subject</label>
                          {isProfileLoading ? (
                            <div className="w-full bg-white/5 border border-white/10 rounded-[20px] p-5 flex items-center gap-3 animate-pulse">
                               <Loader2 className="animate-spin text-indigo-400" size={16} />
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fetching Assigned Curriculum...</span>
                            </div>
                          ) : (profile?.subjects?.length === 0 || !profile?.subjects) ? (
                            <div className="w-full bg-rose-500/10 border border-rose-500/20 rounded-[20px] p-5">
                               <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest text-center">No subjects assigned in your academic profile</p>
                            </div>
                          ) : (
                            <select 
                              value={selectedSubject}
                              onChange={(e) => setSelectedSubject(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-[20px] p-5 text-sm font-bold outline-none focus:border-indigo-400 transition-all appearance-none cursor-pointer"
                            >
                               {profile?.subjects?.map((sub: any) => (
                                 <option key={sub._id} value={sub.name} className="bg-slate-900">{sub.name}</option>
                               ))}
                            </select>
                          )}
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest px-1">Year</label>
                             <select value={targetYear} onChange={(e) => setTargetYear(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[20px] p-4 text-xs font-bold outline-none focus:border-indigo-400 transition-all appearance-none cursor-pointer">
                                {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
                             </select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest px-1">Section</label>
                             <select value={targetSection} onChange={(e) => setTargetSection(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[20px] p-4 text-xs font-bold outline-none focus:border-indigo-400 transition-all appearance-none cursor-pointer">
                                {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s} className="bg-slate-900">Section {s}</option>)}
                             </select>
                          </div>
                       </div>

                       <div className="pt-4 border-t border-white/5">
                          <div className="flex items-center justify-between mb-4">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public Link Access</span>
                             <button 
                                onClick={() => setAccessLevel(prev => prev === 'Internal' ? 'Public' : 'Internal')}
                                className={`w-12 h-6 rounded-full transition-all relative ${accessLevel === 'Public' ? 'bg-indigo-500' : 'bg-slate-700'}`}
                             >
                                <motion.div 
                                  animate={{ x: accessLevel === 'Public' ? 24 : 4 }}
                                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                                />
                             </button>
                          </div>
                          <button 
                            onClick={handleUpload}
                            disabled={!canUpload}
                            className={`w-full py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3 ${!canUpload ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40'}`}
                          >
                             {isUploading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                             {isUploading ? 'Synchronizing...' : 'Confirm & Upload'}
                          </button>
                       </div>
                    </div>
                 </div>

                 <div className="mt-12 pt-10 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-indigo-500/20 rounded-2xl"><HardDrive size={22} className="text-indigo-400" /></div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Cloud Storage</p>
                          <p className="text-base font-black text-indigo-100">{storage?.usedGB || '0.00'} GB / {storage?.limitGB || '5'} GB</p>
                       </div>
                    </div>
                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden shadow-inner">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${((storage?.usedBytes || 0) / (storage?.limitBytes || 5 * 1024 * 1024 * 1024)) * 100}%` }}
                         className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                       />
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 bg-indigo-50 rounded-[32px] border border-indigo-100/50 flex items-start gap-5">
              <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm"><Info size={20} /></div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Access Protocol</p>
                 <p className="text-[11px] text-slate-600 font-medium leading-relaxed">Uploaded materials are {accessLevel === 'Public' ? 'available via public CDN link' : 'restricted to your selected academic unit'}.</p>
              </div>
           </div>
        </div>

        {/* ── Resource List ── */}
        <div className="col-span-12 lg:col-span-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 px-4">
              <div className="flex items-center gap-4">
                 <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                 <h3 className="text-xl font-black text-slate-800 italic tracking-tight">Shared Resources</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                 <div className="flex bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
                    {['All', ...(subjects || []).slice(0, 2).map((s: any) => typeof s === 'string' ? s : s.name)].map(s => (
                       <button 
                         key={s} 
                         onClick={() => setFilterSubject(s)}
                         className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${filterSubject === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-50'}`}
                       >
                          {s}
                       </button>
                    ))}
                 </div>
                 <select 
                   value={filterYear}
                   onChange={(e) => setFilterYear(e.target.value)}
                   className="p-3 bg-white border border-slate-100 rounded-2xl text-[9px] font-black uppercase outline-none shadow-sm px-4"
                 >
                    <option value="All">All Years</option>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
              </div>
           </div>

           <div className="space-y-5">
              {(isMaterialsLoading || isProfileLoading) ? (
                <div className="space-y-4">
                   {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 w-full rounded-[48px]" />)}
                </div>
              ) : filteredMaterials.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {filteredMaterials.map((m: any, i: number) => (
                    <motion.div 
                      key={m._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="dash-card p-8 flex flex-col sm:flex-row items-center justify-between group hover:border-indigo-200 transition-all relative overflow-hidden rounded-[40px] bg-white"
                    >
                       <div className="flex items-center gap-8 relative z-10 w-full sm:w-auto">
                          <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all shadow-lg shrink-0 bg-gradient-to-br ${getIconColor(m.type)}`}>
                             {getFileIcon(m.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                             <div className="flex flex-wrap items-center gap-2 mb-2">
                                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{m.subject}</p>
                                <p className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${m.accessLevel === 'Public' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                   {m.accessLevel === 'Public' ? 'CDN Link' : 'Internal'}
                                </p>
                             </div>
                             <h4 className="font-bold text-slate-800 text-base group-hover:text-indigo-700 transition-colors truncate">{m.title}</h4>
                             <div className="flex items-center gap-4 mt-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <span>{m.year} • Sec {m.section}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span>{m.size}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-2 mt-6 sm:mt-0 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 relative z-10">
                          {m.accessLevel === 'Public' && (
                             <button 
                                onClick={() => {
                                   navigator.clipboard.writeText(m.cdnUrl);
                                   alert('CDN link copied to clipboard');
                                }}
                                className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
                                title="Copy CDN Link"
                             >
                                <Globe size={18} />
                             </button>
                          )}
                          <a 
                            href={`${API.replace('/api', '')}${m.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                          >
                            <Eye size={18} />
                          </a>
                          <a 
                            href={`${API.replace('/api', '')}${m.url}`} 
                            download
                            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                          >
                            <Download size={18} />
                          </a>
                          <button 
                            onClick={() => {
                               if (window.confirm('Delete this material?')) deleteMutation.mutate(m._id);
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="py-32 text-center bg-slate-50/50 rounded-[48px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-6">
                   <div className="p-6 bg-white text-slate-300 rounded-[32px] border border-slate-100 shadow-sm">
                      <Archive size={48} />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-slate-400 italic">No Shared Resources</h4>
                      <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-2">Publish your first lecture material to begin</p>
                   </div>
                </div>
              )}
           </div>

           <div className="mt-12 p-10 bg-indigo-900 rounded-[48px] border-none text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none group-hover:scale-110 transition-transform"><Globe size={120} /></div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
                 <div className="flex items-center gap-6">
                    <div className="p-5 bg-white/10 rounded-[24px] text-indigo-300 border border-white/5 backdrop-blur-sm shadow-xl"><Globe size={32} /></div>
                    <div>
                       <h4 className="text-xl font-black italic tracking-tight">Public Content Management</h4>
                       <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-[0.2em] mt-1">Manage global access and CDN distribution protocols</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button className="px-8 py-4 bg-white/10 border border-white/10 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                       Audit Access
                    </button>
                    <button className="px-8 py-4 bg-indigo-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-black/20">
                       Global CDN Status
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-12 right-12 px-10 py-5 bg-emerald-600 text-white rounded-[28px] text-[10px] font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(5,150,105,0.3)] flex items-center gap-5 z-[100]"
          >
             <div className="p-2 bg-white/20 rounded-xl shadow-inner"><CheckCircle size={20} /></div>
             Material Synchronized to Academic Unit
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default StaffLectures;
