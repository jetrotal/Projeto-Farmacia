import { createContext, useState, useContext, useEffect } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      ApiService.getFavorites()
        .then((list) => setFavorites(Array.isArray(list) ? list : []))
        .catch(() => {});
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('@Farmarcia:favorites');
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch {
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
    }
  }, [isAuthenticated, user?.id]);

  const toggleFavorite = async (product) => {
    const exists = favorites.some((p) => Number(p.id) === Number(product.id));
    if (isAuthenticated) {
      try {
        const updated = await ApiService.toggleFavorite(product.id);
        setFavorites(updated);
        showToast(
          exists
            ? `"${product.name}" removido dos favoritos.`
            : `"${product.name}" salvo nos seus favoritos!`,
          exists ? 'info' : 'success',
        );
      } catch (err) {
        showToast(err.message, 'error');
      }
    } else {
      const updated = exists
        ? favorites.filter((p) => Number(p.id) !== Number(product.id))
        : [...favorites, product];
      setFavorites(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('@Farmarcia:favorites', JSON.stringify(updated));
      }
      showToast(
        exists
          ? `"${product.name}" removido dos favoritos.`
          : `"${product.name}" adicionado à lista de desejos!`,
        exists ? 'info' : 'success',
      );
    }
  };

  const isFavorite = (productId) => {
    return favorites.some((p) => Number(p.id) === Number(productId));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
