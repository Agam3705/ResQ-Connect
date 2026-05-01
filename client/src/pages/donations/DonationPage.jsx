import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useStore } from '../../store/useStore';
import api from '../../lib/api';
import { HandHeart, Package, Send, CheckCircle, Truck, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = ['blankets', 'water', 'food', 'clothes', 'medicine', 'hygiene', 'other'];

export function DonationPage() {
  const { user } = useStore();
  const [myDonations, setMyDonations] = useState([]);
  const [camps, setCamps] = useState([]);
  const [activeTab, setActiveTab] = useState('pledge');
  const [form, setForm] = useState({
    items: [{ name: '', category: 'food', quantity: 1, unit: 'units' }],
    donorContact: '', location: {}
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [donRes, campRes] = await Promise.all([
        api.get(`/api/donations/my/${user?._id}`).catch(() => ({ data: [] })),
        api.get('/api/donations/camps').catch(() => ({ data: [] })),
      ]);
      setMyDonations(donRes.data || []);
      setCamps(campRes.data || []);
    } catch (err) { console.warn(err?.response?.status || err.message); }
  };

  const updateItem = (i, field, value) => {
    const items = [...form.items];
    items[i][field] = value;
    setForm({ ...form, items });
  };

  const handlePledge = async (e) => {
    e.preventDefault();
    if (form.items.some(i => !i.name)) return toast.error('Fill all item names');
    try {
      let location = {};
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch {}
      }
      await api.post('/api/donations/pledge', { ...form, location, donorName: user?.name });
      toast.success('Donation pledged!');
      setForm({ items: [{ name: '', category: 'food', quantity: 1, unit: 'units' }], donorContact: '', location: {} });
      fetchData();
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <HandHeart className="text-teal-400" /> Donation Portal
        </h1>

        <div className="flex bg-slate-800 p-1 rounded-xl">
          {['pledge', 'history', 'camps'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm capitalize transition-all ${activeTab === t ? 'bg-teal-600 text-white' : 'text-slate-400'}`}>
              {t}
            </button>
          ))}
        </div>

        {activeTab === 'pledge' && (
          <form onSubmit={handlePledge} className="bg-slate-800 border border-slate-700 p-6 rounded-xl space-y-4">
            <input placeholder="Contact +91..." className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none"
              value={form.donorContact} onChange={e => setForm({...form, donorContact: e.target.value})} />
            {form.items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder="Item name" className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded-lg text-white text-sm outline-none"
                  value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} />
                <select className="w-28 bg-slate-900 border border-slate-700 p-2 rounded-lg text-white text-sm outline-none"
                  value={item.category} onChange={e => updateItem(i, 'category', e.target.value)}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
                <input type="number" min={1} className="w-20 bg-slate-900 border border-slate-700 p-2 rounded-lg text-white text-sm outline-none"
                  value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value)||1)} />
              </div>
            ))}
            <button type="button" onClick={() => setForm({...form, items: [...form.items, {name:'',category:'food',quantity:1,unit:'units'}]})}
              className="text-blue-400 text-sm">+ Add Item</button>
            <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
              <Send size={18} /> Pledge
            </button>
          </form>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {myDonations.length === 0 && <p className="text-slate-500 text-center py-10">No donations yet</p>}
            {myDonations.map(d => (
              <div key={d._id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
                <span className="text-sm font-bold text-amber-400 capitalize">{d.status}</span>
                <p className="text-sm text-slate-300">{d.items?.map(i => `${i.name} (${i.quantity})`).join(', ')}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'camps' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {camps.length === 0 && <p className="col-span-full text-slate-500 text-center py-10">No active camps</p>}
            {camps.map(c => (
              <div key={c._id} className="bg-slate-800 border border-slate-700 p-5 rounded-xl">
                <h3 className="font-bold text-white">{c.name}</h3>
                <p className="text-xs text-slate-400">{c.location?.address}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
