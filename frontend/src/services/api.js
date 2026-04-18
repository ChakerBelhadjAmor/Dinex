const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('flousna_token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

// ─── AUTH ────────────────────────────────────────────────────

export async function login(phone, pin = '1234') {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, pin })
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem('flousna_token', data.token);
    localStorage.setItem('flousna_user', JSON.stringify(data.user));
  }
  return data;
}

export function logout() {
  localStorage.removeItem('flousna_token');
  localStorage.removeItem('flousna_user');
}

export function getStoredUser() {
  const user = localStorage.getItem('flousna_user');
  const token = localStorage.getItem('flousna_token');
  if (user && token) {
    return { user: JSON.parse(user), token };
  }
  return null;
}

// ─── WALLET ─────────────────────────────────────────────────

export async function getBalance() {
  const res = await fetch(`${API_URL}/api/wallet/balance`, {
    headers: authHeaders()
  });
  return res.json();
}

export async function getTransactions(limit = 50) {
  const res = await fetch(`${API_URL}/api/wallet/transactions?limit=${limit}`, {
    headers: authHeaders()
  });
  return res.json();
}

export async function sendMoney(toPhone, amount, category = 'transfer', description = '') {
  const res = await fetch(`${API_URL}/api/wallet/send`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ toPhone, amount, category, description })
  });
  return res.json();
}

export async function addMoney(amount, source = 'Carte bancaire') {
  const res = await fetch(`${API_URL}/api/wallet/add`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ amount, source })
  });
  return res.json();
}

// ─── INSIGHTS ───────────────────────────────────────────────

export async function getInsights() {
  const res = await fetch(`${API_URL}/api/insights/summary`, {
    headers: authHeaders()
  });
  return res.json();
}

// ─── CHAT ───────────────────────────────────────────────────

export async function sendChat(message) {
  const stored = getStoredUser();
  const res = await fetch(`${AI_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      token: stored?.token,
      userId: stored?.user?.id
    })
  });
  return res.json();
}

export async function confirmAction(action) {
  const stored = getStoredUser();
  const res = await fetch(`${AI_URL}/api/chat/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      token: stored?.token
    })
  });
  return res.json();
}

// ─── PROFILE ────────────────────────────────────────────────

export async function getProfile() {
  const res = await fetch(`${API_URL}/api/users/profile`, {
    headers: authHeaders()
  });
  return res.json();
}

export async function updateProfile(updates) {
  const res = await fetch(`${API_URL}/api/users/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  // Update stored user if successful
  if (data.success && data.user) {
    localStorage.setItem('flousna_user', JSON.stringify(data.user));
  }
  return data;
}

// ─── USER LOOKUP ────────────────────────────────────────────

export async function lookupUser(phone) {
  const res = await fetch(`${API_URL}/api/users/lookup/${phone}`, {
    headers: authHeaders()
  });
  return res.json();
}
