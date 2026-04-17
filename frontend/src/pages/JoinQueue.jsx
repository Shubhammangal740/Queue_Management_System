import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Card, Button, Badge, LoadingSkeleton } from '../components/UI';
import { 
  Building2, 
  MapPin, 
  Layers, 
  ListOrdered, 
  Ticket, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const JoinQueue = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [queues, setQueues] = useState([]);
  
  const [selection, setSelection] = useState({
    service: null,
    branch: null,
    category: null,
    queue: null
  });

  const [generatedToken, setGeneratedToken] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services');
      setServices(res.data.data);
    } catch (error) { toast.error('Failed to load services'); }
    finally { setLoading(false); }
  };

  const fetchBranches = async (serviceId) => {
    setLoading(true);
    try {
      const res = await api.get(`/branches?serviceId=${serviceId}`);
      setBranches(res.data.data);
    } catch (error) { toast.error('Failed to load branches'); }
    finally { setLoading(false); }
  };

  const fetchCategories = async (branchId) => {
    setLoading(true);
    try {
      const res = await api.get(`/categories?branchId=${branchId}`);
      setCategories(res.data.data);
    } catch (error) { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  const fetchQueues = async (categoryId) => {
    setLoading(true);
    try {
      const res = await api.get(`/queues?categoryId=${categoryId}`);
      setQueues(res.data.data);
    } catch (error) { toast.error('Failed to load counters'); }
    finally { setLoading(false); }
  };

  const handleSelectService = (service) => {
    setSelection({ ...selection, service, branch: null, category: null, queue: null });
    fetchBranches(service._id);
    setStep(2);
  };

  const handleSelectBranch = (branch) => {
    setSelection({ ...selection, branch, category: null, queue: null });
    fetchCategories(branch._id);
    setStep(3);
  };

  const handleSelectCategory = (category) => {
    setSelection({ ...selection, category, queue: null });
    fetchQueues(category._id);
    setStep(4);
  };

  const handleSelectQueue = (queue) => {
    setSelection({ ...selection, queue });
    setStep(5);
  };

  const handleGenerateToken = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/queue/${selection.queue._id}/token`);
      setGeneratedToken(res.data.data);
      toast.success('Token Generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelection({ service: null, branch: null, category: null, queue: null });
    setGeneratedToken(null);
  };

  if (generatedToken) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="max-w-md w-full p-0 overflow-hidden shadow-2xl border-none">
            <div className="bg-indigo-600 p-10 text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest text-indigo-100 mb-2">Your Token</h2>
              <div className="text-8xl font-black tracking-tighter mb-4">{generatedToken.tokenNumber}</div>
              <p className="font-bold opacity-80">{selection.queue.name}</p>
            </div>
            <div className="p-8 space-y-6 bg-white">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-bold uppercase">Service</span>
                  <span className="text-slate-900 font-black">{selection.service.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-bold uppercase">Branch</span>
                  <span className="text-slate-900 font-black">{selection.branch.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-bold uppercase">Category</span>
                  <span className="text-slate-900 font-black">{selection.category.name}</span>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100">
                <Button onClick={reset} className="w-full justify-center h-14 text-lg">Done</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-20">
      <div className="max-w-2xl mx-auto space-y-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Join Queue</h1>
            <p className="text-slate-500 font-medium">Select a service to get your token.</p>
          </div>
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
        </header>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-3">
          {[1, 2, 3, 4, 5].map(s => (
            <div 
              key={s} 
              className={`h-2 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`} 
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 gap-4"
          >
            {loading ? (
              <LoadingSkeleton rows={4} />
            ) : (
              <>
                {step === 1 && (
                  <div className="space-y-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Step 1: Select Service</p>
                    {services.map(s => (
                      <button 
                        key={s._id}
                        onClick={() => handleSelectService(s)}
                        className="w-full p-6 bg-white rounded-[2rem] border border-slate-200 hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-100 flex items-center justify-between group transition-all duration-300"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Building2 className="w-7 h-7" />
                          </div>
                          <span className="text-xl font-black text-slate-800">{s.name}</span>
                        </div>
                        <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Step 2: Select Branch</p>
                    {branches.map(b => (
                      <button 
                        key={b._id}
                        onClick={() => handleSelectBranch(b)}
                        className="w-full p-6 bg-white rounded-[2rem] border border-slate-200 hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-100 flex items-center justify-between group transition-all duration-300"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <MapPin className="w-7 h-7" />
                          </div>
                          <span className="text-xl font-black text-slate-800">{b.name}</span>
                        </div>
                        <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </button>
                    ))}
                    {branches.length === 0 && <p className="text-center py-20 font-bold text-slate-400">No branches available for this service.</p>}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Step 3: Select Category</p>
                    {categories.map(c => (
                      <button 
                        key={c._id}
                        onClick={() => handleSelectCategory(c)}
                        className="w-full p-6 bg-white rounded-[2rem] border border-slate-200 hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-100 flex items-center justify-between group transition-all duration-300"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Layers className="w-7 h-7" />
                          </div>
                          <span className="text-xl font-black text-slate-800">{c.name}</span>
                        </div>
                        <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </button>
                    ))}
                    {categories.length === 0 && <p className="text-center py-20 font-bold text-slate-400">No departments available here.</p>}
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Step 4: Select Counter</p>
                    {queues.map(q => (
                      <button 
                        key={q._id}
                        onClick={() => handleSelectQueue(q)}
                        className="w-full p-6 bg-white rounded-[2rem] border border-slate-200 hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-100 flex items-center justify-between group transition-all duration-300"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <ListOrdered className="w-7 h-7" />
                          </div>
                          <div className="text-left">
                            <span className="text-xl font-black text-slate-800 block">{q.name}</span>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Wait Time: ~15 mins</span>
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </button>
                    ))}
                    {queues.length === 0 && <p className="text-center py-20 font-bold text-slate-400">No active counters at this time.</p>}
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-10 py-10">
                    <Card className="p-10 text-center border-none shadow-xl bg-white rounded-[3rem]">
                      <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-200">
                        <Ticket className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">Ready to join?</h2>
                      <p className="text-slate-500 font-medium mb-10 px-10">You are about to join the <span className="text-indigo-600 font-black">{selection.queue.name}</span> in <span className="text-indigo-600 font-black">{selection.branch.name}</span>.</p>
                      
                      <div className="space-y-3">
                        <Button onClick={handleGenerateToken} className="w-full h-16 text-lg justify-center" disabled={loading}>
                          Generate Token
                        </Button>
                        <Button variant="ghost" onClick={reset} className="w-full justify-center text-slate-400">Cancel</Button>
                      </div>
                    </Card>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JoinQueue;
