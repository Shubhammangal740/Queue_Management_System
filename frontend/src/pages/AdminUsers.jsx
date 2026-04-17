import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { User, Shield, Briefcase, Search, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, Badge, Input, LoadingSkeleton } from '../components/UI';

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Identity & Access</h3>
          <p className="text-sm text-slate-500 font-medium">Manage permissions and assign service responsibilities</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="max-w-xs">
            <Input placeholder="Search users..." icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest">Identity</th>
                <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest">Authority</th>
                <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest">Service Assignment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="p-10"><LoadingSkeleton rows={4} /></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="3" className="p-20 text-center text-slate-400 italic">No identities found.</td></tr>
              ) : (
                filteredUsers.map((item) => (
                  <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">{item.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <select 
                        value={item.role}
                        onChange={(e) => handleRoleChange(item._id, e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer text-slate-600"
                      >
                        <option value="USER">User</option>
                        <option value="STAFF">Staff</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-5">
                      {item.role === 'STAFF' ? (
                        <div className="flex items-center gap-3">
                          <select 
                            value={item.queueId || ''}
                            onChange={(e) => handleQueueAssign(item._id, e.target.value)}
                            className="w-full max-w-[200px] bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-2 text-xs font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          >
                            <option value="">Unassigned</option>
                            {queues.map(q => <option key={q._id} value={q._id}>{q.name}</option>)}
                          </select>
                          {item.queueId && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        </div>
                      ) : (
                        <Badge color="slate">Not Applicable</Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminUsers;
