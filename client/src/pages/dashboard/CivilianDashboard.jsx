import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, Map, Users, Heart, FileText, 
  Shield, Activity, Bell, Check, X, Megaphone, 
  Search, Package, MessageSquare, HandHeart, Building2 
} from 'lucide-react';

export function CivilianDashboard() {
  const { user } = useStore();
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // --- FETCH NOTIFICATIONS ON LOAD ---
  useEffect(() => {
    if (user?._id) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/user/notifications/${user._id}`);
      setNotifications(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingNotifs(false); }
  };

  const markRead = async () => {
    try {
      await axios.put(`http://localhost:5000/api/user/notifications/read/${user._id}`);
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  // --- QUICK ACTION CARDS CONFIGURATION ---
  const features = [
    { label: "Tactical Map", icon: Map, path: "/map", color: "text-blue-500", border: "hover:border-blue-500" },
    { label: "SOS Alerts", icon: AlertTriangle, path: "/sos", color: "text-red-500", border: "hover:border-red-500" },
    { label: "Community Chat", icon: MessageSquare, path: "/community", color: "text-emerald-500", border: "hover:border-emerald-500" },
    { label: "Report Hazard", icon: HandHeart, path: "/volunteer", color: "text-amber-500", border: "hover:border-amber-500" },
    { label: "Agencies", icon: Building2, path: "/agencies", color: "text-indigo-500", border: "hover:border-indigo-500" },
    { label: "Missing Persons", icon: Search, path: "/missing", color: "text-purple-500", border: "hover:border-purple-500" },
    { label: "First Aid Guide", icon: Heart, path: "/first-aid", color: "text-rose-500", border: "hover:border-rose-500" },
    { label: "My Documents", icon: FileText, path: "/documents", color: "text-slate-400", border: "hover:border-slate-400" },
  ];

  // Add Logistics only for agencies
  if (user?.role === 'agency') {
    features.push({ label: "Logistics", icon: Package, path: "/logistics", color: "text-orange-500", border: "hover:border-orange-500" });
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- WELCOME HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome, {user?.name}</h1>
            <p className="text-slate-400 flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/> 
              System Online & Secure
            </p>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
            <Shield className="text-blue-500" size={20} />
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Role</p>
              <p className="text-sm text-white font-bold capitalize">{user?.role || "Civilian"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN: FEATURES GRID --- */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-blue-500" /> Quick Access
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {features.map((item, idx) => (
                <Link 
                  key={idx} 
                  to={item.path}
                  className={`bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:scale-105 hover:bg-slate-700 ${item.border}`}
                >
                  <div className={`p-4 bg-slate-900 rounded-full ${item.color}`}>
                    <item.icon size={28} />
                  </div>
                  <span className="text-white font-bold text-sm text-center">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Emergency Banner */}
            <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-red-600 rounded-full text-white animate-pulse">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Emergency Mode Active?</h3>
                <p className="text-slate-300 text-sm">If you are in immediate danger, use the SOS button immediately.</p>
              </div>
              <Link to="/sos" className="ml-auto bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold">
                SOS
              </Link>
            </div>
          </div>

          {/* --- RIGHT COLUMN: NOTIFICATION CENTER --- */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden h-full max-h-[600px] flex flex-col">
              
              {/* Notif Header */}
              <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Bell className="text-amber-500" size={20} /> Live Notifications
                </h2>
                <button 
                  onClick={markRead}
                  className="text-xs text-blue-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Check size={12} /> Mark read
                </button>
              </div>

              {/* Notif List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {loadingNotifs && <p className="text-center text-slate-500 py-10">Loading updates...</p>}
                
                {!loadingNotifs && notifications.length === 0 && (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-sm">No new notifications.</p>
                  </div>
                )}

                {notifications.map(note => (
                  <div 
                    key={note._id} 
                    className={`p-4 rounded-xl border transition-all ${
                      !note.read 
                        ? 'bg-slate-700/50 border-blue-500/30' 
                        : 'bg-slate-900/50 border-transparent opacity-75'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 min-w-[20px] ${
                        note.type === 'alert' ? 'text-red-500' : 
                        note.type === 'success' ? 'text-emerald-500' : 'text-blue-400'
                      }`}>
                        {note.type === 'alert' ? <AlertTriangle size={18} /> : 
                         note.type === 'success' ? <Megaphone size={18} /> : <MessageSquare size={18} />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{note.title}</h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{note.message}</p>
                        <span className="text-[10px] text-slate-500 mt-2 block">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
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