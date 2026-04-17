import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Users, ListOrdered, Ticket, Activity, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, LoadingSkeleton } from '../components/UI';

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
  <Card className="flex items-center gap-5 border-none shadow-md overflow-hidden relative group">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-lg z-10 transition-transform group-hover:scale-110`}>
      <Icon className="text-white w-7 h-7" />
    </div>
    <div className="z-10">
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-black text-slate-800">{value}</h3>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
    </div>
    {/* Decorative background icon */}
    <Icon className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 transition-colors group-hover:text-indigo-50/50" />
  </Card>
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Users" value={stats?.totalUsers || 0} icon={Users} color="bg-blue-500" trend="+12%" />
        <StatCard label="Queues" value={stats?.totalQueues || 0} icon={ListOrdered} color="bg-indigo-500" />
        <StatCard label="Tokens Issued" value={stats?.totalTokens || 0} icon={Ticket} color="bg-pink-500" trend="+40%" />
        <StatCard label="Active Now" value={stats?.activeTokens || 0} icon={Activity} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2" title="System Performance" subtitle="Real-time system health and traffic overview">
          <div className="h-64 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
            <Activity className="w-12 h-12 mb-2 animate-pulse" />
            <p className="font-bold text-sm uppercase tracking-widest">Live Graph Placeholder</p>
          </div>
        </Card>
        
        <Card title="Quick Actions" subtitle="Frequent administrative tasks">
          <div className="space-y-3">
            <button onClick={() => window.location.href='/admin/queues'} className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-between group">
              <span className="font-bold text-slate-700">Create New Queue</span>
              <ListOrdered className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
            </button>
            <button onClick={() => window.location.href='/admin/users'} className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-between group">
              <span className="font-bold text-slate-700">Assign Staff Members</span>
              <Users className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
