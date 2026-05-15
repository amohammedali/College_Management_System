import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import { User, Mail, Shield, Book, Briefcase, Award, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const StaffProfile = () => {
  const { user } = useAuth();

  const profileInfo = [
    { label: 'Full Name', value: 'Dr. Rekha Iyer', icon: User },
    { label: 'Email Address', value: user?.email || 'rekha@college.com', icon: Mail },
    { label: 'Staff ID', value: 'STF001', icon: Shield },
    { label: 'Department', value: 'Computer Science & Eng', icon: Book },
    { label: 'Designation', value: 'Asst. Professor', icon: Briefcase },
    { label: 'Experience', value: '8 Years', icon: Award },
    { label: 'Phone', value: '+91 98765 43210', icon: Phone },
    { label: 'Office', value: 'Block A, Room 302', icon: MapPin },
  ];

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your personal and professional information">
      <div className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="dash-card p-8 flex flex-col items-center text-center lg:col-span-1"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-blue-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black mb-4 shadow-xl shadow-primary-500/20">
              R
            </div>
            <h2 className="text-xl font-bold text-slate-800">Dr. Rekha Iyer</h2>
            <p className="text-sm text-slate-500 font-medium">Asst. Professor</p>
            <div className="mt-6 w-full space-y-2">
              <button className="btn-primary w-full text-sm py-2.5">Edit Profile</button>
              <button className="w-full py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition">Change Password</button>
            </div>
          </motion.div>

          {/* Details Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="dash-card p-8 lg:col-span-2"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profileInfo.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-4 bg-primary-50/50 border border-primary-100 rounded-2xl">
              <h4 className="text-sm font-bold text-primary-700 mb-2">Academic Biography</h4>
              <p className="text-xs text-primary-600 leading-relaxed">
                Specializing in Fluid Mechanics and Thermodynamics. Published over 15 research papers in international journals. Currently lead researcher for the "Sustainable Energy" project in Block A.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffProfile;
