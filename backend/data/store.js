const { v4: uuidv4 } = require('uuid');

// In-memory data store for hackathon demo
const users = {
  '20123456': {
    id: 'usr_1',
    phone: '20123456',
    name: 'Ahmed',
    pin: '1234',
    balance: 1500.00,
    createdAt: '2025-01-15'
  },
  '20654321': {
    id: 'usr_2',
    phone: '20654321',
    name: 'Sami',
    pin: '1234',
    balance: 850.50,
    createdAt: '2025-02-20'
  },
  '20111222': {
    id: 'usr_3',
    phone: '20111222',
    name: 'Fatma',
    pin: '1234',
    balance: 2200.00,
    createdAt: '2025-01-10'
  },
  '20333444': {
    id: 'usr_4',
    phone: '20333444',
    name: 'Mariem',
    pin: '1234',
    balance: 430.75,
    createdAt: '2025-03-01'
  },
  '20555666': {
    id: 'usr_5',
    phone: '20555666',
    name: 'Youssef',
    pin: '1234',
    balance: 3100.00,
    createdAt: '2025-01-05'
  }
};

const transactions = [
  // Ahmed's transactions
  { id: 'tx_1', userId: 'usr_1', type: 'send', amount: 50, to: 'Sami', toPhone: '20654321', category: 'food', description: 'Deja fil mekla', date: '2026-04-17', status: 'completed' },
  { id: 'tx_2', userId: 'usr_1', type: 'receive', amount: 200, from: 'Fatma', fromPhone: '20111222', category: 'transfer', description: 'Remboursement', date: '2026-04-16', status: 'completed' },
  { id: 'tx_3', userId: 'usr_1', type: 'send', amount: 35, to: 'Carrefour', toPhone: null, category: 'shopping', description: 'Courses Carrefour', date: '2026-04-15', status: 'completed' },
  { id: 'tx_4', userId: 'usr_1', type: 'send', amount: 15, to: 'Taxi', toPhone: null, category: 'transport', description: 'Taxi lel khedma', date: '2026-04-15', status: 'completed' },
  { id: 'tx_5', userId: 'usr_1', type: 'send', amount: 120, to: 'STEG', toPhone: null, category: 'bills', description: 'Facture dhaw', date: '2026-04-12', status: 'completed' },
  { id: 'tx_6', userId: 'usr_1', type: 'send', amount: 25, to: 'Café Sidi Bou', toPhone: null, category: 'food', description: 'Kahwa w croissant', date: '2026-04-11', status: 'completed' },
  { id: 'tx_7', userId: 'usr_1', type: 'receive', amount: 500, from: 'Youssef', fromPhone: '20555666', category: 'transfer', description: 'Part loyer', date: '2026-04-10', status: 'completed' },
  { id: 'tx_8', userId: 'usr_1', type: 'send', amount: 80, to: 'Zara', toPhone: null, category: 'shopping', description: 'Hwayej jdod', date: '2026-04-08', status: 'completed' },
  { id: 'tx_9', userId: 'usr_1', type: 'send', amount: 40, to: 'Cinema', toPhone: null, category: 'entertainment', description: 'Film m3a s7abi', date: '2026-04-06', status: 'completed' },
  { id: 'tx_10', userId: 'usr_1', type: 'send', amount: 300, to: 'Loyer', toPhone: null, category: 'bills', description: 'Part loyer avril', date: '2026-04-01', status: 'completed' },
  { id: 'tx_11', userId: 'usr_1', type: 'receive', amount: 2000, from: 'Salaire', fromPhone: null, category: 'income', description: 'Salaire avril', date: '2026-04-01', status: 'completed' },
  { id: 'tx_12', userId: 'usr_1', type: 'send', amount: 60, to: 'Pharmacie', toPhone: null, category: 'health', description: 'Dwa', date: '2026-03-28', status: 'completed' },

  // Sami's transactions
  { id: 'tx_20', userId: 'usr_2', type: 'receive', amount: 50, from: 'Ahmed', fromPhone: '20123456', category: 'food', description: 'Min Ahmed lel mekla', date: '2026-04-17', status: 'completed' },
  { id: 'tx_21', userId: 'usr_2', type: 'send', amount: 100, to: 'Mariem', toPhone: '20333444', category: 'transfer', description: 'Cadeau', date: '2026-04-14', status: 'completed' },

  // Fatma's transactions
  { id: 'tx_30', userId: 'usr_3', type: 'send', amount: 200, to: 'Ahmed', toPhone: '20123456', category: 'transfer', description: 'Remboursement', date: '2026-04-16', status: 'completed' },
];

