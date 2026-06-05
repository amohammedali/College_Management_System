import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const roleRedirects: Record<string, string> = {
    admin: '/admin', staff: '/staff', student: '/student', 'non-teaching': '/staff',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const stored = JSON.parse(localStorage.getItem('cms_user') || '{}');
      navigate(roleRedirects[stored.role] || '/login');
    } catch {
      // error shown from context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900"
      style={{ 
        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.9)), url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>

      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-3xl" />
      </div>

      {/* Floating dots */}
      {[...Array(8)].map((_, i) => (
        <motion.div key={i}
          className="absolute w-1.5 h-1.5 bg-white/20 rounded-full"
          style={{ top: `${10 + i * 11}%`, left: `${5 + i * 12}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-4"
      >
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border border-white/5">
                Official Portal v1.0.4
              </span>
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-primary-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <GraduationCap size={30} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">University Gateway</h1>
            <p className="text-white/50 text-sm mt-1 uppercase tracking-widest font-bold">Administrative & Academic Access</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/20 border border-red-400/30 text-red-200 text-sm rounded-xl p-3 mb-4 text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder:text-white/20 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30 transition text-sm"
                  placeholder="you@college.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-300 hover:text-primary-200 transition">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input id="password" type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full pl-10 pr-12 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder:text-white/20 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30 transition text-sm"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button id="login-btn" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              disabled={loading} type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-400 hover:to-cyan-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-600/30 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><LogIn size={18} /> Sign In</>}
            </motion.button>
          </form>

          {/* Quick Login for Demo */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide text-center mb-3">Demo Quick Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setEmail('admin@college.com'); setPassword('admin123'); }}
                className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 text-xs transition">
                Admin
              </button>
              <button type="button" onClick={() => { setEmail('hod_civil@college.com'); setPassword('staff123'); }}
                className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 text-xs transition">
                HOD (Civil)
              </button>
              <button type="button" onClick={() => { setEmail('kamran@gmail.com'); setPassword('staff123'); }}
                className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 text-xs transition">
                Faculty
              </button>
              <button type="button" onClick={() => { setEmail('student1@college.com'); setPassword('student123'); }}
                className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 text-xs transition">
                Student
              </button>
            </div>
          </div>

          {/* Support info */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-black">
              Institutional Access Only
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
