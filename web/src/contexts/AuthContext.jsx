import { createContext, useState, useContext, useEffect } from 'react';
import { ApiService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null significa role GUEST

  // Ao iniciar a aplicação, verifica se há um usuário salvo no localStorage (persitência mockada)
  useEffect(() => {
    const savedUser = localStorage.getItem('@Farmarcia:user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email, password) => {
    try {
      const userData = await ApiService.login(email, password);
      setUser(userData);
      localStorage.setItem('@Farmarcia:user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@Farmarcia:user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
