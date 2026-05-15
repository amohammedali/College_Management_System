import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Lock, Smartphone, Globe, Eye, 
  Settings, Key, AlertTriangle, ShieldAlert,
  Clock, CheckCircle, Info, ChevronRight, Fingerprint, RefreshCw
} from 'lucide-react';

const AdminSecurity = () => {
  const [policies, setPolicies] = useState([
    { id: '2fa', icon: Smartphone, title: 'Multi-Factor Authentication (2FA)', desc: 'Force OTP verification via email/app for all Admin & Staff logins.', active: true },
    { id: 'ip', icon: Globe, title: 'IP Address Whitelisting', desc: 'Restrict access to campus-only IP ranges for examination modules.', active: false },
    { id: 'session', icon: Clock, title: 'Intelligent Session Timeout', desc: 'Auto-terminate inactive sessions after 15 minutes of idle time.', active: true },
    { id: 'audit', icon: Eye, title: 'Real-time Audit Logs', desc: 'Log every data mutation with user ID and timestamp for NAAC compliance.', active: true }
  ]);

  const [isRotating, setIsRotating] = useState(false);
  const [lastRotation, setLastRotation] = useState(12);

  const togglePolicy = (id: string) => {
    setPolicies(policies.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const handleRotateKeys = async () => {
    setIsRotating(true);
    await new Promise(r => setTimeout(r, 2000));
    setLastRotation(0);
    setIsRotating(false);
  };

  return (
    <DashboardLayout title="Security Command Center" subtitle="Advanced Institutional Protection: 2FA Policies, IP Whitelisting, and Session Intelligence">
      
      <div className="grid grid-cols-12 gap-8">
        {/* Security Policies (7 columns) */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
           <div className="dash-card p-8 bg-slate-900 text-white border-none shadow-2xl shadow-indigo-500/20">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/30"><ShieldCheck size={24} /></div>
                    <div>
                       <h3 className="text-xl font-black italic">Access Control Matrix</h3>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Security Policies</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle size={14} /> System Secure
                 </div>
              </div>

              <div className="space-y-6">
                 {policies.map((policy) => (
                   <div key={policy.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl group hover:border-indigo-500/50 transition-all">
                      <div className="flex items-start justify-between">
                         <div className="flex gap-4">
                            <div className={`p-3 rounded-2xl transition-colors ${policy.active ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-400'}`}><policy.icon size={20} /></div>
                            <div className="max-w-md">
                               <h4 className={`font-bold text-sm transition-colors ${policy.active ? 'text-white' : 'text-slate-400'}`}>{policy.title}</h4>
                               <p className="text-xs text-slate-500 mt-1 leading-relaxed">{policy.desc}</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => togglePolicy(policy.id)}
                           className={`w-12 h-6 rounded-full relative transition-all flex-shrink-0 mt-2 ${policy.active ? 'bg-indigo-600' : 'bg-slate-700'}`}
                         >
                            <motion.div 
                              animate={{ x: policy.active ? 24 : 0 }}
                              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm`} 
                            />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="dash-card p-8 bg-indigo-50 border-indigo-100">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm"><Fingerprint size={24} /></div>
                 <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Biometric Integration</h4>
              </div>
              <p className="text-sm text-indigo-600/70 font-medium leading-relaxed mb-6">
                 EduCMS supports hardware-based biometric authentication for faculty marks entry and sensitive administrative operations.
              </p>
              <button 
                onClick={() => alert('Searching for compatible WebAuthn hardware...')}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
              >
                 Configure WebAuthn
              </button>
           </div>
        </div>

        {/* Threat Intel (5 columns) */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
           <div className="dash-card p-8">
              <h3 className="text-lg font-black text-slate-800 italic mb-8">Security Health Check</h3>
              
              <div className="space-y-6">
                 <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-100 rounded-[40px]">
                    <div className="w-32 h-32 rounded-full border-8 border-indigo-50 flex items-center justify-center relative mb-6">
                       <span className="text-3xl font-black text-slate-800">98%</span>
                       <svg className="absolute -inset-2 w-36 h-36 -rotate-90">
                          <circle cx="72" cy="72" r="68" fill="none" stroke="currentColor" strokeWidth="8" className="text-indigo-600" strokeDasharray="427" strokeDashoffset="8.5" />
                       </svg>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Score</p>
                 </div>

                 <div className="space-y-4">
                    <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl">
                       <div className="flex items-center gap-3 mb-2">
                          <ShieldAlert size={18} className="text-rose-600" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-700">Recent Blocked Event</h4>
                       </div>
                       <p className="text-[11px] text-rose-700/70 font-medium">Brute-force attempt detected from IP 192.168.1.42. Address auto-blacklisted.</p>
                    </div>

                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl">
                       <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3 text-slate-700">
                             <Key size={18} />
                             <h4 className="text-[10px] font-black uppercase tracking-widest">Master Key Rotation</h4>
                          </div>
                          <button 
                            disabled={isRotating}
                            onClick={handleRotateKeys}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg hover:text-indigo-600 transition-colors"
                          >
                             {isRotating ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                          </button>
                       </div>
                       <p className="text-[11px] text-slate-500 font-medium">System encryption keys were last rotated {lastRotation} days ago. Compliance status: Healthy.</p>
                    </div>
                 </div>
              </div>

              <button className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10">
                 Download Audit Log
              </button>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSecurity;
