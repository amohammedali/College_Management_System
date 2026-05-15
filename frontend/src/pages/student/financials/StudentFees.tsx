import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  CreditCard, ShieldCheck, Clock, CheckCircle, 
  AlertCircle, Receipt, Download, ChevronRight,
  TrendingUp, Wallet
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentFees = () => {
  const queryClient = useQueryClient();
  const [payingComponentId, setPayingComponentId] = useState<string | null>(null);

  // 1. Fetch Ledger & Transactions
  // In a real app, student ID comes from AuthContext
  const studentId = '662b6b0a12c14ce397832931'; // Placeholder

  const { data: ledgerData, isLoading } = useQuery({
    queryKey: ['student-ledger', studentId],
    queryFn: () => axios.get(`${API}/fee/ledger/${studentId}`).then(r => r.data),
  });

  const { ledger, transactions, waivers } = ledgerData || { ledger: [], transactions: [], waivers: [] };

  // 2. Razorpay Payment Logic
  const handlePayment = async (component: any) => {
    try {
      setPayingComponentId(component.feeStructure._id);
      
      // Create Order
      const { data: orderData } = await axios.post(`${API}/fee/payment/order`, {
        amount: component.outstanding,
        student_id: studentId
      });

      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Institutional Portal",
        description: `Payment for ${component.feeStructure.feeType} Fee`,
        order_id: orderData.order.id,
        handler: async (response: any) => {
          // Verify Signature
          const verifyData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            student_id: studentId,
            fee_structure_id: component.feeStructure._id,
            amount: component.outstanding
          };
          
          const { data: verifyRes } = await axios.post(`${API}/fee/payment/verify`, verifyData);
          if (verifyRes.success) {
            alert('Payment Successful!');
            queryClient.invalidateQueries({ queryKey: ['student-ledger'] });
          }
        },
        prefill: {
          name: "Student Name",
          email: "student@college.edu",
        },
        theme: { color: "#4f46e5" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      alert('Payment initialization failed');
    } finally {
      setPayingComponentId(null);
    }
  };

  return (
    <DashboardLayout title="My Financial Ledger" subtitle="View fee history, download receipts, and settle outstanding dues">
      
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <div className="dash-card p-8 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={80}/></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Total Outstanding</h4>
            <div className="flex items-end gap-3">
               <span className="text-3xl font-black italic">₹{ledger.reduce((acc: number, curr: any) => acc + curr.outstanding, 0).toLocaleString()}</span>
               <span className="text-[10px] font-bold text-rose-400 mb-1.5 uppercase">Action Required</span>
            </div>
         </div>
         <div className="dash-card p-8 bg-white border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Total Paid (Till Date)</h4>
            <div className="flex items-end gap-3">
               <span className="text-3xl font-black italic text-slate-800">₹{transactions.reduce((acc: number, curr: any) => acc + (curr.status === 'captured' ? curr.amountPaid : 0), 0).toLocaleString()}</span>
               <CheckCircle size={20} className="text-emerald-500 mb-2"/>
            </div>
         </div>
         <div className="dash-card p-8 bg-indigo-50 border border-indigo-100 shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Scholarships & Waivers</h4>
            <div className="flex items-end gap-3">
               <span className="text-3xl font-black italic text-indigo-600">₹{ledger.reduce((acc: number, curr: any) => acc + curr.totalWaived, 0).toLocaleString()}</span>
               <div className="px-2 py-1 bg-indigo-600 text-white rounded text-[8px] font-black uppercase mb-2">Applied</div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
         {/* ── Pending Dues ── */}
         <div className="col-span-12 lg:col-span-8 space-y-6">
            <h3 className="text-lg font-black italic text-slate-800 flex items-center gap-3">
               <Clock className="text-amber-500" size={20}/> Outstanding Components
            </h3>
            
            {isLoading ? (
               <div className="p-20 text-center animate-pulse text-slate-400 font-black italic uppercase tracking-widest">Calculating Ledger...</div>
            ) : ledger.filter((c: any) => c.outstanding > 0).length === 0 ? (
               <div className="dash-card p-12 text-center bg-emerald-50 border-emerald-100">
                  <CheckCircle size={40} className="text-emerald-500 mx-auto mb-4"/>
                  <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest">No Dues Detected</h4>
                  <p className="text-xs text-emerald-600 font-medium mt-2">All your institutional fees are fully settled.</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {ledger.filter((c: any) => c.outstanding > 0).map((comp: any) => (
                     <motion.div 
                       key={comp.feeStructure._id}
                       initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                       className="dash-card p-8 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all"
                     >
                        <div className="flex items-center gap-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center 
                             ${comp.isDefaulter ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                              <Wallet size={24}/>
                           </div>
                           <div>
                              <h4 className="text-sm font-black text-slate-800 capitalize">{comp.feeStructure.feeType} Fee</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                 Due: {new Date(comp.feeStructure.dueDate).toLocaleDateString()} • {comp.isDefaulter ? 'Past Due' : 'Upcoming'}
                              </p>
                           </div>
                        </div>

                        <div className="flex items-center gap-8">
                           <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Outstanding</p>
                              <p className="text-xl font-black text-slate-800 italic">₹{comp.outstanding.toLocaleString()}</p>
                           </div>
                           <button 
                             onClick={() => handlePayment(comp)}
                             disabled={payingComponentId === comp.feeStructure._id}
                             className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-primary-600 transition-all shadow-xl"
                           >
                              {payingComponentId === comp.feeStructure._id ? 'Processing...' : (
                                <>Pay Now <CreditCard size={14}/></>
                              )}
                           </button>
                        </div>
                     </motion.div>
                  ))}
               </div>
            )}

            {/* ── Recent Transactions ── */}
            <div className="mt-12 space-y-6">
               <h3 className="text-lg font-black italic text-slate-800 flex items-center gap-3">
                  <Receipt className="text-indigo-500" size={20}/> Transaction History
               </h3>
               <div className="dash-card p-0 overflow-hidden bg-white border-none shadow-sm">
                  <table className="w-full">
                     <thead className="bg-slate-50">
                        <tr>
                           <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Receipt #</th>
                           <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                           <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                           <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                           <th className="px-6 py-4"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {transactions.map((t: any) => (
                           <tr key={t._id} className="hover:bg-slate-50/50 transition-all">
                              <td className="px-6 py-4 text-xs font-black text-slate-700">{t.receiptNumber}</td>
                              <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.paymentMode}</td>
                              <td className="px-6 py-4 text-sm font-black text-slate-800">₹{t.amountPaid.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                 <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border
                                   ${t.status === 'captured' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                    {t.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Download size={16}/></button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* ── Sidebar: Security & Support ── */}
         <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="dash-card p-8 bg-indigo-600 text-white border-none shadow-2xl">
               <ShieldCheck size={32} className="mb-6 opacity-50"/>
               <h4 className="text-lg font-black italic mb-4">Secure Gateway</h4>
               <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                  All online payments are processed through Razorpay with industry-standard 256-bit encryption. Your bank details are never stored on our servers.
               </p>
               <div className="mt-8 flex gap-3">
                  <div className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest">PCI-DSS Compliant</div>
                  <div className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest">SSL Secure</div>
               </div>
            </div>

            <div className="dash-card p-8">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Need Assistance?</h4>
               <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-slate-100 transition-all group">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm"><AlertCircle size={18}/></div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-800">Payment Issue?</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Raise a ticket</p>
                     </div>
                     <ChevronRight size={14} className="ml-auto text-slate-300"/>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-slate-100 transition-all group">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm"><Receipt size={18}/></div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-800">Waiver Request</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Apply for concession</p>
                     </div>
                     <ChevronRight size={14} className="ml-auto text-slate-300"/>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* ── Razorpay Script ── */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </DashboardLayout>
  );
};

export default StudentFees;
