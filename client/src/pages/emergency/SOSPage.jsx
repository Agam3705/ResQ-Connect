import { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';
import { useStore } from '../../store/useStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AlertTriangle, CheckCircle, Phone, MapPin, Loader2, Volume2, VolumeX, Baby, Activity, Info, Shield, Search, Filter, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';

const SIREN_URL = "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg";

// ========= CIVILIAN VIEW =========
function CivilianSOSView() {
  const { user, sosRequests, fetchSOS } = useStore();
  const [loading, setLoading] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const audioRef = useRef(new Audio(SIREN_URL));
  const [detailsSent, setDetailsSent] = useState(false);
  const [formData, setFormData] = useState({ type: 'general', details: '', infants: false, elderly: false });

  const userId = user?._id || user?.id;
  const myActiveSOS = sosRequests.find(s => s.userId === userId && s.status === 'active');

  useEffect(() => {
    fetchSOS();
    audioRef.current.loop = true;
    return () => { audioRef.current.pause(); audioRef.current.currentTime = 0; };
  }, []);

  const toggleSiren = () => {
    if (sirenActive) { audioRef.current.pause(); audioRef.current.currentTime = 0; setSirenActive(false); }
    else { audioRef.current.play().catch(() => toast.error("Click to enable audio")); setSirenActive(true); }
  };

  const handleTrigger = async () => {
    setLoading(true);
    const toastId = toast.loading("Broadcasting Emergency...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await api.post('/api/sos/create', { userId, userName: user.name, location: { lat: pos.coords.latitude, lng: pos.coords.longitude }, type: 'general', priority: 'high' });
          toast.success("HELP IS ON THE WAY!", { id: toastId, duration: 5000 });
          setDetailsSent(false);
          fetchSOS();
        } catch (err) { toast.error("Failed to send", { id: toastId }); }
        finally { setLoading(false); }
      }, () => { toast.error("Enable GPS", { id: toastId }); setLoading(false); });
    } else { toast.error("GPS not supported"); setLoading(false); }
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    if (!myActiveSOS) return;
    try {
      await api.put(`/api/sos/update/${myActiveSOS._id}`, formData);
      toast.success("Details Updated!");
      setDetailsSent(true);
    } catch (err) { toast.error("Failed"); }
  };

  const handleSafe = async () => {
    if (!myActiveSOS) return;
    try {
      await api.post('/api/sos/resolve', { sosId: myActiveSOS._id });
      if (sirenActive) toggleSiren();
      setDetailsSent(false);
      setFormData({ type: 'general', details: '', infants: false, elderly: false });
      toast.success("You are marked as Safe");
      fetchSOS();
    } catch (err) { toast.error("Failed"); }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-2">SOS Signal</h1>
        <p className="text-slate-400">Triggering alert notifies Police, Medical, and Agencies.</p>
      </div>
      <div className="flex flex-col items-center justify-center mb-8">
        {myActiveSOS ? (
          <div className="w-full">
            <div className="bg-red-900/20 border-2 border-red-500 rounded-2xl p-6 text-center mb-6 animate-pulse">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-3" />
              <h2 className="text-3xl font-black text-white uppercase">SOS ACTIVE</h2>
              <p className="text-red-200 font-bold">Responders are tracking your location.</p>
              {myActiveSOS.assignedAgencyName && (
                <p className="text-emerald-400 font-bold mt-2">🏥 {myActiveSOS.assignedAgencyName} is responding!</p>
              )}
            </div>
            {!detailsSent ? (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Info className="text-blue-400" /> Critical Details (Optional)</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {['accident', 'violence', 'medical', 'fire'].map(t => (
                    <button key={t} onClick={() => setFormData({...formData, type: t})}
                      className={`p-3 rounded-xl border font-bold capitalize transition-all ${formData.type === t ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>{t}</button>
                  ))}
                </div>
                <div className="flex gap-4 mb-4">
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer ${formData.infants ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                    <input type="checkbox" className="hidden" checked={formData.infants} onChange={e => setFormData({...formData, infants: e.target.checked})} /><Baby size={20} /> Infants?
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer ${formData.elderly ? 'bg-orange-600/20 border-orange-500 text-orange-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                    <input type="checkbox" className="hidden" checked={formData.elderly} onChange={e => setFormData({...formData, elderly: e.target.checked})} /><Activity size={20} /> Elderly?
                  </label>
                </div>
                <textarea placeholder="Any other details?" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm mb-4 focus:border-blue-500 outline-none" rows={2}
                  value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} />
                <button onClick={handleSubmitDetails} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl">Update Responders</button>
              </div>
            ) : (
              <div className="bg-emerald-900/20 border border-emerald-500/50 p-4 rounded-xl text-center mb-6">
                <p className="text-emerald-400 font-bold">Details sent to responders.</p>
              </div>
            )}
            <button onClick={handleSafe} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl py-6 rounded-2xl flex items-center justify-center gap-3">
              <CheckCircle size={32} /> I AM SAFE NOW
            </button>
          </div>
        ) : (
          <button onClick={handleTrigger} disabled={loading}
            className="group relative w-72 h-72 rounded-full bg-gradient-to-br from-red-600 to-red-800 shadow-[0_0_50px_rgba(220,38,38,0.5)] hover:shadow-[0_0_80px_rgba(220,38,38,0.7)] border-8 border-red-900 flex flex-col items-center justify-center transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 className="w-24 h-24 text-white animate-spin" /> : (
              <><span className="text-6xl font-black text-white mb-2">SOS</span><span className="text-sm text-red-200 uppercase tracking-widest font-bold">Tap for Help</span></>
            )}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button onClick={toggleSiren} className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${sirenActive ? 'bg-yellow-500 text-black border-yellow-600 animate-pulse font-bold' : 'bg-slate-800 text-white border-slate-700'}`}>
          {sirenActive ? <VolumeX size={24}/> : <Volume2 size={24}/>} {sirenActive ? "STOP SIREN" : "LOUD SIREN"}
        </button>
        <a href="tel:100" className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-white flex items-center justify-center gap-3 hover:bg-slate-700">
          <Phone size={24} className="text-blue-500" /> Call Police
        </a>
      </div>
    </div>
  );
}

// ========= AGENCY/ADMIN COMMAND CENTER =========
function SOSCommandCenter() {
  const { user, sosRequests, fetchSOS, assignSOS, updateSOSStatus } = useStore();
  const [allSOS, setAllSOS] = useState([]);
  const [filter, setFilter] = useState({ type: '', status: '', priority: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const agencyId = user?._id;
  const agencyName = user?.agencyDetails?.agencyName || user?.name;

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    try {
      const res = await api.get('/api/sos/all?limit=100');
      setAllSOS(res.data?.sos || res.data || []);
    } catch (err) {}
    fetchSOS();
  };

  const handleTakeCase = async (sosId) => {
    try {
      await assignSOS(sosId, agencyId, agencyName, '');
      toast.success('Case assigned!');
      fetchAll();
    } catch (err) { toast.error('Failed'); }
  };

  const handleUpdateStatus = async (sosId, status) => {
    try {
      await updateSOSStatus(sosId, status, '');
      toast.success(`Status → ${status}`);
      fetchAll();
    } catch (err) { toast.error('Failed'); }
  };

  const filtered = allSOS.filter(s => {
    if (filter.type && s.type !== filter.type) return false;
    if (filter.status && s.status !== filter.status) return false;
    if (filter.priority && s.priority !== filter.priority) return false;
    if (searchTerm && !s.userName?.toLowerCase().includes(searchTerm.toLowerCase()) && !s.details?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const active = filtered.filter(s => ['active', 'assigned', 'in-progress'].includes(s.status));
  const resolved = filtered.filter(s => s.status === 'resolved');

  const statusColor = (s) => {
    if (s === 'active') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (s === 'assigned') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (s === 'in-progress') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Shield className="text-red-400" /> SOS Command Center</h1>
          <p className="text-slate-400 text-sm">{active.length} active alerts • {resolved.length} resolved</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
          <input placeholder="Search name or details..." className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white text-sm outline-none focus:border-blue-500"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
          value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})}>
          <option value="">All Types</option>
          {['general','medical','fire','flood','accident','violence'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
          value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}>
          <option value="">All Status</option>
          {['active','assigned','in-progress','resolved'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
          value={filter.priority} onChange={e => setFilter({...filter, priority: e.target.value})}>
          <option value="">All Priority</option>
          {['low','medium','high','critical'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Active Alerts */}
      <div className="space-y-3">
        {active.length === 0 && <p className="text-slate-500 text-center py-10">No active alerts matching filters</p>}
        {active.map(sos => (
          <div key={sos._id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors">
            <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-500" size={24} />
                <div>
                  <h3 className="font-bold text-white text-lg">{sos.userName}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <Clock size={12} /> {new Date(sos.createdAt).toLocaleString()}
                    {sos.location && <span className="flex items-center gap-1"><MapPin size={12} /> {sos.location.lat?.toFixed(4)}, {sos.location.lng?.toFixed(4)}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${statusColor(sos.status)}`}>{sos.status}</span>
                <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-slate-700 text-slate-300">{sos.type}</span>
                {sos.priority === 'high' && <span className="px-2 py-1 rounded text-[10px] font-bold bg-red-600 text-white">HIGH</span>}
              </div>
            </div>

            {sos.details && <p className="text-sm text-slate-300 mb-2 italic">"{sos.details}"</p>}
            {(sos.peopleCount?.infants || sos.peopleCount?.elderly) && (
              <div className="flex gap-2 mb-2">
                {sos.peopleCount?.infants && <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">👶 Infants</span>}
                {sos.peopleCount?.elderly && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">👴 Elderly</span>}
              </div>
            )}

            {/* Assigned Agency Info (Admin sees this) */}
            {sos.assignedAgencyName && (
              <p className="text-xs text-emerald-400 mb-3 flex items-center gap-1">
                <User size={12} /> Handled by: <strong>{sos.assignedAgencyName}</strong>
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-700">
              {sos.status === 'active' && (
                <button onClick={() => handleTakeCase(sos._id)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg">
                  Take Case
                </button>
              )}
              {sos.status === 'assigned' && sos.assignedAgency === agencyId && (
                <button onClick={() => handleUpdateStatus(sos._id, 'in-progress')} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg">
                  Start Response
                </button>
              )}
              {['assigned', 'in-progress'].includes(sos.status) && (sos.assignedAgency === agencyId || user?.role === 'admin') && (
                <button onClick={() => handleUpdateStatus(sos._id, 'resolved')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg">
                  Mark Resolved
                </button>
              )}
              {sos.location && (
                <a href={`https://maps.google.com/?q=${sos.location.lat},${sos.location.lng}`} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                  <MapPin size={12} /> View on Map
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resolved (Collapsible) */}
      {resolved.length > 0 && (
        <details className="group">
          <summary className="text-slate-400 text-sm cursor-pointer hover:text-white transition-colors">
            Show {resolved.length} resolved alerts
          </summary>
          <div className="mt-3 space-y-2">
            {resolved.slice(0, 20).map(sos => (
              <div key={sos._id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <span className="text-sm text-slate-300">{sos.userName}</span>
                  <span className="text-xs text-slate-500 ml-2">{sos.type} • {new Date(sos.createdAt).toLocaleDateString()}</span>
                  {sos.assignedAgencyName && <span className="text-xs text-emerald-500 ml-2">→ {sos.assignedAgencyName}</span>}
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold">RESOLVED</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

// ========= MAIN PAGE (ROLE SWITCH) =========
export function SOSPage() {
  const { user } = useStore();
  const isCivilian = user?.role === 'civilian';

  return (
    <DashboardLayout>
      {isCivilian ? <CivilianSOSView /> : <SOSCommandCenter />}
    </DashboardLayout>
  );
}