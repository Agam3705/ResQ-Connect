import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Bell, Menu, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NotificationPanel } from './NotificationPanel';

export function Header({ onMobileMenuClick }) {
  const { user } = useStore();
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <>
      {/* Backdrop for notifications */}
      {showNotifs && (
        <div 
          className="fixed inset-0 z-40 cursor-default" 
          onClick={() => setShowNotifs(false)}
        />
      )}

      <header className="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 lg:px-8 z-50 relative shadow-sm">
        
        {/* Left: Mobile Toggle Only (Logo moved to Sidebar) */}
        <div className="flex items-center">
          <button 
            onClick={onMobileMenuClick} 
            className="lg:hidden text-slate-400 hover:text-white p-2"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          
          {/* NOTIFICATION BELL AREA */}
          <div className="relative z-50">
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              className={`relative p-2 rounded-full transition-colors ${showNotifs ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse pointer-events-none"></span>
            </button>
            
            <NotificationPanel isOpen={showNotifs} />
          </div>

          {/* User Profile Link */}
          <Link to="/profile" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded-lg transition-colors z-40">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-white leading-none">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize mt-1">{user?.role || 'Civilian'}</p>
            </div>
            <UserCircle size={28} className="text-slate-400" />
          </Link>
        </div>
      </header>
    </>
  );
}