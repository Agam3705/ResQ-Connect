import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Search, UserPlus, CheckCircle, MapPin, Phone, Calendar, User, Camera, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export function MissingPersonPage() {
  const { user } = useStore();
  const [people, setPeople] = useState([]);
  const [view, setView] = useState('board');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [photo, setPhoto] = useState(null); // <--- NEW STATE FOR FILE
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Male', lastSeenLocation: '', description: '', contact: ''
  });

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/missing');
      setPeople(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // USE FORMDATA FOR FILE UPLOAD
    const data = new FormData();
    data.append('reporterId', user._id);
    data.append('reporterName', user.name);
    data.append('reporterContact', formData.contact);
    data.append('name', formData.name);
    data.append('age', formData.age);
    data.append('gender', formData.gender);
    data.append('lastSeenLocation', formData.lastSeenLocation);
    data.append('description', formData.description);
    if (photo) {
      data.append('photo', photo); // Attach the file
    }

    try {
      await axios.post('http://localhost:5000/api/missing/report', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Report Submitted");
      
      // Reset Form
      setFormData({ name: '', age: '', gender: 'Male', lastSeenLocation: '', description: '', contact: '' });
      setPhoto(null);
      setView('board');
      fetchPeople();
    } catch (err) { toast.error("Failed to submit"); }
    finally { setLoading(false); }
  };

  const markFound = async (id) => {
    if(!window.confirm("Confirm this person is found?")) return;
    try {
      await axios.put(`http://localhost:5000/api/missing/found/${id}`);
      toast.success("Status Updated: FOUND");
      fetchPeople();
    } catch (err) { toast.error("Update failed"); }
  };

  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.lastSeenLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Search className="text-amber-500" /> Missing Persons
            </h1>
            <p className="text-slate-400">Community bulletin board for locating missing individuals.</p>
          </div>
          <button 
            onClick={() => setView(view === 'board' ? 'report' : 'board')}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
              view === 'board' 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg' 
                : 'bg-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {view === 'board' ? <><UserPlus size={20}/> Report Missing</> : 'Back to Board'}
          </button>
        </div>

        {/* --- VIEW 1: REPORT FORM --- */}
        {view === 'report' && (
          <div className="max-w-2xl mx-auto bg-slate-800 border border-slate-700 p-8 rounded-2xl animate-in fade-in">
            <h2 className="text-xl font-bold text-white mb-6">File a Missing Person Report</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* PHOTO UPLOAD */}
              <div className="flex justify-center mb-6">
                <label className="cursor-pointer group relative w-32 h-32 rounded-full bg-slate-900 border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden hover:border-blue-500 transition-colors">
                  {photo ? (
                    <img src={URL.createObjectURL(photo)} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Camera className="w-8 h-8 text-slate-500 mx-auto mb-1 group-hover:text-blue-500" />
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Add Photo</span>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Full Name</label>
                  <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Age</label>
                  <input type="number" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none" required
                    value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Gender</label>
                  <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none"
                    value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Your Contact No.</label>
                  <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none" required placeholder="+91..."
                    value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400">Last Seen Location</label>
                <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none" required placeholder="e.g. Central Station, 5 PM"
                  value={formData.lastSeenLocation} onChange={e => setFormData({...formData, lastSeenLocation: e.target.value})} />
              </div>

              <div>
                <label className="text-xs text-slate-400">Description / Clothing</label>
                <textarea rows={3} className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none" placeholder="Red shirt, blue jeans, height 5'9..."
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <button disabled={loading} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors">
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        )}

        {/* --- VIEW 2: BOARD --- */}
        {view === 'board' && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
              <input 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-500 outline-none"
                placeholder="Search by name or location..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPeople.length === 0 && <p className="text-slate-500 col-span-full text-center py-10">No reports match your search.</p>}
              
              {filteredPeople.map(person => (
                <div key={person._id} className={`bg-slate-800 border ${person.status === 'found' ? 'border-emerald-500/50' : 'border-slate-700'} p-5 rounded-2xl relative overflow-hidden group`}>
                  
                  <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider z-10 ${
                    person.status === 'found' ? 'bg-emerald-500 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {person.status}
                  </div>

                  {/* IMAGE SECTION */}
                  <div className="flex items-start gap-4 mb-4 mt-2">
                    <div className="w-20 h-20 bg-slate-900 rounded-2xl flex-shrink-0 overflow-hidden border-2 border-slate-700">
                      {person.photoUrl ? (
                        <img 
                          src={`http://localhost:5000/${person.photoUrl.replace(/\\/g, '/')}`} 
                          alt={person.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={32} className="text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{person.name}</h3>
                      <p className="text-sm text-slate-400">{person.gender}, {person.age} yrs</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-300 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-red-400" /> 
                      <span className="truncate">{person.lastSeenLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-400" /> 
                      <span>{new Date(person.lastSeenDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-emerald-400" /> 
                      <span>Contact: {person.reporterContact}</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg text-slate-400 text-xs italic mt-2">
                      "{person.description}"
                    </div>
                  </div>

                  {person.status === 'missing' && (
                    <button 
                      onClick={() => markFound(person._id)}
                      className="w-full bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-500/30 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} /> Mark as Found
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}