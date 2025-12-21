import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { UserPlus, Shield, Copy, Send, MapPin, MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Markers
const sosIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const offlineIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export function FamilyPage() {
  const { user, sosRequests, fetchSOS } = useStore();
  
  const [view, setView] = useState('lobby'); 
  const [myFamilies, setMyFamilies] = useState([]);
  const [activeFamily, setActiveFamily] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState({ name: '', code: '' });
  
  const messagesEndRef = useRef(null);
  const userId = user?._id || user?.id;

  // 1. Initial Load
  useEffect(() => {
    if (userId) {
      fetchMyFamilies();
      fetchSOS(); 
    }
  }, [userId]);

  const fetchMyFamilies = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/family/my-families/${userId}`);
      // Safety check for array
      setMyFamilies(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Poll Room Data
  useEffect(() => {
    let interval;
    if (view === 'room' && activeFamily) {
      fetchRoomData();
      interval = setInterval(() => {
        fetchRoomData();
        fetchSOS();
      }, 3000); 
    }
    return () => clearInterval(interval);
  }, [view, activeFamily?._id]);

  const fetchRoomData = async () => {
    if (!activeFamily) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/family/details/${activeFamily._id}`);
      setActiveFamily(res.data);
      const msgRes = await axios.get(`http://localhost:5000/api/family/messages/${activeFamily._id}`);
      setMessages(Array.isArray(msgRes.data) ? msgRes.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // HANDLERS
  const handleCreate = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Creating...");
    try {
      await axios.post('http://localhost:5000/api/family/create', { userId, name: inputs.name });
      toast.success("Created!", { id: toastId });
      fetchMyFamilies();
      setView('lobby');
    } catch (err) {
      toast.error("Failed", { id: toastId });
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Joining...");
    try {
      await axios.post('http://localhost:5000/api/family/join', { userId, code: inputs.code.toUpperCase() });
      toast.success("Joined!", { id: toastId });
      fetchMyFamilies();
      setView('lobby');
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Code", { id: toastId });
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await axios.post('http://localhost:5000/api/family/message', {
        familyId: activeFamily._id,
        senderName: user.name,
        text: newMessage
      });
      setNewMessage("");
      fetchRoomData();
    } catch (err) {
      console.error(err);
    }
  };

  // --- LOGIC: STATUS CHECKER ---
  const getMemberStatus = (member) => {
    // 1. Check SOS (High Priority)
    const isSOS = sosRequests.some(alert => alert.userId === member._id);
    if (isSOS) return 'sos';

    // 2. FORCE SELF ONLINE (If it's me, I am obviously online)
    if (member._id === userId) return 'online';

    // 3. Check Database Timestamp (Last 2 minutes)
    if (member.lastLocation?.updatedAt) {
      const diff = new Date() - new Date(member.lastLocation.updatedAt);
      if (diff < 60000 * 2) return 'online';
    }

    // 4. Default Offline
    return 'offline';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'sos': return 'bg-red-600';
      case 'online': return 'bg-emerald-600';
      default: return 'bg-slate-600';
    }
  };

  if (loading) return <DashboardLayout><div className="p-10 text-white"><Loader2 className="animate-spin"/> Loading...</div></DashboardLayout>;

  // === VIEW: LOBBY ===
  if (view === 'lobby') {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Family Circles</h1>
              <p className="text-slate-400">Manage your private safety groups</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setView('create')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Shield size={18} /> Create New
              </button>
              <button onClick={() => setView('join')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <UserPlus size={18} /> Join Existing
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myFamilies.map((fam, index) => (
              <div key={fam._id || index} onClick={() => { setActiveFamily(fam); setView('room'); }}
                className="bg-slate-800 border border-slate-700 p-6 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-slate-750 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <Shield className="text-blue-500 group-hover:text-white" />
                  </div>
                  <span className="bg-slate-900 text-slate-400 text-xs px-2 py-1 rounded font-mono border border-slate-700">{fam.joinCode}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{fam.name}</h3>
                <p className="text-sm text-slate-400">{fam.members.length} Members</p>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // === VIEW: FORMS ===
  if (view === 'create' || view === 'join') {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-20">
           <button onClick={() => setView('lobby')} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Lobby
          </button>
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">{view === 'create' ? 'Create New Circle' : 'Join Circle'}</h2>
            <form onSubmit={view === 'create' ? handleCreate : handleJoin} className="space-y-4">
              <input autoFocus placeholder={view === 'create' ? "Family Name" : "Enter Code"} className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-blue-500"
                value={view === 'create' ? inputs.name : inputs.code}
                onChange={e => setInputs(view === 'create' ? {...inputs, name: e.target.value} : {...inputs, code: e.target.value})}
              />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold">
                {view === 'create' ? 'Create Circle' : 'Join Circle'}
              </button>
            </form>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // === VIEW: ROOM ===
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-7rem)] flex flex-col lg:flex-row gap-4">
        {/* CHAT */}
        <div className="lg:w-1/3 flex flex-col bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={() => setView('lobby')} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><ArrowLeft size={18} /></button>
              <h3 className="text-white font-bold">{activeFamily?.name}</h3>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(activeFamily?.joinCode); toast.success("Copied!"); }}
              className="text-xs font-mono bg-slate-900 border border-slate-700 px-2 py-1 rounded text-blue-400">{activeFamily?.joinCode}</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800">
            {messages.map((msg, idx) => {
              const isMe = msg.senderName === user.name;
              return (
                <div key={msg._id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                    {!isMe && <p className="text-[10px] text-blue-300 font-bold mb-1">{msg.senderName}</p>}
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="p-3 bg-slate-900 border-t border-slate-700 flex gap-2">
            <input className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="Message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg"><Send size={18} /></button>
          </form>
        </div>

        {/* MAP & MEMBERS */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl flex gap-4 overflow-x-auto">
            {activeFamily?.members.filter(m => m).map((m, idx) => { // FILTER NULLS & ADD KEY
              const status = getMemberStatus(m);
              const colorClass = getStatusColor(status);
              
              return (
                <div key={m._id || idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border min-w-[140px] transition-all ${status === 'sos' ? 'bg-red-900/50 border-red-500 animate-pulse' : 'bg-slate-900 border-slate-700'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${colorClass}`}>
                    {m.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold truncate max-w-[80px]">{m.name || "Unknown"}</p>
                    <p className={`text-[10px] font-bold ${status === 'sos' ? 'text-red-400' : status === 'online' ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {status === 'sos' ? '⚠️ SOS' : status === 'online' ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden relative shadow-lg">
             <MapContainer center={[28.61, 77.20]} zoom={11} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {activeFamily?.members.filter(m => m && m.lastLocation).map((member, idx) => {
                   const status = getMemberStatus(member);
                   let iconToUse = new L.Icon.Default(); 
                   if (status === 'sos') iconToUse = sosIcon;
                   else if (status === 'offline') iconToUse = offlineIcon;

                   return (
                    <Marker 
                      key={member._id || idx} 
                      position={[member.lastLocation.lat, member.lastLocation.lng]}
                      icon={iconToUse}
                    >
                      <Popup>
                        <div className="text-slate-900 font-bold">{member.name || 'Unknown'}</div>
                        <div className={`text-xs font-bold ${
                           status === 'sos' ? 'text-red-600' : 
                           status === 'online' ? 'text-emerald-600' : 'text-slate-500'
                        }`}>
                          {status === 'sos' ? '🚨 SOS ACTIVE' : status === 'online' ? '🟢 Online' : '⚫ Offline'}
                        </div>
                      </Popup>
                    </Marker>
                   );
                })}
              </MapContainer>
              <button 
                 onClick={() => {
                   if(navigator.geolocation) {
                     toast("Updating Location...");
                     navigator.geolocation.getCurrentPosition(p => {
                       axios.post('http://localhost:5000/api/family/location', {
                         userId, lat: p.coords.latitude, lng: p.coords.longitude
                       });
                     });
                   }
                 }}
                 className="absolute bottom-4 left-4 z-[500] bg-slate-900 text-white p-2 rounded border border-slate-700 shadow text-xs hover:bg-slate-800"
              >
                <MapPin size={14} className="inline mr-1"/> Update My Location
              </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}