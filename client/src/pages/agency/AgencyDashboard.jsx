import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import { 
  AlertTriangle, Shield, Package, Users, Map, MessageSquare, 
  ArrowRight, CheckCircle, Clock, Activity,
  HandHeart, Search, ChevronRight, Building2, RefreshCw,
  Truck, Eye, Pill
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AgencyDashboard() {
  const { user, sosRequests, fetchSOS } = useStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [allSOS, setAllSOS] = useState([]);
  const [myCases, setMyCases] = useState([]);
  const [resources, setResources] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [exchangeBoard, setExchangeBoard] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [programForm, setProgramForm] = useState({ title: '', description: '', type: 'program', location: '', contactDetails: '' });
  const [showProgramForm, setShowProgramForm] = useState(false);

  const agencyId = user?._id;
  const agencyName = user?.agencyDetails?.agencyName || user?.name;

  useEffect(() => {
    fetchSOS();
    fetchData();
    const interval = setInterval(() => { fetchSOS(); fetchData(); }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [sosRes, resRes, volRes, exchRes, progRes] = await Promise.all([
        api.get('/api/sos/active').catch(() => ({ data: [] })),
        api.get(`/api/logistics/agency/${agencyId}`).catch(() => ({ data: [] })),
        api.get('/api/community/help-offers').catch(() => ({ data: [] })),
        api.get('/api/exchange/board').catch(() => ({ data: [] })),
        api.get('/api/agency-services').catch(() => ({ data: [] })),
      ]);
      
      const all = Array.isArray(sosRes.data) ? sosRes.data : (sosRes.data?.sos || []);
      setAllSOS(all);
      setMyCases(all.filter(s => s.assignedAgency === agencyId));
      setResources(Array.isArray(resRes.data) ? resRes.data : []);
      setVolunteers(Array.isArray(volRes.data) ? volRes.data : []);
      setExchangeBoard(Array.isArray(exchRes.data) ? exchRes.data : []);
      setPrograms(Array.isArray(progRes.data) ? progRes.data.filter(p => p.agencyId === agencyId) : []);
    } catch (err) { console.warn(err?.response?.status || err.message); }
  };

  const handleTakeCase = async (sosId) => {
    const toastId = toast.loading('Taking case...');
    try {
      await api.put(`/api/sos/assign/${sosId}`, { agencyId, agencyName });
      toast.success('Case assigned to you!', { id: toastId });
      fetchSOS();
      fetchData();
    } catch (err) { toast.error('Failed', { id: toastId }); }
  };

  const handleUpdateStatus = async (sosId, status) => {
    try {
      await api.put(`/api/sos/status/${sosId}`, { status });
      toast.success(`Status updated: ${status}`);
      fetchSOS();
      fetchData();
    } catch (err) { toast.error('Failed'); }
  };

  const handlePostProgram = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/agency-services', programForm);
      toast.success('Posted successfully');
      setProgramForm({ title: '', description: '', type: 'program', location: '', contactDetails: '' });
      setShowProgramForm(false);
      fetchData();
    } catch (err) { toast.error('Failed to post'); }
  };

  const handleDeleteProgram = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/api/agency-services/${id}`);
      toast.success('Deleted');
      fetchData();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'cases', label: 'SOS Cases', icon: AlertTriangle, badge: allSOS.filter(s => s.status === 'active').length },
    { id: 'mycases', label: 'My Cases', icon: Shield, badge: myCases.length },
    { id: 'volunteers', label: 'Volunteers', icon: HandHeart, badge: volunteers.length },
    { id: 'programs', label: 'Programs & Alerts', icon: Activity, badge: programs.length },
  ];

  const quickLinks = [
    { label: 'Inventory', href: '/logistics', icon: Package, color: 'from-blue-600 to-blue-700' },
    { label: 'Resource Exchange', href: '/exchange', icon: RefreshCw, color: 'from-emerald-600 to-emerald-700' },
    { label: 'Agency Chat', href: '/agency-chat', icon: MessageSquare, color: 'from-purple-600 to-purple-700' },
    { label: 'Tactical Map', href: '/map', icon: Map, color: 'from-cyan-600 to-cyan-700' },
    { label: 'Community Chat', href: '/community', icon: Users, color: 'from-indigo-600 to-indigo-700' },
    { label: 'Missing Persons', href: '/missing', icon: Search, color: 'from-amber-600 to-amber-700' },
    { label: 'Medicine', href: '/medicine', icon: Pill, color: 'from-pink-600 to-pink-700' },
    { label: 'Transport', href: '/transport', icon: Truck, color: 'from-orange-600 to-orange-700' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-blue-900/30 p-6 rounded-2xl border border-blue-500/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="text-blue-400" /> {agencyName} Command Center
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {user?.agencyDetails?.type?.toUpperCase()} • Status: <span className="text-emerald-400">Active</span>
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-red-900/30 border border-red-500/30 px-4 py-2 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-400">{allSOS.filter(s => s.status === 'active').length}</p>
                <p className="text-[10px] text-red-300 uppercase">Open SOS</p>
              </div>
              <div className="bg-blue-900/30 border border-blue-500/30 px-4 py-2 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-400">{myCases.length}</p>
                <p className="text-[10px] text-blue-300 uppercase">My Cases</p>
              </div>
              <div className="bg-emerald-900/30 border border-emerald-500/30 px-4 py-2 rounded-lg text-center">
                <p className="text-2xl font-bold text-emerald-400">{resources.length}</p>
                <p className="text-[10px] text-emerald-300 uppercase">Inventory</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {quickLinks.map(link => (
            <Link key={link.href} to={link.href}
              className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 p-3 rounded-xl transition-all text-center"
            >
              <div className={`w-9 h-9 mx-auto bg-gradient-to-br ${link.color} rounded-lg flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}>
                <link.icon size={16} className="text-white" />
              </div>
              <p className="text-[11px] font-medium text-slate-300">{link.label}</p>
            </Link>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-800 p-1 rounded-xl overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}>
              <tab.icon size={16} /> {tab.label}
              {tab.badge > 0 && (
                <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live SOS Feed */}
            <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
              <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                <AlertTriangle className="text-red-400" size={18} /> Live SOS Feed
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {allSOS.filter(s => s.status === 'active').length === 0 && (
                  <p className="text-slate-500 text-center py-6">No active SOS alerts</p>
                )}
                {allSOS.filter(s => s.status === 'active').slice(0, 8).map(sos => (
                  <div key={sos._id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-red-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <div>
                        <p className="text-sm font-medium text-white">{sos.userName}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{sos.type} • {sos.priority} priority</p>
                      </div>
                    </div>
                    <button onClick={() => handleTakeCase(sos._id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
                      Take Case
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Exchange Board */}
            <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <RefreshCw className="text-emerald-400" size={18} /> Resource Board
                </h3>
                <Link to="/exchange" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                  View All <ChevronRight size={12} />
                </Link>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {exchangeBoard.length === 0 && (
                  <p className="text-slate-500 text-center py-6">No active requests</p>
                )}
                {exchangeBoard.slice(0, 6).map(req => (
                  <div key={req._id} className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium text-white">{req.fromAgencyName}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        req.type === 'request' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>{req.type === 'request' ? 'NEEDS' : 'SURPLUS'}</span>
                    </div>
                    <p className="text-xs text-slate-400">{req.items?.map(i => `${i.name} (${i.quantity})`).join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cases' && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">All Open SOS Alerts</h3>
            {allSOS.filter(s => s.status === 'active').length === 0 && (
              <div className="text-center py-10 text-slate-500 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                No open SOS alerts. All clear! ✅
              </div>
            )}
            {allSOS.filter(s => s.status === 'active').map(sos => (
              <div key={sos._id} className="bg-slate-800 border border-red-500/20 p-5 rounded-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{sos.userName}</h4>
                      <p className="text-sm text-slate-400 capitalize">{sos.type} Emergency • {sos.priority} Priority</p>
                      {sos.details && <p className="text-xs text-slate-500 mt-1">"{sos.details}"</p>}
                      {sos.peopleCount?.infants && <span className="text-xs text-purple-400 mr-2">👶 Infants</span>}
                      {sos.peopleCount?.elderly && <span className="text-xs text-orange-400">👴 Elderly</span>}
                      <p className="text-[10px] text-slate-600 mt-1">📍 {sos.location?.lat?.toFixed(4)}, {sos.location?.lng?.toFixed(4)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleTakeCase(sos._id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-lg transition-colors flex items-center gap-1">
                      <Shield size={14} /> Take Case
                    </button>
                    <a href={`https://www.google.com/maps?q=${sos.location?.lat},${sos.location?.lng}`} target="_blank" rel="noopener noreferrer"
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1">
                      <Map size={14} /> Navigate
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'mycases' && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">My Assigned Cases</h3>
            {myCases.length === 0 && (
              <div className="text-center py-10 text-slate-500 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                No cases assigned to you yet. Take a case from the SOS tab.
              </div>
            )}
            {myCases.map(sos => (
              <div key={sos._id} className="bg-slate-800 border border-blue-500/20 p-5 rounded-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">{sos.userName}</h4>
                    <p className="text-sm text-slate-400 capitalize">{sos.type} • Status: <span className="text-blue-400">{sos.status}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateStatus(sos._id, 'in-progress')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                      <Clock size={12} /> In Progress
                    </button>
                    <button onClick={() => handleUpdateStatus(sos._id, 'resolved')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                      <CheckCircle size={12} /> Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'volunteers' && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">Community Volunteers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {volunteers.length === 0 && (
                <div className="col-span-full text-center py-10 text-slate-500 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                  No volunteer offers yet.
                </div>
              )}
              {volunteers.map((vol, i) => (
                <div key={vol._id || i} className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <HandHeart size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{vol.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{vol.type}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{vol.details}</p>
                  {vol.contact && <p className="text-xs text-blue-400">📞 {vol.contact}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Programs & Alerts Tab */}
        {activeTab === 'programs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">My Programs & Alerts</h3>
              <button onClick={() => setShowProgramForm(!showProgramForm)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold">
                + Post New
              </button>
            </div>

            {showProgramForm && (
              <form onSubmit={handlePostProgram} className="bg-slate-800 border border-blue-500/30 p-6 rounded-xl space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Title" className="bg-slate-900 border border-slate-700 p-3 rounded-lg text-white outline-none"
                    value={programForm.title} onChange={e => setProgramForm({...programForm, title: e.target.value})} />
                  <select className="bg-slate-900 border border-slate-700 p-3 rounded-lg text-white outline-none"
                    value={programForm.type} onChange={e => setProgramForm({...programForm, type: e.target.value})}>
                    <option value="program">Program / Camp</option>
                    <option value="service">Ongoing Service</option>
                    <option value="alert">Emergency Alert</option>
                  </select>
                </div>
                <textarea required placeholder="Description..." className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white outline-none" rows={3}
                  value={programForm.description} onChange={e => setProgramForm({...programForm, description: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Location (optional)" className="bg-slate-900 border border-slate-700 p-3 rounded-lg text-white outline-none"
                    value={programForm.location} onChange={e => setProgramForm({...programForm, location: e.target.value})} />
                  <input placeholder="Contact Details (optional)" className="bg-slate-900 border border-slate-700 p-3 rounded-lg text-white outline-none"
                    value={programForm.contactDetails} onChange={e => setProgramForm({...programForm, contactDetails: e.target.value})} />
                </div>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm w-full">Post Now</button>
              </form>
            )}

            <div className="space-y-4">
              {programs.length === 0 && <p className="text-slate-500 text-center py-6">You haven't posted any programs or alerts.</p>}
              {programs.map(srv => (
                <div key={srv._id} className="bg-slate-800 border border-slate-700 p-5 rounded-xl flex justify-between items-start">
                  <div>
                    <div className="flex gap-2 items-center mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        srv.type === 'alert' ? 'bg-red-500/20 text-red-500' :
                        srv.type === 'program' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'
                      }`}>{srv.type}</span>
                      <h4 className="font-bold text-white">{srv.title}</h4>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{srv.description}</p>
                    <div className="flex gap-4 text-xs text-slate-500">
                      {srv.location && <span>📍 {srv.location}</span>}
                      {srv.contactDetails && <span>📞 {srv.contactDetails}</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteProgram(srv._id)} className="text-red-400 hover:text-red-300 text-xs font-bold bg-red-900/30 px-3 py-1.5 rounded-lg">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}