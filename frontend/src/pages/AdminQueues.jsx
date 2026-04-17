import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, ToggleLeft, ToggleRight, Settings, Search, ListOrdered, Activity, MoreVertical, LayoutGrid, List, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, Button, Badge, Input, LoadingSkeleton } from '../components/UI';
import { motion, AnimatePresence } from 'framer-motion';

const AdminQueues = () => {
  const [queues, setQueues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQueueName, setNewQueueName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchQueues();
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newQueueName.trim()) return;
    try {
      await api.post('/admin/queue', { 
        name: newQueueName,
        categoryId: newCategoryId || undefined 
      });
      toast.success('Queue initialized');
      setNewQueueName('');
      setNewCategoryId('');
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
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Service Queues</h1>
          <p className="text-slate-500 font-medium">Manage and monitor your department service lines in real-time.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter services..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm"
            />
          </div>
          <Button onClick={() => setShowModal(true)} className="shadow-indigo-200 py-3.5">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Queue</span>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 border-none shadow-sm" glass>
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
            <ListOrdered className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Services</p>
            <p className="text-xl font-black text-slate-900">{queues.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border-none shadow-sm" glass>
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Lines</p>
            <p className="text-xl font-black text-slate-900">{queues.filter(q => q.isActive).length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border-none shadow-sm" glass>
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
            <ToggleLeft className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paused Lines</p>
            <p className="text-xl font-black text-slate-900">{queues.filter(q => !q.isActive).length}</p>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="p-0 overflow-hidden border-none shadow-xl shadow-slate-200/50 relative">
        <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
          <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest text-xs">
            <List className="w-4 h-4 text-indigo-500" />
            Service Registry
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Counter Identity</th>
                <th className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Hierarchy (S > B > C)</th>
                <th className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Current Token</th>
                <th className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Operational Status</th>
                <th className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="p-12"><LoadingSkeleton rows={5} /></td></tr>
              ) : filteredQueues.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-24 text-center">
                    <p className="text-slate-900 font-bold mb-1">No queues found</p>
                  </td>
                </tr>
              ) : (
                filteredQueues.map((queue, i) => (
                  <motion.tr 
                    key={queue._id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-slate-50/80 transition-all duration-300"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                          <ListOrdered className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-700 text-base">{queue.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        {queue.categoryId ? (
                          <>
                            {queue.categoryId.branchId?.serviceId?.name || '---'} 
                            <span className="mx-1 text-indigo-300">›</span>
                            {queue.categoryId.branchId?.name || '---'}
                            <span className="mx-1 text-indigo-300">›</span>
                            <span className="text-slate-600">{queue.categoryId.name}</span>
                          </>
                        ) : (
                          <span className="text-slate-300">No Category Assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-lg font-mono text-sm font-black text-slate-600 border border-slate-200">
                        #{queue.currentTokenNumber.toString().padStart(3, '0')}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge color={queue.isActive ? 'emerald' : 'amber'}>
                        {queue.isActive ? 'Operational' : 'Paused'}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={() => handleToggleActive(queue._id, queue.isActive)}
                          className={`p-2.5 rounded-xl border transition-all ${
                            queue.isActive 
                              ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' 
                              : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                          }`}
                        >
                          {queue.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                        </button>
                        <button className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all">
                          <Settings className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modern Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Initialize Queue</h3>
                  <p className="text-slate-500 font-medium text-sm">Assign a counter to a department.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                  <Plus className="w-6 h-6 text-slate-400 rotate-45" />
                </button>
              </div>
              
              <form onSubmit={handleCreate} className="p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Parent Category</label>
                  <select 
                    className="w-full h-14 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    value={newCategoryId}
                    onChange={e => setNewCategoryId(e.target.value)}
                    required
                  >
                    <option value="">Select Category...</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.branchId?.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Counter Name</label>
                  <div className="relative group">
                    <ListOrdered className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      required
                      placeholder="e.g. Counter 1, Window A"
                      value={newQueueName}
                      onChange={(e) => setNewQueueName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="secondary" type="button" className="flex-1 py-4 text-sm" onClick={() => setShowModal(false)}>Discard</Button>
                  <Button type="submit" className="flex-1 py-4 text-sm shadow-indigo-200">Activate Counter</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminQueues;
