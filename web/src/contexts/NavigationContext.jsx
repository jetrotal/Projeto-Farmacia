import { createContext, useState, useContext, useEffect } from 'react';

const NavigationContext = createContext();

const PAGE_TITLES = {
  home: 'FARMARCIA | Sua saúde em boas mãos',
  catalog: 'Catálogo de Produtos | FARMARCIA',
  departments: 'Departamentos | FARMARCIA',
  'product-detail': 'Detalhes do Produto | FARMARCIA',
  cart: 'Meu Carrinho | FARMARCIA',
  checkout: 'Finalizar Compra | FARMARCIA',
  'checkout-success': 'Pedido Confirmado | FARMARCIA',
  favorites: 'Lista de Desejos | FARMARCIA',
  login: 'Entrar na Conta | FARMARCIA',
  signup: 'Criar Conta | FARMARCIA',
  'forgot-password': 'Recuperar Senha | FARMARCIA',
  profile: 'Minha Conta e Pedidos | FARMARCIA',
  admin: 'Painel Administrativo | FARMARCIA',
  info: 'Atendimento & Institucional | FARMARCIA',
};

export function updateSeoMeta({ title, description, image }) {
  if (typeof document === 'undefined') return;
  if (title) document.title = title;

  const setMeta = (selector, attr, content) => {
    if (!content) return;
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      const [k, v] = attr.split('=');
      el.setAttribute(k, v);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  if (title) setMeta('meta[property="og:title"]', 'property=og:title', title);
  if (description) {
    setMeta('meta[name="description"]', 'name=description', description);
    setMeta('meta[property="og:description"]', 'property=og:description', description);
  }
  if (image) setMeta('meta[property="og:image"]', 'property=og:image', image);
}

export function NavigationProvider({ children }) {
  const getInitialRoute = () => {
    if (typeof window === 'undefined') return { page: 'home', params: {} };
    const searchParams = new URLSearchParams(window.location.search);
    const page = searchParams.get('page') || 'home';
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'page') params[key] = value;
    }
    return { page, params };
  };

  const [route, setRoute] = useState(getInitialRoute);

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state) {
        setRoute(event.state);
      } else {
        setRoute(getInitialRoute());
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const baseTitle = PAGE_TITLES[route.page] || 'FARMARCIA | Farmácia Online';
    updateSeoMeta({
      title: route.params?.title ? `${route.params.title} | FARMARCIA` : baseTitle,
      description:
        'Compre medicamentos, dermocosméticos, vitaminas e produtos de higiene na FARMARCIA com entrega expressa.',
    });
  }, [route]);

  const navigate = (page, params = {}) => {
    const newState = { page, params };
    setRoute(newState);

    if (typeof window !== 'undefined') {
      const cleanParams = { page };
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && typeof v !== 'object') {
          cleanParams[k] = String(v);
        }
      });
      const searchParams = new URLSearchParams(cleanParams);
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.pushState(newState, '', newUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <NavigationContext.Provider value={{ route, navigate, updateSeoMeta }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);
