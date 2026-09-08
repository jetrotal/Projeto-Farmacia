import { createContext, useState, useContext, useEffect } from 'react';
import { ApiService } from '../services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    ApiService.getCartItems().then(setCartItems);
  }, []);

  const addToCart = async (product) => {
    const updatedCart = await ApiService.addToCart(product);
    setCartItems(updatedCart);
  };

  const removeFromCart = async (cartId) => {
    const updatedCart = await ApiService.removeFromCart(cartId);
    setCartItems(updatedCart);
  };

  const updateQty = async (cartId, qty) => {
    const updatedCart = await ApiService.updateCartQty(cartId, qty);
    setCartItems(updatedCart);
  };

  const clearCart = async () => {
    const emptyCart = await ApiService.clearCart();
    setCartItems(emptyCart);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
