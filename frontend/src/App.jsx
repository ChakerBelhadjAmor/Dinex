import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomNav from './components/BottomNav';
import LoginScreen from './screens/LoginScreen';
import ChatScreen from './screens/ChatScreen';
import DashboardScreen from './screens/DashboardScreen';
import SendMoneyScreen from './screens/SendMoneyScreen';
import HistoryScreen from './screens/HistoryScreen';
import InsightsScreen from './screens/InsightsScreen';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/send" element={<SendMoneyScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
        <Route path="/insights" element={<InsightsScreen />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
