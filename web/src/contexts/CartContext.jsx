import { createContext, useState, useContext, useEffect } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [abandonedOffer, setAbandonedOffer] = useState(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const refreshCart = async () => {
    try {
      const items = await ApiService.getCartItems();
      setCartItems(Array.isArray(items) ? items : []);
    } catch {
      setCartItems([]);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user?.id]);

  // Monitora carrinho abandonado (simulação do lembrete automático com cupom de incentivo)
  useEffect(() => {
    if (cartItems.length === 0) {
      setAbandonedOffer(null);
      return;
    }
    const timer = setTimeout(() => {
      setAbandonedOffer({
        coupon: 'VOLTA15',
        message: 'Notamos itens no seu carrinho! Finalize agora com 15% OFF usando o cupom VOLTA15.',
      });
    }, 45000);
    return () => clearTimeout(timer);
  }, [cartItems]);

  const addToCart = async (product, qty = 1) => {
    try {
      const updatedCart = await ApiService.addToCart(product, qty);
      setCartItems(updatedCart);
      showToast(`"${product.name}" adicionado ao carrinho!`, 'success');
    } catch (err) {
      showToast(err.message || 'Não foi possível adicionar ao carrinho.', 'error');
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      const updatedCart = await ApiService.removeFromCart(cartId);
      setCartItems(updatedCart);
      showToast('Item removido do carrinho.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const updateQty = async (cartId, qty) => {
    try {
      const updatedCart = await ApiService.updateCartQty(cartId, qty);
      setCartItems(updatedCart);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const clearCart = async () => {
    try {
      const emptyCart = await ApiService.clearCart();
      setCartItems(emptyCart);
    } catch {
      setCartItems([]);
    }
  };

  const reorderItems = async (orderId) => {
    try {
      const updatedCart = await ApiService.reorder(orderId);
      setCartItems(updatedCart);
      showToast('Todos os itens do pedido foram adicionados ao seu carrinho!', 'success');
      return true;
    } catch (err) {
      showToast(err.message || 'Erro ao recomprar pedido.', 'error');
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        abandonedOffer,
        setAbandonedOffer,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        reorderItems,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
