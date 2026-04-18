import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';

export default function LoginScreen() {
  const { loginUser } = useAuth();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      setError('A3tina numero telephone s7i7 (8 chiffres)');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const result = await login(phone, pin || '1234');
      if (result.success) {
        loginUser(result.user, result.token);
      } else {
        setError(result.error || 'Ma njemtch ndkhol. Jarreb marra okhra.');
      }
    } catch {
      setError('Mafammech connexion. Vérifier el internet.');
    }
    setLoading(false);
  }

  return (
    <div className="app-container">
      <div className="login-screen">
        <div className="login-logo">F</div>
        <h1 className="login-title">Flousna</h1>
        <p className="login-subtitle">Floussek f jibek, fil telephone</p>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="input-group">
            <label className="input-label">Numero telephone</label>
            <input
              type="tel"
              className="input-field"
              placeholder="20 123 456"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              maxLength={8}
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label">Code PIN</label>
            <input
              type="password"
              className="input-field"
              placeholder="****"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              maxLength={4}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Jari el connexion...' : 'Odkhol'}
          </button>
        </form>

        <div className="login-demo">
          <p>Demo: ista3mel numero <span>20123456</span></p>
          <p>PIN: <span>1234</span></p>
        </div>
      </div>
    </div>
  );
}
