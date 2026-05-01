import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import { 
  AlertTriangle, Shield, Heart, Map, Users, Search, Building2, 
  MessageSquare, FileText, Package, Pill, Truck, 
  HandHeart, Phone, ChevronRight, Bell, Activity
} from 'lucide-react';

export function CivilianDashboard() {
  const { user, sosRequests, fetchSOS } = useStore();
  const [agencies, setAgencies] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchSOS();
    fetchDashboardData();
    const interval = setInterval(fetchSOS, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [agRes, notifRes] = await Promise.all([
        api.get('/api/social/agencies').catch(() => ({ data: [] })),
        api.get(`/api/user/notifications/${user?._id}`).catch(() => ({ data: [] })),
      ]);
      setAgencies(Array.isArray(agRes.data) ? agRes.data.slice(0, 6) : []);
      setNotifications(Array.isArray(notifRes.data) ? notifRes.data.slice(0, 5) : []);
    } catch (err) { console.warn(err?.response?.status || err.message); }
  };

  const quickLinks = [
    { icon: AlertTriangle, label: 'SOS Alert', href: '/sos', color: 'from-red-600 to-red-700', desc: 'Emergency Help' },
    { icon: Map, label: 'Tactical Map', href: '/map', color: 'from-blue-600 to-blue-700', desc: 'Live Situation' },
    { icon: Heart, label: 'First Aid', href: '/first-aid', color: 'from-emerald-600 to-emerald-700', desc: 'Medical Guides' },
    { icon: Users, label: 'Family Circle', href: '/family', color: 'from-violet-600 to-violet-700', desc: 'Track Family' },

    { icon: Search, label: 'Missing Person', href: '/missing', color: 'from-amber-600 to-amber-700', desc: 'Find People' },
    { icon: Pill, label: 'Medicine', href: '/medicine', color: 'from-pink-600 to-pink-700', desc: 'P2P Exchange' },
    { icon: Truck, label: 'Transport', href: '/transport', color: 'from-orange-600 to-orange-700', desc: 'Evacuation' },
    { icon: HandHeart, label: 'Volunteer', href: '/volunteer', color: 'from-teal-600 to-teal-700', desc: 'Help Others' },
    { icon: MessageSquare, label: 'Community', href: '/community', color: 'from-indigo-600 to-indigo-700', desc: 'Chat & Support' },
    { icon: Building2, label: 'Agencies', href: '/agencies', color: 'from-slate-600 to-slate-700', desc: 'Get Help' },
    { icon: FileText, label: 'Documents', href: '/documents', color: 'from-gray-600 to-gray-700', desc: 'Secure Vault' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome, <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">{user?.name}</span>
            </h1>
            <p className="text-slate-400 mt-1">Emergency Dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          {/* Status Bar */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 font-medium">System Online</span>
            </div>
            {sosRequests.length > 0 && (
              <div className="flex items-center gap-2 bg-red-900/30 px-3 py-1.5 rounded-lg border border-red-500/30 text-xs animate-pulse">
                <AlertTriangle size={12} className="text-red-500" />
                <span className="text-red-400 font-bold">{sosRequests.length} Active SOS</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Access Grid */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Activity size={18} className="text-blue-400" /> Quick Access
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {quickLinks.map(link => (
              <Link key={link.href} to={link.href}
                className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 p-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${link.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg`}>
                  <link.icon size={20} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-white">{link.label}</h3>
                <p className="text-[10px] text-slate-500">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Notifications */}
          <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white flex items-center gap-2"><Bell size={16} className="text-amber-400" /> Notifications</h3>
              <Link to="/profile" className="text-xs text-blue-400 hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {notifications.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No new notifications</p>}
              {notifications.map((n, i) => (
                <div key={n._id || i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.type === 'alert' ? 'bg-red-500' : n.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="text-sm text-white font-medium leading-tight">{n.title}</p>
                    <p className="text-xs text-slate-400">{n.message?.substring(0, 60)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Agencies */}
          <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white flex items-center gap-2"><Building2 size={16} className="text-blue-400" /> Agencies</h3>
              <Link to="/agencies" className="text-xs text-blue-400 hover:underline">View All</Link>
            </div>
            <div className="space-y-2">
              {agencies.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No agencies available</p>}
              {agencies.map((ag, i) => (
                <div key={ag._id || i} className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      ag.agencyDetails?.type === 'medical' ? 'bg-red-500/20 text-red-400' :
                      ag.agencyDetails?.type === 'police' ? 'bg-blue-500/20 text-blue-400' :
                      ag.agencyDetails?.type === 'fire' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      <Shield size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{ag.name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{ag.agencyDetails?.type || 'Organization'}</p>
                    </div>
                  </div>
                  <a href={`mailto:${ag.email}`} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400 transition-colors">
                    <Phone size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Numbers */}
          <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4"><Phone size={16} className="text-red-400" /> Emergency Numbers</h3>
            <div className="space-y-2">
              {[
                { name: 'Police', number: '100', color: 'bg-blue-500' },
                { name: 'Ambulance', number: '108', color: 'bg-red-500' },
                { name: 'Fire', number: '101', color: 'bg-orange-500' },
                { name: 'Disaster Helpline', number: '1070', color: 'bg-purple-500' },
                { name: 'Women Helpline', number: '1091', color: 'bg-pink-500' },
                { name: 'Child Helpline', number: '1098', color: 'bg-emerald-500' },
              ].map(e => (
                <a key={e.number} href={`tel:${e.number}`} className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${e.color} flex items-center justify-center`}>
                      <Phone size={12} className="text-white" />
                    </div>
                    <span className="text-sm text-white font-medium">{e.name}</span>
                  </div>
                  <span className="text-sm font-mono text-slate-400 group-hover:text-white">{e.number}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}