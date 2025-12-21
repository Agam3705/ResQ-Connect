import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { 
  Home, Map, AlertTriangle, Users, Heart, FileText, 
  HandHeart, Building2, Search, MessageSquare, Package, 
  Settings, LogOut, ChevronLeft, ChevronRight 
} from 'lucide-react';
import clsx from 'clsx'; 

export function Sidebar({ mobileOpen, onMobileClose }) {
  const { sidebarOpen, setSidebarOpen, user, logout, sosRequests } = useStore();
  const location = useLocation();
  const activeSOS = sosRequests.length;

  const navItems = [
    { icon: <Home size={20} />, label: 'Dashboard', href: '/' },
    { icon: <Map size={20} />, label: 'Tactical Map', href: '/map' },
    { icon: <AlertTriangle size={20} />, label: 'SOS Alerts', href: '/sos', badge: activeSOS },
    { icon: <Users size={20} />, label: 'Family Circle', href: '/family', role: 'civilian' },
    { icon: <Heart size={20} />, label: 'First Aid', href: '/first-aid' },
    { icon: <HandHeart size={20} />, label: 'Volunteer', href: '/volunteer' },
    { icon: <MessageSquare size={20} />, label: 'Community', href: '/community' },
    { icon: <Building2 size={20} />, label: 'Agencies', href: '/agencies' },
    { icon: <Search size={20} />, label: 'Missing Person', href: '/missing' },
    { icon: <Package size={20} />, label: 'Logistics', href: '/logistics', role: 'agency' },
    { icon: <FileText size={20} />, label: 'Documents', href: '/documents', role: 'civilian' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/profile' },
  ];

  return (
    <aside className={clsx(
      "fixed lg:static inset-y-0 left-0 z-40 bg-slate-900 border-r border-slate-700 transition-all duration-300 flex flex-col flex-shrink-0",
      sidebarOpen ? "w-64" : "w-20",
      mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>

      <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {navItems.map((item) => {
          if (item.role && user?.role !== item.role) return null;
          const isActive = location.pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              to={item.href} 
              onClick={onMobileClose}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all relative whitespace-nowrap group mb-1",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <div className="min-w-[20px] flex justify-center">{item.icon}</div>
              
              <span className={clsx(
                "transition-all duration-300 ml-2 font-medium",
                sidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0 overflow-hidden"
              )}>
                {item.label}
              </span>
              
              {!sidebarOpen && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-slate-700 shadow-xl">
                  {item.label}
                </div>
              )}

              {item.badge > 0 && (
                <span className={clsx(
                  "bg-red-600 text-white text-[10px] px-1.5 rounded-full font-bold shadow-sm",
                  sidebarOpen ? "absolute right-4 top-3.5" : "absolute top-1 right-1"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-900 space-y-2">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        <button 
          onClick={logout}
          className={clsx(
            "flex items-center gap-3 px-2 py-2 w-full text-slate-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors",
            !sidebarOpen && "justify-center"
          )}
        >
          <LogOut size={20} />
          {sidebarOpen && <span className="font-medium text-sm ml-2">Logout</span>}
        </button>
      </div>
    </aside>
  );
}