import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useStore } from '../../store/useStore';
import api from '../../lib/api';
import { CommentThread } from '../../components/shared/CommentThread';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { RefreshCw, Package, Send, CheckCircle, Plus, MessageCircle, Trash2, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const itemCategories = ['food', 'medical', 'equipment', 'shelter', 'fuel', 'water', 'clothing', 'other'];

export function ResourceExchangePage() {
  const { user } = useStore();
  const [board, setBoard] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('board');
  const [openComment, setOpenComment] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState({ type: '', urgency: '', search: '' });
  const [form, setForm] = useState({
    type: 'request', urgency: 'normal', message: '',
    items: [{ name: '', quantity: 1, category: 'other', unit: 'units' }]
  });
  const agencyId = user?._id;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [boardRes, myRes] = await Promise.all([
        api.get('/api/exchange/board').catch(() => ({ data: [] })),
        api.get(`/api/exchange/my/${agencyId}`).catch(() => ({ data: [] })),
      ]);
      setBoard(boardRes.data || []);
      setMyRequests(myRes.data || []);
    } catch (err) {}
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (form.items.some(i => !i.name)) return toast.error('Fill item names');
    try {
      await api.post('/api/exchange', form);
      toast.success('Posted to exchange board!');
      setForm({ type: 'request', urgency: 'normal', message: '', items: [{ name: '', quantity: 1, category: 'other', unit: 'units' }] });
      setActiveTab('board');
      fetchData();
    } catch (err) { toast.error('Failed to post'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/exchange/${deleteId}`);
      toast.success('Deleted');
      setDeleteId(null);
      fetchData();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  const filteredBoard = board.filter(r => {
    if (filter.type && r.type !== filter.type) return false;
    if (filter.urgency && r.urgency !== filter.urgency) return false;
    if (filter.search && !r.items?.some(i => i.name.toLowerCase().includes(filter.search.toLowerCase())) && 
        !r.fromAgencyName?.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <RefreshCw className="text-emerald-400" /> Resource Exchange
        </h1>

        <div className="flex bg-slate-800 p-1 rounded-xl">
          {['board', 'post', 'mine'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm capitalize ${activeTab === t ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
              {t === 'board' ? 'Exchange Board' : t === 'post' ? 'Post Request/Surplus' : `My Posts (${myRequests.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'board' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input placeholder="Search items or agency..." className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-white text-sm outline-none"
                  value={filter.search} onChange={e => setFilter({...filter, search: e.target.value})} />
              </div>
              <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
                value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})}>
                <option value="">All Types</option><option value="request">Needs</option><option value="surplus">Surplus</option>
              </select>
              <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
                value={filter.urgency} onChange={e => setFilter({...filter, urgency: e.target.value})}>
                <option value="">All Urgency</option>{['low','normal','high','critical'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBoard.length === 0 && <p className="col-span-full text-slate-500 text-center py-10">No matching posts</p>}
              {filteredBoard.map(req => (
                <div key={req._id} className={`bg-slate-800 border p-5 rounded-xl ${req.type === 'request' ? 'border-red-500/20' : 'border-emerald-500/20'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${req.type === 'request' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {req.type === 'request' ? 'NEEDS' : 'HAS SURPLUS'}
                    </span>
                    <span className={`text-[10px] font-bold ${req.urgency === 'critical' ? 'text-red-400' : 'text-slate-400'}`}>{req.urgency}</span>
                  </div>
                  <p className="text-sm font-bold text-white">{req.fromAgencyName}</p>
                  <p className="text-xs text-slate-400 mt-1">{req.items?.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}</p>
                  {req.message && <p className="text-xs text-slate-500 mt-1 italic">"{req.message}"</p>}
                  <p className="text-[10px] text-slate-600 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>

                  {req.fromAgency !== agencyId && (
                    <button onClick={() => setOpenComment(openComment === req._id ? null : req._id)}
                      className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                      <MessageCircle size={12} /> {openComment === req._id ? 'Hide Chat' : 'Respond / Chat'}
                    </button>
                  )}
                  {req.fromAgency === agencyId && (
                    <button onClick={() => setOpenComment(openComment === req._id ? null : req._id)}
                      className="mt-3 px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                      <MessageCircle size={12} /> View Responses
                    </button>
                  )}

                  <CommentThread postId={req._id} postType="exchange" isOpen={openComment === req._id} onClose={() => setOpenComment(null)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'post' && (
          <form onSubmit={handlePost} className="bg-slate-800 border border-slate-700 p-6 rounded-xl space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex gap-2">
                {['request', 'surplus'].map(t => (
                  <button key={t} type="button" onClick={() => setForm({...form, type: t})}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize border ${form.type === t ? (t === 'request' ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-emerald-600/20 border-emerald-500 text-emerald-400') : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                    {t === 'request' ? 'I Need' : 'I Have Extra'}
                  </button>
                ))}
              </div>
              <select className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none"
                value={form.urgency} onChange={e => setForm({...form, urgency: e.target.value})}>
                {['low', 'normal', 'high', 'critical'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            {form.items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder="Item name" className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded-lg text-white text-sm outline-none"
                  value={item.name} onChange={e => { const items = [...form.items]; items[i].name = e.target.value; setForm({...form, items}); }} />
                <select className="w-28 bg-slate-900 border border-slate-700 p-2 rounded-lg text-white text-sm outline-none"
                  value={item.category} onChange={e => { const items = [...form.items]; items[i].category = e.target.value; setForm({...form, items}); }}>
                  {itemCategories.map(c => <option key={c}>{c}</option>)}
                </select>
                <input type="number" min={1} className="w-20 bg-slate-900 border border-slate-700 p-2 rounded-lg text-white text-sm outline-none"
                  value={item.quantity} onChange={e => { const items = [...form.items]; items[i].quantity = parseInt(e.target.value)||1; setForm({...form, items}); }} />
                {form.items.length > 1 && (
                  <button type="button" onClick={() => { const items = form.items.filter((_, j) => j !== i); setForm({...form, items}); }}
                    className="text-red-400 hover:text-red-300 p-2"><Trash2 size={16} /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setForm({...form, items: [...form.items, {name:'',quantity:1,category:'other',unit:'units'}]})}
              className="text-blue-400 text-sm">+ Add Item</button>
            <textarea placeholder="Message (optional)" className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none" rows={2}
              value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl">Post to Board</button>
          </form>
        )}

        {activeTab === 'mine' && (
          <div className="space-y-3">
            {myRequests.length === 0 && <p className="text-slate-500 text-center py-10">No posts yet</p>}
            {myRequests.map(r => (
              <div key={r._id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-xs font-bold capitalize ${r.type === 'request' ? 'text-red-400' : 'text-emerald-400'}`}>{r.type}</span>
                    <p className="text-sm text-white">{r.items?.map(i => `${i.name} (${i.quantity})`).join(', ')}</p>
                    <p className="text-[10px] text-slate-500">Status: {r.status} • {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => setDeleteId(r._id)}
                    className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/20 rounded transition-colors"><Trash2 size={16} /></button>
                </div>
                <button onClick={() => setOpenComment(openComment === r._id ? null : r._id)}
                  className="mt-2 text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300">
                  <MessageCircle size={12} /> View responses
                </button>
                <CommentThread postId={r._id} postType="exchange" isOpen={openComment === r._id} onClose={() => setOpenComment(null)} />
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
        message="Are you sure you want to delete this resource post and all its comments? This cannot be undone."
        isDanger={true}
      />
    </DashboardLayout>
  );
}
