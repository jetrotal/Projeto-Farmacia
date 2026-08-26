import Icon from './Icon';

import { mdiMagnify, mdiAccountOutline, mdiCartOutline, mdiPill } from '@mdi/js';
import { ASSETS } from '../constants/assets';

export default function Navbar({ setPage }) {
  return (
    <header className="navbar">
      <div className="microbar px-80">
        <span className="announcement">Promoções diárias! Confira as novidades.</span>
        <div className="quick-links">
          <span>Nossas Lojas</span>
          <span>Televendas: 0800 555 1234</span>
        </div>
      </div>

      <div className="main-nav px-80">
        <div className="brand-logo pointer" onClick={() => setPage('home')}>
          <div className="mascot-square">
            <img src={ASSETS.mascotHero} style={{ width: '60px' }}></img>
          </div>
          <span className="brand-text">FARMARCIA</span>
        </div>

        <div className="search-bar">
          <Icon path={mdiMagnify} size={1} color="#0E3D55" />
          <input type="text" placeholder="O que você está procurando hoje?" className="search-input" />
        </div>

        <nav className="menu-links">
          <a onClick={() => setPage('home')} className="nav-link active">Início</a>
          <a onClick={() => setPage('catalog')} className="nav-link">Produtos</a>
          <a onClick={() => setPage('signup')} className="nav-link text-green">Criar Conta</a>
        </nav>

        <div className="nav-actions">
          <div className="user-shortcut pointer" onClick={() => setPage('signup')}>
            <div className="icon-circle">
              <Icon path={mdiAccountOutline} size={1} color="#0E3D55" />
            </div>
            <div className="user-text">
              <span className="user-greet">Olá, faça seu</span>
              <span className="user-action">Login ou Cadastro</span>
            </div>
          </div>

          <button className="cart-badge">
            <Icon path={mdiCartOutline} size={1} color="#FFFFFF" />
            <span>Meu Carrinho (3)</span>
          </button>
        </div>
      </div>
    </header>
  );
}
