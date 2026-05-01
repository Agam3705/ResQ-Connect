import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useStore } from '../../store/useStore';
import api from '../../lib/api';
import { Truck, MapPin, Send, Users, Search, Plus, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/shared/ConfirmModal';

const vehicleTypes = ['car', 'van', 'truck', 'bus', 'ambulance', 'boat', 'other'];

export function TransportPage() {
  const { user } = useStore();
  const [transports, setTransports] = useState([]);
  const [myTransports, setMyTransports] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [filter, setFilter] = useState({ type: '', search: '', minCapacity: 1 });
  const [form, setForm] = useState({
    vehicleType: 'car', capacity: 4, driverName: user?.name || '',
    driverContact: '', route: '', notes: '',
    pickupPoints: [{ address: '' }]
  });
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const userId = user?._id || user?.id;

  useEffect(() => { fetchTransports(); }, []);

  const fetchTransports = async () => {
    try {
      const [availRes, myRes] = await Promise.all([
        api.get('/api/transport/available'),
        api.get(`/api/transport/my/${userId}`)
      ]);
      setTransports(availRes.data || []);
      setMyTransports(myRes.data || []);
    } catch (err) {}
  };

  const handleFlag = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/api/transport/${editId}`, form);
        toast.success('Vehicle updated!');
      } else {
        await api.post('/api/transport/flag', form);
        toast.success('Vehicle flagged as available!');
      }
      setEditId(null);
      setForm({ vehicleType: 'car', capacity: 4, driverName: user?.name || '', driverContact: '', route: '', notes: '', pickupPoints: [{ address: '' }] });
      setActiveTab('mine');
      fetchTransports();
    } catch (err) { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/transport/${deleteId}`);
      toast.success('Removed');
      setDeleteId(null);
      fetchTransports();
    } catch (err) { toast.error('Failed'); }
  };

  const handleEdit = (vehicle) => {
    setForm({
      vehicleType: vehicle.vehicleType, capacity: vehicle.capacity, driverName: vehicle.driverName,
      driverContact: vehicle.driverContact, route: vehicle.route, notes: vehicle.notes,
      pickupPoints: vehicle.pickupPoints?.length ? vehicle.pickupPoints : [{ address: '' }]
    });
    setEditId(vehicle._id);
    setActiveTab('flag');
  };

  const filteredTransports = transports.filter(t => {
    if (filter.type && t.vehicleType !== filter.type) return false;
    if (t.capacity < filter.minCapacity) return false;
    if (filter.search) {
      const s = filter.search.toLowerCase();
      if (!t.route?.toLowerCase().includes(s) && !t.pickupPoints?.some(p => p.address.toLowerCase().includes(s))) return false;
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Truck className="text-orange-400" /> Evacuation Transport
        </h1>

        <div className="flex bg-slate-800 p-1 rounded-xl">
          {['available', 'flag', 'mine'].map(t => (
            <button key={t} onClick={() => {
              setActiveTab(t);
              if (t !== 'flag') { setEditId(null); setForm({ vehicleType: 'car', capacity: 4, driverName: user?.name || '', driverContact: '', route: '', notes: '', pickupPoints: [{ address: '' }] }); }
            }}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm capitalize ${activeTab === t ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>
              {t === 'available' ? 'Available Vehicles' : t === 'flag' ? (editId ? 'Edit Vehicle' : 'Flag My Vehicle') : `My Vehicles (${myTransports.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'available' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input placeholder="Search route or pickup points..." className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-white text-sm outline-none"
                  value={filter.search} onChange={e => setFilter({...filter, search: e.target.value})} />
              </div>
              <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
                value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})}>
                <option value="">All Types</option>
                {vehicleTypes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
                <Users size={14} className="text-slate-400" />
                <input type="number" min={1} className="w-16 bg-transparent text-white text-sm outline-none"
                  value={filter.minCapacity} onChange={e => setFilter({...filter, minCapacity: parseInt(e.target.value)||1})} title="Min Capacity" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTransports.length === 0 && (
                <p className="col-span-full text-slate-500 text-center py-10">No vehicles match your search</p>
              )}
              {filteredTransports.map(t => (
                <div key={t._id} className="bg-slate-800 border border-slate-700 p-5 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-white capitalize text-lg">{t.vehicleType}</h3>
                      <p className="text-sm text-slate-400">{t.driverName}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-orange-400 font-bold bg-orange-500/10 px-3 py-1 rounded-lg">
                      <Users size={14} /> {t.capacity} seats
                    </div>
                  </div>
                  {t.route && <p className="text-sm text-white mb-2"><MapPin size={14} className="inline text-slate-400" /> <span className="font-bold">Route:</span> {t.route}</p>}
                  
                  {t.pickupPoints?.length > 0 && t.pickupPoints[0].address && (
                    <div className="mb-3 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                      <p className="text-xs text-slate-400 font-bold mb-1">Pickup Points along route:</p>
                      <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                        {t.pickupPoints.map((p, i) => <li key={i}>{p.address}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {t.notes && <p className="text-xs text-slate-400 italic mb-3">"{t.notes}"</p>}
                  
                  <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center">
                    <p className="text-sm text-blue-400 font-bold flex items-center gap-2">📞 {t.driverContact}</p>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold uppercase">Available</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'flag' && (
          <form onSubmit={handleFlag} className="bg-slate-800 border border-slate-700 p-6 rounded-xl space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Vehicle Type</label>
                <select className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none mt-1"
                  value={form.vehicleType} onChange={e => setForm({...form, vehicleType: e.target.value})}>
                  {vehicleTypes.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Capacity (people)</label>
                <input type="number" min={1} className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none mt-1"
                  value={form.capacity} onChange={e => setForm({...form, capacity: parseInt(e.target.value)||1})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Driver Name</label>
                <input className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none mt-1"
                  value={form.driverName} onChange={e => setForm({...form, driverName: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-400">Contact Number</label>
                <input required type="tel" pattern="[0-9]{10}" maxLength="10" title="10-digit phone number" className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none mt-1"
                  value={form.driverContact} onChange={e => setForm({...form, driverContact: e.target.value.replace(/\D/g, '')})} />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Main Route (e.g. Delhi → Jaipur via NH48)</label>
              <input className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none mt-1"
                value={form.route} onChange={e => setForm({...form, route: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Intermediate Pickup Points</label>
              {form.pickupPoints.map((point, i) => (
                <div key={i} className="flex gap-2">
                  <input className="flex-1 bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none"
                    placeholder="Enter locality or landmark" value={point.address} onChange={e => { const pts = [...form.pickupPoints]; pts[i].address = e.target.value; setForm({...form, pickupPoints: pts}); }} />
                  {form.pickupPoints.length > 1 && (
                    <button type="button" onClick={() => { const pts = form.pickupPoints.filter((_, j) => j !== i); setForm({...form, pickupPoints: pts}); }}
                      className="text-red-400 hover:text-red-300 px-3 border border-slate-700 rounded-lg bg-slate-900"><Trash2 size={16} /></button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setForm({...form, pickupPoints: [...form.pickupPoints, {address:''}]})}
                className="text-orange-400 hover:text-orange-300 text-xs font-bold flex items-center gap-1 mt-1"><Plus size={14} /> Add Pickup Point</button>
            </div>

            <div>
              <label className="text-xs text-slate-400">Additional Notes</label>
              <textarea placeholder="Any other info?" className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none mt-1" rows={2}
                value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
              <Send size={18} /> {editId ? 'Save Changes' : 'Flag Vehicle Available'}
            </button>
          </form>
        )}

        {activeTab === 'mine' && (
          <div className="grid grid-cols-1 gap-4">
            {myTransports.length === 0 && <p className="text-slate-500 text-center py-10">You haven't flagged any vehicles yet</p>}
            {myTransports.map(t => (
              <div key={t._id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white capitalize text-lg">{t.vehicleType} <span className="text-slate-400 text-sm font-normal">({t.capacity} seats)</span></h3>
                  <p className="text-sm text-slate-300">{t.route}</p>
                  <p className="text-xs text-slate-500 mt-1">Status: {t.status}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(t)} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(t._id)} className="p-2 bg-slate-700 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded-lg"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Vehicle"
        message="Are you sure you want to remove this vehicle from the available transport list?"
        isDanger={true}
      />
    </DashboardLayout>
  );
}
