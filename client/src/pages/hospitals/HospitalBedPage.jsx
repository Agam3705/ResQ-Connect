import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import { useStore } from '../../store/useStore';
import { Hospital, Activity, RefreshCw, Plus, Edit3, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const getCapacityColor = (total, occupied) => {
  if (total === 0) return 'bg-slate-600';
  const pct = ((total - occupied) / total) * 100;
  if (pct > 50) return 'bg-emerald-500';
  if (pct > 20) return 'bg-amber-500';
  if (pct > 0) return 'bg-red-500';
  return 'bg-slate-700';
};

const getCapacityText = (total, occupied) => {
  if (total === 0) return { text: 'N/A', color: 'text-slate-500' };
  const avail = total - occupied;
  const pct = (avail / total) * 100;
  if (pct > 50) return { text: `${avail} Available`, color: 'text-emerald-400' };
  if (pct > 20) return { text: `${avail} Left`, color: 'text-amber-400' };
  if (pct > 0) return { text: `${avail} Critical`, color: 'text-red-400' };
  return { text: 'FULL', color: 'text-red-500' };
};

export function HospitalBedPage() {
  const { user } = useStore();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '', address: '', phone: '',
    wards: {
      icu: { total: 0, occupied: 0 }, general: { total: 0, occupied: 0 },
      pediatric: { total: 0, occupied: 0 }, maternity: { total: 0, occupied: 0 },
      emergency: { total: 0, occupied: 0 }
    }
  });

  const isManager = user?.role === 'agency' || user?.role === 'admin';

  useEffect(() => {
    fetchHospitals();
    const interval = setInterval(fetchHospitals, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/api/hospitals');
      setHospitals(res.data);
    } catch (err) { console.warn(err?.response?.status || err.message); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/api/hospitals/${editId}/beds`, { wards: form.wards });
      } else {
        await api.post('/api/hospitals', form);
      }
      toast.success(editId ? 'Updated!' : 'Hospital Added!');
      setShowForm(false); setEditId(null);
      fetchHospitals();
    } catch (err) { toast.error('Failed'); }
  };

  const startEdit = (h) => {
    setForm({ name: h.name, address: h.address, phone: h.phone, wards: h.wards });
    setEditId(h._id);
    setShowForm(true);
  };

  const wardNames = ['icu', 'general', 'pediatric', 'maternity', 'emergency'];
  const wardLabels = { icu: 'ICU', general: 'General', pediatric: 'Pediatric', maternity: 'Maternity', emergency: 'Emergency' };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Hospital className="text-cyan-400" /> Hospital Bed Capacity</h1>
            <p className="text-slate-400 text-sm">Real-time bed availability across hospitals</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchHospitals} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white">
              <RefreshCw size={18} />
            </button>
            {isManager && (
              <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name:'', address:'', phone:'', wards:{ icu:{total:0,occupied:0}, general:{total:0,occupied:0}, pediatric:{total:0,occupied:0}, maternity:{total:0,occupied:0}, emergency:{total:0,occupied:0} } }); }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded-lg flex items-center gap-2">
                <Plus size={16} /> Add Hospital
              </button>
            )}
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && isManager && (
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl space-y-4">
            <div className="flex justify-between"><h3 className="font-bold text-white">{editId ? 'Update Beds' : 'Add Hospital'}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-slate-400 hover:text-white" /></button>
            </div>
            {!editId && (
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Hospital Name" className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <input placeholder="Address" className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                <input placeholder="Phone" className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
            )}
            <div className="grid grid-cols-5 gap-3">
              {wardNames.map(w => (
                <div key={w} className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 mb-2 font-bold uppercase">{wardLabels[w]}</p>
                  <input type="number" min={0} placeholder="Total" className="w-full bg-slate-800 border border-slate-700 p-1.5 rounded text-white text-sm outline-none mb-1"
                    value={form.wards[w].total} onChange={e => setForm({...form, wards: {...form.wards, [w]: {...form.wards[w], total: parseInt(e.target.value)||0}}})} />
                  <input type="number" min={0} placeholder="Occupied" className="w-full bg-slate-800 border border-slate-700 p-1.5 rounded text-white text-sm outline-none"
                    value={form.wards[w].occupied} onChange={e => setForm({...form, wards: {...form.wards, [w]: {...form.wards[w], occupied: parseInt(e.target.value)||0}}})} />
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg flex items-center gap-2"><Save size={14} /> Save</button>
          </div>
        )}

        {/* Hospital Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitals.map(h => {
            const totalBeds = Object.values(h.wards || {}).reduce((a, w) => a + (w.total || 0), 0);
            const totalOccupied = Object.values(h.wards || {}).reduce((a, w) => a + (w.occupied || 0), 0);
            const overall = getCapacityText(totalBeds, totalOccupied);

            return (
              <div key={h._id} className="bg-slate-800 border border-slate-700 p-5 rounded-xl hover:border-cyan-500/30 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-white">{h.name}</h3>
                    <p className="text-xs text-slate-400">{h.address}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${overall.color}`}>{overall.text}</p>
                    <p className="text-[10px] text-slate-500">{totalBeds - totalOccupied}/{totalBeds} beds</p>
                  </div>
                </div>

                {/* Ward bars */}
                <div className="space-y-2">
                  {wardNames.map(w => {
                    const ward = h.wards?.[w] || { total: 0, occupied: 0 };
                    if (ward.total === 0) return null;
                    const pct = (ward.occupied / ward.total) * 100;
                    return (
                      <div key={w}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-slate-400">{wardLabels[w]}</span>
                          <span className="text-slate-300">{ward.total - ward.occupied}/{ward.total}</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${getCapacityColor(ward.total, ward.occupied)}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700">
                  <p className="text-[10px] text-slate-500">Updated: {h.lastUpdated ? new Date(h.lastUpdated).toLocaleString() : 'N/A'}</p>
                  {isManager && <button onClick={() => startEdit(h)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Edit3 size={12} /> Update</button>}
                </div>
              </div>
            );
          })}
          {hospitals.length === 0 && !loading && (
            <div className="col-span-full text-center py-10 text-slate-500 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
              No hospitals registered yet.{isManager && ' Click "Add Hospital" to begin.'}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
