import { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUser, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored.user);
      setToken(stored.token);
    }
    setLoading(false);
  }, []);

  function loginUser(userData, userToken) {
    setUser(userData);
    if (userToken) setToken(userToken);
  }

  function logout() {
    apiLogout();
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
