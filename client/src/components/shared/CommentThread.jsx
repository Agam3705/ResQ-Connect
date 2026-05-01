import { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';
import { useStore } from '../../store/useStore';
import { Send, Trash2, MessageCircle, X } from 'lucide-react';

export function CommentThread({ postId, postType, isOpen, onClose }) {
  const { user } = useStore();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  const currentUserId = user?._id || user?.id;

  useEffect(() => {
    if (isOpen && postId) fetchComments();
  }, [isOpen, postId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/api/comments/${postType}/${postId}`);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {}
  };

  const sendComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await api.post(`/api/comments/${postType}/${postId}`, { text });
      setText('');
      fetchComments();
    } catch (err) {}
    finally { setLoading(false); }
  };

  const deleteComment = async (id) => {
    try {
      await api.delete(`/api/comments/${id}`);
      fetchComments();
    } catch (err) {}
  };

  if (!isOpen) return null;

  return (
    <div className="mt-3 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden animate-in fade-in">
      <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <h4 className="text-xs font-bold text-white flex items-center gap-1">
          <MessageCircle size={14} /> Discussion ({comments.length})
        </h4>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={14} /></button>
      </div>

      <div className="max-h-48 overflow-y-auto p-3 space-y-2">
        {comments.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-4">No messages yet. Start the conversation!</p>
        )}
        {comments.map(c => (
          <div key={c._id} className={`flex gap-2 ${c.userId === currentUserId ? 'flex-row-reverse' : ''}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-lg text-xs ${
              c.userId === currentUserId 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-slate-700 text-slate-200 rounded-bl-none'
            }`}>
              {c.userId !== currentUserId && (
                <span className="block text-[10px] font-bold text-blue-300 mb-0.5">
                  {c.userName} {c.userRole !== 'civilian' && `(${c.userRole})`}
                </span>
              )}
              <span>{c.text}</span>
              <span className="block text-[9px] opacity-60 mt-1">
                {new Date(c.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
              </span>
            </div>
            {c.userId === currentUserId && (
              <button onClick={() => deleteComment(c._id)} className="text-slate-600 hover:text-red-400 self-center">
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendComment} className="p-2 border-t border-slate-700 flex gap-2">
        <input className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
          placeholder="Type a message..." value={text} onChange={e => setText(e.target.value)} disabled={loading} />
        <button type="submit" disabled={loading || !text.trim()} 
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg disabled:opacity-50">
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
