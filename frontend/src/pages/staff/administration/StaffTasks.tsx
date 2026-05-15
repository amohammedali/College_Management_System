import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, Plus, Search, Filter, MoreVertical } from 'lucide-react';

const mockTasks: any[] = [];

const StaffTasks = () => {
  const [tasks] = useState(mockTasks);

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'text-red-500 bg-red-50';
      case 'Medium': return 'text-orange-500 bg-orange-50';
      case 'Low': return 'text-green-500 bg-green-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'Completed': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'In Progress': return <Clock size={16} className="text-blue-500" />;
      default: return <AlertCircle size={16} className="text-orange-500" />;
    }
  };

  return (
    <DashboardLayout title="Task Management" subtitle="Track and manage your administrative and academic duties">
      <div className="dash-card p-6 min-h-[75vh]">
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter tasks..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-primary-500 focus:bg-white transition-all"
              />
            </div>
            <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-100 transition">
              <Filter size={18} />
            </button>
          </div>
          <button className="btn-primary flex items-center gap-2 text-sm px-6 py-2.5 shadow-lg shadow-primary-500/20 w-full md:w-auto justify-center">
            <Plus size={18} /> Create New Task
          </button>
        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.length > 0 ? tasks.map((task, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={task.id} 
              className="border border-slate-100 bg-white rounded-3xl p-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
                  {task.priority} Priority
                </span>
                <button className="text-slate-300 hover:text-slate-600 transition">
                  <MoreVertical size={18} />
                </button>
              </div>

              <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-primary-600 transition-colors">{task.title}</h3>
              <p className="text-xs text-slate-400 font-medium mb-6 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {task.dept}
              </p>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <span className="text-xs font-bold text-slate-600">{task.status}</span>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Deadline</p>
                  <p className="text-xs font-black text-slate-800">{task.deadline}</p>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
               <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-200 mb-4">
                 <CheckCircle2 size={32} />
               </div>
               <h3 className="font-bold text-slate-800 text-lg">All caught up!</h3>
               <p className="text-sm text-slate-500 mt-1">No administrative tasks assigned to you yet.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffTasks;
