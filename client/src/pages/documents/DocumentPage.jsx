import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Lock, Unlock, Upload, FileText, Trash2, Shield, Eye, File, KeyRound, Loader2, StickyNote, X } from 'lucide-react';
import toast from 'react-hot-toast';

export function DocumentPage() {
  const { user } = useStore();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [verifying, setVerifying] = useState(false);

  // DATA
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'note'
  const [viewNote, setViewNote] = useState(null); // Selected note to view

  // FORM
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('identity');
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState('');

  const userId = user?._id || user?.id;

  useEffect(() => {
    if (isUnlocked && userId) fetchDocs();
  }, [isUnlocked, userId]);

  const fetchDocs = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/documents/${userId}`);
      setDocs(res.data);
    } catch (err) {
      toast.error("Failed to load items");
    }
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!passwordInput) return toast.error("Enter password");
    setVerifying(true);
    try {
      await axios.post('http://localhost:5000/api/auth/verify-password', { userId, password: passwordInput });
      toast.success("Vault Unlocked");
      setIsUnlocked(true);
      setPasswordInput('');
    } catch (err) {
      toast.error("Incorrect Password");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return toast.error("Title is required");

    setUploading(true);
    try {
      if (activeTab === 'file') {
        if (!file) throw new Error("Please select a file");
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        formData.append('title', title);
        formData.append('category', category);
        
        await axios.post('http://localhost:5000/api/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        if (!textContent) throw new Error("Note content is empty");
        await axios.post('http://localhost:5000/api/documents/note', {
          userId, title, category, textContent
        });
      }

      toast.success(activeTab === 'file' ? "File Uploaded" : "Note Saved");
      // Reset Form
      setTitle('');
      setFile(null);
      setTextContent('');
      fetchDocs();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/documents/${id}`);
      toast.success("Deleted");
      fetchDocs();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // --- LOCKED VIEW ---
  if (!isUnlocked) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
          <form onSubmit={handleUnlock} className="bg-slate-800 border border-slate-700 p-8 rounded-2xl w-full max-w-md text-center shadow-2xl animate-in fade-in zoom-in">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-slate-700">
              <Shield className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Secure Vault</h2>
            <p className="text-slate-400 mb-8">Password required to access.</p>
            <div className="mb-6 relative">
              <KeyRound className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
              <input type="password" placeholder="Enter Password" className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-500 outline-none"
                value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} autoFocus />
            </div>
            <button type="submit" disabled={verifying} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
              {verifying ? <Loader2 className="animate-spin" /> : <Unlock size={18} />} {verifying ? "Verifying..." : "Unlock Vault"}
            </button>
          </form>
        </div>
      </DashboardLayout>
    );
  }

  // --- UNLOCKED VIEW ---
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-800 border border-slate-700 p-6 rounded-2xl">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="text-emerald-500" /> Secure Vault
            </h1>
            <p className="text-slate-400 text-sm">Encrypted storage for Files & Notes.</p>
          </div>
          <button onClick={() => setIsUnlocked(false)} className="text-slate-400 hover:text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
            <Lock size={16} /> Lock
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: CREATE FORM */}
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl h-fit">
            
            {/* Tabs */}
            <div className="flex p-1 bg-slate-900 rounded-lg mb-6">
              <button onClick={() => setActiveTab('file')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'file' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                Upload File
              </button>
              <button onClick={() => setActiveTab('note')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'note' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                Write Note
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Title</label>
                <input className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none"
                  placeholder={activeTab === 'file' ? "e.g. Passport" : "e.g. WiFi Password"}
                  value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Category</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none"
                  value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="identity">Identity</option>
                  <option value="medical">Medical</option>
                  <option value="insurance">Insurance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {activeTab === 'file' ? (
                <div className="border-2 border-dashed border-slate-600 rounded-xl p-4 text-center hover:bg-slate-700/50 cursor-pointer relative transition-colors">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFile(e.target.files[0])} />
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-300 truncate">{file ? file.name : "Select File"}</p>
                </div>
              ) : (
                <textarea rows={4} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-blue-500 outline-none"
                  placeholder="Enter secret note..." value={textContent} onChange={e => setTextContent(e.target.value)} />
              )}

              <button disabled={uploading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                {uploading ? <Loader2 className="animate-spin" /> : (activeTab === 'file' ? <Upload size={18}/> : <StickyNote size={18}/>)}
                {uploading ? "Saving..." : (activeTab === 'file' ? "Upload File" : "Save Note")}
              </button>
            </form>
          </div>

          {/* RIGHT: LIST */}
          <div className="lg:col-span-2 space-y-4">
            {docs.length === 0 && (
              <div className="text-center py-10 text-slate-500 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">Vault is empty.</div>
            )}
            
            {docs.map(doc => (
              <div key={doc._id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex justify-between items-center group hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${doc.type === 'note' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {doc.type === 'note' ? <StickyNote size={20} /> : <File size={20} />}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{doc.title}</h3>
                    <p className="text-xs text-slate-400 capitalize">{doc.category} • {doc.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {doc.type === 'file' ? (
                    <a href={`http://localhost:5000/${doc.filePath}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-emerald-400">
                      <Eye size={18} />
                    </a>
                  ) : (
                    <button onClick={() => setViewNote(doc)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-yellow-400">
                      <Eye size={18} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(doc._id)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NOTE VIEWER MODAL */}
        {viewNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><StickyNote className="text-yellow-500"/> {viewNote.title}</h3>
                <button onClick={() => setViewNote(null)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white"><X size={20}/></button>
              </div>
              <div className="p-6">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <p className="text-slate-300 whitespace-pre-wrap font-mono text-sm">{viewNote.textContent}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}