import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SOSButton } from '../emergency/SOSButton'; // <--- Import it
import { useStore } from '../../store/useStore';

export function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useStore();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <TopBar onMenuClick={() => setMobileMenuOpen(true)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          mobileOpen={mobileMenuOpen} 
          onMobileClose={() => setMobileMenuOpen(false)} 
        />
        
        <main className="flex-1 overflow-auto p-4 lg:p-6 relative">
           <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
           </div>
           
           <div className="relative z-10">
             {children}
           </div>
        </main>
      </div>

      {/* Show SOS Button only for Civilians */}
      {user?.role === 'civilian' && <SOSButton />}
      
    </div>
  );
}