import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Loader2, ListOrdered, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'STAFF') navigate('/staff');
      else {
        toast.error('Access denied: Mobile app users cannot use the web panel');
        navigate('/unauthorized');
      }
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white selection:bg-indigo-100">
      {/* Left Side: Branding & Visuals */}
      <div className="hidden lg:flex relative flex-col items-center justify-center p-12 bg-slate-950 overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/30 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px]"
        />

        <div className="relative z-10 text-center max-w-lg">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-indigo-300 text-xs font-black uppercase tracking-widest mb-8"
          >
            <Sparkles className="w-3 h-3" />
            <span>Next Generation Queueing</span>
          </motion.div>
          
          <h1 className="text-5xl xl:text-7xl font-black text-white tracking-tighter mb-6 leading-tight">
            Streamline your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Customer Flow.</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
            The intelligent enterprise-grade solution for modern waiting management and real-time analytics.
          </p>

          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { label: 'Real-time', desc: 'Instant updates' },
              { label: 'Analytics', desc: 'Deep insights' },
              { label: 'Scalable', desc: 'Cloud native' },
              { label: 'Secure', desc: 'Role-based access' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5"
              >
                <p className="text-white font-bold text-sm">{feature.label}</p>
                <p className="text-slate-500 text-xs">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-mesh">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center lg:text-left mb-10">
            <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <ListOrdered className="text-white w-7 h-7" />
              </div>
              <span className="font-black text-2xl text-slate-900 tracking-tight">SmartQ</span>
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Please enter your credentials to access the panel.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-slate-700"
                  placeholder="admin@smartq.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot password?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-slate-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none overflow-hidden"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100/50">
            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3">Demo Credentials</p>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Email</span>
                <span className="text-slate-800 font-bold">admin@example.com</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Password</span>
                <span className="text-slate-800 font-bold">password123</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
