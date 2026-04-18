const { v4: uuidv4 } = require('uuid');
const pool = require('../db/pool');

async function getUserByPhone(phone) {
  const { rows } = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
  return rows[0] || null;
}

async function getUserById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

async function getTransactions(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC, created_at DESC',
    [userId]
  );
  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    amount: parseFloat(row.amount),
    to: row.to_name,
    toPhone: row.to_phone,
    from: row.from_name,
    fromPhone: row.from_phone,
    category: row.category,
    description: row.description,
    date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
    status: row.status,
  }));
}

async function getBalance(userId) {
  const user = await getUserById(userId);
  return user ? parseFloat(user.balance) : null;
}

async function sendMoney(fromUserId, toPhone, amount, category = 'transfer', description = '') {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [sender] } = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [fromUserId]);
    if (!sender) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Utilisateur introuvable' };
    }
    if (parseFloat(sender.balance) < amount) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Solde insuffisant' };
    }
    if (amount <= 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Montant invalide' };
    }

    const { rows: recipients } = await client.query('SELECT * FROM users WHERE phone = $1 FOR UPDATE', [toPhone]);
    const recipient = recipients[0] || null;
    const recipientName = recipient ? recipient.name : toPhone;
    const today = new Date().toISOString().split('T')[0];

    // Deduct from sender
    await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, fromUserId]);

    // Add to recipient if they exist
    if (recipient) {
      await client.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, recipient.id]);

      // Receive transaction for recipient
      await client.query(
        `INSERT INTO transactions (id, user_id, type, amount, from_name, from_phone, category, description, date)
         VALUES ($1, $2, 'receive', $3, $4, $5, $6, $7, $8)`,
        ['tx_' + uuidv4().slice(0, 8), recipient.id, amount, sender.name, sender.phone, category, description || `Min ${sender.name}`, today]
      );
    }

    // Send transaction for sender
    const txId = 'tx_' + uuidv4().slice(0, 8);
    await client.query(
      `INSERT INTO transactions (id, user_id, type, amount, to_name, to_phone, category, description, date)
       VALUES ($1, $2, 'send', $3, $4, $5, $6, $7, $8)`,
      [txId, fromUserId, amount, recipientName, toPhone, category, description || `Transfer l ${recipientName}`, today]
    );

    // Get updated balance
    const { rows: [updated] } = await client.query('SELECT balance FROM users WHERE id = $1', [fromUserId]);

    await client.query('COMMIT');

    return {
      success: true,
      transaction: { id: txId, userId: fromUserId, type: 'send', amount, to: recipientName, toPhone, category, description, date: today, status: 'completed' },
      newBalance: parseFloat(updated.balance)
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('sendMoney error:', err.message);
    return { success: false, error: 'Erreur interne' };
  } finally {
    client.release();
  }
}

async function addMoney(userId, amount, source = 'Carte bancaire') {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [user] } = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [userId]);
    if (!user) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Utilisateur introuvable' };
    }
    if (amount <= 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Montant invalide' };
    }

    await client.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, userId]);

    const txId = 'tx_' + uuidv4().slice(0, 8);
    const today = new Date().toISOString().split('T')[0];
    await client.query(
      `INSERT INTO transactions (id, user_id, type, amount, from_name, category, description, date)
       VALUES ($1, $2, 'receive', $3, $4, 'deposit', $5, $6)`,
      [txId, userId, amount, source, `Ajout min ${source}`, today]
    );

    const { rows: [updated] } = await client.query('SELECT balance FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');

    return {
      success: true,
      transaction: { id: txId, userId, type: 'receive', amount, from: source, category: 'deposit', description: `Ajout min ${source}`, date: today, status: 'completed' },
      newBalance: parseFloat(updated.balance)
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('addMoney error:', err.message);
    return { success: false, error: 'Erreur interne' };
  } finally {
    client.release();
  }
}

async function getInsights(userId) {
  const { rows: spentRows } = await pool.query(
    `SELECT category, SUM(amount) as total
     FROM transactions
     WHERE user_id = $1 AND type = 'send'
     GROUP BY category
     ORDER BY total DESC`,
    [userId]
  );

  const { rows: [receivedRow] } = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) as total
     FROM transactions
     WHERE user_id = $1 AND type = 'receive'`,
    [userId]
  );

  const { rows: [countRow] } = await pool.query(
    `SELECT COUNT(*) as count
     FROM transactions
     WHERE user_id = $1 AND type = 'send'`,
    [userId]
  );

  const totalSpent = spentRows.reduce((sum, r) => sum + parseFloat(r.total), 0);
  const totalReceived = parseFloat(receivedRow.total);

  const categories = spentRows.map(r => ({
    name: r.category || 'other',
    amount: parseFloat(r.total),
    percentage: totalSpent > 0 ? Math.round((parseFloat(r.total) / totalSpent) * 100) : 0
  }));

  return {
    totalSpent,
    totalReceived,
    categories,
    transactionCount: parseInt(countRow.count),
    topCategory: categories[0] || null
  };
}

module.exports = {
  getUserByPhone,
  getUserById,
  getTransactions,
  getBalance,
  sendMoney,
  addMoney,
  getInsights
};
