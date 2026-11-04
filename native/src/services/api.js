import AsyncStorage from '@react-native-async-storage/async-storage';

// MANTENHA a URL do seu backend aqui
export const API_URL = 'https://symmetrical-xylophone-xv9vwxr6x5qc9vqp-3000.app.github.dev';

// ADICIONE a URL do seu frontend (Vite) aqui! (Sem barra no final)
export const WEB_URL = 'https://symmetrical-xylophone-xv9vwxr6x5qc9vqp-5173.app.github.dev';

const getHeaders = async () => {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const token = await AsyncStorage.getItem('@Farmarcia:token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {}
  return headers;
};

const request = async (endpoint, options = {}) => {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Erro de conexão com a FARMARCIA.');
  }
  return data;
};

export const ApiService = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getFeaturedProducts: () => request('/products/featured'),
  getCatalogProducts: () => request('/products'),
  getProductById: (id) => request(`/products/${id}`),
  getCartItems: () => request('/cart'),
  addToCart: (product, qty = 1) => request('/cart', { method: 'POST', body: JSON.stringify({ ...product, qty }) }),
  removeFromCart: (cartId) => request(`/cart/${cartId}`, { method: 'DELETE' }),
  syncCart: () => request('/cart/sync', { method: 'POST' }),
  getMyOrders: () => request('/orders/my'),
};
