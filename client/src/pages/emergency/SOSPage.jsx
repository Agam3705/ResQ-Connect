import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AlertTriangle, CheckCircle, Phone, MapPin, Loader2, Volume2, VolumeX, Baby, Activity, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const SIREN_URL = "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg";

export function SOSPage() {
  const { user, sosRequests, fetchSOS, resolveSOS, updateSOSDetails } = useStore();
  const [loading, setLoading] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const audioRef = useRef(new Audio(SIREN_URL));
  
  // FORM STATE
  const [detailsSent, setDetailsSent] = useState(false);
  const [formData, setFormData] = useState({
    type: 'general',
    details: '',
    infants: false,
    elderly: false
  });

  const userId = user?._id || user?.id;
  const myActiveSOS = sosRequests.find(s => s.userId === userId && s.status === 'active');

  useEffect(() => {
    fetchSOS();
    audioRef.current.loop = true;
    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, []);

  const toggleSiren = () => {
    if (sirenActive) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setSirenActive(false);
    } else {
      audioRef.current.play().catch(e => toast.error("Click screen to enable audio"));
      setSirenActive(true);
    }
  };

  const handleTrigger = async () => {
    setLoading(true);
    const toastId = toast.loading("Broadcasting Emergency Alert...");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await axios.post('http://localhost:5000/api/sos/create', {
            userId,
            userName: user.name,
            location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            type: 'general',
            priority: 'high'
          });
          
          toast.success("HELP IS ON THE WAY!", { id: toastId, duration: 5000 });
          setDetailsSent(false); // Reset form status
          fetchSOS(); 
        } catch (err) {
          toast.error("Failed to send alert", { id: toastId });
        } finally {
          setLoading(false);
        }
      }, () => {
        toast.error("Enable GPS to send SOS", { id: toastId });
        setLoading(false);
      });
    } else {
      toast.error("GPS not supported");
      setLoading(false);
    }
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    if (!myActiveSOS) return;
    
    const toastId = toast.loading("Updating Responders...");
    try {
      await updateSOSDetails(myActiveSOS._id, formData);
      toast.success("Details Updated!", { id: toastId });
      setDetailsSent(true);
    } catch (err) {
      toast.error("Failed to update", { id: toastId });
    }
  };

  const handleSafe = async () => {
    if (!myActiveSOS) return;
    const toastId = toast.loading("Cancelling Alert...");
    try {
      await resolveSOS(myActiveSOS._id);
      if(sirenActive) toggleSiren();
      setDetailsSent(false);
      setFormData({ type: 'general', details: '', infants: false, elderly: false });
      toast.success("You are marked as Safe", { id: toastId });
    } catch (err) {
      toast.error("Failed to update status", { id: toastId });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-6 px-4">
        
        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-2">Emergency Response</h1>
          <p className="text-slate-400">Triggering alert notifies Police, Medical, and Family.</p>
        </div>

        {/* --- MAIN INTERFACE --- */}
        <div className="flex flex-col items-center justify-center mb-8">
          
          {myActiveSOS ? (
            // === ACTIVE STATE ===
            <div className="w-full animate-in fade-in duration-500">
              
              {/* 1. STATUS CARD */}
              <div className="bg-red-900/20 border-2 border-red-500 rounded-2xl p-6 text-center mb-6 animate-pulse">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-3" />
                <h2 className="text-3xl font-black text-white uppercase">SOS ACTIVE</h2>
                <p className="text-red-200 font-bold">Responders are tracking your location.</p>
              </div>

              {/* 2. OPTIONAL DETAILS FORM (Only if not sent yet) */}
              {!detailsSent ? (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6 shadow-xl">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Info className="text-blue-400" /> Provide Critical Details (Optional)
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {['accident', 'violence', 'medical', 'fire'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setFormData({...formData, type: t})}
                        className={`p-3 rounded-xl border font-bold capitalize transition-all ${
                          formData.type === t 
                            ? 'bg-blue-600 border-blue-500 text-white' 
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4 mb-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.infants ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                      <input type="checkbox" className="hidden" checked={formData.infants} onChange={e => setFormData({...formData, infants: e.target.checked})} />
                      <Baby size={20} /> Infants?
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.elderly ? 'bg-orange-600/20 border-orange-500 text-orange-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                      <input type="checkbox" className="hidden" checked={formData.elderly} onChange={e => setFormData({...formData, elderly: e.target.checked})} />
                      <Activity size={20} /> Elderly?
                    </label>
                  </div>

                  <textarea 
                    placeholder="Any other details? (e.g. Car color, number of attackers...)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm mb-4 focus:border-blue-500 outline-none"
                    rows={2}
                    value={formData.details}
                    onChange={e => setFormData({...formData, details: e.target.value})}
                  />

                  <button onClick={handleSubmitDetails} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl">
                    Update Responders
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-900/20 border border-emerald-500/50 p-4 rounded-xl text-center mb-6">
                  <p className="text-emerald-400 font-bold">Details sent to responders.</p>
                </div>
              )}

              {/* 3. SAFE BUTTON */}
              <button onClick={handleSafe} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl py-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105">
                <CheckCircle size={32} /> I AM SAFE NOW
              </button>
            </div>
          ) : (
            // === NORMAL STATE (BIG ROUND BUTTON) ===
            <button
              onClick={handleTrigger}
              disabled={loading}
              className="group relative w-72 h-72 rounded-full bg-gradient-to-br from-red-600 to-red-800 shadow-[0_0_50px_rgba(220,38,38,0.5)] hover:shadow-[0_0_80px_rgba(220,38,38,0.7)] border-8 border-red-900 flex flex-col items-center justify-center transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-24 h-24 text-white animate-spin" /> : (
                <>
                  <span className="text-6xl font-black text-white mb-2">SOS</span>
                  <span className="text-sm text-red-200 uppercase tracking-widest font-bold">Tap for Help</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* UTILITY BAR */}
        <div className="grid grid-cols-2 gap-4 mb-6">
           <button onClick={toggleSiren} className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${sirenActive ? 'bg-yellow-500 text-black border-yellow-600 animate-pulse font-bold' : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'}`}>
             {sirenActive ? <VolumeX size={24}/> : <Volume2 size={24}/>}
             {sirenActive ? "STOP SIREN" : "LOUD SIREN"}
           </button>
           <a href="tel:100" className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-white flex items-center justify-center gap-3 hover:bg-slate-700 transition-all">
             <Phone size={24} className="text-blue-500" /> Call Police
           </a>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg flex items-center justify-center gap-2 text-slate-400 text-xs">
           <MapPin size={14} /> GPS Tracking Active
        </div>

      </div>
    </DashboardLayout>
  );
}