import { ASSETS } from '../constants/assets';

// ... (Mantenha MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS, MOCK_TESTIMONIALS iguais) ...
const MOCK_PRODUCTS = [
  { id: 1, image: ASSETS.prodLaRoche, discount: '-20% OFF', brand: 'La Roche-Posay', name: 'Anthelios FPS 60', rating: 4, reviews: 42, oldPrice: 'R$ 89,90', price: 'R$ 71,90', priceValue: 71.90, installment: '2x de R$ 35,95', category: 'Dermocosméticos' },
  { id: 2, image: ASSETS.prodDipirona, discount: '-65% OFF', brand: 'EMS Genéricos', name: 'Dipirona 500mg 10 comprimidos', rating: 5, reviews: 128, oldPrice: 'R$ 10,90', price: 'R$ 3,80', priceValue: 3.80, installment: '1x de R$ 3,80', category: 'Medicamentos' },
  { id: 3, image: ASSETS.prodRedoxon, discount: '-25% OFF', brand: 'Bayer', name: 'Redoxon Vitamina C 1g Laranja', rating: 4, reviews: 15, oldPrice: 'R$ 32,90', price: 'R$ 24,60', priceValue: 24.60, installment: '1x de R$ 24,60', category: 'Vitaminas' },
  { id: 4, image: ASSETS.prodHuggies, discount: '-18% OFF', brand: 'Huggies', name: 'Fralda Huggies Supreme Care M', rating: 5, reviews: 310, oldPrice: 'R$ 89,90', price: 'R$ 73,70', priceValue: 73.70, installment: '2x de R$ 36,85', category: 'Bebê' },
  { id: 5, image: ASSETS.prodLaRoche, discount: '-10% OFF', brand: 'CeraVe', name: 'Loção Hidratante 200ml', rating: 5, reviews: 89, oldPrice: 'R$ 55,00', price: 'R$ 49,50', priceValue: 49.50, installment: '1x de R$ 49,50', category: 'Dermocosméticos' },
  { id: 6, image: ASSETS.prodDipirona, discount: '-15% OFF', brand: 'Neosaldina', name: 'Neosaldina 30 drágeas', rating: 4, reviews: 210, oldPrice: 'R$ 25,00', price: 'R$ 21,25', priceValue: 21.25, installment: '1x de R$ 21,25', category: 'Medicamentos' },
  { id: 7, image: ASSETS.prodRedoxon, discount: '-5% OFF', brand: 'Protex', name: 'Sabonete Líquido Protex 250ml', rating: 4, reviews: 45, oldPrice: 'R$ 15,00', price: 'R$ 14,25', priceValue: 14.25, installment: '1x de R$ 14,25', category: 'Higiene Pessoal' },
  { id: 8, image: ASSETS.prodLaRoche, discount: '-30% OFF', brand: 'Vichy', name: 'Minéral 89 50ml', rating: 5, reviews: 520, oldPrice: 'R$ 199,90', price: 'R$ 139,90', priceValue: 139.90, installment: '3x de R$ 46,63', category: 'Dermocosméticos' },
];

const MOCK_CATEGORIES = ['Medicamentos', 'Dermocosméticos', 'Vitaminas', 'Higiene Pessoal', 'Bebê', 'Bem-estar'];
const MOCK_BRANDS = ['La Roche-Posay', 'EMS Genéricos', 'CeraVe', 'Huggies', 'Bayer', 'Neosaldina', 'Protex', 'Vichy'];
const MOCK_TESTIMONIALS = [
  { id: 1, text: "A entrega da FARMARCIA foi extremamente rápida! Em menos de 2 horas eu recebi os medicamentos em casa com todo o carinho e cuidado.", name: "Juliana Mendes", subtitle: "Cliente desde 2024", avatar: ASSETS.avatar1 },
  { id: 2, text: "Melhor preço em dermocosméticos e genéricos que eu já encontrei. O atendimento pelo WhatsApp também é impecável.", name: "Carlos Alberto", subtitle: "Cliente VIP", avatar: ASSETS.avatar2 }
];

let mockCart = [];

export const ApiService = {
  // Novo endpoint simulando Auth
  login: async (email, password) => {
    // Simulando delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email === 'admin@farmarcia.com.br') {
      return { id: 1, name: 'Márcia Souza', email, role: 'ADMIN' };
    }
    
    if (password === '123456') { // Senha genérica para testes
      return { id: 2, name: 'Cliente Farmarcia', email, role: 'CUSTOMER' };
    }
    
    throw new Error('E-mail ou senha incorretos');
  },

  getFeaturedProducts: async () => Promise.resolve(MOCK_PRODUCTS.slice(0, 4)),
  
  getCatalogProducts: async (filters = {}) => {
    let products = [...MOCK_PRODUCTS, ...MOCK_PRODUCTS];
    
    if (filters.categories && filters.categories.length > 0) {
      products = products.filter(p => filters.categories.includes(p.category));
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.brand.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          products.sort((a, b) => a.priceValue - b.priceValue);
          break;
        case 'price-desc':
          products.sort((a, b) => b.priceValue - a.priceValue);
          break;
        case 'rating':
          products.sort((a, b) => b.rating - a.rating);
          break;
      }
    }

    return Promise.resolve(products);
  },

  getCategories: async () => Promise.resolve(MOCK_CATEGORIES),
  getBrands: async () => Promise.resolve(MOCK_BRANDS),
  getTestimonials: async () => Promise.resolve(MOCK_TESTIMONIALS),

  subscribeNewsletter: async (email) => {
    return Promise.resolve({ success: true });
  },

  getCartItems: async () => Promise.resolve([...mockCart]),
  
  addToCart: async (product) => {
    const existing = mockCart.find(item => item.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      mockCart.push({ ...product, cartId: `cart_${Date.now()}_${Math.random()}`, qty: 1 });
    }
    return Promise.resolve([...mockCart]);
  },

  removeFromCart: async (cartId) => {
    mockCart = mockCart.filter(item => item.cartId !== cartId);
    return Promise.resolve([...mockCart]);
  },

  updateCartQty: async (cartId, qty) => {
    const item = mockCart.find(i => i.cartId === cartId);
    if (item) item.qty = qty;
    return Promise.resolve([...mockCart]);
  },
  
  clearCart: async () => {
    mockCart = [];
    return Promise.resolve([...mockCart]);
  }
};
