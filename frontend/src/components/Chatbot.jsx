import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    { role: 'assistant', text: 'Hello! I am the CRPS Assistant. How can I help you today?' }
  ]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen, isMinimized]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', text: input.trim() };
    const apiHistory = history.map(msg => ({ role: msg.role, content: msg.text }));
    
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: userMessage.text,
        history: apiHistory
      });
      setHistory(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
    } catch (err) {
      let errText = 'Sorry, there was an issue connecting to the AI brain.';
      if (err.response?.status === 503) errText = 'NVIDIA API key is missing on the server. Please configure it in .env.';
      setHistory(prev => [...prev, { role: 'assistant', text: errText, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className="chatbot-fab hover-float"
        title="Chat with CRPS AI"
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #1a4f8a, #0284c7)', color: 'white',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 25px -5px rgba(26, 79, 138, 0.4)', cursor: 'pointer'
        }}
      >
        <MessageCircle size={30} />
      </button>
    );
  }

  return (
    <div className={`chatbot-window ${isMinimized ? 'minimized' : ''}`} style={{
      position: 'fixed', bottom: isMinimized ? '2rem' : '2rem', right: '2rem', zIndex: 9999,
      width: isMinimized ? '280px' : '360px', height: isMinimized ? '60px' : '550px',
      background: '#ffffff', borderRadius: '16px', overflow: 'hidden',
      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2), 0 0 10px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '1px solid rgba(0,0,0,0.08)'
    }}>
      {/* Header */}
      <div 
        onClick={() => setIsMinimized(!isMinimized)}
        style={{
          background: 'linear-gradient(135deg, #1a4f8a, #0284c7)', padding: '1rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white',
          cursor: 'pointer', userSelect: 'none'
        }}
      >
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>CRPS AI</div>
          {!isMinimized && <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)' }}>Powered by NVIDIA</div>}
        </div>
        {!isMinimized && (
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', borderRadius: 4 }}>
              <Minimize2 size={18} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', borderRadius: 4 }}>
              <X size={18} />
            </button>
          </div>
        )}
        {isMinimized && (
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Messages Area */}
      {!isMinimized && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map((msg, i) => {
            const isAI = msg.role === 'assistant';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: isAI ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                {isAI && <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a4f8a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}><Bot size={14} /></div>}
                <div style={{
                  background: isAI ? (msg.error ? '#fef2f2' : 'white') : '#1a4f8a',
                  color: isAI ? (msg.error ? '#dc2626' : '#1e293b') : 'white',
                  border: isAI ? `1px solid ${msg.error ? '#fca5a5' : '#e2e8f0'}` : 'none',
                  padding: '0.6rem 0.85rem', borderRadius: '16px',
                  borderBottomLeftRadius: isAI ? '4px' : '16px',
                  borderBottomRightRadius: isAI ? '16px' : '4px',
                  fontSize: '0.85rem', lineHeight: 1.5,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  {msg.text.split('\n').map((line, j) => <div key={j} style={{ minHeight: line ? 'auto' : '0.5rem' }}>{line}</div>)}
                </div>
                {!isAI && <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexShrink: 0 }}><User size={14} /></div>}
              </div>
            );
          })}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a4f8a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}><Bot size={14} /></div>
              <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 0.85rem', borderRadius: '16px', borderBottomLeftRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Loader2 size={14} color="#94a3b8" className="animate-spin" />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      {!isMinimized && (
        <form onSubmit={handleSend} style={{ padding: '0.75rem 1rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <textarea 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={loading}
            style={{
              flex: 1, padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '12px',
              resize: 'none', height: '42px', maxHeight: '100px', fontSize: '0.85rem', fontFamily: 'inherit',
              outline: 'none', background: loading ? '#f8fafc' : 'white', transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1a4f8a'}
            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading ? '#1a4f8a' : '#cbd5e1',
              color: 'white', border: 'none', width: '42px', height: '42px',
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() && !loading ? 'pointer' : 'default', transition: 'background 0.2s'
            }}
          >
            <Send size={18} style={{ marginLeft: '-2px' }} />
          </button>
        </form>
      )}
    </div>
  );
}
