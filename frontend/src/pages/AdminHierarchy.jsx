import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Card, Button, Input, LoadingSkeleton } from '../components/UI';
import { Network, Plus, ChevronRight, Layers, MapPin, Building2, ListOrdered, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AdminHierarchy = () => {
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newService, setNewService] = useState('');
  const [newBranch, setNewBranch] = useState({ name: '', serviceId: '' });
  const [newCategory, setNewCategory] = useState({ name: '', branchId: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, bRes, cRes] = await Promise.all([
        api.get('/services'),
        api.get('/branches'),
        api.get('/categories')
      ]);
      setServices(sRes.data.data || []);
      setBranches(bRes.data.data || []);
      setCategories(cRes.data.data || []);
    } catch (error) {
      console.error('Fetch Error:', error);
      toast.error('System synchronization failed. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!newService.trim()) return;
    setSubmitting(true);
    try {
      const response = await api.post('/admin/service', { name: newService.trim() });
      if (response.data.success) {
        toast.success('Service operational');
        setNewService('');
        await fetchData();
      }
    } catch (error) { 
      toast.error(error.response?.data?.message || 'Failed to initialize service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!newBranch.name.trim() || !newBranch.serviceId) return;
    setSubmitting(true);
    try {
      await api.post('/admin/branch', newBranch);
      toast.success('Branch established');
      setNewBranch({ name: '', serviceId: '' });
      await fetchData();
    } catch (error) { 
      toast.error(error.response?.data?.message || 'Failed to establish branch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim() || !newCategory.branchId) return;
    setSubmitting(true);
    try {
      await api.post('/admin/category', newCategory);
      toast.success('Category activated');
      setNewCategory({ name: '', branchId: '' });
      await fetchData();
    } catch (error) { 
      toast.error(error.response?.data?.message || 'Failed to activate category');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col gap-6">
      <LoadingSkeleton rows={1} className="h-20" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <LoadingSkeleton rows={4} />
        <LoadingSkeleton rows={4} />
        <LoadingSkeleton rows={4} />
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <header className="relative overflow-hidden p-10 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Network className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Architecture</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">System Hierarchy Builder</h1>
          <p className="text-slate-500 font-medium max-w-xl">Configure your organizational structure from top to bottom. Initialize services, branches, and departments to start serving users.</p>
        </div>
        <Sparkles className="absolute -right-10 -bottom-10 w-64 h-64 text-indigo-500/5 rotate-12" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Services Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-[10px]">
              <Building2 className="w-4 h-4 text-indigo-500" /> Level 1: Services
            </div>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black">{services.length}</span>
          </div>
          
          <Card className="p-6 border-none shadow-xl shadow-slate-200/50">
            <form onSubmit={handleCreateService} className="relative mb-8">
              <Input 
                placeholder="Hospital, Bank, etc..." 
                value={newService} 
                onChange={e => setNewService(e.target.value)}
                className="pr-14 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 transition-all"
                disabled={submitting}
              />
              <button 
                type="submit" 
                disabled={!newService.trim() || submitting}
                className="absolute right-2 top-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {services.map((s, i) => (
                  <motion.div 
                    key={s._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-indigo-200 hover:shadow-md transition-all cursor-default"
                  >
                    <span className="font-bold text-slate-700 text-sm">{s.name}</span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <ArrowRight className="w-4 h-4 text-indigo-400" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {services.length === 0 && !submitting && (
                <div className="py-10 text-center border-2 border-dashed border-slate-50 rounded-3xl">
                  <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No Services</p>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Branches Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-[10px]">
              <MapPin className="w-4 h-4 text-blue-500" /> Level 2: Branches
            </div>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black">{branches.length}</span>
          </div>

          <Card className="p-6 border-none shadow-xl shadow-slate-200/50">
            <form onSubmit={handleCreateBranch} className="space-y-4 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent Service</label>
                <select 
                  className="w-full h-14 px-4 rounded-2xl bg-slate-50 border border-transparent text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all outline-none"
                  value={newBranch.serviceId}
                  onChange={e => setNewBranch({...newBranch, serviceId: e.target.value})}
                  disabled={submitting}
                >
                  <option value="">Select Service...</option>
                  {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              
              <div className="relative">
                <Input 
                  placeholder="New Branch Name..." 
                  value={newBranch.name} 
                  onChange={e => setNewBranch({...newBranch, name: e.target.value})}
                  className="pr-14 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all"
                  disabled={submitting}
                />
                <button 
                  type="submit" 
                  disabled={!newBranch.name.trim() || !newBranch.serviceId || submitting}
                  className="absolute right-2 top-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-30 transition-all shadow-lg shadow-blue-200"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {branches.map((b, i) => (
                  <motion.div 
                    key={b._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <p className="font-bold text-slate-700 text-sm">{b.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight">{b.serviceId?.name || '---'}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </section>

        {/* Categories Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-[10px]">
              <Layers className="w-4 h-4 text-emerald-500" /> Level 3: Categories
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black">{categories.length}</span>
          </div>

          <Card className="p-6 border-none shadow-xl shadow-slate-200/50">
            <form onSubmit={handleCreateCategory} className="space-y-4 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent Branch</label>
                <select 
                  className="w-full h-14 px-4 rounded-2xl bg-slate-50 border border-transparent text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  value={newCategory.branchId}
                  onChange={e => setNewCategory({...newCategory, branchId: e.target.value})}
                  disabled={submitting}
                >
                  <option value="">Select Branch...</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.serviceId?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Input 
                  placeholder="New Category Name..." 
                  value={newCategory.name} 
                  onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                  className="pr-14 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 transition-all"
                  disabled={submitting}
                />
                <button 
                  type="submit" 
                  disabled={!newCategory.name.trim() || !newCategory.branchId || submitting}
                  className="absolute right-2 top-2 p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-30 transition-all shadow-lg shadow-emerald-200"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {categories.map((c, i) => (
                  <motion.div 
                    key={c._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all group"
                  >
                    <p className="font-bold text-slate-700 text-sm">{c.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight">
                        {c.branchId?.name} • {c.branchId?.serviceId?.name}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </section>
      </div>

      {/* Redirect to Queues */}
      <Card className="p-8 border-none shadow-xl bg-indigo-600 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-2">Ready to define Counters?</h3>
          <p className="text-indigo-100 font-medium">After setting up your hierarchy, you can assign physical counters (Queues) to each category.</p>
        </div>
        <Button 
          variant="secondary" 
          className="bg-white text-indigo-600 hover:bg-indigo-50 h-14 px-8 relative z-10"
          onClick={() => window.location.href = '/admin/queues'}
        >
          Manage Counters <ListOrdered className="w-5 h-5" />
        </Button>
        <Network className="absolute -right-20 -top-20 w-80 h-80 text-white/5" />
      </Card>
    </div>
  );
};

export default AdminHierarchy;
