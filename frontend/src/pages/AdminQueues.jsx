import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, ToggleLeft, ToggleRight, Settings, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, Button, Badge, Input, LoadingSkeleton } from '../components/UI';
import { motion, AnimatePresence } from 'framer-motion';

const AdminQueues = () => {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQueueName, setNewQueueName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchQueues();
  }, []);

  const fetchQueues = async () => {
    try {
      const response = await api.get('/admin/queues');
      setQueues(response.data.data);
    } catch (error) {
      toast.error('Sync error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newQueueName.trim()) return;
    try {
      await api.post('/admin/queue', { name: newQueueName });
      toast.success('Queue initialized');
      setNewQueueName('');
      setShowModal(false);
      fetchQueues();
    } catch (error) {
      toast.error('Creation failed');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/queue/${id}`, { isActive: !currentStatus });
      toast.success(`Queue ${currentStatus ? 'Paused' : 'Resumed'}`);
      setQueues(queues.map(q => q._id === id ? { ...q, isActive: !currentStatus } : q));
    } catch (error) {
      toast.error('Status update failed');
    }
  };

  const filteredQueues = queues.filter(q => q.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Service Queues</h3>
          <p className="text-sm text-slate-500 font-medium">Configure and monitor active service lines</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-5 h-5" />
          New Queue
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="max-w-xs">
            <Input 
              placeholder="Search queues..." 
              icon={Search} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest">Token High</th>
                <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="p-10"><LoadingSkeleton rows={3} /></td></tr>
              ) : filteredQueues.length === 0 ? (
                <tr><td colSpan="4" className="p-20 text-center text-slate-400 font-medium italic">No queues found matching your search.</td></tr>
              ) : (
                filteredQueues.map((queue) => (
                  <tr key={queue._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 font-bold text-slate-700">{queue.name}</td>
                    <td className="px-6 py-5 font-mono text-slate-500 font-bold">{queue.currentTokenNumber}</td>
                    <td className="px-6 py-5">
                      <Badge color={queue.isActive ? 'emerald' : 'amber'}>
                        {queue.isActive ? 'Active' : 'Paused'}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleActive(queue._id, queue.isActive)}
                          className={`p-2 rounded-xl transition-all ${
                            queue.isActive ? 'text-amber-500 hover:bg-amber-100' : 'text-emerald-500 hover:bg-emerald-100'
                          }`}
                        >
                          {queue.isActive ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                        </button>
                        <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <Settings className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl" title="Initialize Queue" subtitle="Service name will be visible to users">
              <form onSubmit={handleCreate} className="space-y-6">
                <Input
                  label="Display Name"
                  required
                  autoFocus
                  placeholder="e.g. VIP Lounge, General Inquiries"
                  value={newQueueName}
                  onChange={(e) => setNewQueueName(e.target.value)}
                />
                <div className="flex gap-4">
                  <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1">Create Queue</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminQueues;
