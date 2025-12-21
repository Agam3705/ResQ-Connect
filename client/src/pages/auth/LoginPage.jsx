import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const toastId = toast.loading("Verifying credentials...");

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      login(res.data.user);
      
      toast.success("Welcome back, Commander!", { id: toastId });
      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Login failed', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-lg border border-slate-700">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">ResQ-Connect</h2>
          <p className="text-slate-400">Tactical Response System</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                className="w-full pl-10 p-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-red-500 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                className="w-full pl-10 p-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-red-500 outline-none"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white p-2 rounded font-bold transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-700 pt-4">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}