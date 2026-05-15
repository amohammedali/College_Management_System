import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Star, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentFeedbackSubmission = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const subjectId = searchParams.get('subject_id');
  
  const [ratings, setRatings] = useState<Record<string, number>>({
    q1: 5, q2: 5, q3: 5, q4: 5, q5: 5
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token || !subjectId) {
      toast.error('Invalid feedback link.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/appraisal/feedback/submit`, {
        anon_token: token,
        subject_id: subjectId,
        ratings
      });
      setSubmitted(true);
      toast.success('Feedback submitted anonymously!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md border border-slate-100"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 size={40}/>
          </div>
          <h2 className="text-2xl font-black text-slate-800 italic mb-2">Thank You!</h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Your feedback has been recorded anonymously. The token has been permanently destroyed to protect your identity.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 py-20">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            <ShieldCheck size={14}/> 100% Anonymous Feedback
          </div>
          <h1 className="text-4xl font-black text-slate-900 italic">Faculty Evaluation</h1>
          <p className="text-slate-400 mt-2 font-medium">Please provide your honest feedback. Your identity is NOT linked to this form.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-8 bg-slate-900 text-white">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Subject Evaluation</p>
             <h3 className="text-xl font-bold">Instructional Quality Assessment</h3>
          </div>

          <div className="p-8 space-y-10">
             {[
               { id: 'q1', label: 'Subject Content Clarity', desc: 'How well did the faculty explain complex concepts?' },
               { id: 'q2', label: 'Teaching Delivery Quality', desc: 'Quality of lectures, pace, and use of teaching aids.' },
               { id: 'q3', label: 'Faculty Availability', desc: 'Accessibility for doubts and guidance outside class hours.' },
               { id: 'q4', label: 'Fairness of Assessments', desc: 'Objectivity and fairness in internal marking and grading.' },
               { id: 'q5', label: 'Overall Satisfaction', desc: 'General experience with the faculty throughout the semester.' }
             ].map((q, idx) => (
               <div key={q.id} className="space-y-4">
                  <div className="flex justify-between items-start">
                     <div>
                        <h4 className="text-sm font-black text-slate-800">{idx + 1}. {q.label}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{q.desc}</p>
                     </div>
                     <span className="text-lg font-black text-indigo-600 italic">{ratings[q.id]}/5</span>
                  </div>
                  <div className="flex gap-4">
                     {[1, 2, 3, 4, 5].map(val => (
                        <button 
                           key={val}
                           onClick={() => setRatings({ ...ratings, [q.id]: val })}
                           className={`flex-1 py-4 rounded-2xl transition-all flex items-center justify-center
                              ${ratings[q.id] === val 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                                : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                        >
                           <Star size={18} fill={ratings[q.id] === val ? 'currentColor' : 'none'}/>
                        </button>
                     ))}
                  </div>
               </div>
             ))}

             <div className="pt-6 border-t border-slate-50">
                <button 
                  onClick={handleSubmit}
                  disabled={loading || !token || !subjectId}
                  className="w-full py-6 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                   {loading ? 'Submitting...' : <><Send size={16}/> Submit Anonymous Evaluation</>}
                </button>
                <p className="text-center text-[10px] font-bold text-slate-300 mt-6 uppercase tracking-widest flex items-center justify-center gap-2">
                   <ShieldCheck size={12}/> Encrypted & Anonymous Submission
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedbackSubmission;
