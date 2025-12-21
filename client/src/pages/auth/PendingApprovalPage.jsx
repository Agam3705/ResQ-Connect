import { LogOut, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function PendingApprovalPage() {
  const { logout } = useStore();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center shadow-2xl">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="text-amber-500" size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">Verification Pending</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Your agency account is currently under review by our administrators. You will gain access to the Command Center once verified.
        </p>

        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors border border-slate-700"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}