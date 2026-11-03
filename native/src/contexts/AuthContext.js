import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('@Farmarcia:user').then(data => {
      if (data) setUser(JSON.parse(data));
    });
  }, []);

  const login = async (email, password) => {
    try {
      const data = await ApiService.login(email, password);
      setUser(data.user);
      await AsyncStorage.setItem('@Farmarcia:token', data.token);
      await AsyncStorage.setItem('@Farmarcia:user', JSON.stringify(data.user));
      try { await ApiService.syncCart(); } catch (e) {} // Sincroniza carrinho anônimo
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('@Farmarcia:token');
    await AsyncStorage.removeItem('@Farmarcia:user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
