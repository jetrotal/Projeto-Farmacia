// O React faz chamadas relativas usando o prefixo /api (compatível com Vite proxy no Codespaces e produção)
const API_URL = '/api';

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('@Farmarcia:token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

const request = async (endpoint, options = {}) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Erro ao comunicar com o servidor da FARMARCIA.');
  }
  return data;
};

export const ApiService = {
  // Autenticação & Conta (JWT)
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  forgotPassword: (email) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (payload) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProfile: (userId = 'me') =>
    request(userId === 'me' ? '/auth/me' : `/users/${userId}`),

  updateProfile: (userId, payload) =>
    request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Múltiplos Endereços
  getAddresses: (userId = 'me') => request(`/users/${userId}/addresses`),

  addAddress: (userId, payload) =>
    request(`/users/${userId}/addresses`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateAddress: (userId, addressId, payload) =>
    request(`/users/${userId}/addresses/${addressId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteAddress: (userId, addressId) =>
    request(`/users/${userId}/addresses/${addressId}`, {
      method: 'DELETE',
    }),

  // Produtos, Categorias, Marcas, Avaliações e Alerta de Estoque
  getFeaturedProducts: () => request('/products/featured'),

  getCatalogProducts: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.categories) {
      filters.categories.forEach((c) => params.append('categories', c));
    }
    if (filters.brands) {
      filters.brands.forEach((b) => params.append('brands', b));
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters.onlyInStock) {
      params.append('onlyInStock', 'true');
    }
    return request(`/products?${params.toString()}`);
  },

  getProductById: (id) => request(`/products/${id}`),

  createProduct: (payload) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProduct: (id, payload) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteProduct: (id) =>
    request(`/products/${id}`, {
      method: 'DELETE',
    }),

  getProductReviews: (productId) => request(`/products/${productId}/reviews`),

  addProductReview: (productId, payload) =>
    request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  registerStockAlert: (productId, email) =>
    request(`/products/${productId}/stock-alert`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  getStockAlerts: () => request('/admin/stock-alerts'),

  getCategories: (onlyHome = false) =>
    request(`/products/categories${onlyHome ? '?home=true' : ''}`),

  getCategoriesFull: () => request('/categories'),

  createCategory: (payload) =>
    request('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateCategory: (id, payload) =>
    request(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteCategory: (id) =>
    request(`/categories/${id}`, {
      method: 'DELETE',
    }),

  getBrands: () => request('/products/brands'),

  getBrandsFull: () => request('/brands'),

  createBrand: (name) =>
    request('/brands', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  deleteBrand: (id) =>
    request(`/brands/${id}`, {
      method: 'DELETE',
    }),

  // Depoimentos e Newsletter
  getTestimonials: () => request('/testimonials'),

  subscribeNewsletter: (email) =>
    request('/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Carrinho Persistente Atrelado à Conta
  getCartItems: () => request('/cart'),

  addToCart: (product, qty = 1) =>
    request('/cart', {
      method: 'POST',
      body: JSON.stringify({ ...product, qty }),
    }),

  syncCart: () =>
    request('/cart/sync', {
      method: 'POST',
    }),

  removeFromCart: (cartId) =>
    request(`/cart/${cartId}`, {
      method: 'DELETE',
    }),

  updateCartQty: (cartId, qty) =>
    request(`/cart/${cartId}`, {
      method: 'PATCH',
      body: JSON.stringify({ qty }),
    }),

  clearCart: () =>
    request('/cart', {
      method: 'DELETE',
    }),

  getAbandonedCarts: () => request('/admin/abandoned-carts'),

  notifyAbandonedCart: (userId) =>
    request('/admin/abandoned-carts/notify', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  // Favoritos no Banco de Dados
  getFavorites: () => request('/favorites'),

  toggleFavorite: (productId) =>
    request(`/favorites/${productId}`, {
      method: 'POST',
    }),

  // Pedidos, Rastreio e Recompra Rápida
  createOrder: (payload) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyOrders: () => request('/orders/my'),

  reorder: (orderId) =>
    request(`/orders/${orderId}/reorder`, {
      method: 'POST',
    }),

  getAllOrders: () => request('/orders'),

  updateOrderStatus: (orderId, status) =>
    request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Cupons Promocionais
  getCoupons: () => request('/coupons'),

  validateCoupon: (code) =>
    request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  createCoupon: (payload) =>
    request('/coupons', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteCoupon: (id) =>
    request(`/coupons/${id}`, {
      method: 'DELETE',
    }),

  // Frete e Pagamento
  calculateShipping: (cep, items, subtotal) =>
    request('/shipping/calculate', {
      method: 'POST',
      body: JSON.stringify({ cep, items, subtotal }),
    }),

  processPayment: (payload) =>
    request('/payments/process', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Banners / Vitrine e CMS
  getBanner: () => request('/banners'),

  updateBanner: (payload) =>
    request('/banners', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getPages: () => request('/pages'),

  getPageByTitle: (title) =>
    request(`/pages?title=${encodeURIComponent(title)}`),

  upsertPage: (payload) =>
    request('/pages', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  uploadImage: (imageBase64, fileName) =>
    request('/upload', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, fileName }),
    }),

  // Admin Dashboard & CRM
  getAdminMetrics: () => request('/admin/metrics'),

  getAllUsers: () => request('/users'),

  toggleBlockUser: (userId, isBlocked) =>
    request(`/users/${userId}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ isBlocked }),
    }),
};
