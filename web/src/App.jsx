import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Departments from './pages/Departments';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Favorites from './pages/Favorites';
import Info from './pages/Info';
import CheckoutSuccess from './pages/CheckoutSuccess';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

// Rotas que exigem usuário logado (ROLE: CUSTOMER ou ADMIN)
const PROTECTED_ROUTES = ['checkout', 'favorites', 'checkout-success'];

function AppContent() {
  const { route, navigate } = useNavigation();
  const { isAuthenticated } = useAuth();

  // Guardião de Rotas (Router Guard)
  useEffect(() => {
    if (PROTECTED_ROUTES.includes(route.page) && !isAuthenticated) {
      alert('Você precisa estar logado para acessar esta página.');
      navigate('login', { redirectTo: route.page });
    }
  }, [route.page, isAuthenticated]);

  // Se a rota for protegida e o usuário não estiver autenticado, renderiza nulo para evitar "flash" de tela
  if (PROTECTED_ROUTES.includes(route.page) && !isAuthenticated) {
    return null; 
  }

  return (
    <div className="app-container">
      <Navbar />
      
      <main className="main-content">
        {route.page === 'home' && <Home />}
        {route.page === 'catalog' && <Catalog />}
        {route.page === 'departments' && <Departments />}
        {route.page === 'signup' && <SignUp />}
        {route.page === 'login' && <Login />}
        {route.page === 'cart' && <Cart />}
        {route.page === 'checkout' && <Checkout />}
        {route.page === 'favorites' && <Favorites />}
        {route.page === 'info' && <Info />}
        {route.page === 'checkout-success' && <CheckoutSuccess />}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <CartProvider>
          <FavoritesProvider>
            <AppContent />
          </FavoritesProvider>
        </CartProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}
