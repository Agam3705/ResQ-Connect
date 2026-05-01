import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { 
  Users, AlertTriangle, Shield, Building2, Activity, Eye, EyeOff,
  CheckCircle, XCircle, Megaphone, Send, BarChart3, TrendingUp,
  Globe, Package, Search, ChevronDown, AlertOctagon, UserCog, HeartPulse
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingAgencies, setPendingAgencies] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [rumors, setRumors] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Broadcast form
  const [broadcast, setBroadcast] = useState({ title: '', message: '', severity: 'info', targetRole: 'all' });
  
  // Confirm Modal state
  const [confirmData, setConfirmData] = useState({ open: false, title: '', message: '', onConfirm: null, isDanger: false });
  
  // Disaster form
  const [disasterForm, setDisasterForm] = useState({ name: '', type: 'flood', severity: 'high', location: { name: '', lat: 0, lng: 0 }, description: '' });
  const [showDisasterForm, setShowDisasterForm] = useState(false);

  // Rumor form
  const [rumorForm, setRumorForm] = useState({ title: '', description: '' });
  const [showRumorForm, setShowRumorForm] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, pendingRes, disastersRes, rumorsRes, hazardsRes] = await Promise.all([
        api.get('/api/admin/stats').catch(() => ({ data: null })),
        api.get('/api/admin/users').catch(() => ({ data: { users: [] } })),
        api.get('/api/admin/pending-agencies').catch(() => ({ data: [] })),
        api.get('/api/admin/disasters').catch(() => ({ data: [] })),
        api.get('/api/admin/rumors').catch(() => ({ data: [] })),
        api.get('/api/community/hazards?all=true').catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data?.users || []);
      setPendingAgencies(pendingRes.data || []);
      setDisasters(disastersRes.data || []);
      setRumors(rumorsRes.data || []);
      setHazards(hazardsRes.data || []);
    } catch (err) { console.warn(err?.response?.status || err.message); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try { await api.put(`/api/admin/approve/${id}`); toast.success('Agency Approved'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const handleReject = async (id) => {
    try { await api.put(`/api/admin/reject/${id}`); toast.success('Agency Rejected'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const toggleUserStatus = async (id, isActive) => {
    try { await api.put(`/api/admin/users/${id}/status`, { isActive: !isActive }); toast.success('Updated'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const changeUserRole = async (id, role) => {
    try { await api.put(`/api/admin/users/${id}/role`, { role }); toast.success('Role updated'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const sendBroadcast = async () => {
    if (!broadcast.title || !broadcast.message) return toast.error('Title and message required');
    try { await api.post('/api/admin/broadcast', broadcast); toast.success('Broadcast sent!'); setBroadcast({ title: '', message: '', severity: 'info', targetRole: 'all' }); }
    catch { toast.error('Failed'); }
  };

  const createDisaster = async () => {
    if (!disasterForm.name || !disasterForm.location.name) return toast.error('Fill required fields');
    try { await api.post('/api/admin/disasters', disasterForm); toast.success('Disaster zone declared'); setShowDisasterForm(false); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const closeDisaster = async (id) => {
    try { await api.put(`/api/admin/disasters/${id}/close`); toast.success('Disaster resolved'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const verifyRumor = async (id, status) => {
    try { await api.put(`/api/admin/rumors/${id}/verify`, { adminStatus: status }); toast.success('Updated'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const verifyHazard = async (id, status) => {
    try { await api.put(`/api/community/hazard/${id}/status`, { status }); toast.success('Updated'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const createRumor = async (e) => {
    e.preventDefault();
    if (!rumorForm.title || !rumorForm.description) return toast.error('Fill required fields');
    try { await api.post('/api/admin/rumors', rumorForm); toast.success('Rumor Poll Created'); setShowRumorForm(false); setRumorForm({ title: '', description: '' }); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const deleteRumor = async (id) => {
    try { 
      await api.delete(`/api/admin/rumors/${id}`); 
      toast.success('Deleted'); 
      setConfirmData({ ...confirmData, open: false });
      fetchAll(); 
    } catch { toast.error('Failed'); }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const tabs = [
    { id: 'overview', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users, badge: users.length },
    { id: 'agencies', label: 'Agency Verification', icon: Shield, badge: pendingAgencies.length },
    { id: 'disasters', label: 'Disasters', icon: Globe, badge: disasters.filter(d => d.status === 'active').length },
    { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
    { id: 'rumors', label: 'Rumor Control', icon: AlertOctagon },
    { id: 'hazards', label: 'Hazard Review', icon: AlertTriangle, badge: hazards.filter(h => h.approvalStatus === 'pending').length },
    { id: 'firstaid', label: 'First Aid', icon: HeartPulse },
  ];

  const overview = stats?.overview || {};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/20 via-slate-900 to-red-900/20 p-6 rounded-2xl border border-red-500/20">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-red-400" /> Admin Control Panel
          </h1>
          <p className="text-slate-400 text-sm mt-1">System-wide management and oversight</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-800 p-1 rounded-xl overflow-x-auto gap-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}>
              <tab.icon size={16} /> {tab.label}
              {tab.badge > 0 && <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{tab.badge}</span>}
            </button>
          ))}
        </div>

        {/* === OVERVIEW TAB === */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Users', value: overview.totalUsers || 0, icon: Users, color: 'text-blue-400' },
                { label: 'Active SOS', value: overview.activeSOS || 0, icon: AlertTriangle, color: 'text-red-400' },
                { label: 'Agencies', value: overview.totalAgencies || 0, icon: Building2, color: 'text-emerald-400' },
                { label: 'Pending Approval', value: overview.pendingAgencies || 0, icon: Shield, color: 'text-amber-400' },
                { label: 'Active Disasters', value: overview.activeDisasters || 0, icon: Globe, color: 'text-purple-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon size={18} className={stat.color} />
                    <TrendingUp size={14} className="text-slate-600" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Charts placeholder - SOS by type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
                <h3 className="font-bold text-white mb-4">SOS by Type</h3>
                <div className="space-y-3">
                  {(stats?.charts?.sosByType || []).map((item, i) => {
                    const maxCount = Math.max(...(stats?.charts?.sosByType || []).map(s => s.count), 1);
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300 capitalize">{item._id || 'Unknown'}</span>
                          <span className="text-white font-bold">{item.count}</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all" style={{ width: `${(item.count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {(!stats?.charts?.sosByType || stats.charts.sosByType.length === 0) && (
                    <p className="text-slate-500 text-center py-4">No SOS data</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
                <h3 className="font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(stats?.recent?.recentSOS || []).map((sos, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div>
                        <p className="text-sm text-white">{sos.userName} - {sos.type}</p>
                        <p className="text-[10px] text-slate-500">{new Date(sos.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === USERS TAB === */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-slate-500" size={16} />
                <input className="w-full pl-10 p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-blue-500"
                  placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 text-white text-sm outline-none"
                value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="all">All Roles</option>
                <option value="civilian">Civilians</option>
                <option value="agency">Agencies</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="p-3 text-left">User</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-center">Role</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredUsers.map(u => (
                      <tr key={u._id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-3 text-white font-medium">{u.name}</td>
                        <td className="p-3 text-slate-400">{u.email}</td>
                        <td className="p-3 text-center">
                          <select className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none"
                            value={u.role} onChange={e => changeUserRole(u._id, e.target.value)}>
                            <option value="civilian">Civilian</option>
                            <option value="agency">Agency</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.isActive !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {u.isActive !== false ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button onClick={() => toggleUserStatus(u._id, u.isActive !== false)}
                            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors" title={u.isActive !== false ? 'Disable' : 'Enable'}>
                            {u.isActive !== false ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* === AGENCIES TAB === */}
        {activeTab === 'agencies' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Pending Agency Applications</h3>
            {pendingAgencies.length === 0 && (
              <div className="text-center py-10 text-slate-500 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">No pending applications</div>
            )}
            {pendingAgencies.map(ag => (
              <div key={ag._id} className="bg-slate-800 border border-amber-500/20 p-5 rounded-xl">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">{ag.name}</h4>
                    <p className="text-sm text-slate-400">{ag.email}</p>
                    <div className="mt-2 space-y-1 text-xs text-slate-400">
                      <p>Agency: <span className="text-white">{ag.agencyDetails?.agencyName}</span></p>
                      <p>Type: <span className="text-white capitalize">{ag.agencyDetails?.type}</span></p>
                      <p>Commander: <span className="text-white">{ag.agencyDetails?.commanderName}</span></p>
                      <p>Phone: <span className="text-white">{ag.agencyDetails?.phone}</span></p>
                      {ag.agencyDetails?.services?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ag.agencyDetails.services.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px]">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleApprove(ag._id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg flex items-center gap-1">
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button onClick={() => handleReject(ag._id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-lg flex items-center gap-1">
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* === DISASTERS TAB === */}
        {activeTab === 'disasters' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Disaster Zones</h3>
              <button onClick={() => setShowDisasterForm(!showDisasterForm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-lg">
                + Declare Disaster
              </button>
            </div>

            {showDisasterForm && (
              <div className="bg-slate-800 border border-red-500/20 p-6 rounded-xl space-y-3">
                <h4 className="font-bold text-white">New Disaster Declaration</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Name (e.g. Chennai Floods)" className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none" 
                    value={disasterForm.name} onChange={e => setDisasterForm({...disasterForm, name: e.target.value})} />
                  <select className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none"
                    value={disasterForm.type} onChange={e => setDisasterForm({...disasterForm, type: e.target.value})}>
                    {['flood','earthquake','cyclone','fire','pandemic','landslide','tsunami','drought','other'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input placeholder="Location Name" className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none"
                    value={disasterForm.location.name} onChange={e => setDisasterForm({...disasterForm, location: {...disasterForm.location, name: e.target.value}})} />
                  <select className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none"
                    value={disasterForm.severity} onChange={e => setDisasterForm({...disasterForm, severity: e.target.value})}>
                    {['critical','high','medium','low'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <textarea placeholder="Description..." className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none" rows={2}
                  value={disasterForm.description} onChange={e => setDisasterForm({...disasterForm, description: e.target.value})} />
                <button onClick={createDisaster} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-lg">Declare</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {disasters.map(d => (
                <div key={d._id} className={`bg-slate-800 border p-5 rounded-xl ${d.status === 'active' ? 'border-red-500/30' : 'border-slate-700'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-white">{d.name}</h4>
                      <p className="text-xs text-slate-400 capitalize">{d.type} • {d.location?.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      d.status === 'active' ? 'bg-red-500/20 text-red-400' :
                      d.status === 'contained' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>{d.status}</span>
                  </div>
                  <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 ${
                    d.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    d.severity === 'high' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>Severity: {d.severity}</div>
                  {d.description && <p className="text-xs text-slate-400 mb-3">{d.description}</p>}
                  {d.status === 'active' && (
                    <button onClick={() => closeDisaster(d._id)} className="text-xs text-emerald-400 hover:text-emerald-300 font-bold">Mark Resolved →</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === BROADCAST TAB === */}
        {activeTab === 'broadcast' && (
          <div className="max-w-2xl mx-auto bg-slate-800 border border-slate-700 p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Megaphone className="text-amber-400" /> System Broadcast</h3>
            <input placeholder="Title" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white outline-none"
              value={broadcast.title} onChange={e => setBroadcast({...broadcast, title: e.target.value})} />
            <textarea placeholder="Message..." className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white outline-none" rows={3}
              value={broadcast.message} onChange={e => setBroadcast({...broadcast, message: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <select className="bg-slate-900 border border-slate-700 p-3 rounded-lg text-white outline-none"
                value={broadcast.severity} onChange={e => setBroadcast({...broadcast, severity: e.target.value})}>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
              <select className="bg-slate-900 border border-slate-700 p-3 rounded-lg text-white outline-none"
                value={broadcast.targetRole} onChange={e => setBroadcast({...broadcast, targetRole: e.target.value})}>
                <option value="all">All Users</option>
                <option value="civilian">Civilians Only</option>
                <option value="agency">Agencies Only</option>
              </select>
            </div>
            <button onClick={sendBroadcast} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
              <Send size={18} /> Send Broadcast
            </button>
          </div>
        )}

        {/* === RUMORS TAB === */}
        {activeTab === 'rumors' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Rumor Moderation</h3>
              <button onClick={() => setShowRumorForm(!showRumorForm)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg">
                + Add Rumor Poll
              </button>
            </div>

            {showRumorForm && (
              <form onSubmit={createRumor} className="bg-slate-800 border border-indigo-500/50 p-6 rounded-xl space-y-3">
                <h4 className="font-bold text-white">New Rumor Poll</h4>
                <input placeholder="Rumor Title" className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none" required
                  value={rumorForm.title} onChange={e => setRumorForm({...rumorForm, title: e.target.value})} />
                <textarea placeholder="Rumor Description..." className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none" rows={2} required
                  value={rumorForm.description} onChange={e => setRumorForm({...rumorForm, description: e.target.value})} />
                <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg">Create Poll</button>
              </form>
            )}

            {rumors.length === 0 && (
              <div className="text-center py-10 text-slate-500 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">No rumors to moderate</div>
            )}
            {rumors.map(r => (
              <div key={r._id} className="bg-slate-800 border border-slate-700 p-5 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white">{r.title}</h4>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    r.adminStatus === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                    r.adminStatus === 'debunked' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'
                  }`}>{r.adminStatus}</span>
                </div>
                <p className="text-sm text-slate-400 mb-3">{r.description}</p>
                <div className="text-xs text-slate-500 mb-3">Votes: True {r.votesTrue} | Fake {r.votesFalse}</div>
                <div className="flex gap-2">
                  <button onClick={() => verifyRumor(r._id, 'verified')} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg">✓ Verify</button>
                  <button onClick={() => verifyRumor(r._id, 'debunked')} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg">✗ Debunk</button>
                  <button onClick={() => setConfirmData({
                    open: true, title: 'Delete Rumor', message: 'Delete this rumor poll?', 
                    onConfirm: () => deleteRumor(r._id), isDanger: true
                  })} className="px-3 py-1.5 bg-red-900/40 text-red-400 hover:text-red-300 text-xs font-bold rounded-lg ml-auto">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* === HAZARDS TAB === */}
        {activeTab === 'hazards' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Hazard Review Pipeline</h3>
            {hazards.length === 0 && (
              <div className="text-center py-10 text-slate-500 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">No hazards reported</div>
            )}
            {hazards.map(h => (
              <div key={h._id} className="bg-slate-800 border border-slate-700 p-5 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white uppercase">{h.type} Hazard</h4>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    h.approvalStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                    h.approvalStatus === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>{h.approvalStatus}</span>
                </div>
                <p className="text-sm text-slate-400 mb-2">{h.description}</p>
                {h.location && h.location.lat && (
                  <p className="text-xs text-blue-400 mb-3">📍 Location: {h.location.lat.toFixed(4)}, {h.location.lng.toFixed(4)}</p>
                )}
                <div className="flex gap-2">
                  <button onClick={() => verifyHazard(h._id, 'approved')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors">✓ Approve</button>
                  <button onClick={() => verifyHazard(h._id, 'rejected')} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors">✗ Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* === FIRST AID TAB === */}
        {activeTab === 'firstaid' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">First Aid Management</h3>
              <Link to="/first-aid" className="text-blue-400 hover:underline text-sm font-medium">Go to First Aid Page →</Link>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-xl text-center">
              <HeartPulse size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 max-w-md mx-auto">Use the First Aid page directly to manage guides. You can add, edit, and delete custom instructions there.</p>
              <button onClick={() => navigate('/first-aid')} className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg">Manage Guides</button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={confirmData.open}
        onClose={() => setConfirmData({ ...confirmData, open: false })}
        onConfirm={confirmData.onConfirm}
        title={confirmData.title}
        message={confirmData.message}
        isDanger={confirmData.isDanger}
      />
    </DashboardLayout>
  );
}