// Helper functions
function getUserByPhone(phone) {
  return users[phone] || null;
}

function getUserById(id) {
  return Object.values(users).find(u => u.id === id) || null;
}

function getTransactions(userId) {
  return transactions
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getBalance(userId) {
  const user = getUserById(userId);
  return user ? user.balance : null;
}

function sendMoney(fromUserId, toPhone, amount, category = 'transfer', description = '') {
  const sender = getUserById(fromUserId);
  if (!sender) return { success: false, error: 'Utilisateur introuvable' };
  if (sender.balance < amount) return { success: false, error: 'Solde insuffisant' };
  if (amount <= 0) return { success: false, error: 'Montant invalide' };

  const recipient = getUserByPhone(toPhone);
  const recipientName = recipient ? recipient.name : toPhone;

  // Deduct from sender
  sender.balance -= amount;

  // Add to recipient if they exist
  if (recipient) {
    recipient.balance += amount;

    // Create receive transaction for recipient
    transactions.push({
      id: 'tx_' + uuidv4().slice(0, 8),
      userId: recipient.id,
      type: 'receive',
      amount,
      from: sender.name,
      fromPhone: sender.phone,
      category,
      description: description || `Min ${sender.name}`,
      date: new Date().toISOString().split('T')[0],
      status: 'completed'
    });
  }

  // Create send transaction for sender
  const tx = {
    id: 'tx_' + uuidv4().slice(0, 8),
    userId: fromUserId,
    type: 'send',
    amount,
    to: recipientName,
    toPhone,
    category,
    description: description || `Transfer l ${recipientName}`,
    date: new Date().toISOString().split('T')[0],
    status: 'completed'
  };
  transactions.push(tx);

  return { success: true, transaction: tx, newBalance: sender.balance };
}

function addMoney(userId, amount, source = 'Carte bancaire') {
  const user = getUserById(userId);
  if (!user) return { success: false, error: 'Utilisateur introuvable' };
  if (amount <= 0) return { success: false, error: 'Montant invalide' };

  user.balance += amount;

  const tx = {
    id: 'tx_' + uuidv4().slice(0, 8),
    userId,
    type: 'receive',
    amount,
    from: source,
    fromPhone: null,
    category: 'deposit',
    description: `Ajout min ${source}`,
    date: new Date().toISOString().split('T')[0],
    status: 'completed'
  };
  transactions.push(tx);

  return { success: true, transaction: tx, newBalance: user.balance };
}

function getInsights(userId) {
  const userTx = transactions.filter(t => t.userId === userId && t.type === 'send');
  const categories = {};
  let totalSpent = 0;

  userTx.forEach(tx => {
    const cat = tx.category || 'other';
    if (!categories[cat]) categories[cat] = 0;
    categories[cat] += tx.amount;
    totalSpent += tx.amount;
  });

  const categoryList = Object.entries(categories).map(([name, amount]) => ({
    name,
    amount,
    percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);

  const received = transactions
    .filter(t => t.userId === userId && t.type === 'receive')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalSpent,
    totalReceived: received,
    categories: categoryList,
    transactionCount: userTx.length,
    topCategory: categoryList[0] || null
  };
}

module.exports = {
  users,
  transactions,
  getUserByPhone,
  getUserById,
  getTransactions,
  getBalance,
  sendMoney,
  addMoney,
  getInsights
};
