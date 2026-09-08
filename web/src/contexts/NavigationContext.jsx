import { createContext, useState, useContext, useEffect } from 'react';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  // Lemos os parâmetros iniciais da URL caso seja carregado direto
  const getInitialRoute = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const page = searchParams.get('page') || 'home';
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'page') params[key] = value;
    }
    return { page, params };
  };

  const [route, setRoute] = useState(getInitialRoute());

  useEffect(() => {
    // History API listener para lidar com o Botão de Voltar do navegador
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

  const navigate = (page, params = {}) => {
    const newState = { page, params };
    setRoute(newState);
    
    // Atualiza a barra de endereço sem recarregar a página
    const searchParams = new URLSearchParams({ page, ...params });
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    
    window.history.pushState(newState, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider value={{ route, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);
