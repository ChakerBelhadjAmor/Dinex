import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, LayoutDashboard, Send, Clock, BarChart3 } from 'lucide-react';

const navItems = [
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dar' },
  { path: '/send', icon: Send, label: "Ab3ath" },
  { path: '/history', icon: Clock, label: 'Tarikh' },
  { path: '/insights', icon: BarChart3, label: 'Tahlil' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <button
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <item.icon />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
