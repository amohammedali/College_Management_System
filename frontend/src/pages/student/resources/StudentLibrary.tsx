import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Library, Search, Filter, BookOpen, 
  FileText, Video, Download, ExternalLink,
  Star, Archive, Clock, Bookmark, ChevronRight,
  Layers, Info, Sparkles, BookMarked,
  ArrowRight, CheckCircle2, Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentLibrary = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Materials from Academic Unit
  const { data: materials, isLoading } = useQuery({
    queryKey: ['student-materials'],
    queryFn: () => axios.get(`${API}/student/library`).then(r => r.data),
  });

  const categories = [
    { name: 'All', icon: Library },
    { name: 'PDF', icon: FileText },
    { name: 'DOCX', icon: Layers },
    { name: 'VIDEO', icon: Video },
    { name: 'PPTX', icon: BookMarked },
  ];

  const filteredMaterials = (materials || []).filter((m: any) => 
    (activeCategory === 'All' || m.type.toUpperCase().includes(activeCategory)) &&
    (m.title.toLowerCase().includes(searchTerm.toLowerCase()) || m.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getFileIcon = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('PDF')) return <FileText size={28} />;
    if (t.includes('PPT') || t.includes('SLIDE')) return <Archive size={28} />;
    if (t.includes('MP4') || t.includes('VIDEO')) return <Video size={28} />;
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
    <DashboardLayout title="Institutional Material" subtitle="Unified Academic Library, Digital Courseware & Resource Repository">
      <div className="max-w-7xl mx-auto pb-32">
        
        {/* Search & Intelligence Bar */}
        <div className="flex flex-col xl:flex-row gap-8 mb-12">
           <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by title or subject..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[32px] text-sm font-medium shadow-xl shadow-slate-200/50 outline-none focus:border-indigo-600 transition-all"
              />
           </div>
           
           <div className="flex bg-white rounded-[32px] border border-slate-100 p-1.5 shadow-xl shadow-slate-200/50 overflow-x-auto no-scrollbar">
              {categories.map(cat => (
                 <button 
                   key={cat.name} onClick={() => setActiveCategory(cat.name)}
                   className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat.name ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-50'}`}
                 >
                    <cat.icon size={16} /> {cat.name}
                 </button>
              ))}
           </div>
        </div>

        {/* Material Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {isLoading ? (
             [1, 2, 3].map(i => <div key={i} className="skeleton h-80 w-full rounded-[40px]" />)
           ) : (
             <AnimatePresence mode="popLayout">
                {filteredMaterials.map((m: any, i: number) => (
                   <motion.div 
                     layout key={m._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                     className="group relative bg-white rounded-[40px] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-50 hover:border-indigo-200 transition-all"
                   >
                      <div className={`h-48 flex items-center justify-center bg-gradient-to-br ${getIconColor(m.type)}`}>
                         {getFileIcon(m.type)}
                         <div className="absolute top-6 right-6 flex flex-col gap-2">
                            <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl">
                               {m.type}
                            </div>
                         </div>
                      </div>

                      <div className="p-8">
                         <div className="flex items-center gap-2 mb-3">
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em]">{m.subject}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.size}</span>
                         </div>
                         <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors mb-2 truncate">{m.title}</h3>
                         <p className="text-xs font-bold text-slate-400 italic mb-6">Course Material • Academic Repository</p>
                         
                         <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <button 
                              onClick={() => window.open(`${API.replace('/api', '')}${m.url}`, '_blank')}
                              className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 hover:text-indigo-600 transition-all"
                            >
                               <BookOpen size={14} /> Open
                            </button>
                            <a 
                               href={`${API.replace('/api', '')}${m.url}`}
                               download
                               className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                            >
                               Download <Download size={14} />
                            </a>
                         </div>
                      </div>
                   </motion.div>
                ))}
             </AnimatePresence>
           )}
           {!isLoading && filteredMaterials.length === 0 && (
             <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-[48px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-6">
                <div className="p-6 bg-white text-slate-300 rounded-[32px] border border-slate-100 shadow-sm">
                   <Library size={48} />
                </div>
                <h4 className="text-lg font-black text-slate-400 italic">No resources found in your academic unit</h4>
             </div>
           )}
        </div>

        {/* Recently Viewed */}
        {filteredMaterials.length > 0 && (
          <div className="mt-20">
             <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Sparkles size={24} /></div>
                   <div>
                      <h3 className="text-xl font-black text-slate-800">New Resources</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Recently published by your faculty</p>
                   </div>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredMaterials.slice(0, 2).map((m: any, i: number) => (
                   <div key={m._id} className="dash-card p-6 flex items-center gap-6 group hover:border-indigo-200 transition-all cursor-pointer" onClick={() => window.open(`${API.replace('/api', '')}${m.url}`, '_blank')}>
                      <div className={`w-20 h-24 rounded-2xl flex items-center justify-center bg-gradient-to-br ${getIconColor(m.type)} shadow-lg group-hover:scale-105 transition-transform`}>
                         {getFileIcon(m.type)}
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest">New</span>
                            <span className="text-[10px] font-bold text-slate-400 italic">{m.subject}</span>
                         </div>
                         <h4 className="text-sm font-black text-slate-800 leading-tight truncate">{m.title}</h4>
                         <p className="text-[10px] font-black text-slate-300 uppercase mt-2">{new Date(m.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-all">
                         <ExternalLink size={20} />
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default StudentLibrary;
