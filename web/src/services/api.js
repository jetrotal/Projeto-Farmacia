// O React agora fará chamadas relativas para a própria URL atual usando o prefixo /api
const API_URL = '/api';

export const ApiService = {
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'E-mail ou senha incorretos');
    }
    return res.json();
  },

  getFeaturedProducts: async () => {
    return (await fetch(`${API_URL}/products/featured`)).json();
  },
  
  getCatalogProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.categories) {
      filters.categories.forEach(c => params.append('categories', c));
    }
    if (filters.brands) {
      filters.brands.forEach(b => params.append('brands', b));
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    
    return (await fetch(`${API_URL}/products?${params.toString()}`)).json();
  },

  getCategories: async () => (await fetch(`${API_URL}/products/categories`)).json(),
  
  getBrands: async () => (await fetch(`${API_URL}/products/brands`)).json(),
  
  getTestimonials: async () => (await fetch(`${API_URL}/testimonials`)).json(),

  subscribeNewsletter: async (email) => {
    return (await fetch(`${API_URL}/newsletter`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })).json();
  },

  getCartItems: async () => (await fetch(`${API_URL}/cart`)).json(),
  
  addToCart: async (product) => {
    return (await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    })).json();
  },

  removeFromCart: async (cartId) => {
    return (await fetch(`${API_URL}/cart/${cartId}`, { method: 'DELETE' })).json();
  },

  updateCartQty: async (cartId, qty) => {
    return (await fetch(`${API_URL}/cart/${cartId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qty })
    })).json();
  },
  
  clearCart: async () => {
    return (await fetch(`${API_URL}/cart`, { method: 'DELETE' })).json();
  }
};