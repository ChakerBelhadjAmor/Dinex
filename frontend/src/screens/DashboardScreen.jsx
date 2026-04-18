import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Plus, ArrowUpRight, ArrowDownLeft, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBalance, getTransactions } from '../services/api';

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

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [balData, txData] = await Promise.all([
        getBalance(),
        getTransactions(5)
      ]);
      setBalance(balData);
      setTransactions(txData.transactions || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
    setLoading(false);
  }

  return (
    <>
      <div className="header">
        <div className="header-logo">
          <div className="header-logo-icon">
            <img src="/dinex_logo.png" alt="Dinex logo" className="brand-logo-image" />
          </div>
          <div className="header-title">Dar</div>
        </div>
        <div className="header-user">
          <span>{user?.name}</span>
          <button className="header-avatar" onClick={() => navigate('/profile')} title="El profil mta3i">
            <User size={16} />
          </button>
        </div>
      </div>

      <div className="screen-content dashboard">
        {/* Balance Card */}
        <div className="balance-card slide-up">
          <div className="balance-label">El balance mta3ek</div>
          {loading ? (
            <div className="balance-amount" style={{ opacity: 0.3 }}>---</div>
          ) : (
            <div className="balance-amount">
              {balance?.balance?.toFixed(2) || '0.00'}
              <span className="currency">DT</span>
            </div>
          )}
          <div className="balance-actions">
            <button className="balance-action-btn send" onClick={() => navigate('/send')}>
              <Send size={18} /> Ab3ath flous
            </button>
            <button className="balance-action-btn add" onClick={() => navigate('/send')}>
              <Plus size={18} /> Zid flous
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="section-title">
          <span>Ekher el transactions</span>
          <button className="see-all" onClick={() => navigate('/history')}>Chouf lkol</button>
        </div>

        <div className="tx-list">
          {loading ? (
            <div className="loading">Jari el chargement...</div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <p>Ma 3andek 7ata transaction baaed</p>
            </div>
          ) : (
            transactions.map(tx => (
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
                  <div className="tx-date">{tx.date}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
