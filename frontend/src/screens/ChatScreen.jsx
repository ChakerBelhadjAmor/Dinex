import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendChat, confirmAction } from '../services/api';

const WELCOME_MESSAGE = {
  role: 'bot',
  text: 'Ahla bik fi Dinex! 👋\n\nEna el assistant mta3ek, hna bech n3awnek fil flous mta3ek. Najem:\n\n💰 Nchouflek el balance\n💸 Nab3ath flous l 7ad\n📋 Nwarrik el historique\n📊 Na3tik conseils\n\n9ouli chnoua thebb!',
};

export default function ChatScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isTyping) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsTyping(true);

    try {
      const data = await sendChat(text);
      setIsTyping(false);

      if (data.needsConfirmation && data.action) {
        setPendingAction(data.action);
        setMessages(prev => [...prev, {
          role: 'bot',
          text: data.response,
          showConfirm: true
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
      }
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Mech mriguel, mafammech connexion m3a el serveur 😕. Jarreb marra okhra.'
      }]);
    }
  }

  async function handleConfirm(confirmed) {
    if (!pendingAction) return;

    // Remove confirm buttons from last message
    setMessages(prev => prev.map((m, i) =>
      i === prev.length - 1 ? { ...m, showConfirm: false } : m
    ));

    if (confirmed) {
      setIsTyping(true);
      try {
        const data = await confirmAction(pendingAction);
        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
      } catch {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: 'bot',
          text: 'Mech mriguel, ma njemtech nkammel 😕'
        }]);
      }
    } else {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Tayeb, annuliha. Chnoua thebb tdir okhra? 😊'
      }]);
    }
    setPendingAction(null);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <div className="header">
        <div className="header-logo">
          <div className="header-logo-icon">
            <img src="/dinex_logo.png" alt="Dinex logo" className="brand-logo-image" />
          </div>
          <div>
            <div className="header-title">Dinex</div>
          </div>
        </div>
        <div className="header-user">
          <span>{user?.name}</span>
          <button className="header-avatar" onClick={() => navigate('/profile')} title="El profil mta3i">
            {user?.name?.[0] || 'U'}
          </button>
        </div>
      </div>

      <div className="chat-screen">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i}>
              <div className={`chat-bubble ${msg.role} fade-in`}>
                {msg.role === 'bot' && <div className="bubble-name">Dinex 🤖</div>}
                {msg.text}
              </div>
              {msg.showConfirm && (
                <div className="chat-confirm" style={{ justifyContent: 'flex-start', marginTop: 8 }}>
                  <button className="btn-yes" onClick={() => handleConfirm(true)}>
                    Ey, mouwafe9 ✅
                  </button>
                  <button className="btn-no" onClick={() => handleConfirm(false)}>
                    La, annuli ❌
                  </button>
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="chat-typing">
              <span></span><span></span><span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-bar">
          <input
            ref={inputRef}
            className="chat-input"
            placeholder="Ekteb hna... (ex: 9addech ba9a?)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </>
  );
}
