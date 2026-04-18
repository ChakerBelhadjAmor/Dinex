import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { getTransactions } from '../services/api';

const categoryIcons = {
  food: '🍕',
  transport: '🚕',
  shopping: '🛍️',
  bills: '📄',
  transfer: '💸',
  entertainment: '🎬',
  health: '💊',
  income: '💰',
  deposit: '🏦',
};

const FILTERS = [
  { key: 'all', label: 'Lkol' },
  { key: 'send', label: 'Mab3outh' },
  { key: 'receive', label: 'Jani' },
];

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      const data = await getTransactions(50);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
    setLoading(false);
  }

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter(tx => tx.type === filter);

  // Group by date
  const grouped = {};
  filtered.forEach(tx => {
    const date = tx.date;
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(tx);
  });

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) return 'Lyoum';
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Lbera7';

    return d.toLocaleDateString('fr-TN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <>
      <div className="header">
        <div className="header-logo">
          <div className="header-logo-icon">F</div>
          <div className="header-title">Tarikh</div>
        </div>
      </div>

      <div className="screen-content history-screen">
        <div className="history-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-chip ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Jari el chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>Ma 3andek 7ata transaction</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, txs]) => (
            <div key={date} className="history-date-group">
              <div className="history-date-label">{formatDate(date)}</div>
              <div className="tx-list">
                {txs.map(tx => (
                  <div key={tx.id} className="tx-item fade-in">
                    <div className={`tx-icon ${tx.type}`}>
                      {categoryIcons[tx.category] || (tx.type === 'send' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />)}
                    </div>
                    <div className="tx-details">
                      <div className="tx-name">{tx.type === 'send' ? tx.to : tx.from}</div>
                      <div className="tx-desc">{tx.description}</div>
                    </div>
                    <div>
                      <div className={`tx-amount ${tx.type}`}>
                        {tx.type === 'send' ? '-' : '+'}{tx.amount.toFixed(2)} DT
                      </div>
                      <div className="tx-date">{tx.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
