import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { User, Shield, Briefcase, Search, CheckCircle, MoreHorizontal, Mail, ShieldCheck, UserCog } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, Badge, Input, LoadingSkeleton, Button } from '../components/UI';
import { motion } from 'framer-motion';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, queuesRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/queues')
      ]);
      setUsers(usersRes.data.data);
      setQueues(queuesRes.data.data);
    } catch (error) {
      toast.error('Data sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/user/${userId}/role`, { role: newRole });
      toast.success('Access updated');
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      toast.error('Update blocked');
    }
  };

  const handleQueueAssign = async (userId, queueId) => {
    try {
      await api.patch(`/admin/staff/${userId}/assign-queue`, { queueId });
      toast.success('Queue linked to staff');
      setUsers(users.map(u => u._id === userId ? { ...u, queueId } : u));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mapping failed');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Identity & Access</h1>
          <p className="text-slate-500 font-medium">Manage organization permissions and service line assignments.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search identities..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm"
            />
          </div>
          <Button variant="secondary" className="py-3.5">
            <UserCog className="w-5 h-5" />
            <span className="hidden sm:inline">User Settings</span>
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="p-0 overflow-hidden border-none shadow-xl shadow-slate-200/50">
        <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
          <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest text-xs">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            Active Directory
          </h3>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            {filteredUsers.length} Users Found
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Identity Profile</th>
                <th className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Authority Level</th>
                <th className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Service Mapping</th>
                <th className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="4" className="p-12"><LoadingSkeleton rows={5} /></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-24 text-center">
                    <div className="max-w-xs mx-auto text-slate-400 italic">No users matching your criteria.</div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item, i) => (
                  <motion.tr 
                    key={item._id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-slate-50/80 transition-all duration-300"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all duration-300 shadow-inner">
                            <User className="w-6 h-6" />
                          </div>
                          {item.role === 'ADMIN' && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center">
                              <Shield className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-base leading-tight">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-3 h-3 text-slate-300" />
                            <p className="text-xs text-slate-500 font-medium">{item.email}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="relative inline-block w-full max-w-[160px]">
                        <select 
                          value={item.role}
                          onChange={(e) => handleRoleChange(item._id, e.target.value)}
                          className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer text-slate-600"
                        >
                          <option value="USER">Standard User</option>
                          <option value="STAFF">Service Staff</option>
                          <option value="ADMIN">Administrator</option>
                        </select>
                        <MoreHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {item.role === 'STAFF' ? (
                        <div className="flex items-center gap-3">
                          <div className="relative flex-1 max-w-[220px]">
                            <select 
                              value={item.queueId || ''}
                              onChange={(e) => handleQueueAssign(item._id, e.target.value)}
                              className="w-full appearance-none bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-2.5 text-xs font-bold text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
                            >
                              <option value="">Unassigned Role</option>
                              {queues.map(q => <option key={q._id} value={q._id}>{q.name}</option>)}
                            </select>
                            <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-300 pointer-events-none" />
                          </div>
                          {item.queueId && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <Badge color="slate">
                          <span className="flex items-center gap-1.5 opacity-50">
                            <ShieldCheck className="w-3 h-3" />
                            System Controlled
                          </span>
                        </Badge>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                        <MoreHorizontal className="w-6 h-6" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Help Card */}
      <Card glass className="border-none shadow-sm flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Need help with permissions?</p>
            <p className="text-sm text-slate-500">Read our documentation on role-based access control and staff mapping.</p>
          </div>
        </div>
        <Button variant="ghost" className="text-indigo-600 font-black text-xs uppercase tracking-widest">
          View Docs
        </Button>
      </Card>
    </div>
  );
};

export default AdminUsers;
