import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { MessageSquare, User, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

const remarks: any[] = [];

const StudentRemarks = () => {
  return (
    <DashboardLayout title="Faculty Remarks" subtitle="View behavioral and academic feedback from your professors">
      <div className="max-w-3xl">
        <div className="space-y-6">
          {remarks.map((r, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`dash-card p-6 border-l-8 ${r.positive ? 'border-l-green-500' : 'border-l-orange-500'} relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300`}
            >
              {/* Background Icon */}
              <MessageSquare size={120} className="absolute -right-4 -bottom-4 text-slate-50 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity" />

              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary-500">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{r.by}</h4>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-blue text-[10px] font-bold uppercase tracking-widest">{r.subject}</span>
                      {r.positive ? (
                        <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold"><CheckCircle size={12} /> POSITIVE</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-orange-500 font-bold"><AlertTriangle size={12} /> ATTENTION REQUIRED</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                  <Calendar size={14} /> {r.date}
                </div>
              </div>

              <div className="relative mt-2">
                <p className="text-slate-600 leading-relaxed italic text-base">
                  "{r.text}"
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="text-xs font-bold text-primary-500 hover:text-primary-700 underline underline-offset-4">
                  Reply to Faculty
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {remarks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center dash-card">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
              <MessageSquare size={40} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">No Remarks Yet</h3>
            <p className="text-sm text-slate-500 mt-1">Your faculty has not posted any remarks for you yet.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentRemarks;
