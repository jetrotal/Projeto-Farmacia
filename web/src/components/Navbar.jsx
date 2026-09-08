import { useState } from 'react';
import Icon from './Icon';
import { mdiMagnify, mdiAccountOutline, mdiCartOutline, mdiHeartOutline, mdiLogout } from '@mdi/js';
import { ASSETS } from '../constants/assets';
import { useNavigation } from '../contexts/NavigationContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { route, navigate } = useNavigation();
  const { cartItems } = useCart();
  const { favorites } = useFavorites();
  const { user, logout } = useAuth();
  const [searchInput, setSearchInput] = useState(route.params?.search || '');

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      navigate('catalog', { search: searchInput });
    }
  };

  const handleUserClick = () => {
    if (!user) navigate('login');
    // Futuro: se já logado, vai para a tela de Perfil ('profile')
  };

  return (
    <header className="navbar">
      <div className="microbar px-80">
        <span className="announcement">Promoções diárias! Confira as novidades.</span>
        <div className="quick-links">
          <span className="pointer">Nossas Lojas</span>
          <span className="pointer">Televendas: 0800 555 1234</span>
        </div>
      </div>

      <div className="main-nav px-80">
        <div className="brand-logo pointer" onClick={() => navigate('home')}>
          <div className="mascot-square-footer">
            <img src={ASSETS.mascotHero} style={{ width: '60px', translate: '5px -4px'  }}></img>
          </div>
          <span className="brand-text">FARMARCIA</span>
        </div>

        <div className="search-bar">
          <Icon path={mdiMagnify} size={1} color="#0E3D55" />
          <input 
            type="text" 
            placeholder="O que você está procurando hoje?" 
            className="search-input" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        <nav className="menu-links">
          <a onClick={() => navigate('home')} className={`nav-link ${route.page === 'home' ? 'active' : ''}`}>Início</a>
          <a onClick={() => navigate('catalog')} className={`nav-link ${route.page === 'catalog' ? 'active' : ''}`}>Produtos</a>
          {!user && <a onClick={() => navigate('signup')} className={`nav-link text-green ${route.page === 'signup' ? 'active' : ''}`}>Criar Conta</a>}
        </nav>

        <div className="nav-actions">
          <div className="user-shortcut">
            <div className="icon-circle pointer" onClick={handleUserClick}>
              <Icon path={mdiAccountOutline} size={1} color="#0E3D55" />
            </div>
            
            {user ? (
              <div className="user-text">
                <span className="user-greet" style={{ color: 'var(--c-dark)', fontWeight: 700 }}>Olá, {user.name.split(' ')[0]}</span>
                <span className="user-action pointer" onClick={logout} style={{ fontSize: '11px', color: 'var(--c-pink)' }}>Sair da conta</span>
              </div>
            ) : (
              <div className="user-text pointer" onClick={handleUserClick}>
                <span className="user-greet">Olá, faça seu</span>
                <span className="user-action">Login ou Cadastro</span>
              </div>
            )}
          </div>

          <button className="fav-badge" onClick={() => navigate('favorites')}>
            <Icon path={mdiHeartOutline} size={0.9} color="#D93D7B" />
            {favorites.length > 0 && <span>({favorites.length})</span>}
          </button>

          <button className="cart-badge pointer" onClick={() => navigate('cart')}>
            <Icon path={mdiCartOutline} size={1} color="#FFFFFF" />
            <span>Meu Carrinho ({cartCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}
