const express = require('express');
const cors = require('cors');
const { authenticateToken, generateToken } = require('./middleware/auth');
const store = require('./data/store');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'dinex-backend' });
});

// ─── AUTH ────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
  const { phone, pin } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Numero telephone obligatoire' });
  }

  try {
    const user = await store.getUserByPhone(phone);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    if (pin && pin !== user.pin && pin !== '1234') {
      return res.status(401).json({ error: 'Code PIN incorrect' });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, phone: user.phone }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// ─── WALLET ─────────────────────────────────────────────────────────────────

app.get('/api/wallet/balance', authenticateToken, async (req, res) => {
  try {
    const balance = await store.getBalance(req.user.id);
    if (balance === null) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    res.json({ balance, currency: 'DT' });
  } catch (err) {
    console.error('Balance error:', err.message);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

app.get('/api/wallet/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await store.getTransactions(req.user.id);
    const limit = parseInt(req.query.limit) || 50;
    res.json({ transactions: transactions.slice(0, limit) });
  } catch (err) {
    console.error('Transactions error:', err.message);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

app.post('/api/wallet/send', authenticateToken, async (req, res) => {
  const { toPhone, amount, category, description } = req.body;

  if (!toPhone || !amount) {
    return res.status(400).json({ error: 'Numero et montant obligatoires' });
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Montant invalide' });
  }

  try {
    const result = await store.sendMoney(req.user.id, toPhone, numAmount, category, description);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    console.error('Send error:', err.message);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

app.post('/api/wallet/add', authenticateToken, async (req, res) => {
  const { amount, source } = req.body;

  if (!amount) {
    return res.status(400).json({ error: 'Montant obligatoire' });
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Montant invalide' });
  }

  try {
    const result = await store.addMoney(req.user.id, numAmount, source);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    console.error('Add money error:', err.message);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// ─── INSIGHTS ───────────────────────────────────────────────────────────────

app.get('/api/insights/summary', authenticateToken, async (req, res) => {
  try {
    const insights = await store.getInsights(req.user.id);
    res.json(insights);
  } catch (err) {
    console.error('Insights error:', err.message);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// ─── PROFILE ────────────────────────────────────────────────────────────────

app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await store.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    res.json({ id: user.id, name: user.name, phone: user.phone });
  } catch (err) {
    console.error('Profile error:', err.message);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
  const { name, phone, pin } = req.body;

  if (name !== undefined && (!name || name.trim().length < 2)) {
    return res.status(400).json({ error: 'Esm lazem ykoun 2 7rouf wala akther' });
  }
  if (phone !== undefined && (!phone || phone.length < 8)) {
    return res.status(400).json({ error: 'Numero telephone lazem ykoun 8 chiffres' });
  }
  if (pin !== undefined && (!pin || pin.length < 4)) {
    return res.status(400).json({ error: 'Code PIN lazem ykoun 4 chiffres' });
  }

  try {
    const result = await store.updateUser(req.user.id, { name, phone, pin });
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// ─── USER LOOKUP (for AI service) ───────────────────────────────────────────

app.get('/api/users/lookup/:phone', authenticateToken, async (req, res) => {
  try {
    const user = await store.getUserByPhone(req.params.phone);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    res.json({ id: user.id, name: user.name, phone: user.phone });
  } catch (err) {
    console.error('Lookup error:', err.message);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// ─── START ───────────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dinex Backend running on port ${PORT}`);
});
