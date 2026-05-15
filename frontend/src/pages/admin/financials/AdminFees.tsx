import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { 
  DollarSign, Receipt, CreditCard, History, 
  Search, Filter, Download, ArrowUpRight, 
  TrendingUp, TrendingDown, Clock, ShieldCheck 
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminFees = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Queries for stats
  const { data: stats } = useQuery({
    queryKey: ['fee-stats'],
    queryFn: () => axios.get(`${API}/fee/stats`).then(r => r.data),
  });

  const { data: recentTx } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => axios.get(`${API}/fee/ledger/recent`).then(r => r.data),
  });

  const { mutate: sendReminder } = useMutation({
    mutationFn: (studentId: string) => axios.post(`${API}/fee/reminders/send`, { studentId }),
    onSuccess: () => alert('Payment reminder sent to student email.'),
    onError: () => alert('Failed to send reminder.')
  });

  const handleDownloadReceipt = async (id: string, receiptNo: string) => {
    try {
      const response = await axios.get(`${API}/fee/receipt/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt_${receiptNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download receipt. Please try again.');
    }
  };

  return (
    <DashboardLayout title="Financial Operations" subtitle="Comprehensive fee management, ledger tracking, and revenue analytics">
      
      {/* Tab Navigation */}
      <div className="flex gap-8 mb-8 border-b border-slate-200">
        {['overview', 'structure', 'ledger', 'reminders'].map(tab => (
           <button 
             key={tab} onClick={() => setActiveTab(tab)}
             className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
              {tab}
              {activeTab === tab && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
           </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid-dashboard mb-8">
               {/* ... (existing overview cards) */}
               <div className="col-span-full lg:col-span-3 space-y-6">
                  <div className="dash-card p-6 bg-slate-900 text-white border-none shadow-xl relative overflow-hidden">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Total Collected</h3>
                     <p className="text-3xl font-black italic">₹{stats?.totalCollected?.toLocaleString() || '0'}</p>
                     <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold text-green-400">+12%</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase">vs last month</span>
                     </div>
                  </div>
                  <div className="dash-card p-6">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Outstanding</h3>
                     <p className="text-2xl font-black text-slate-800">₹{stats?.totalOutstanding?.toLocaleString() || '0'}</p>
                     <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">From {stats?.defaulterCount || 0} Students</p>
                  </div>
                  <div className="dash-card p-6">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Collection Rate</h3>
                        <span className="text-xs font-black text-primary-600">{stats?.collectionRate || 0}%</span>
                     </div>
                     <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${stats?.collectionRate || 0}%` }} className="h-full bg-primary-500" />
                     </div>
                     <p className="text-[9px] text-slate-400 font-bold uppercase mt-3">Target: 90%</p>
                  </div>
               </div>

               <div className="col-span-full lg:col-span-6 dash-card p-6">
                 <div className="flex items-center justify-between mb-8">
                   <h2 className="font-bold text-slate-800">Revenue Performance</h2>
                   <select className="bg-slate-50 border-none rounded-lg text-[10px] font-bold px-3 py-1.5 outline-none">
                      <option>AY 2024-25</option>
                   </select>
                 </div>
                 <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats?.monthlyData || []}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                       <XAxis dataKey="month" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                       <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                       <Tooltip contentStyle={{borderRadius: 16, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                       <Bar dataKey="actual" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
                       <Bar dataKey="target" fill="#f1f5f9" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                 </ResponsiveContainer>
               </div>

               <div className="col-span-full lg:col-span-3 space-y-6">
                  <div className="dash-card p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl shadow-indigo-500/20">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-6">Pending Approvals</h3>
                     <div className="flex justify-between items-end mb-6">
                       <p className="text-4xl font-black italic">{stats?.pendingApprovals || 0}</p>
                       <div className="p-2 bg-white/20 rounded-xl"><ArrowUpRight size={18}/></div>
                     </div>
                     <p className="text-[9px] text-indigo-100 font-bold leading-relaxed mb-6">Waivers and offline settlements awaiting verification.</p>
                     <button className="w-full py-3 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Review Queue</button>
                  </div>
               </div>
            </div>

            <div className="dash-card p-0 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                 <h2 className="text-xl font-black text-slate-800 italic">Recent Transactions</h2>
                 <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-50 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2">
                       <Download size={14}/> Export Ledger
                    </button>
                 </div>
              </div>
              <table className="w-full border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest pl-8">Receipt No</th>
                       <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                       <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Type</th>
                       <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                       <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                       <th className="p-5 pr-8"></th>
                    </tr>
                 </thead>
                 <tbody>
                    {recentTx?.map((tx: any) => (
                       <tr key={tx._id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-all">
                          <td className="p-6 pl-8 font-mono text-[10px] font-bold text-slate-400">{tx.receiptNumber || 'PENDING'}</td>
                          <td className="p-6">
                             <h5 className="text-xs font-black text-slate-800">{tx.student?.name}</h5>
                             <p className="text-[9px] text-slate-400 font-bold">{tx.student?.studentId}</p>
                          </td>
                          <td className="p-6">
                             <div className="flex items-center gap-2">
                                <span className="p-1 bg-primary-50 text-primary-600 rounded-md"><Receipt size={10}/></span>
                                <span className="text-xs font-bold text-slate-600 capitalize">{tx.feeStructure?.feeType}</span>
                             </div>
                          </td>
                          <td className="p-6 text-sm font-black text-slate-800 italic">₹{tx.amount.toLocaleString()}</td>
                          <td className="p-6">
                             <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                                tx.status === 'captured' ? 'bg-green-100 text-green-600' : 
                                tx.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-rose-100 text-rose-600'
                             }`}>
                                {tx.status}
                             </span>
                          </td>
                          <td className="p-6 pr-8 text-right">
                             <button 
                               onClick={() => handleDownloadReceipt(tx._id, tx.receiptNumber)}
                               className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline"
                             >
                                View Receipt
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'ledger' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between gap-4 mb-8">
               <div className="relative flex-1">
                  <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search by Receipt ID or Student..." className="w-full pl-14 pr-8 py-4 bg-white rounded-2xl border-none shadow-sm text-sm font-medium focus:ring-2 focus:ring-primary-500" />
               </div>
               <button className="px-6 py-4 bg-white rounded-2xl shadow-sm text-slate-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Filter size={16}/> Filters</button>
            </div>
            
            <div className="dash-card p-0 overflow-hidden bg-white shadow-xl">
               <table className="w-full border-collapse">
                  <thead>
                     <tr className="bg-slate-50">
                        <th className="p-5 pl-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode</th>
                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                        <th className="p-5 pr-8"></th>
                     </tr>
                  </thead>
                  <tbody>
                     {recentTx?.map((tx: any) => (
                        <tr key={tx._id} className="border-t border-slate-50">
                           <td className="p-6 pl-8 font-mono text-[10px] font-bold text-slate-400">{tx.razorpayPaymentId || tx._id.slice(-8).toUpperCase()}</td>
                           <td className="p-6">
                              <p className="text-xs font-black text-slate-800">{tx.student?.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{tx.student?.studentId}</p>
                           </td>
                           <td className="p-6">
                              <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                                 {tx.paymentMode === 'online' ? <CreditCard size={14}/> : <DollarSign size={14}/>}
                                 {tx.paymentMode}
                              </span>
                           </td>
                           <td className="p-6 text-sm font-black text-slate-800">₹{tx.amount.toLocaleString()}</td>
                           <td className="p-6 pr-8 text-right">
                              <button onClick={() => handleDownloadReceipt(tx._id, tx.receiptNumber)} className="p-3 bg-slate-50 text-slate-400 hover:text-primary-600 rounded-xl transition-all"><History size={16}/></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'reminders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-12 gap-8">
             <div className="col-span-12 lg:col-span-8 space-y-6">
                <div className="dash-card p-8 bg-white shadow-xl">
                   <h3 className="text-xl font-black text-slate-800 italic mb-8">Defaulters Registry</h3>
                   <div className="space-y-4">
                      {/* Placeholder for defaulters list */}
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center font-black">JS</div>
                            <div>
                               <p className="text-xs font-black text-slate-800">John Smith (CSE-2023)</p>
                               <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1">Outstanding: ₹45,000</p>
                            </div>
                         </div>
                         <button 
                            onClick={() => sendReminder('STU001')} // Example ID
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg"
                         >
                            Send Alert
                         </button>
                      </div>
                   </div>
                </div>
             </div>
             <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="dash-card p-8 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
                   <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12"><Clock size={180} /></div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Reminder Settings</h4>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                         <span className="text-xs font-bold">Auto-Email Reminders</span>
                         <div className="w-10 h-6 bg-primary-500 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full ml-auto" /></div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 opacity-50">
                         <span className="text-xs font-bold">SMS Notifications</span>
                         <div className="w-10 h-6 bg-slate-700 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-slate-500 rounded-full" /></div>
                      </div>
                      <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Broadcast All Dues</button>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default AdminFees;
