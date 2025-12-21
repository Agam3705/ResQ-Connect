import { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Shield, CheckCircle, XCircle, AlertCircle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const [pendingAgencies, setPendingAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/pending-agencies');
      setPendingAgencies(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await axios.put(`http://localhost:5000/api/admin/approve/${id}`);
        toast.success("Agency Approved");
      } else {
        await axios.put(`http://localhost:5000/api/admin/reject/${id}`);
        toast.error("Agency Rejected");
      }
      fetchPending(); // Refresh list
    } catch (err) { toast.error("Action Failed"); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield size={32} className="text-red-600" /> Admin Console
            </h1>
            <p className="text-slate-400 mt-2">Manage agency verifications and system status.</p>
          </div>
          <div className="bg-slate-800 px-6 py-3 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 uppercase font-bold">Pending Requests</p>
            <p className="text-2xl font-bold text-white">{pendingAgencies.length}</p>
          </div>
        </div>

        {/* PENDING LIST */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertCircle className="text-amber-500" /> Verification Requests
          </h2>

          {loading && <p className="text-slate-500">Loading requests...</p>}
          
          {!loading && pendingAgencies.length === 0 && (
            <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-500">
              No pending agency approvals.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {pendingAgencies.map(agency => (
              <div key={agency._id} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{agency.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                        {agency.email}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300 capitalize">
                        Type: {agency.agencyDetails?.type || 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      License: {agency.agencyDetails?.licenseNumber || 'Not Provided'} • Address: {agency.agencyDetails?.address || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => handleAction(agency._id, 'reject')}
                    className="flex-1 md:flex-none px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-500/30 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  <button 
                    onClick={() => handleAction(agency._id, 'approve')}
                    className="flex-1 md:flex-none px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"
                  >
                    <CheckCircle size={18} /> Approve
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}