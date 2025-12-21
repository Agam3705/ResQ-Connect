import { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { Check, Info, AlertTriangle } from 'lucide-react';

export function NotificationPanel({ isOpen }) {
  const { user } = useStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?._id) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/user/notifications/${user._id}`);
      // Ensure we always set an array, even if API returns null/undefined
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      console.error("Failed to fetch notifications", err);
      setNotifications([]); 
    } finally {
      setLoading(false);
    }
  };

  const markRead = async () => {
    if (!user?._id) return;
    try {
      await axios.put(`http://localhost:5000/api/user/notifications/read/${user._id}`);
      fetchNotifications(); // Refresh list
    } catch (err) { console.error(err); }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 ring-1 ring-black/5">
      {/* Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-sm font-bold text-white">Notifications</h3>
        <button onClick={markRead} className="text-xs text-blue-400 hover:text-white transition-colors">
          Mark all read
        </button>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto bg-slate-800">
        {loading && (
          <div className="p-4 text-center text-slate-500 text-xs">Loading...</div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="p-6 text-center text-slate-500 text-xs">No new notifications.</div>
        )}

        {!loading && notifications.map(note => (
          <div key={note._id} className={`p-3 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors ${!note.read ? 'bg-slate-700/30' : ''}`}>
            <div className="flex gap-3">
              <div className={`mt-1 min-w-[20px] ${
                note.type === 'alert' ? 'text-red-500' : 
                note.type === 'success' ? 'text-emerald-500' : 'text-blue-500'
              }`}>
                {note.type === 'alert' ? <AlertTriangle size={16} /> : 
                 note.type === 'success' ? <Check size={16} /> : <Info size={16} />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">{note.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{note.message}</p>
                <span className="text-[10px] text-slate-500 mt-2 block">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}