import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { User, Shield, Lock, Save, Loader2, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user, updateUser } = useStore(); // Ensure updateUser is in your store actions
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'
  const [loading, setLoading] = useState(false);

  // Profile Form
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', bloodGroup: '', emergencyContact: ''
  });

  // Password Form
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    if (user?._id) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/user/profile/${user._id}`);
      setFormData(res.data);
    } catch (err) { console.error(err); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/user/profile/${user._id}`, formData);
      toast.success("Profile Updated");
      updateUser(res.data); // Update local store
    } catch (err) { toast.error("Failed to update"); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/user/profile/password/${user._id}`, passData);
      toast.success("Password Changed");
      setPassData({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR TABS */}
          <div className="w-full md:w-64 space-y-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <User size={18} /> Profile Info
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'security' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Shield size={18} /> Security
            </button>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-8">
            
            {/* TAB 1: PROFILE INFO */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6 animate-in fade-in">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-600">
                    <User size={40} className="text-slate-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{formData.name}</h2>
                    <p className="text-slate-400 text-sm">{user.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Full Name</label>
                    <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Email (Read-only)</label>
                    <input disabled className="w-full bg-slate-900/50 border border-slate-700 p-3 rounded-xl text-slate-500 cursor-not-allowed"
                      value={formData.email} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Phone Number</label>
                    <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none"
                      value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91..." />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Blood Group</label>
                    <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none"
                      value={formData.bloodGroup || ''} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                      <option value="">Select...</option>
                      <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                      <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-400 mb-1 block">Address</label>
                    <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none"
                      value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full address" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-400 mb-1 block">Emergency Contact (Parent/Guardian)</label>
                    <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none"
                      value={formData.emergencyContact || ''} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} placeholder="Name & Phone Number" />
                  </div>
                </div>

                <button disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mt-4">
                  {loading ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Save Changes
                </button>
              </form>
            )}

            {/* TAB 2: SECURITY */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordChange} className="space-y-6 animate-in fade-in">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Lock className="text-amber-500" /> Change Password
                </h2>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Current Password</label>
                  <input type="password" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none"
                    value={passData.currentPassword} onChange={e => setPassData({...passData, currentPassword: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">New Password</label>
                  <input type="password" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none"
                    value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} />
                </div>

                <button disabled={loading} className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                  {loading ? <Loader2 className="animate-spin"/> : <Shield size={18}/>} Update Password
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}