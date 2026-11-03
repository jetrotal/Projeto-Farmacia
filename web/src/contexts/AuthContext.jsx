import { createContext, useState, useContext, useEffect } from 'react';
import { ApiService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('@Farmarcia:user');
      const savedToken = localStorage.getItem('@Farmarcia:token');
      if (savedUser && savedToken) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        } catch {
          localStorage.removeItem('@Farmarcia:user');
          localStorage.removeItem('@Farmarcia:token');
        }
      }
    }
    setLoading(false);
  }, []);

  const saveSession = (userData) => {
    const jwt = userData.token || userData.access_token;
    const cleanUser = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      cpf: userData.cpf || '',
      phone: userData.phone || '',
    };
    setUser(cleanUser);
    if (jwt) {
      setToken(jwt);
      localStorage.setItem('@Farmarcia:token', jwt);
    }
    localStorage.setItem('@Farmarcia:user', JSON.stringify(cleanUser));
  };

  const login = async (email, password) => {
    try {
      const userData = await ApiService.login(email, password);
      saveSession(userData);
      try {
        await ApiService.syncCart();
      } catch {
        // Ignora caso não haja itens de visitante
      }
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (formData) => {
    try {
      const userData = await ApiService.register(formData);
      saveSession(userData);
      try {
        await ApiService.syncCart();
      } catch {
        // Ignora
      }
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateUserSession = (updatedData) => {
    saveSession({ ...user, ...updatedData, token: updatedData.token || token });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('@Farmarcia:user');
      localStorage.removeItem('@Farmarcia:token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserSession,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
