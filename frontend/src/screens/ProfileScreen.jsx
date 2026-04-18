import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Lock, LogOut, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/api';

export default function ProfileScreen() {
  const { user, loginUser, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await getProfile();
      setName(data.name || '');
      setPhone(data.phone || '');
    } catch {
      setError('Ma njemtech nchargi el profil');
    }
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const updates = {};
    if (name !== user?.name) updates.name = name.trim();
    if (phone !== user?.phone) updates.phone = phone.trim();
    if (pin) updates.pin = pin;

    if (Object.keys(updates).length === 0) {
      setError('Ma baddelt 7ata 7aja');
      setSaving(false);
      return;
    }

    try {
      const result = await updateProfile(updates);
      if (result.success) {
        loginUser(result.user, null);
        setSuccess('Tbaddel b naje7! ✅');
        setPin('');
      } else {
        setError(result.error || 'Ma njemtech nbaddel');
      }
    } catch {
      setError('Mafammech connexion');
    }
    setSaving(false);
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading" style={{ paddingTop: 100 }}>Jari el chargement...</div>
      </div>
    );
  }

  return (
    <>
      <div className="header">
        <div className="header-logo" style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <div className="header-title">El profil mta3i</div>
        </div>
      </div>

      <div className="screen-content" style={{ padding: 20 }}>
        {/* Avatar */}
        <div className="profile-avatar-section slide-up">
          <div className="profile-avatar-large">
            {name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="profile-name-display">{name || 'User'}</div>
          <div className="profile-phone-display">{phone}</div>
        </div>

        {/* Edit Form */}
        <form className="send-form slide-up" onSubmit={handleSave} style={{ marginTop: 24 }}>
          {error && <div className="login-error">{error}</div>}
          {success && (
            <div style={{
              background: 'rgba(0, 212, 170, 0.1)',
              border: '1px solid rgba(0, 212, 170, 0.3)',
              color: 'var(--accent)',
              padding: 12,
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              textAlign: 'center'
            }}>
              {success}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">
              <User size={14} style={{ display: 'inline', marginRight: 4 }} />Esm
            </label>
            <input
              className="input-field"
              type="text"
              placeholder="Esmek"
              value={name}
              onChange={e => setName(e.target.value)}
              minLength={2}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <Phone size={14} style={{ display: 'inline', marginRight: 4 }} />Numero telephone
            </label>
            <input
              className="input-field"
              type="tel"
              placeholder="20 123 456"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              maxLength={8}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <Lock size={14} style={{ display: 'inline', marginRight: 4 }} />Code PIN jdid (optionnel)
            </label>
            <input
              className="input-field"
              type="password"
              placeholder="****"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              maxLength={4}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Check size={18} />
            {saving ? 'Jari el modification...' : 'Sauvgarder'}
          </button>
        </form>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="profile-logout-btn"
        >
          <LogOut size={18} />
          Deconnexion
        </button>
      </div>
    </>
  );
}
