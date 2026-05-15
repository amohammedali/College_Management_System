import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  CreditCard, Smartphone, ShieldCheck, 
  QrCode, Building2, User, Globe, Share2, 
  Download, Printer, Info, Sparkles, Zap,
  Navigation, ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentID = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => axios.get(`${API}/student/profile`).then(r => r.data),
  });

  return (
    <DashboardLayout title="Digital Identity" subtitle="Secure Institutional Credentials, Digital Access Pass & Verification Hub">
      <div className="max-w-7xl mx-auto pb-32">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           {/* Futuristic ID Card Preview */}
           <div className="perspective-1000">
              <motion.div 
                initial={{ rotateY: -20, opacity: 0, scale: 0.9 }}
                animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                whileHover={{ rotateY: 10, rotateX: 5 }}
                transition={{ duration: 1, type: 'spring' }}
                className="relative w-full max-w-[440px] aspect-[1/1.58] mx-auto rounded-[48px] overflow-hidden shadow-2xl shadow-indigo-500/20 group"
              >
                 {/* Card Background & Overlays */}
                 <div className="absolute inset-0 bg-slate-900" />
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 via-transparent to-blue-600/40 opacity-50" />
                 <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(99,102,241,0.1)_0%,transparent_70%)] animate-pulse" />
                 
                 {/* ID Content */}
                 <div className="relative h-full flex flex-col p-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-lg">
                             <Building2 size={24} />
                          </div>
                          <div>
                             <h3 className="text-white text-xs font-black uppercase tracking-tighter italic">Institution</h3>
                             <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">Identity Portal</p>
                          </div>
                       </div>
                       <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10">
                          <ShieldCheck className="text-emerald-400" size={20} />
                       </div>
                    </div>

                    {/* Profile Photo Area */}
                    <div className="flex flex-col items-center mb-10">
                       <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity" />
                          <div className="relative w-40 h-40 bg-slate-800 rounded-full border-4 border-slate-900 overflow-hidden shadow-2xl">
                             {profile?.profileImage ? (
                                <img src={profile.profileImage} className="w-full h-full object-cover" alt="Profile" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-800">
                                   <User size={64} />
                                </div>
                             )}
                          </div>
                          <div className="absolute bottom-2 right-2 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white border-4 border-slate-900 shadow-xl">
                             <Sparkles size={16} />
                          </div>
                       </div>
                       <h2 className="mt-8 text-2xl font-black text-white italic tracking-tight">{profile?.name || 'Loading...'}</h2>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-2 italic">Student Researcher</p>
                    </div>

                    {/* Identity Details */}
                    <div className="grid grid-cols-2 gap-8 mb-12">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Enrollment ID</p>
                          <p className="text-xs font-bold text-white tracking-widest">{profile?.rollNumber || '23BCS1024'}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Department</p>
                          <p className="text-xs font-bold text-white truncate">{profile?.department || 'Comp Science'}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Valid Until</p>
                          <p className="text-xs font-bold text-emerald-400">MAY 2027</p>
                       </div>
                       <div className="space-y-1 text-right flex flex-col items-end">
                          <div className="p-2 bg-white rounded-lg shadow-xl shadow-indigo-900/50">
                             <QrCode size={40} className="text-slate-900" />
                          </div>
                       </div>
                    </div>

                    {/* NFC Strip */}
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                             <Smartphone className="text-indigo-400" size={14} />
                          </div>
                          <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">NFC Digital Access Enabled</span>
                       </div>
                       <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-indigo-500/20" />
                          <div className="w-6 h-2 rounded-full bg-indigo-600 shadow-lg shadow-indigo-600/50" />
                       </div>
                    </div>
                 </div>

                 {/* Holographic Reflection */}
                 <motion.div 
                   animate={{ x: [-500, 500] }}
                   transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                   className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-45 pointer-events-none"
                 />
              </motion.div>
           </div>

           {/* Security Features & Actions */}
           <div className="space-y-12">
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-indigo-600">
                    <Zap size={20} className="fill-indigo-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Identity Intelligence</span>
                 </div>
                 <h3 className="text-4xl font-black text-slate-800 italic leading-tight">Secure Digital Credentials</h3>
                 <p className="text-slate-500 font-medium leading-relaxed max-w-md">Your digital ID card is an encrypted credential valid for campus security, digital library borrowing, and official examination verification.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="dash-card p-6 border-none shadow-xl shadow-slate-200/50 group hover:bg-indigo-600 transition-all cursor-pointer">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit group-hover:bg-white/20 group-hover:text-white transition-all">
                       <Smartphone size={24} />
                    </div>
                    <h4 className="mt-4 font-black text-slate-800 group-hover:text-white">Apple Wallet</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 group-hover:text-white/60">Add to Apple Wallet</p>
                 </div>
                 <div className="dash-card p-6 border-none shadow-xl shadow-slate-200/50 group hover:bg-slate-900 transition-all cursor-pointer">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit group-hover:bg-white/20 group-hover:text-white transition-all">
                       <Printer size={24} />
                    </div>
                    <h4 className="mt-4 font-black text-slate-800 group-hover:text-white">Print Request</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 group-hover:text-white/60">Order Physical Card</p>
                 </div>
              </div>

              <div className="dash-card p-8 bg-slate-50 border-slate-100 flex items-start gap-6">
                 <div className="p-4 bg-white rounded-2xl text-amber-500 shadow-sm"><Info size={24} /></div>
                 <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Security Protocol</h4>
                    <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">This ID contains a dynamic QR code that refreshes every 24 hours. Screenshotting or sharing this credential may result in account suspension.</p>
                    <button className="mt-4 text-[10px] font-black text-indigo-600 hover:underline flex items-center gap-2 uppercase tracking-widest">
                       Learn about security <ChevronRight size={14} />
                    </button>
                 </div>
              </div>

              <div className="flex items-center gap-8 pt-4">
                 <button className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-900/20">
                    <Download size={18} /> Download PDF
                 </button>
                 <button className="flex items-center gap-3 px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-all">
                    <Share2 size={18} /> Share Credential
                 </button>
              </div>
           </div>
        </div>

      </div>
      <style>{`
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </DashboardLayout>
  );
};

export default StudentID;
