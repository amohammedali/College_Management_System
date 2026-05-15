import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, GraduationCap, Loader2, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #075985 40%, #0369a1 100%)' }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} className="w-full max-w-md px-4">
        <div className="glass rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={30} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Reset Password</h1>
            <p className="text-white/50 text-sm mt-1">
              {sent ? 'Check your inbox for a reset link.' : "Enter your email and we'll send a reset link."}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input id="forgot-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full pl-10 pr-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder:text-white/20 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30 transition text-sm"
                    placeholder="you@college.com"
                  />
                </div>
              </div>

              <motion.button id="reset-btn" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                disabled={loading} type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
              </motion.button>
            </form>
          ) : (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-center py-4">
              <CheckCircle size={56} className="mx-auto text-green-400 mb-4" />
              <p className="text-white/70 text-sm">A reset link has been sent to <strong className="text-white">{email}</strong></p>
            </motion.div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-white/40 text-sm hover:text-white/70 transition inline-flex items-center gap-1.5">
              <ArrowLeft size={14} /> Back to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
