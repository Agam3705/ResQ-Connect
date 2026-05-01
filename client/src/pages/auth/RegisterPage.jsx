import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';
import { Shield, Loader2, UserPlus, Mail, Lock, User, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function RegisterPage() {
  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <RegisterContent />
      </GoogleOAuthProvider>
    );
  }
  return <RegisterContent />;
}

function RegisterContent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'civilian',
    agencyDetails: {
      agencyName: '', type: 'ngo', commanderName: '',
      licenseNumber: '', address: '', phone: '', services: [],
      operatingHours: ''
    }
  });

  const availableServices = ['rescue', 'medical-aid', 'food-supply', 'shelter', 'transport', 'fire-fighting', 'search-and-rescue', 'counseling'];

  const handleServiceToggle = (service) => {
    const current = formData.agencyDetails.services;
    setFormData({
      ...formData,
      agencyDetails: {
        ...formData.agencyDetails,
        services: current.includes(service) 
          ? current.filter(s => s !== service) 
          : [...current, service]
      }
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords don't match");
    }
    if (formData.password.length < 4) {
      return toast.error("Password must be at least 4 characters");
    }

    setIsLoading(true);
    const toastId = toast.loading("Creating account...");
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };
      if (formData.role === 'agency') {
        payload.agencyDetails = formData.agencyDetails;
      }
      await api.post('/api/auth/register', payload);
      toast.success(
        formData.role === 'agency' 
          ? 'Registration submitted! Awaiting admin approval.' 
          : 'Account created! Please login.',
        { id: toastId, duration: 4000 }
      );
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const { login } = useStore();

  const handleGoogleSuccess = async (credentialResponse) => {
    const toastId = toast.loading("Authenticating with Google...");
    try {
      const res = await api.post('/api/auth/google/token', {
        credential: credentialResponse.credential
      });
      login(res.data.user, res.data.token);
      toast.success("Welcome!", { id: toastId });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google login failed', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-600 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-emerald-600 rounded-full filter blur-[120px]" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
            <p className="text-slate-400 text-sm">Join the emergency response network</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Role Selector */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'civilian', label: 'Civilian', icon: User, desc: 'Get help' },
                { value: 'agency', label: 'Agency', icon: Building2, desc: 'Provide help' }
              ].map(r => (
                <button type="button" key={r.value}
                  onClick={() => { setFormData({...formData, role: r.value}); setStep(1); }}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    formData.role === r.value 
                      ? 'bg-blue-600/20 border-blue-500 text-white' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <r.icon className="mx-auto mb-1" size={24} />
                  <span className="text-sm font-bold block">{r.label}</span>
                  <span className="text-[10px] opacity-60">{r.desc}</span>
                </button>
              ))}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Full Name</label>
                <input required className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none focus:border-blue-500"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Email</label>
                <input required type="email" className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none focus:border-blue-500"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Password</label>
                <input required type="password" className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none focus:border-blue-500"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Confirm</label>
                <input required type="password" className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none focus:border-blue-500"
                  value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
              </div>
            </div>

            {/* Agency Details */}
            {formData.role === 'agency' && (
              <div className="space-y-3 pt-2 border-t border-slate-700/50">
                <h3 className="text-sm font-bold text-slate-300">Agency Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Agency Name</label>
                    <input required className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none focus:border-blue-500"
                      value={formData.agencyDetails.agencyName} onChange={e => setFormData({...formData, agencyDetails: {...formData.agencyDetails, agencyName: e.target.value}})} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Type</label>
                    <select className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none"
                      value={formData.agencyDetails.type} onChange={e => setFormData({...formData, agencyDetails: {...formData.agencyDetails, type: e.target.value}})}>
                      <option value="police">Police</option>
                      <option value="fire">Fire Department</option>
                      <option value="medical">Medical</option>
                      <option value="ngo">NGO</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Commander Name</label>
                    <input className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none focus:border-blue-500"
                      value={formData.agencyDetails.commanderName} onChange={e => setFormData({...formData, agencyDetails: {...formData.agencyDetails, commanderName: e.target.value}})} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Phone</label>
                    <input className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-white text-sm outline-none focus:border-blue-500" 
                      placeholder="10 digit number" maxLength={10} pattern="[0-9]{10}"
                      value={formData.agencyDetails.phone} onChange={e => setFormData({...formData, agencyDetails: {...formData.agencyDetails, phone: e.target.value.replace(/\D/g, '')}})} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Services Offered</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {availableServices.map(s => (
                      <button type="button" key={s} onClick={() => handleServiceToggle(s)}
                        className={`px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                          formData.agencyDetails.services.includes(s)
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                            : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'
                        }`}
                      >{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white p-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg"
            >
              {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 
                formData.role === 'agency' ? 'Submit for Approval' : 'Create Account'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-700" />
              <span className="text-[10px] text-slate-500 uppercase">or</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>

            {/* Google Sign-In */}
            <div className="flex justify-center">
              {GOOGLE_CLIENT_ID ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google Sign-In failed')}
                  theme="filled_black"
                  size="large"
                  width="100%"
                  text="signup_with"
                  shape="pill"
                />
              ) : (
                <button type="button" onClick={() => toast.info('Google ID not configured')}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 text-sm hover:text-white transition-all"
                >
                  Continue with Google
                </button>
              )}
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-400">
              Already have an account? <Link to="/login" className="text-blue-400 hover:underline font-medium">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}