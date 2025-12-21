import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { 
  Siren, Truck, Radio, Megaphone, Activity, MapPin, 
  CheckCircle, Clock, Shield, Users, BarChart3, ChevronRight 
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AgencyDashboard() {
  const { user, sosRequests } = useStore();
  const [resources, setResources] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  
  // Calculate Stats
  const activeIncidents = sosRequests.filter(r => r.status !== 'resolved').length;
  const criticalIncidents = sosRequests.filter(r => r.status === 'pending').length;
  
  useEffect(() => {
    fetchLogistics();
  }, []);

  const fetchLogistics = async () => {
    try {
      // Mock data if API fails, or fetch real data
      const res = await axios.get('http://localhost:5000/api/logistics');
      setResources(res.data);
    } catch (err) { console.error(err); }
  };

  const sendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    try {
      await axios.post('http://localhost:5000/api/broadcast/create', {
        agencyId: user._id,
        agencyName: user.name,
        title: 'AGENCY ALERT',
        message: broadcastMsg,
        severity: 'medium'
      });
      toast.success("Broadcast Sent");
      setBroadcastMsg('');
    } catch (err) { toast.error("Failed to send"); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1920px] mx-auto space-y-6">
        
        {/* --- 1. COMMAND HEADER --- */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Shield className="text-blue-500" size={24} />
              <h1 className="text-2xl font-bold text-white tracking-wide uppercase">Agency Command // {user?.name}</h1>
            </div>
            <p className="text-slate-400 text-xs font-mono ml-9">UNIT ID: {user?._id?.slice(-6).toUpperCase()} • SECTOR A</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-red-900/20 border border-red-500/30 px-6 py-3 rounded-xl text-center">
              <p className="text-red-500 text-xs font-bold uppercase">Critical</p>
              <p className="text-3xl font-bold text-white leading-none">{criticalIncidents}</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 px-6 py-3 rounded-xl text-center">
              <p className="text-blue-500 text-xs font-bold uppercase">Active Units</p>
              <p className="text-3xl font-bold text-white leading-none">12</p>
            </div>
          </div>
        </div>

        {/* --- 2. MAIN OPERATIONS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COL 1: LIVE INCIDENT FEED (SOS) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[500px]">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Siren className="text-red-500 animate-pulse" size={20} /> Live Incidents
                </h2>
                <Link to="/map" className="text-xs text-blue-400 hover:text-white flex items-center gap-1">
                  View Tactical Map <ChevronRight size={12}/>
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {sosRequests.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600">
                    <CheckCircle size={48} className="mb-2 opacity-50" />
                    <p>All clear. No active distress signals.</p>
                  </div>
                )}
                {sosRequests.map(sos => (
                  <div key={sos._id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center justify-between hover:border-red-500/50 transition-colors group">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-red-500/10 rounded-lg text-red-500 font-bold text-xs flex flex-col items-center justify-center w-16">
                        <span className="text-lg">SOS</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{sos.user?.name || 'Unknown Civilian'}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin size={12} /> {sos.location?.latitude?.toFixed(4)}, {sos.location?.longitude?.toFixed(4)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Clock size={12} /> {new Date(sos.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Link to="/map" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
                      Respond
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK ACTIONS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/logistics" className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-orange-500 flex flex-col items-center justify-center gap-2 group transition-all">
                <Truck className="text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-slate-300">Logistics</span>
              </Link>
              <Link to="/missing" className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-purple-500 flex flex-col items-center justify-center gap-2 group transition-all">
                <Users className="text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-slate-300">Missing Persons</span>
              </Link>
              <Link to="/agencies" className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-blue-500 flex flex-col items-center justify-center gap-2 group transition-all">
                <BarChart3 className="text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-slate-300">Reports</span>
              </Link>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center gap-2 opacity-50">
                <Activity className="text-slate-500" />
                <span className="text-sm font-bold text-slate-500">Unit Status</span>
              </div>
            </div>
          </div>

          {/* COL 2: SIDEBAR WIDGETS */}
          <div className="space-y-6">
            
            {/* BROADCAST WIDGET */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="font-bold text-white flex items-center gap-2 mb-4">
                <Radio className="text-amber-500" size={20} /> Quick Broadcast
              </h2>
              <form onSubmit={sendBroadcast}>
                <textarea 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none resize-none h-32 mb-3"
                  placeholder="Type emergency alert message..."
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                />
                <button className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Megaphone size={18} /> Send Alert
                </button>
              </form>
            </div>

            {/* LOGISTICS SNAPSHOT */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Truck className="text-blue-500" size={20} /> Resources
                </h2>
                <Link to="/logistics" className="text-xs text-blue-400">Manage</Link>
              </div>
              
              <div className="space-y-4">
                {['Food', 'Water', 'Medical', 'Fuel'].map((item, i) => (
                  <div key={item}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{item} Supplies</span>
                      <span>{85 - (i*15)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          i === 0 ? 'bg-emerald-500' : 
                          i === 1 ? 'bg-blue-500' : 
                          i === 2 ? 'bg-red-500' : 'bg-amber-500'
                        }`} 
                        style={{ width: `${85 - (i*15)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}