import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useStore } from '../../store/useStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Building2, Megaphone, Phone, Mail, ShieldCheck, Filter, Stethoscope, Flame, AlertOctagon, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function AgenciesPage() {
  const { user } = useStore();
  const [agencies, setAgencies] = useState([]);
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const agRes = await api.get('/api/social/agencies');
      const srvRes = await api.get('/api/agency-services');
      setAgencies(agRes.data);
      setServices(srvRes.data);
    } catch (err) { console.warn(err?.response?.status || err.message); }
  };

  const filteredAgencies = agencies.filter(agency => {
    if (filter === 'all') return true;
    const type = agency.agencyDetails?.type?.toLowerCase() || '';
    return type === filter;
  });

  const categories = [
    { id: 'all', label: 'All', icon: Building2 },
    { id: 'police', label: 'Police', icon: ShieldCheck },
    { id: 'medical', label: 'Medical', icon: Stethoscope },
    { id: 'fire', label: 'Fire', icon: Flame },
    { id: 'ngo', label: 'NGOs', icon: AlertOctagon },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center py-8 relative">
          <h1 className="text-3xl font-bold text-white">Agency Hub</h1>
          <p className="text-slate-400">Connect with Emergency Services & Relief Organizations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: LIST OF AGENCIES */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="text-blue-500" /> Directory
              </h2>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                    filter === cat.id 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <cat.icon size={14} /> {cat.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredAgencies.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-slate-700 rounded-xl">
                  <p className="text-slate-500 text-sm">No agencies found.</p>
                  <button onClick={() => setFilter('all')} className="text-blue-400 text-xs mt-2 underline">Clear Filters</button>
                </div>
              )}

              {filteredAgencies.map(agency => (
                <div key={agency._id} className="bg-slate-800 border border-slate-700 p-5 rounded-xl hover:border-blue-500 transition-colors animate-in fade-in">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      agency.agencyDetails?.type === 'medical' ? 'bg-red-500/20 text-red-500' :
                      agency.agencyDetails?.type === 'police' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-slate-900 text-emerald-500'
                    }`}>
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{agency.name}</h3>
                      <p className="text-xs text-slate-400 capitalize">{agency.agencyDetails?.type || 'Organization'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <a href={`mailto:${agency.email}`} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white">
                      <Mail size={14} /> {agency.email}
                    </a>
                    <button 
                      onClick={() => window.location.href = `mailto:${agency.email}`}
                      className="w-full mt-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                      Contact Agency
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: LIVE UPDATES FEED */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Megaphone className="text-red-500" /> Programs & Alerts
              </h2>
            </div>


            {services.length === 0 && (
              <div className="bg-slate-800 border border-dashed border-slate-700 p-8 rounded-xl text-center text-slate-500">
                No active programs or announcements at this time.
              </div>
            )}

            {services.map(srv => (
              <div key={srv._id} className="bg-slate-800 border border-slate-700 p-6 rounded-xl relative group">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    srv.type === 'alert' ? 'bg-red-500/20 text-red-500' :
                    srv.type === 'program' ? 'bg-emerald-500/20 text-emerald-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {srv.type}
                  </span>
                  <span className="text-xs text-slate-500">{new Date(srv.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{srv.title}</h3>
                <p className="text-slate-300 text-sm mb-3">{srv.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-3">
                  {srv.location && <span>📍 {srv.location}</span>}
                  {srv.contactDetails && <span>📞 {srv.contactDetails}</span>}
                </div>
                <p className="text-xs text-slate-500 font-mono border-t border-slate-700/50 pt-2 mt-2">Posted by: {srv.agencyName}</p>
                
                {(user?.id === srv.agencyId || user?._id === srv.agencyId || user?.role === 'admin') && (
                  <button onClick={() => handleDeleteService(srv._id)} className="absolute top-4 right-4 p-2 bg-slate-900 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}