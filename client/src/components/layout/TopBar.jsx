import { useStore } from '../../store/useStore';
import { Shield, Bell, LogOut, Menu } from 'lucide-react';

export function TopBar({ onMenuClick }) {
  const { user, logout } = useStore();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 z-50">
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
        <div className="relative cursor-pointer">
          <Bell className="text-slate-400 hover:text-white" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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