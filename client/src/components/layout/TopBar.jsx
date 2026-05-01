import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Shield, Bell, LogOut, Menu } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import api from '../../lib/api';

export function TopBar({ onMenuClick }) {
  const { user, logout } = useStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const userId = user?._id || user?.id;

  useEffect(() => {
    if (userId) fetchUnread();
    const interval = setInterval(() => { if (userId) fetchUnread(); }, 15000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchUnread = async () => {
    try {
      const res = await api.get(`/api/user/notifications/${userId}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (e) {}
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 z-50 relative">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-white">
          <Menu />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield className="text-white w-5 h-5" />
          </div>
          <span className="text-white font-bold text-lg hidden sm:block">ResQ-Connect</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Bell Notification */}
        <div className="relative">
          <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchUnread(); }}
            className="text-slate-400 hover:text-white relative p-1">
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationPanel isOpen={notifOpen} onClose={() => { setNotifOpen(false); fetchUnread(); }} />
        </div>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
          <div className="text-right hidden sm:block">
            <p className="text-sm text-white font-medium">{user?.name || 'Guest'}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role || 'Visitor'}</p>
          </div>
          <button onClick={logout} className="text-red-400 hover:text-red-300">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}