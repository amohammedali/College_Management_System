import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { User, Mail, Shield, Book, GraduationCap, Phone, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentProfile = () => {
  const { data: student, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => axios.get(`${API}/student/profile`).then(r => r.data),
  });

  if (isLoading) return <div className="p-8"><div className="skeleton h-64 w-full rounded-3xl" /></div>;

  const profileInfo = [
    { label: 'Full Name', value: student?.name || 'N/A', icon: User },
    { label: 'Email Address', value: student?.user?.email || 'N/A', icon: Mail },
    { label: 'Student ID', value: student?.studentId || 'N/A', icon: Shield },
    { label: 'Department', value: student?.department || 'N/A', icon: Book },
    { label: 'Current Class', value: student?.class || 'N/A', icon: GraduationCap },
    { label: 'Phone', value: student?.phone || 'N/A', icon: Phone },
    { label: 'Address', value: student?.address || 'N/A', icon: MapPin },
  ];

  return (
    <DashboardLayout title="My Profile" subtitle="View and manage your student profile">
      <div className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="dash-card p-8 flex flex-col items-center text-center lg:col-span-1"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black mb-4 shadow-xl shadow-green-500/20">
              {student?.name?.charAt(0) || 'S'}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{student?.name}</h2>
            <p className="text-sm text-slate-500 font-medium">Student — {student?.department}</p>
            <div className="mt-6 w-full space-y-2">
              <button className="btn-primary w-full text-sm py-2.5">Edit Profile</button>
            </div>
          </motion.div>

          {/* Details Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="dash-card p-8 lg:col-span-2"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Personal & Academic Info</h3>
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
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
