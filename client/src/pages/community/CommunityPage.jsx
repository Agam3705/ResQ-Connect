import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AlertTriangle, HandHeart, MessageSquare, MapPin, CheckCircle, XCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export function CommunityPage() {
  const { user, fetchHazards } = useStore();
  const [activeTab, setActiveTab] = useState('hazard'); // 'hazard', 'help', 'rumor'
  
  // -- STATE --
  const [hazards, setHazards] = useState({ type: 'Fire', description: '' });
  const [help, setHelp] = useState({ type: 'donation', details: '', contact: '' });
  const [rumors, setRumors] = useState([]);
  const [loading, setLoading] = useState(false);

  // FETCH RUMORS ON LOAD
  useEffect(() => {
    if (activeTab === 'rumor') fetchRumors();
  }, [activeTab]);

  const fetchRumors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/community/rumors');
      setRumors(res.data);
    } catch (err) { console.error(err); }
  };

  // -- HANDLERS --

  // 1. REPORT HAZARD
  const submitHazard = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!navigator.geolocation) return toast.error("GPS Required");
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.post('http://localhost:5000/api/community/hazard', {
          userId: user._id,
          type: hazards.type,
          description: hazards.description,
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
        });
        toast.success("Hazard Reported on Map");
        setHazards({ type: 'Fire', description: '' });
        fetchHazards(); // Update global store
      } catch (err) { toast.error("Failed"); }
      finally { setLoading(false); }
    });
  };

  // 2. OFFER HELP
  const submitHelp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/community/help', {
        userId: user._id,
        name: user.name,
        ...help
      });
      toast.success("Offer Sent to Agencies");
      setHelp({ type: 'donation', details: '', contact: '' });
    } catch (err) { toast.error("Failed"); }
    finally { setLoading(false); }
  };

  // 3. VOTE ON RUMOR
  const voteRumor = async (id, voteType) => {
    try {
      await axios.post('http://localhost:5000/api/community/rumors/vote', { id, vote: voteType });
      toast.success("Vote Recorded");
      fetchRumors();
    } catch (err) { toast.error("Failed"); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Community Response</h1>
          <p className="text-slate-400">Report dangers, offer aid, and verify news.</p>
        </div>

        {/* TABS */}
        <div className="flex bg-slate-800 p-1 rounded-xl">
          {[
            { id: 'hazard', label: 'Report Hazard', icon: <AlertTriangle size={18}/> },
            { id: 'help', label: 'Offer Help', icon: <HandHeart size={18}/> },
            { id: 'rumor', label: 'Rumor Control', icon: <MessageSquare size={18}/> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* --- TAB 1: REPORT HAZARD --- */}
        {activeTab === 'hazard' && (
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl animate-in fade-in">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MapPin className="text-red-500" /> Report a Danger
            </h2>
            <form onSubmit={submitHazard} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Hazard Type</label>
                <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none"
                  value={hazards.type} onChange={e => setHazards({...hazards, type: e.target.value})}>
                  <option>Fire</option>
                  <option>Flood</option>
                  <option>Road Blocked</option>
                  <option>Structural Damage</option>
                  <option>Gas Leak</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400">Description</label>
                <textarea rows={3} className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none"
                  placeholder="Describe details..." 
                  value={hazards.description} onChange={e => setHazards({...hazards, description: e.target.value})}
                />
              </div>
              <button disabled={loading} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl">
                {loading ? 'Sending...' : 'Post to Map'}
              </button>
            </form>
          </div>
        )}

        {/* --- TAB 2: OFFER HELP --- */}
        {activeTab === 'help' && (
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl animate-in fade-in">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <HandHeart className="text-emerald-500" /> I Can Help
            </h2>
            <form onSubmit={submitHelp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Help Type</label>
                  <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none"
                    value={help.type} onChange={e => setHelp({...help, type: e.target.value})}>
                    <option value="donation">Donation (Food/Clothes)</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="shelter">Provide Shelter</option>
                    <option value="transport">Transport</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Contact Number</label>
                  <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none"
                    placeholder="+91..."
                    value={help.contact} onChange={e => setHelp({...help, contact: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400">Details</label>
                <textarea rows={3} className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none"
                  placeholder="What can you provide? When are you available?" 
                  value={help.details} onChange={e => setHelp({...help, details: e.target.value})}
                />
              </div>
              <button disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl">
                {loading ? 'Sending...' : 'Submit Offer'}
              </button>
            </form>
          </div>
        )}

        {/* --- TAB 3: RUMOR CONTROL --- */}
        {activeTab === 'rumor' && (
          <div className="space-y-4 animate-in fade-in">
            {rumors.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                <p>No active rumors tracked.</p>
                <button onClick={() => axios.post('http://localhost:5000/api/community/rumors/seed').then(fetchRumors)} className="text-xs text-blue-500 mt-2 underline">
                  (Dev: Click to Seed Data)
                </button>
              </div>
            )}

            {rumors.map(rumor => {
              const total = rumor.votesTrue + rumor.votesFalse;
              const truePercent = total === 0 ? 0 : (rumor.votesTrue / total) * 100;
              
              return (
                <div key={rumor._id} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{rumor.title}</h3>
                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                      rumor.adminStatus === 'verified' ? 'bg-emerald-500/20 text-emerald-500' :
                      rumor.adminStatus === 'debunked' ? 'bg-red-500/20 text-red-500' :
                      'bg-slate-700 text-slate-400'
                    }`}>
                      {rumor.adminStatus}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">{rumor.description}</p>
                  
                  {/* VOTING BAR */}
                  <div className="relative h-2 bg-slate-700 rounded-full mb-4 overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 bg-emerald-500 transition-all" style={{ width: `${truePercent}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mb-4 font-mono">
                    <span>TRUE: {rumor.votesTrue}</span>
                    <span>FAKE: {rumor.votesFalse}</span>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-3">
                    <button onClick={() => voteRumor(rumor._id, 'true')} className="flex-1 bg-slate-900 hover:bg-emerald-900/30 border border-slate-700 hover:border-emerald-500 text-emerald-500 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors">
                      <CheckCircle size={16} /> True
                    </button>
                    <button onClick={() => voteRumor(rumor._id, 'false')} className="flex-1 bg-slate-900 hover:bg-red-900/30 border border-slate-700 hover:border-red-500 text-red-500 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors">
                      <XCircle size={16} /> Fake
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}