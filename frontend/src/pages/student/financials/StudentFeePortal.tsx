import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  CreditCard, Download, Receipt, 
  ShieldCheck, AlertCircle, CheckCircle2,
  Clock, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentFeePortal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFees, setSelectedFees] = useState<string[]>([]);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Queries
  const { data: structures } = useQuery({
    queryKey: ['student-fees'],
    queryFn: () => axios.get(`${API}/fee/structures?dept=${user?.department}&year=${user?.academicYear}`).then(r => r.data),
  });

  const { data: ledger } = useQuery({
    queryKey: ['student-ledger'],
    queryFn: () => axios.get(`${API}/fee/ledger/student`).then(r => r.data),
  });

  // Total Calculation
  const totalToPay = structures
    ?.filter((s: any) => selectedFees.includes(s._id))
    .reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;

  // Mutations
  const verifyMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/fee/payment/verify`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-ledger'] });
      alert('Payment successful! Your receipt is now available.');
      setSelectedFees([]);
    }
  });

  const handlePayment = async () => {
    try {
      const { data: order } = await axios.post(`${API}/fee/payment/order`, {
        amount: totalToPay,
        studentId: user?._id,
        feeStructureIds: selectedFees
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock',
        amount: order.amount,
        currency: order.currency,
        name: "EduCMS Global",
        description: "Academic Fee Payment",
        order_id: order.id,
        handler: function (response: any) {
          verifyMutation.mutate({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#0ea5e9"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const downloadReceipt = async (id: string, receiptNo: string) => {
    const response = await axios.get(`${API}/fee/receipt/${id}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `receipt_${receiptNo}.pdf`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <DashboardLayout title="Financial Portal" subtitle="Manage academic dues, scholarships, and secure payments">
      <div className="grid grid-cols-12 gap-8">
        
        {/* Fee Selection List */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
           <div className="dash-card p-8 bg-white border-none shadow-xl">
              <h3 className="text-xl font-black text-slate-800 italic mb-6">Applicable Dues</h3>
              <div className="space-y-4">
                 {structures?.map((s: any) => (
                    <div key={s._id} className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedFees.includes(s._id) ? 'border-primary-500 bg-primary-50/30' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                         onClick={() => {
                            if (selectedFees.includes(s._id)) setSelectedFees(selectedFees.filter(id => id !== s._id));
                            else setSelectedFees([...selectedFees, s._id]);
                         }}>
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedFees.includes(s._id) ? 'bg-primary-600 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                             <Receipt size={20} />
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-slate-800 capitalize">{s.feeType} Fee</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                                <Clock size={12}/> Due by {new Date(s.dueDate).toLocaleDateString()}
                             </p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-lg font-black text-slate-800 italic">₹{s.amount.toLocaleString()}</p>
                          {s.installmentAllowed && <span className="text-[9px] font-black text-primary-500 uppercase tracking-tighter">Installments Available</span>}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Payment Ledger */}
           <div className="dash-card p-0 overflow-hidden bg-white border-none shadow-xl">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="text-xl font-black text-slate-800 italic">Transaction History</h3>
                 <span className="badge badge-primary text-[9px]">OFFICIAL RECORDS</span>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full border-collapse text-left">
                    <thead>
                       <tr className="bg-slate-50">
                          <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-8">Receipt</th>
                          <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                          <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                          <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                          <th className="p-5 pr-8"></th>
                       </tr>
                    </thead>
                    <tbody>
                       {ledger?.length === 0 ? (
                          <tr><td colSpan={5} className="p-20 text-center text-slate-400 italic text-sm font-medium">No transactions found.</td></tr>
                       ) : (
                          ledger?.map((tx: any) => (
                             <tr key={tx._id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-all">
                                <td className="p-6 pl-8 font-mono text-[10px] font-bold text-slate-400">{tx.receiptNumber}</td>
                                <td className="p-6">
                                   <div className="text-xs font-black text-slate-800 capitalize">{tx.feeStructure?.feeType} Fee</div>
                                   <div className="text-[10px] text-slate-400 font-bold">{new Date(tx.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td className="p-6 text-sm font-black text-slate-800 text-right italic">₹{tx.amount.toLocaleString()}</td>
                                <td className="p-6 text-center">
                                   <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${tx.status === 'captured' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                      {tx.status}
                                   </span>
                                </td>
                                <td className="p-6 pr-8 text-right">
                                   {tx.status === 'captured' && (
                                      <button onClick={() => downloadReceipt(tx._id, tx.receiptNumber)} 
                                              className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                                         <Download size={18} />
                                      </button>
                                   )}
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Payment Summary Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <div className="dash-card p-8 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12"><ShieldCheck size={180} /></div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Checkout Summary</h4>
              
              <div className="space-y-4 mb-10">
                 <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-bold">Selected Components</span>
                    <span className="text-xs font-black">{selectedFees.length}</span>
                 </div>
                 <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-400">Total Payable</span>
                    <span className="text-4xl font-black italic">₹{totalToPay.toLocaleString()}</span>
                 </div>
              </div>

              <button 
                disabled={totalToPay === 0}
                onClick={handlePayment}
                className={`w-full py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${totalToPay > 0 ? 'bg-primary-500 hover:bg-primary-400 shadow-xl shadow-primary-500/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
              >
                 <CreditCard size={18} /> Pay Securely <ArrowRight size={18} />
              </button>

              <div className="mt-8 flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                 <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-primary-400"><ShieldCheck size={16}/></div>
                 <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">Payments are processed via 256-bit encrypted secure gateway.</p>
              </div>
           </div>

           <div className="dash-card p-8 border-2 border-dashed border-slate-100 flex flex-col items-center text-center">
              <div className="p-4 bg-orange-50 text-orange-600 rounded-3xl mb-6"><AlertCircle size={24}/></div>
              <h4 className="text-sm font-black text-slate-800 italic">Have a Scholarship?</h4>
              <p className="text-xs text-slate-400 mt-2 mb-6">If you have been awarded a scholarship or waiver, please submit your documents for approval.</p>
              <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline">Apply for Waiver</button>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentFeePortal;
