import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Star, Search, Plus, MessageSquare, User, Calendar } from 'lucide-react';

const mockRemarks: any[] = [];

const StaffRemarks = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <DashboardLayout title="Student Remarks" subtitle="Provide feedback and academic notes for your students">
      <div className="dash-card p-6 min-h-[75vh]">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-100 pb-6">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search students or remarks..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
          </div>
          <button className="btn-primary flex items-center gap-2 text-sm px-6 py-2.5 shadow-lg shadow-primary-500/20">
            <Plus size={18} /> Add New Remark
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockRemarks.map((item, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={item.id} 
              className="border border-slate-100 bg-slate-50/30 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:bg-white hover:border-primary-100 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{item.student}</h4>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${item.type === 'Academic' ? 'text-green-500' : 'text-orange-500'}`}>{item.type}</span>
                  </div>
                </div>
                <div className="flex text-yellow-400">
                  <Star size={14} fill="currentColor" />
                </div>
              </div>

              <div className="relative">
                <MessageSquare size={14} className="absolute -left-1 -top-1 text-slate-200" />
                <p className="text-sm text-slate-600 leading-relaxed italic pl-5">
                  "{item.remark}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium">
                  <Calendar size={12} /> {item.date}
                </div>
                <button className="text-xs font-bold text-primary-500 hover:text-primary-700">Edit</button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {mockRemarks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
              <MessageSquare size={40} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">No Remarks Yet</h3>
            <p className="text-sm text-slate-500 mt-1">Start providing feedback to your students.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StaffRemarks;
