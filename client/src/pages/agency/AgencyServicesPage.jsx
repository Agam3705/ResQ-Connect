import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useStore } from '../../store/useStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Megaphone, Plus, Trash2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/shared/ConfirmModal';

export function AgencyServicesPage() {
  const { user } = useStore();
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  const [form, setForm] = useState({
    title: '', type: 'program', description: '', location: '', contactDetails: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/api/agency-services');
      // Only show my own services here
      const myServices = res.data.filter(s => s.agencyId === (user?._id || user?.id));
      setServices(myServices);
    } catch (err) {
      console.warn(err?.response?.status || err.message);
    }
  };

  const handlePostService = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/agency-services', form);
      toast.success('Successfully posted');
      setForm({ title: '', type: 'program', description: '', location: '', contactDetails: '' });
      setShowForm(false);
      fetchServices();
    } catch (err) { toast.error('Failed to post'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/agency-services/${deleteId}`);
      toast.success('Deleted');
      fetchServices();
    } catch (err) { toast.error('Failed to delete'); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Megaphone className="text-blue-500" /> My Programs & Alerts
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage your agency's public announcements and services.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all">
            <Plus size={18} /> New Post
          </button>
        </div>

        {showForm && (
          <form onSubmit={handlePostService} className="bg-slate-800 border-2 border-blue-500/30 p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold text-white text-lg border-b border-slate-700 pb-2">Create New Broadcast</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Title</label>
                <input required className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none mt-1"
                  value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-400">Type</label>
                <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none mt-1"
                  value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="program">Program / Camp</option>
                  <option value="service">Ongoing Service</option>
                  <option value="alert">Emergency Alert</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Description</label>
              <textarea required className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none mt-1" rows={3}
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Location (optional)</label>
                <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none mt-1"
                  value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-400">Contact Details (optional)</label>
                <input type="tel" pattern="[0-9]{10}" maxLength="10" title="10-digit phone number" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none mt-1" placeholder="10-digit number"
                  value={form.contactDetails} onChange={e => setForm({...form, contactDetails: e.target.value.replace(/\D/g, '')})} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl text-slate-400 hover:text-white font-bold transition-colors">Cancel</button>
              <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 active:scale-95">Post Now</button>
            </div>
          </form>
        )}
        
        <div className="space-y-4">
          {services.length === 0 && (
            <div className="bg-slate-800 border-2 border-dashed border-slate-700 p-12 rounded-2xl text-center text-slate-500">
              <ShieldCheck className="mx-auto w-12 h-12 text-slate-600 mb-3" />
              <p>You haven't posted any programs or alerts yet.</p>
            </div>
          )}

          {services.map(srv => (
            <div key={srv._id} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex justify-between items-start group hover:border-blue-500/50 transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    srv.type === 'alert' ? 'bg-red-500/20 text-red-400' :
                    srv.type === 'program' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {srv.type}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{new Date(srv.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{srv.title}</h3>
                <p className="text-slate-300 text-sm mb-4 max-w-2xl leading-relaxed">{srv.description}</p>
                
                <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-medium">
                  {srv.location && <span className="bg-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-1">📍 {srv.location}</span>}
                  {srv.contactDetails && <span className="bg-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-1">📞 {srv.contactDetails}</span>}
                </div>
              </div>
              <button 
                onClick={() => setDeleteId(srv._id)}
                className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

      </div>

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Post"
        message="Are you sure you want to delete this program/alert? This action cannot be undone and it will be removed from the public directory."
        confirmText="Delete"
        isDanger={true}
      />
    </DashboardLayout>
  );
}
