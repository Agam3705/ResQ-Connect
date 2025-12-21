import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Building2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('civilian');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    agencyName: '', agencyType: 'police', commanderName: '',
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const toastId = toast.loading("Creating account...");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
        agencyDetails: role === 'agency' ? {
          agencyName: formData.agencyName,
          type: formData.agencyType,
          commanderName: formData.commanderName,
          status: 'pending'
        } : undefined
      };

      await axios.post('http://localhost:5000/api/auth/register', payload);
      
      if (role === 'agency') {
        toast.success("Agency Application Submitted! Wait for approval.", { id: toastId, duration: 6000 });
      } else {
        toast.success("Account Created! Redirecting...", { id: toastId });
      }
      
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-lg border border-slate-700">
         <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400">Join the ResQ-Connect Network</p>
        </div>

        {/* Role Toggles */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setRole('civilian')}
            className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${
              role === 'civilian' 
                ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                : 'border-slate-600 text-slate-400 hover:border-slate-500'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-sm font-medium">Civilian</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('agency')}
            className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${
              role === 'agency' 
                ? 'bg-orange-600/20 border-orange-500 text-orange-400' 
                : 'border-slate-600 text-slate-400 hover:border-slate-500'
            }`}
          >
            <Building2 className="w-6 h-6" />
            <span className="text-sm font-medium">Rescue Agency</span>
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Full Name</label>
            <input required className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Email</label>
            <input required type="email" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Password</label>
            <input required type="password" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" 
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          {role === 'agency' && (
            <div className="space-y-4 pt-4 border-t border-slate-700 animate-in fade-in">
               <div>
                <label className="block text-xs font-medium text-orange-400 mb-1 uppercase">Agency Name</label>
                <input required className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" 
                  value={formData.agencyName} onChange={e => setFormData({...formData, agencyName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <select className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
                    value={formData.agencyType} onChange={e => setFormData({...formData, agencyType: e.target.value})}>
                    <option value="police">Police</option>
                    <option value="fire">Fire Dept</option>
                    <option value="medical">Medical</option>
                 </select>
                 <input required placeholder="Commander Name" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" 
                  value={formData.commanderName} onChange={e => setFormData({...formData, commanderName: e.target.value})} />
              </div>
            </div>
          )}

          <button type="submit" disabled={isLoading}
            className={`w-full mt-6 p-2 rounded font-bold text-white ${role === 'civilian' ? 'bg-blue-600' : 'bg-orange-600'}`}>
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-slate-400 hover:text-white">Already have an account? Sign In</Link>
        </div>
      </div>
    </div>
  );
}