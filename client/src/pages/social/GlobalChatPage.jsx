import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Send, Users } from 'lucide-react';

export function GlobalChatPage() {
  const { user } = useStore();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/social/chat');
      setMessages(res.data);
    } catch (err) { console.error(err); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    try {
      await axios.post('http://localhost:5000/api/social/chat', {
        userId: user._id || user.id,
        userName: user.name,
        text: inputText
      });
      setInputText('');
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col max-w-5xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center shrink-0">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-blue-500" /> Community Chat
          </h1>
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/> Live
          </span>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => {
            const isMe = msg.userId === (user._id || user.id);
            return (
              <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-xl text-sm ${
                  isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'
                }`}>
                  {!isMe && <span className="block text-[10px] text-blue-300 font-bold mb-1">{msg.userName}</span>}
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-500 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Input Area - FULL WIDTH STACKED LAYOUT */}
        <form onSubmit={sendMessage} className="p-4 bg-slate-900 border-t border-slate-700 flex flex-col gap-3 shrink-0">
          <input
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Type a message to the community..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
          >
            <Send size={20} /> Send Message
          </button>
        </form>

      </div>
    </DashboardLayout>
  );
}