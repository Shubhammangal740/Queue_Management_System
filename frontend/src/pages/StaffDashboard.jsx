import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { 
  Users, 
  Ticket, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Pause, 
  LogOut,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge, LoadingSkeleton } from '../components/UI';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [queueData, setQueueData] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const { on, connected } = useSocket(queueData?.queue?._id);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (on) {
      on('TOKEN_CREATED', () => {
        fetchData();
        toast('New user joined', { icon: '👋' });
      });
      on('TOKEN_UPDATED', () => fetchData());
      on('QUEUE_UPDATED', () => fetchData());
    }
  }, [on]);

  const fetchData = async () => {
    try {
      const [statusRes, tokensRes] = await Promise.all([
        api.get('/staff/queue'),
        api.get('/staff/queue/tokens')
      ]);
      setQueueData(statusRes.data.data);
      setTokens(tokensRes.data.data);
    } catch (error) {
      console.error('Fetch error');
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    setProcessing(true);
    try {
      const res = await api.post('/staff/queue/call-next');
      toast.success('User called');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Call failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (tokenId, status) => {
    setProcessing(true);
    try {
      const res = await api.patch(`/staff/token/${tokenId}/status`, { status });
      toast.success(`Marked as ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Status update failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleTogglePause = async () => {
    try {
      const res = await api.patch('/staff/queue/pause');
      toast.success(res.data.message);
      fetchData();
    } catch (error) {
      toast.error('Failed to pause');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center p-20"><LoadingSkeleton rows={5} /></div>;

  if (!queueData?.queue) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <Card className="text-center max-w-sm" title="No Assignment" subtitle="Assignment Required">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <p className="text-slate-500 mb-8 font-medium">Please contact an administrator to be assigned to a service line.</p>
          <Button onClick={handleLogout} className="w-full justify-center">Logout</Button>
        </Card>
      </div>
    );
  }

  const currentlyServing = tokens.find(t => t.status === 'CALLED');
  const waitingTokens = tokens.filter(t => t.status === 'WAITING');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar for Staff */}
      <aside className="w-full lg:w-80 bg-white border-b lg:border-r border-slate-200 lg:h-screen lg:fixed p-8 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Ticket className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">StaffPortal</h1>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{connected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Line</p>
            <h2 className="text-2xl font-black text-indigo-600">{queueData.queue.name}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Waiting</p>
              <p className="text-2xl font-black text-slate-800">{waitingTokens.length}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <Badge color={queueData.queue.isActive ? 'emerald' : 'amber'}>
                {queueData.queue.isActive ? 'Open' : 'Paused'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-black">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-700 text-sm">{user?.name}</p>
              <p className="text-[10px] font-black text-indigo-500 uppercase">Operator</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-center">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 lg:ml-80 p-4 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Current Serving Card */}
          <Card className="p-0 overflow-hidden relative shadow-2xl border-none">
            <div className="bg-indigo-600 p-8 text-white flex flex-col items-center">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-200 mb-6">Currently Serving</p>
              <motion.div
                key={currentlyServing?.tokenNumber}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-9xl font-black tracking-tighter mb-8"
              >
                {currentlyServing ? currentlyServing.tokenNumber : '--'}
              </motion.div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                {currentlyServing ? (
                  <>
                    <Button 
                      variant="success" 
                      className="flex-1 h-16 text-lg"
                      onClick={() => handleUpdateStatus(currentlyServing._id, 'COMPLETED')}
                      disabled={processing}
                    >
                      <CheckCircle2 className="w-6 h-6" /> Complete
                    </Button>
                    <Button 
                      variant="danger" 
                      className="flex-1 h-16 text-lg"
                      onClick={() => handleUpdateStatus(currentlyServing._id, 'NO_SHOW')}
                      disabled={processing}
                    >
                      <XCircle className="w-6 h-6" /> No Show
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="flex-1 h-16 text-2xl shadow-xl shadow-indigo-900/40 bg-white text-indigo-600 hover:bg-slate-50"
                    onClick={handleCallNext}
                    disabled={processing || !queueData.queue.isActive || waitingTokens.length === 0}
                  >
                    <Play className="w-8 h-8 fill-current" /> CALL NEXT
                  </Button>
                )}
              </div>
            </div>
            
            <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center">
              <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <Clock className="w-4 h-4" /> 
                {currentlyServing ? `Started at ${new Date(currentlyServing.updatedAt).toLocaleTimeString()}` : 'System Idle'}
              </p>
              <Button 
                variant={queueData.queue.isActive ? 'secondary' : 'success'} 
                className="h-10 text-xs px-4"
                onClick={handleTogglePause}
              >
                {queueData.queue.isActive ? <><Pause className="w-4 h-4" /> Pause Line</> : <><Play className="w-4 h-4" /> Open Line</>}
              </Button>
            </div>
          </Card>

          {/* Waiting List */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center justify-between">
              Waiting in Line
              <span className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">{waitingTokens.length} Users</span>
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              <AnimatePresence>
                {waitingTokens.map((token, index) => (
                  <motion.div
                    key={token._id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center hover:border-indigo-200 hover:shadow-md transition-all cursor-default"
                  >
                    <span className="text-4xl font-black text-slate-800 mb-1">{token.tokenNumber}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(token.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {waitingTokens.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-300 font-black uppercase tracking-widest text-sm border-2 border-dashed border-slate-100 rounded-3xl">
                  Queue is empty
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
