-- Flousna Database Schema

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  pin VARCHAR(10) NOT NULL DEFAULT '1234',
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id),
  type VARCHAR(10) NOT NULL CHECK (type IN ('send', 'receive')),
  amount DECIMAL(12, 2) NOT NULL,
  to_name VARCHAR(100),
  to_phone VARCHAR(20),
  from_name VARCHAR(100),
  from_phone VARCHAR(20),
  category VARCHAR(50),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Seed users
INSERT INTO users (id, phone, name, pin, balance, created_at) VALUES
  ('usr_1', '20123456', 'Ahmed',   '1234', 1500.00, '2025-01-15'),
  ('usr_2', '20654321', 'Sami',    '1234',  850.50, '2025-02-20'),
  ('usr_3', '20111222', 'Fatma',   '1234', 2200.00, '2025-01-10'),
  ('usr_4', '20333444', 'Mariem',  '1234',  430.75, '2025-03-01'),
  ('usr_5', '20555666', 'Youssef', '1234', 3100.00, '2025-01-05')
ON CONFLICT (id) DO NOTHING;

-- Seed transactions (Ahmed)
INSERT INTO transactions (id, user_id, type, amount, to_name, to_phone, from_name, from_phone, category, description, date) VALUES
  ('tx_1',  'usr_1', 'send',    50,  'Sami',        '20654321', NULL,     NULL,       'food',          'Deja fil mekla',     '2026-04-17'),
  ('tx_2',  'usr_1', 'receive', 200, NULL,           NULL,       'Fatma',  '20111222', 'transfer',      'Remboursement',      '2026-04-16'),
  ('tx_3',  'usr_1', 'send',    35,  'Carrefour',    NULL,       NULL,     NULL,       'shopping',      'Courses Carrefour',  '2026-04-15'),
  ('tx_4',  'usr_1', 'send',    15,  'Taxi',         NULL,       NULL,     NULL,       'transport',     'Taxi lel khedma',    '2026-04-15'),
  ('tx_5',  'usr_1', 'send',    120, 'STEG',         NULL,       NULL,     NULL,       'bills',         'Facture dhaw',       '2026-04-12'),
  ('tx_6',  'usr_1', 'send',    25,  'Café Sidi Bou',NULL,       NULL,     NULL,       'food',          'Kahwa w croissant',  '2026-04-11'),
  ('tx_7',  'usr_1', 'receive', 500, NULL,           NULL,       'Youssef','20555666', 'transfer',      'Part loyer',         '2026-04-10'),
  ('tx_8',  'usr_1', 'send',    80,  'Zara',         NULL,       NULL,     NULL,       'shopping',      'Hwayej jdod',        '2026-04-08'),
  ('tx_9',  'usr_1', 'send',    40,  'Cinema',       NULL,       NULL,     NULL,       'entertainment', 'Film m3a s7abi',     '2026-04-06'),
  ('tx_10', 'usr_1', 'send',    300, 'Loyer',        NULL,       NULL,     NULL,       'bills',         'Part loyer avril',   '2026-04-01'),
  ('tx_11', 'usr_1', 'receive', 2000,NULL,           NULL,       'Salaire',NULL,       'income',        'Salaire avril',      '2026-04-01'),
  ('tx_12', 'usr_1', 'send',    60,  'Pharmacie',    NULL,       NULL,     NULL,       'health',        'Dwa',                '2026-03-28'),
  -- Sami
  ('tx_20', 'usr_2', 'receive', 50,  NULL,           NULL,       'Ahmed',  '20123456', 'food',          'Min Ahmed lel mekla','2026-04-17'),
  ('tx_21', 'usr_2', 'send',    100, 'Mariem',       '20333444', NULL,     NULL,       'transfer',      'Cadeau',             '2026-04-14'),
  -- Fatma
  ('tx_30', 'usr_3', 'send',    200, 'Ahmed',        '20123456', NULL,     NULL,       'transfer',      'Remboursement',      '2026-04-16')
ON CONFLICT (id) DO NOTHING;
