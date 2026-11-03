import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { ApiService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  const loadCart = async () => {
    try {
      const items = await ApiService.getCartItems();
      setCartItems(Array.isArray(items) ? items : []);
    } catch (e) {
      setCartItems([]);
    }
  };

  useEffect(() => { loadCart(); }, [user]);

  const addToCart = async (product, qty = 1) => {
    try {
      const updated = await ApiService.addToCart(product, qty);
      setCartItems(updated);
      Alert.alert('Sucesso', `"${product.name}" adicionado ao carrinho!`);
    } catch (err) {
      Alert.alert('Erro', err.message);
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      const updated = await ApiService.removeFromCart(cartId);
      setCartItems(updated);
    } catch (err) {
      Alert.alert('Erro', err.message);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, loadCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
