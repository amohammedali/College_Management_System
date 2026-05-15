import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Star, Send, Shield, Info } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentFeedback = () => {
  const [formData, setFormData] = useState({
    teachingStyle: 5,
    clarity: 5,
    punctuality: 5,
    materials: 5,
    comments: ''
  });

  const feedbackMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/feedback/submit`, data),
    onSuccess: () => alert('Feedback submitted anonymously. Thank you for your input.')
  });

  const renderStars = (key: string, value: number) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => setFormData({ ...formData, [key]: star })}
          className={`p-2 rounded-xl transition-all ${value >= star ? 'text-amber-400' : 'text-slate-200'}`}
        >
          <Star size={28} fill={value >= star ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );

  return (
    <DashboardLayout title="Faculty Evaluation" subtitle="Your voice helps improve institutional teaching standards. All feedback is 100% anonymous.">
      
      <div className="max-w-3xl mx-auto">
         <div className="mb-12 p-8 bg-indigo-50 border border-indigo-100 rounded-[40px] flex items-center gap-8 shadow-sm">
            <div className="p-5 bg-white rounded-[30px] text-indigo-600 shadow-xl shadow-indigo-100/50"><Shield size={32} /></div>
            <div>
               <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Privacy Guarantee</h4>
               <p className="text-xs text-indigo-600/70 font-medium leading-relaxed">
                  Encryption ensures your identity is never linked to this submission. Faculty only see aggregated anonymized scores.
               </p>
            </div>
         </div>

         <div className="dash-card p-10 bg-white shadow-2xl space-y-12">
            {[
              { label: 'Teaching Methodology', key: 'teachingStyle', desc: 'How effective is the teacher in explaining complex concepts?' },
              { label: 'Clarity & Communication', key: 'clarity', desc: 'Is the delivery clear and easy to follow?' },
              { label: 'Punctuality & Discipline', key: 'punctuality', desc: 'Does the faculty adhere to the scheduled timetable?' },
              { label: 'Course Materials', key: 'materials', desc: 'Are the notes and resources provided helpful?' }
            ].map((item, i) => (
               <div key={i} className="space-y-4">
                  <div className="flex items-center justify-between">
                     <div>
                        <h5 className="font-black text-slate-800 text-sm italic">{item.label}</h5>
                        <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{item.desc}</p>
                     </div>
                     <span className="text-2xl font-black italic text-slate-200">0{i+1}</span>
                  </div>
                  {renderStars(item.key, (formData as any)[item.key])}
               </div>
            ))}

            <div className="space-y-4 pt-6 border-t border-slate-50">
               <h5 className="font-black text-slate-800 text-sm italic">Additional Remarks</h5>
               <textarea 
                 value={formData.comments}
                 onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                 placeholder="Share your experience or suggestions for improvement..."
                 className="w-full p-6 bg-slate-50 rounded-3xl border-none outline-none text-sm font-medium focus:ring-2 focus:ring-primary-500 h-32"
               />
            </div>

            <button 
              onClick={() => feedbackMutation.mutate(formData)}
              className="w-full py-5 bg-slate-900 text-white rounded-3xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-primary-600 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
               <Send size={18} /> Submit Anonymous Feedback
            </button>
         </div>

         <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
            <Info size={14}/>
            <p className="text-[10px] font-bold uppercase tracking-widest">Responses are encrypted and stored in an immutable vault.</p>
         </div>
      </div>

    </DashboardLayout>
  );
};

export default StudentFeedback;
