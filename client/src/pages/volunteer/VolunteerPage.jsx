import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useStore } from '../../store/useStore';
import api from '../../lib/api';
import { HandHeart, Send, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export function VolunteerPage() {
  const { user } = useStore();
  const [offers, setOffers] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  const [form, setForm] = useState({ type: 'volunteer', details: '', contact: '' });

  useEffect(() => { fetchOffers(); }, []);

  const fetchOffers = async () => {
    try {
      const res = await api.get('/api/community/help-offers');
      setOffers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.warn(err?.response?.status || err.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/community/help', {
        userId: user?._id, name: user?.name, ...form
      });
      toast.success('Offer submitted!');
      setForm({ type: 'volunteer', details: '', contact: '' });
      setActiveTab('list');
      fetchOffers();
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <HandHeart className="text-emerald-400" /> Volunteer Hub
        </h1>

        <div className="flex bg-slate-800 p-1 rounded-xl">
          {['list', 'offer'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm ${activeTab === t ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
              {t === 'list' ? 'Active Volunteers' : 'I Want to Help'}
            </button>
          ))}
        </div>

        {activeTab === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.length === 0 && <p className="col-span-full text-slate-500 text-center py-10">No volunteer offers yet. Be the first!</p>}
            {offers.map((o, i) => (
              <div key={o._id || i} className="bg-slate-800 border border-slate-700 p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <HandHeart size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{o.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{o.type}</p>
                  </div>
                </div>
                {o.details && <p className="text-sm text-slate-300 mb-2">{o.details}</p>}
                {o.contact && <p className="text-xs text-blue-400 flex items-center gap-1"><Phone size={12} /> {o.contact}</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'offer' && (
          <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 p-6 rounded-xl space-y-4">
            <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white outline-none"
              value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="volunteer">Volunteer</option>
              <option value="donation">Donation (Food/Clothes)</option>
              <option value="shelter">Provide Shelter</option>
              <option value="transport">Transport</option>
            </select>
            <textarea placeholder="How can you help? When are you available?" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white outline-none" rows={3}
              value={form.details} onChange={e => setForm({...form, details: e.target.value})} />
            <input placeholder="Contact number" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white outline-none"
              value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
              <Send size={18} /> Submit Offer
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
