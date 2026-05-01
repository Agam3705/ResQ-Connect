import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useStore } from '../../store/useStore';
import api from '../../lib/api';
import { MessageSquare, Send, Building2 } from 'lucide-react';

export function AgencyChatPage() {
  const { user } = useStore();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/api/agency-chat');
      setMessages(res.data || []);
    } catch (err) { console.warn(err?.response?.status || err.message); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    try {
      await api.post('/api/agency-chat', { text: inputText });
      setInputText('');
      fetchMessages();
    } catch (err) { console.warn(err?.response?.status || err.message); }
  };

  return (
    <DashboardLayout noScroll>
      <div className="h-full flex flex-col max-w-5xl mx-auto bg-slate-800 border-x border-slate-700 overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center shrink-0">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="text-purple-400" /> Agency Collaboration Room
          </h1>
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => {
            const isMe = msg.senderId === user?._id;
            return (
              <div key={msg._id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${isMe ? 'bg-purple-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                  {!isMe && (
                    <span className="block text-[10px] text-purple-300 font-bold mb-1">
                      {msg.agencyName || msg.senderName}
                    </span>
                  )}
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-500 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                </span>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 bg-slate-900 border-t border-slate-700 flex gap-3 shrink-0">
          <input className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            placeholder="Coordinate with other agencies..." value={inputText} onChange={e => setInputText(e.target.value)} />
          <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-6 rounded-xl font-bold flex items-center gap-2">
            <Send size={18} /> Send
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
