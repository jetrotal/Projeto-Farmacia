import { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import {
  mdiMagnify,
  mdiAccountOutline,
  mdiCartOutline,
  mdiHeartOutline,
  mdiMenu,
  mdiClose,
  mdiShieldCrownOutline,
  mdiTagOutline,
} from '@mdi/js';
import { ASSETS } from '../constants/assets';
import { useNavigation } from '../contexts/NavigationContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ApiService } from '../services/api';

export default function Navbar() {
  const { route, navigate } = useNavigation();
  const { cartItems, abandonedOffer, setAbandonedOffer } = useCart();
  const { favorites } = useFavorites();
  const { user, logout, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [searchInput, setSearchInput] = useState(route.params?.search || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchBoxRef = useRef(null);

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  // Live Search (Autocomplete) ao digitar
  useEffect(() => {
    const query = searchInput.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      ApiService.getCatalogProducts({ search: query })
        .then((res) => {
          setSuggestions(Array.isArray(res) ? res.slice(0, 6) : []);
          setShowDropdown(true);
        })
        .catch(() => setSuggestions([]));
    }, 180);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fecha o autocomplete ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.nativeEvent?.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter') {
      setShowDropdown(false);
      navigate('catalog', { search: searchInput });
    }
  };

  const handleUserClick = () => {
    if (!user) {
      navigate('login');
    } else {
      navigate('profile');
    }
  };

  const handleLogout = (e) => {
    e.stopPropagation();
    logout();
    showToast('Você saiu da sua conta com segurança.', 'info');
    navigate('home');
  };

  return (
    <header className="navbar">
      <div className="microbar px-80">
        <span className="announcement">
          Promoções diárias! Use <strong>BOASVINDAS10</strong> (10% OFF) ou{' '}
          <strong>VERAO20</strong> (20% OFF).
        </span>
        <div className="quick-links mobile-hidden">
          <span
            className="pointer"
            onClick={() => navigate('info', { title: 'Entregas e Prazos' })}
          >
            Frete & Prazos
          </span>
          <span
            className="pointer"
            onClick={() => navigate('info', { title: 'Central de Ajuda' })}
          >
            Televendas: 0800 555 1234
          </span>
        </div>
      </div>

      {abandonedOffer && (
        <div className="abandoned-banner px-80">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon path={mdiTagOutline} size={0.8} color="#FFFFFF" />
            <span>{abandonedOffer.message}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="abandoned-cta pointer"
              onClick={() => {
                setAbandonedOffer(null);
                navigate('cart', { coupon: abandonedOffer.coupon });
              }}
            >
              Finalizar com 15% OFF
            </button>
            <button
              type="button"
              className="toast-close"
              onClick={() => setAbandonedOffer(null)}
            >
              <Icon path={mdiClose} size={0.7} color="#FFFFFF" />
            </button>
          </div>
        </div>
      )}

      <div className="main-nav px-80">
        <div
          className="nav-brand-section"
          style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <button
            type="button"
            className="hamburger desktop-hidden pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Icon path={isMenuOpen ? mdiClose : mdiMenu} size={1.2} color="#0E3D55" />
          </button>

          <div className="brand-logo pointer" onClick={() => navigate('home')}>
            <div className="mascot-square-footer nav-mascot">
              <img
                src={ASSETS.mascotHero}
                alt="Mascote FARMARCIA"
                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>
            <span className="brand-text">FARMARCIA</span>
          </div>
        </div>

        <div className="search-bar-wrapper" ref={searchBoxRef}>
          <div className="search-bar">
            <Icon path={mdiMagnify} size={1} color="#0E3D55" />
            <input
              type="text"
              placeholder="O que você está procurando hoje? (ex: Dipirona, Vichy...)"
              className="search-input"
              value={searchInput}
              onFocus={() => searchInput.trim().length >= 2 && setShowDropdown(true)}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {searchInput && (
              <button
                type="button"
                className="search-clear pointer"
                onClick={() => {
                  setSearchInput('');
                  setSuggestions([]);
                  setShowDropdown(false);
                }}
              >
                <Icon path={mdiClose} size={0.7} color="#6C788A" />
              </button>
            )}
          </div>

          {showDropdown && searchInput.trim().length >= 2 && (
            <div className="live-search-dropdown">
              {suggestions.length === 0 ? (
                <div className="live-search-empty">
                  Nenhum produto encontrado para &ldquo;{searchInput}&rdquo;
                </div>
              ) : (
                <>
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      className="live-search-item"
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('product-detail', { id: item.id });
                      }}
                    >
                      <img src={item.image} alt={item.name} className="live-search-thumb" />
                      <div className="live-search-info">
                        <span className="live-search-brand">{item.brand}</span>
                        <span className="live-search-name">{item.name}</span>
                        <span
                          className={`live-search-stock ${item.stock <= 0 ? 'out' : ''}`}
                        >
                          {item.stock <= 0 ? 'Esgotado' : `${item.stock} em estoque`}
                        </span>
                      </div>
                      <span className="live-search-price">{item.price}</span>
                    </div>
                  ))}
                  <div
                    className="live-search-footer pointer"
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('catalog', { search: searchInput });
                    }}
                  >
                    Ver todos os resultados para &ldquo;{searchInput}&rdquo; →
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <nav className={`menu-links ${isMenuOpen ? 'open' : ''}`}>
          <a
            onClick={() => {
              setIsMenuOpen(false);
              navigate('home');
            }}
            className={`nav-link ${route.page === 'home' ? 'active' : ''}`}
          >
            Início
          </a>
          <a
            onClick={() => {
              setIsMenuOpen(false);
              navigate('catalog');
            }}
            className={`nav-link ${route.page === 'catalog' ? 'active' : ''}`}
          >
            Produtos
          </a>
          <a
            onClick={() => {
              setIsMenuOpen(false);
              navigate('departments');
            }}
            className={`nav-link ${route.page === 'departments' ? 'active' : ''}`}
          >
            Departamentos
          </a>
          {isAdmin && (
            <a
              onClick={() => {
                setIsMenuOpen(false);
                navigate('admin');
              }}
              className={`nav-link text-green ${route.page === 'admin' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800 }}
            >
              <Icon path={mdiShieldCrownOutline} size={0.8} color="#26B394" /> Admin
            </a>
          )}
          {!user && (
            <a
              onClick={() => {
                setIsMenuOpen(false);
                navigate('signup');
              }}
              className={`nav-link text-green ${route.page === 'signup' ? 'active' : ''}`}
            >
              Criar Conta
            </a>
          )}
        </nav>

        <div className="nav-actions">
          <div className="user-shortcut">
            <div
              className="icon-circle pointer"
              onClick={handleUserClick}
              title={user ? 'Minha Conta' : 'Entrar ou Cadastrar'}
            >
              <Icon path={mdiAccountOutline} size={1} color="#0E3D55" />
            </div>

            {user ? (
              <div className="user-text mobile-hidden">
                <span
                  className="user-greet pointer"
                  onClick={() => navigate('profile')}
                  style={{ color: 'var(--c-dark)', fontWeight: 700, fontSize: '13px' }}
                >
                  Olá, {user.name.split(' ')[0]}
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span
                    className="user-action pointer"
                    onClick={() => navigate('profile')}
                    style={{ fontSize: '11px', color: 'var(--c-cyan)' }}
                  >
                    Minha Conta
                  </span>
                  <span style={{ color: '#ccc', fontSize: '10px' }}>|</span>
                  <span
                    className="user-action pointer"
                    onClick={handleLogout}
                    style={{ fontSize: '11px', color: 'var(--c-pink)' }}
                  >
                    Sair
                  </span>
                </div>
              </div>
            ) : (
              <div className="user-text pointer mobile-hidden" onClick={handleUserClick}>
                <span className="user-greet">Olá, faça seu</span>
                <span className="user-action">Login ou Cadastro</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="fav-badge"
            onClick={() => navigate('favorites')}
            title="Lista de Desejos"
          >
            <Icon path={mdiHeartOutline} size={0.9} color="#D93D7B" />
            {favorites.length > 0 && <span>({favorites.length})</span>}
          </button>

          <button
            type="button"
            className="cart-badge pointer"
            onClick={() => navigate('cart')}
          >
            <Icon path={mdiCartOutline} size={1} color="#FFFFFF" />
            <span className="mobile-hidden">Meu Carrinho ({cartCount})</span>
            <span className="desktop-hidden">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
