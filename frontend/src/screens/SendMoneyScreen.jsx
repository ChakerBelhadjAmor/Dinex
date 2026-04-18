import { useState } from 'react';
import { ArrowLeft, CheckCircle, Send, User, Hash, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sendMoney, addMoney } from '../services/api';

export default function SendMoneyScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('choose'); // choose, send, add, success
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleSend(e) {
    e.preventDefault();
    if (!phone || !amount) {
      setError('Lazem ta3ti numero w montant');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const data = await sendMoney(phone, parseFloat(amount), 'transfer', description);
      if (data.success) {
        setResult(data);
        setMode('success');
      } else {
        setError(data.error || 'Ma njemtech nab3ath');
      }
    } catch {
      setError('Mafammech connexion');
    }
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!amount) {
      setError('Lazem ta3ti montant');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const data = await addMoney(parseFloat(amount));
      if (data.success) {
        setResult(data);
        setMode('success');
      } else {
        setError(data.error || 'Ma njemtech nzid');
      }
    } catch {
      setError('Mafammech connexion');
    }
    setLoading(false);
  }

  function reset() {
    setMode('choose');
    setPhone('');
    setAmount('');
    setDescription('');
    setError('');
    setResult(null);
  }

  return (
    <>
      <div className="header">
        <div className="header-logo" style={{ cursor: 'pointer' }} onClick={() => mode === 'choose' ? navigate('/dashboard') : reset()}>
          <ArrowLeft size={20} />
          <div className="header-title">
            {mode === 'send' ? "Ab3ath flous" : mode === 'add' ? 'Zid flous' : mode === 'success' ? 'Tamm!' : 'Flous'}
          </div>
        </div>
      </div>

      <div className="screen-content send-screen">
        {mode === 'choose' && (
          <div className="slide-up" style={{ paddingTop: 40 }}>
            <div className="send-amount-display">
              <h2 style={{ fontSize: 22, marginBottom: 8 }}>Chnoua thebb tdir?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Akhtar chnoua thebb</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn-primary" onClick={() => setMode('send')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <Send size={20} /> Ab3ath flous l 7ad
              </button>
              <button
                className="btn-primary"
                onClick={() => setMode('add')}
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              >
                <Hash size={20} /> Zid flous fil compte
              </button>
            </div>
            {/* QR Code Section */}
            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>Wala scan QR code</p>
              <div className="qr-container">
                <QRDisplay />
              </div>
            </div>
          </div>
        )}

        {mode === 'send' && (
          <form className="send-form slide-up" onSubmit={handleSend}>
            <div className="send-amount-display">
              <div className="send-amount-value">
                {amount || '0'}<span className="currency"> DT</span>
              </div>
              <div className="send-amount-label">Montant bech tab3thou</div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <div className="input-group">
              <label className="input-label"><User size={14} style={{ display: 'inline', marginRight: 4 }} />Numero telephone</label>
              <input
                className="input-field"
                type="tel"
                placeholder="20 654 321"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={8}
              />
            </div>

            <div className="input-group">
              <label className="input-label"><Hash size={14} style={{ display: 'inline', marginRight: 4 }} />Montant (DT)</label>
              <input
                className="input-field"
                type="number"
                placeholder="50"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="1"
                step="0.01"
              />
            </div>

            <div className="input-group">
              <label className="input-label"><FileText size={14} style={{ display: 'inline', marginRight: 4 }} />Description (optionnel)</label>
              <input
                className="input-field"
                type="text"
                placeholder="Ex: part mta3 el pizza"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Jari el envoi...' : "Confirmer w ab3ath 💸"}
            </button>
          </form>
        )}

        {mode === 'add' && (
          <form className="send-form slide-up" onSubmit={handleAdd}>
            <div className="send-amount-display">
              <div className="send-amount-value">
                {amount || '0'}<span className="currency"> DT</span>
              </div>
              <div className="send-amount-label">Montant bech tzidou</div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <div className="input-group">
              <label className="input-label">Montant (DT)</label>
              <input
                className="input-field"
                type="number"
                placeholder="100"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="1"
                step="0.01"
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[50, 100, 200, 500].map(v => (
                <button
                  key={v}
                  type="button"
                  className="filter-chip"
                  onClick={() => setAmount(String(v))}
                  style={amount === String(v) ? { background: 'var(--accent)', color: '#000', borderColor: 'var(--accent)' } : {}}
                >
                  {v} DT
                </button>
              ))}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Jari...' : 'Confirmer w zid 💰'}
            </button>
          </form>
        )}

        {mode === 'success' && (
          <div className="send-success">
            <div className="send-success-icon">
              <CheckCircle size={40} />
            </div>
            <h2>Tamm b naje7! ✅</h2>
            {result?.transaction && (
              <p>
                {result.transaction.type === 'receive'
                  ? `Zedna ${result.transaction.amount} DT fil compte.`
                  : `Ba3atht ${result.transaction.amount} DT l ${result.transaction.to}.`
                }
              </p>
            )}
            {result?.newBalance !== undefined && (
              <p style={{ marginTop: 12, fontSize: 18, fontWeight: 700 }}>
                Balance jdida: {result.newBalance.toFixed(2)} DT
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'center' }}>
              <button className="btn-primary" onClick={reset} style={{ maxWidth: 160 }}>
                Okhra 💸
              </button>
              <button
                className="btn-primary"
                onClick={() => navigate('/dashboard')}
                style={{ maxWidth: 160, background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              >
                Dar 🏠
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Simple QR code visual (mock)
function QRDisplay() {
  // Generate a deterministic QR-like pattern
  const pattern = [
    1,1,1,1,1,1,1,0,1,0,1,
    1,0,0,0,0,0,1,0,0,1,0,
    1,0,1,1,1,0,1,0,1,0,1,
    1,0,1,1,1,0,1,0,0,1,1,
    1,0,1,1,1,0,1,0,1,0,0,
    1,0,0,0,0,0,1,0,0,1,1,
    1,1,1,1,1,1,1,0,1,0,1,
    0,0,0,0,0,0,0,0,0,1,0,
    1,0,1,0,1,1,1,0,1,0,1,
    0,1,0,1,0,0,0,0,1,0,1,
    1,0,1,1,1,0,1,0,0,1,1,
  ];

  return (
    <div className="qr-code">
      <div className="qr-grid">
        {pattern.map((cell, i) => (
          <div key={i} className={`qr-cell ${cell ? 'filled' : 'empty'}`} />
        ))}
      </div>
    </div>
  );
}
