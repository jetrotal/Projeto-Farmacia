import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Departments from './pages/Departments';
import ProductDetail from './pages/ProductDetail';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Favorites from './pages/Favorites';
import Info from './pages/Info';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import './index.css';

// Rotas que exigem usuário logado (ROLE: CUSTOMER ou ADMIN)
const PROTECTED_ROUTES = ['checkout', 'favorites', 'checkout-success', 'profile', 'admin'];

function AppContent() {
  const { route, navigate } = useNavigation();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { showToast } = useToast();

  // Guardião de Rotas (Router Guard)
  useEffect(() => {
    if (loading) return;
    if (PROTECTED_ROUTES.includes(route.page) && !isAuthenticated) {
      showToast('Faça login para acessar esta área exclusiva.', 'info');
      navigate('login', { redirectTo: route.page });
      return;
    }
    if (route.page === 'admin' && isAuthenticated && !isAdmin) {
      showToast('Acesso restrito a administradores (ROLE: ADMIN).', 'error');
      navigate('home');
    }
  }, [route.page, isAuthenticated, isAdmin, loading]);

  if (loading) return null;

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
        {route.page === 'product-detail' && <ProductDetail />}
        {route.page === 'signup' && <SignUp />}
        {route.page === 'login' && <Login />}
        {route.page === 'forgot-password' && <ForgotPassword />}
        {route.page === 'cart' && <Cart />}
        {route.page === 'checkout' && <Checkout />}
        {route.page === 'favorites' && <Favorites />}
        {route.page === 'info' && <Info />}
        {route.page === 'checkout-success' && <CheckoutSuccess />}
        {route.page === 'profile' && <Profile />}
        {route.page === 'admin' && <Admin />}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NavigationProvider>
          <CartProvider>
            <FavoritesProvider>
              <AppContent />
            </FavoritesProvider>
          </CartProvider>
        </NavigationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
