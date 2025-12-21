import { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Package, Truck, CheckCircle, Plus, MapPin, Box, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export function LogisticsPage() {
  const [resources, setResources] = useState([]);
  const [view, setView] = useState('inventory'); // 'inventory' or 'transit'
  const [loading, setLoading] = useState(false);

  // Form State
  const [newItem, setNewItem] = useState({ name: '', category: 'food', quantity: 0, unit: 'boxes', location: 'Main Warehouse' });
  const [dispatchDest, setDispatchDest] = useState('');
  const [selectedId, setSelectedId] = useState(null); // For dispatch modal

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/logistics');
      setResources(res.data);
    } catch (err) { console.error(err); }
  };

  // HANDLERS
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/logistics/add', newItem);
      toast.success("Item Added");
      setNewItem({ name: '', category: 'food', quantity: 0, unit: 'boxes', location: 'Main Warehouse' });
      fetchResources();
    } catch (err) { toast.error("Failed"); }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchDest) return;
    try {
      await axios.put(`http://localhost:5000/api/logistics/dispatch/${selectedId}`, { destination: dispatchDest });
      toast.success("Dispatched!");
      setSelectedId(null);
      setDispatchDest('');
      fetchResources();
    } catch (err) { toast.error("Failed"); }
  };

  const handleDeliver = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/logistics/deliver/${id}`);
      toast.success("Marked as Distributed");
      fetchResources();
    } catch (err) { toast.error("Failed"); }
  };

  // Filter Data
  const inventoryItems = resources.filter(r => r.status === 'stored');
  const transitItems = resources.filter(r => r.status === 'in-transit');

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Package className="text-blue-500" /> Logistics & Resources
            </h1>
            <p className="text-slate-400">Manage inventory and track relief shipments.</p>
          </div>
          
          <div className="flex bg-slate-800 p-1 rounded-lg">
            <button onClick={() => setView('inventory')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${view === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              Inventory ({inventoryItems.length})
            </button>
            <button onClick={() => setView('transit')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${view === 'transit' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              In Transit ({transitItems.length})
            </button>
          </div>
        </div>

        {/* --- VIEW 1: INVENTORY & ADD FORM --- */}
        {view === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ADD FORM */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl h-fit">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Plus size={18}/> Add Stock</h2>
              <form onSubmit={handleAdd} className="space-y-4">
                <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none" 
                  placeholder="Item Name (e.g. Rice)" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
                
                <div className="grid grid-cols-2 gap-2">
                  <select className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none"
                    value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                    <option value="food">Food</option>
                    <option value="medical">Medical</option>
                    <option value="equipment">Equipment</option>
                    <option value="shelter">Shelter</option>
                  </select>
                  <input type="number" className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none" 
                    placeholder="Qty" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})} required />
                </div>
                
                <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none" 
                  placeholder="Location (e.g. Warehouse A)" value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} />
                
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl">Add to Inventory</button>
              </form>
            </div>

            {/* LIST */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventoryItems.map(item => (
                <div key={item._id} className="bg-slate-800 border border-slate-700 p-5 rounded-xl flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${
                        item.category === 'food' ? 'bg-orange-500/10 text-orange-500' :
                        item.category === 'medical' ? 'bg-red-500/10 text-red-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        <Box size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{item.name}</h3>
                        <p className="text-xs text-slate-400 capitalize">{item.category} • {item.location}</p>
                      </div>
                    </div>
                    <span className="bg-slate-700 text-white px-3 py-1 rounded-lg font-bold text-sm">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  
                  {/* Dispatch Section */}
                  {selectedId === item._id ? (
                    <form onSubmit={handleDispatch} className="mt-2 flex gap-2 animate-in fade-in">
                      <input autoFocus className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded-lg text-white text-sm outline-none"
                        placeholder="Destination?" value={dispatchDest} onChange={e => setDispatchDest(e.target.value)} />
                      <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white p-2 rounded-lg"><ArrowRight size={18}/></button>
                      <button type="button" onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-white p-2">Cancel</button>
                    </form>
                  ) : (
                    <button onClick={() => setSelectedId(item._id)} className="w-full bg-slate-700 hover:bg-amber-600/20 hover:text-amber-500 hover:border-amber-500 border border-transparent text-slate-300 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2">
                      <Truck size={16} /> Dispatch / Move
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW 2: IN TRANSIT --- */}
        {view === 'transit' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transitItems.length === 0 && <p className="text-slate-500 col-span-full text-center py-10">No shipments currently in transit.</p>}
            
            {transitItems.map(item => (
              <div key={item._id} className="bg-slate-800 border border-amber-500/30 p-5 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Truck size={100} className="text-amber-500" />
                </div>
                
                <h3 className="font-bold text-white text-xl mb-1">{item.name}</h3>
                <p className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-4">In Transit</p>
                
                <div className="flex items-center gap-4 text-sm text-slate-300 mb-6">
                  <div className="flex items-center gap-1"><MapPin size={14}/> {item.location}</div>
                  <ArrowRight size={14} className="text-slate-500" />
                  <div className="flex items-center gap-1 text-white font-bold"><MapPin size={14}/> {item.destination}</div>
                </div>

                <button onClick={() => handleDeliver(item._id)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> Mark Delivered
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}