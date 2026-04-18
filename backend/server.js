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
  res.json({ status: 'ok', service: 'flousna-backend' });
});

// ─── AUTH ────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const { phone, pin } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Numero telephone obligatoire' });
  }

  const user = store.getUserByPhone(phone);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }

  // For hackathon: accept any pin or default "1234"
  if (pin && pin !== user.pin && pin !== '1234') {
    return res.status(401).json({ error: 'Code PIN incorrect' });
  }

  const token = generateToken(user);
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone
    }
  });
});

// ─── WALLET ─────────────────────────────────────────────────────────────────

app.get('/api/wallet/balance', authenticateToken, (req, res) => {
  const balance = store.getBalance(req.user.id);
  if (balance === null) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }
  res.json({ balance, currency: 'DT' });
});

app.get('/api/wallet/transactions', authenticateToken, (req, res) => {
  const transactions = store.getTransactions(req.user.id);
  const limit = parseInt(req.query.limit) || 50;
  res.json({ transactions: transactions.slice(0, limit) });
});

app.post('/api/wallet/send', authenticateToken, (req, res) => {
  const { toPhone, amount, category, description } = req.body;

  if (!toPhone || !amount) {
    return res.status(400).json({ error: 'Numero et montant obligatoires' });
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Montant invalide' });
  }

  const result = store.sendMoney(req.user.id, toPhone, numAmount, category, description);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json(result);
});

app.post('/api/wallet/add', authenticateToken, (req, res) => {
  const { amount, source } = req.body;

  if (!amount) {
    return res.status(400).json({ error: 'Montant obligatoire' });
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Montant invalide' });
  }

  const result = store.addMoney(req.user.id, numAmount, source);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json(result);
});

// ─── INSIGHTS ───────────────────────────────────────────────────────────────

app.get('/api/insights/summary', authenticateToken, (req, res) => {
  const insights = store.getInsights(req.user.id);
  res.json(insights);
});

// ─── USER LOOKUP (for AI service) ───────────────────────────────────────────

app.get('/api/users/lookup/:phone', authenticateToken, (req, res) => {
  const user = store.getUserByPhone(req.params.phone);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }
  res.json({ id: user.id, name: user.name, phone: user.phone });
});

// ─── START ───────────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Flousna Backend running on port ${PORT}`);
});
