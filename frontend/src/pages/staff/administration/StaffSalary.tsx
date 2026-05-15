import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { DollarSign, Download, Calendar, ArrowUpRight, TrendingUp } from 'lucide-react';

const salaryHistory: any[] = [];

const StaffSalary = () => {
  return (
    <DashboardLayout title="Salary & Payroll" subtitle="View your earnings, payslips, and tax deductions">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Card */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-2 dash-card p-8 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none shadow-2xl shadow-slate-900/20">
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Current Month Earnings</p>
              <h2 className="text-4xl font-black">₹0.00</h2>
              <div className="flex items-center gap-1.5 text-slate-400 mt-2 text-sm font-bold">
                No recent pay adjustments
              </div>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
              <DollarSign size={32} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Basic Pay</p>
              <p className="text-lg font-bold">₹0</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Allowances</p>
              <p className="text-lg font-bold">₹0</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Deductions</p>
              <p className="text-lg font-bold">₹0</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="dash-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 mb-4">Payroll Documents</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-primary-50 rounded-xl transition text-sm font-semibold text-slate-700 hover:text-primary-600">
                <div className="flex items-center gap-3">
                  <Download size={18} className="text-slate-400" /> Latest Payslip
                </div>
                <ArrowUpRight size={16} />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-primary-50 rounded-xl transition text-sm font-semibold text-slate-700 hover:text-primary-600">
                <div className="flex items-center gap-3">
                  <Download size={18} className="text-slate-400" /> Tax Form (16A)
                </div>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
          <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <p className="text-xs text-slate-400 font-medium italic">No pending payments scheduled.</p>
          </div>
        </motion.div>
      </div>

      {/* Payment History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="dash-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Calendar size={18} className="text-slate-400" />
          <h2 className="font-bold text-slate-800">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Transaction Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaryHistory.length > 0 ? salaryHistory.map((row, i) => (
                <tr key={i}>
                  <td className="font-bold text-slate-800">{row.month}</td>
                  <td className="text-slate-500">{row.date}</td>
                  <td className="font-black text-slate-700">₹{row.amount.toLocaleString()}</td>
                  <td><span className="badge badge-green">{row.status}</span></td>
                  <td>
                    <button className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition">
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-slate-400 font-medium italic">
                    No payroll history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default StaffSalary;
