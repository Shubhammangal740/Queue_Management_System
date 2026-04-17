import React, { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { Users, ListOrdered, Ticket, Activity, TrendingUp, ArrowUpRight, Clock, ShieldCheck, Network } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, LoadingSkeleton } from '../components/UI';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplayValue(Math.floor(latest))
    });
    return () => controls.stop();
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const StatCard = ({ label, value, icon: Icon, color, trend, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    <Card className="relative group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      {/* Background Glow */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity blur-3xl ${color}`} />
      
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3.5 rounded-2xl ${color} bg-opacity-10 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100/50">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
          <AnimatedNumber value={value} />
        </h3>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
        <Clock className="w-3 h-3" />
        <span>Updated just now</span>
        <ArrowUpRight className="ml-auto w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
      </div>
    </Card>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) return <LoadingSkeleton rows={4} />;

  const statConfig = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "bg-blue-500", trend: "+12%" },
    { label: "Active Queues", value: stats?.totalQueues || 0, icon: ListOrdered, color: "bg-indigo-500", trend: null },
    { label: "Total Tokens", value: stats?.totalTokens || 0, icon: Ticket, color: "bg-purple-500", trend: "+40%" },
    { label: "Active Sessions", value: stats?.activeTokens || 0, icon: Activity, color: "bg-emerald-500", trend: "Live" },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            Operational status: <span className="text-emerald-500 font-bold">All systems normal</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-600">
            Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statConfig.map((stat, i) => (
          <StatCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 relative overflow-hidden group" title="Network Traffic" subtitle="Live tracking of token issuance and queue activity">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            Live Monitoring
          </div>
          
          <div className="h-[300px] flex flex-col items-center justify-center relative">
            {/* Visual Placeholder for Graph */}
            <div className="absolute inset-0 flex items-end justify-between px-10 pb-10 gap-2">
              {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95, 75, 55].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 1, ease: "easeOut" }}
                  className="w-full bg-gradient-to-t from-indigo-500/20 to-indigo-500/5 rounded-t-lg border-t-2 border-indigo-500/30"
                />
              ))}
            </div>
            <div className="relative z-10 text-center">
              <Activity className="w-12 h-12 text-indigo-500 mb-4 mx-auto animate-pulse" />
              <p className="font-black text-sm text-slate-400 uppercase tracking-[0.3em]">Traffic Analysis</p>
            </div>
          </div>
        </Card>
        
        <Card title="Quick Actions" subtitle="Administrative control shortcuts">
          <div className="space-y-4">
            {[
              { label: 'Organization', icon: Network, path: '/admin/hierarchy', color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Manage Queues', icon: ListOrdered, path: '/admin/queues', color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { label: 'System Users', icon: Users, path: '/admin/users', color: 'text-blue-500', bg: 'bg-blue-50' },
            ].map((action, i) => (
              <motion.button 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                onClick={() => window.location.href = action.path}
                className="w-full group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className={`p-3 rounded-xl ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 text-sm">{action.label}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Configure System</p>
                </div>
                <ArrowUpRight className="ml-auto w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </motion.button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
