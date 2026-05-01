import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useStore } from '../../store/useStore';
import api from '../../lib/api';
import { CommentThread } from '../../components/shared/CommentThread';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { Pill, Send, AlertTriangle, CheckCircle, MessageCircle, Trash2, XCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const medCategories = ['insulin', 'epipen', 'inhaler', 'blood-pressure', 'antibiotics', 'painkillers', 'other'];

export function MedicineExchangePage() {
  const { user } = useStore();
  const [board, setBoard] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [openComment, setOpenComment] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState({ type: '', category: '', search: '' });
  const [form, setForm] = useState({ type: 'request', medicineName: '', category: 'other', quantity: '1', urgency: 'normal', description: '', contact: '', location: { area: '' } });

  const userId = user?._id || user?.id;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [boardRes, myRes] = await Promise.all([
        api.get('/api/medicine').catch(() => ({ data: [] })),
        api.get(`/api/medicine/my/${userId}`).catch(() => ({ data: [] })),
      ]);
      setBoard(boardRes.data || []);
      setMyPosts(myRes.data || []);
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.medicineName) return toast.error('Medicine name required');
    try {
      await api.post('/api/medicine', { ...form, userName: user?.name });
      toast.success(`${form.type === 'request' ? 'Request' : 'Offer'} posted!`);
      setForm({ type: 'request', medicineName: '', category: 'other', quantity: '1', urgency: 'normal', description: '', contact: '', location: { area: '' } });
      setActiveTab('browse');
      fetchData();
    } catch (err) { toast.error('Failed'); }
  };

  const handleClose = async (id, currentStatus) => {
    try {
      await api.put(`/api/medicine/${id}/close`);
      toast.success(currentStatus === 'closed' ? 'Reopened successfully' : 'Removed from board');
      fetchData();
    } catch (err) { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/medicine/${deleteId}`);
      toast.success('Deleted');
      setDeleteId(null);
      fetchData();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  const filteredBoard = board.filter(item => {
    if (item.status === 'closed') return false; // Hide closed items on the board
    if (filter.type && item.type !== filter.type) return false;
    if (filter.category && item.category !== filter.category) return false;
    if (filter.search && !item.medicineName.toLowerCase().includes(filter.search.toLowerCase()) && 
        !item.userName?.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Pill className="text-pink-400" /> Medicine Exchange</h1>

        <div className="flex bg-slate-800 p-1 rounded-xl">
          {['browse', 'post', 'mine'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm capitalize ${activeTab === t ? 'bg-pink-600 text-white' : 'text-slate-400'}`}>
              {t === 'browse' ? 'Browse Board' : t === 'post' ? 'Post Request/Offer' : `My Posts (${myPosts.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'browse' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input placeholder="Search medicine or user..." className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-white text-sm outline-none"
                  value={filter.search} onChange={e => setFilter({...filter, search: e.target.value})} />
              </div>
              <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
                value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})}>
                <option value="">All Types</option>
                <option value="request">Requests</option>
                <option value="offer">Offers</option>
              </select>
              <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
                value={filter.category} onChange={e => setFilter({...filter, category: e.target.value})}>
                <option value="">All Categories</option>
                {medCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBoard.length === 0 && <p className="col-span-full text-slate-500 text-center py-10">No active listings</p>}
              {filteredBoard.map(item => (
                <div key={item._id} className={`bg-slate-800 border p-5 rounded-xl ${item.type === 'request' ? 'border-red-500/20' : 'border-emerald-500/20'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.type === 'request' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {item.type}
                    </span>
                    {item.urgency === 'critical' && <span className="flex items-center gap-1 text-red-400 text-xs"><AlertTriangle size={12} /> Critical</span>}
                  </div>
                  <h3 className="font-bold text-white text-lg">{item.medicineName}</h3>
                  <p className="text-xs text-slate-400 capitalize mb-1">{item.category} • Qty: {item.quantity}</p>
                  <p className="text-xs text-slate-400">{item.userName} • {item.location?.area}</p>
                  {item.description && <p className="text-xs text-slate-500 mt-1 italic">"{item.description}"</p>}
                  {item.contact && <p className="text-xs text-blue-400 mt-1">📞 {item.contact}</p>}
                  <p className="text-[10px] text-slate-600 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>

                  <div className="mt-3 flex gap-2">
                    {item.userId !== userId ? (
                      <button onClick={() => setOpenComment(openComment === item._id ? null : item._id)}
                        className="px-4 py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                        <MessageCircle size={12} /> {openComment === item._id ? 'Hide Chat' : 'Respond / Chat'}
                      </button>
                    ) : (
                      <button onClick={() => setOpenComment(openComment === item._id ? null : item._id)}
                        className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                        <MessageCircle size={12} /> View Responses
                      </button>
                    )}
                  </div>
                  
                  <CommentThread postId={item._id} postType="medicine" isOpen={openComment === item._id} onClose={() => setOpenComment(null)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'post' && (
          <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 p-6 rounded-xl space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Type</label>
                <div className="flex gap-2 mt-1">
                  {['request', 'offer'].map(t => (
                    <button key={t} type="button" onClick={() => setForm({...form, type: t})}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize border ${form.type === t ? (t === 'request' ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-emerald-600/20 border-emerald-500 text-emerald-400') : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                      {t === 'request' ? 'I Need' : 'I Have'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400">Urgency</label>
                <select className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none mt-1"
                  value={form.urgency} onChange={e => setForm({...form, urgency: e.target.value})}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Medicine Name</label>
                <input required className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none"
                  value={form.medicineName} onChange={e => setForm({...form, medicineName: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-400">Category</label>
                <select className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none"
                  value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {medCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input required type="tel" pattern="[0-9]{10}" maxLength="10" title="10-digit phone number" placeholder="Contact (10-digits)" className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none"
                value={form.contact} onChange={e => setForm({...form, contact: e.target.value.replace(/\D/g, '')})} />
              <input placeholder="Area/Location" className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none"
                value={form.location.area} onChange={e => setForm({...form, location: { area: e.target.value }})} />
            </div>
            <textarea placeholder="Details..." className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none" rows={2}
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <button type="submit" className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-xl">Post to Board</button>
          </form>
        )}

        {activeTab === 'mine' && (
          <div className="space-y-3">
            {myPosts.length === 0 && <p className="text-slate-500 text-center py-10">No posts yet</p>}
            {myPosts.map(r => (
              <div key={r._id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-xs font-bold capitalize ${r.type === 'request' ? 'text-red-400' : 'text-emerald-400'}`}>{r.type}</span>
                    <p className="text-sm font-bold text-white">{r.medicineName} <span className="font-normal text-xs text-slate-400">({r.quantity})</span></p>
                    <p className="text-[10px] text-slate-500">Status: {r.status} • {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleClose(r._id, r.status)} title={r.status === 'closed' ? "Reopen post" : "Remove from board"}
                      className={`${r.status === 'closed' ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20' : 'text-amber-400 hover:text-amber-300 hover:bg-amber-900/20'} p-1 rounded transition-colors`}>
                      {r.status === 'closed' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    </button>
                    <button onClick={() => setDeleteId(r._id)} title="Delete completely"
                      className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/20 rounded transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                <button onClick={() => setOpenComment(openComment === r._id ? null : r._id)}
                  className="mt-2 text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300">
                  <MessageCircle size={12} /> View responses
                </button>
                <CommentThread postId={r._id} postType="medicine" isOpen={openComment === r._id} onClose={() => setOpenComment(null)} />
              </div>
            ))}
          </div>
        )}

      </div>
      
      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post and all its comments? This cannot be undone."
      />
    </DashboardLayout>
  );
}
