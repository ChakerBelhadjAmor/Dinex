import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getInsights } from '../services/api';

const COLORS = ['#00d4aa', '#7c5cfc', '#ff4466', '#ffaa33', '#4488ff', '#ff66aa', '#44ddff', '#aaff44'];

const categoryLabels = {
  food: 'Mekla 🍕',
  transport: 'Transport 🚕',
  shopping: 'Courses 🛍️',
  bills: 'Factures 📄',
  transfer: 'Transfers 💸',
  entertainment: 'Divertissement 🎬',
  health: 'S7a 💊',
};

export default function InsightsScreen() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    try {
      const data = await getInsights();
      setInsights(data);
    } catch (err) {
      console.error('Error loading insights:', err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <>
        <div className="header">
          <div className="header-logo">
            <div className="header-logo-icon">
              <img src="/dinex_logo.png" alt="Dinex logo" className="brand-logo-image" />
            </div>
            <div className="header-title">Tahlil</div>
          </div>
        </div>
        <div className="screen-content">
          <div className="loading">Jari el chargement...</div>
        </div>
      </>
    );
  }

  const chartData = insights?.categories?.map(cat => ({
    name: categoryLabels[cat.name] || cat.name,
    value: cat.amount,
    rawName: cat.name,
  })) || [];

  const totalChartSpent = chartData.reduce((sum, item) => sum + item.value, 0);

  function renderChartTooltip({ active, payload }) {
    if (!active || !payload || payload.length === 0) return null;

    const point = payload[0];
    const amount = Number(point.value) || 0;
    const percentage = totalChartSpent > 0 ? (amount / totalChartSpent) * 100 : 0;

    return (
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          padding: '10px 12px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{point.name}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Masrouf: {amount.toFixed(2)} DT</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Pourcentage: {percentage.toFixed(1)}%</div>
      </div>
    );
  }

  function getAdvice() {
    if (!insights || !insights.topCategory) return '';
    const top = insights.topCategory;
    const label = categoryLabels[top.name] || top.name;
    const messages = {
      food: `Sraft ${top.amount.toFixed(0)} DT 3al mekla hal chhar! 🍕 Jarreb tabkhi fi dar, twaffer barcha.`,
      transport: `Sraft ${top.amount.toFixed(0)} DT 3al transport! 🚕 Jarreb el bus wala el covoiturage bech twaffer.`,
      shopping: `Sraft ${top.amount.toFixed(0)} DT 3al courses! 🛍️ Dir liste 9bal ma temchi lel magasin.`,
      bills: `${top.amount.toFixed(0)} DT factures hal chhar. 📄 Normal, ama chouf ida tnajem t9ayed chwaya.`,
      entertainment: `${top.amount.toFixed(0)} DT 3al divertissement! 🎬 Ma3labalech, ama hawell tna99es chwaya el chhar el jey.`,
      transfer: `Dayer ${top.amount.toFixed(0)} DT transfers! 💸 Mriguel, ama ta7kem fil masrouf.`,
    };
    return messages[top.name] || `Sraft akther 3al ${label}: ${top.amount.toFixed(0)} DT. Hawell tna99es chwaya!`;
  }

  return (
    <>
      <div className="header">
        <div className="header-logo">
          <div className="header-logo-icon">
            <img src="/dinex_logo.png" alt="Dinex logo" className="brand-logo-image" />
          </div>
          <div className="header-title">Tahlil</div>
        </div>
      </div>

      <div className="screen-content insights-screen">
        {/* Summary Card */}
        <div className="insight-card slide-up">
          <h3>📊 Resume mta3 el chhar</h3>
          <div className="insight-stat">
            <span className="insight-stat-label">Masrouf total</span>
            <span className="insight-stat-value" style={{ color: 'var(--danger)' }}>
              -{insights?.totalSpent?.toFixed(2) || '0.00'} DT
            </span>
          </div>
          <div className="insight-stat">
            <span className="insight-stat-label">Dkhol total</span>
            <span className="insight-stat-value" style={{ color: 'var(--success)' }}>
              +{insights?.totalReceived?.toFixed(2) || '0.00'} DT
            </span>
          </div>
          <div className="insight-stat">
            <span className="insight-stat-label">3dod el transactions</span>
            <span className="insight-stat-value">{insights?.transactionCount || 0}</span>
          </div>
        </div>

        {/* Pie Chart */}
        {chartData.length > 0 && (
          <div className="insight-card slide-up">
            <h3>🥧 Win sraft floussek</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={renderChartTooltip}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        <div className="insight-card slide-up">
          <h3>📁 Par categorie</h3>
          <div className="category-bar">
            {insights?.categories?.map((cat, i) => (
              <div key={cat.name} className="category-row">
                <span className="category-name">{categoryLabels[cat.name] || cat.name}</span>
                <div className="category-bar-track">
                  <div
                    className="category-bar-fill"
                    style={{
                      width: `${cat.percentage}%`,
                      background: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
                <span className="category-amount">{cat.amount.toFixed(0)} DT</span>
              </div>
            ))}
          </div>
        </div>

        {/* Advice Card */}
        <div className="advice-card slide-up">
          <strong>💡 Conseil min Dinex:</strong>
          <br /><br />
          {getAdvice()}
        </div>
      </div>
    </>
  );
}
