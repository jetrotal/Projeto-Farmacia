import Icon from '../components/Icon';
import { mdiArrowRight, mdiMessageReplyTextOutline, mdiTruckOutline, mdiTagOutline, mdiClockOutline, mdiLockOutline, mdiPill, mdiStarFourPointsOutline, mdiApple, mdiWaterOutline, mdiBabyCarriage, mdiHeartOutline } from '@mdi/js';
import ProductCard from '../components/ProductCard';
import { ASSETS, MOCK_PRODUCTS } from '../constants/assets';

export default function Home({ setPage }) {
  const categories = [
    { name: 'Medicamentos', icon: mdiPill, active: true },
    { name: 'Dermocosméticos', icon: mdiStarFourPointsOutline, active: false },
    { name: 'Vitaminas', icon: mdiApple, active: false },
    { name: 'Higiene', icon: mdiWaterOutline, active: false },
    { name: 'Bebê', icon: mdiBabyCarriage, active: false },
    { name: 'Bem-estar', icon: mdiHeartOutline, active: false },
  ];

  return (
    <div className="page-home">
      {/* Hero Section */}
      <section className="hero px-80">
        <div className="hero-content">
          <div className="badge-offer">🏷️ CUPOM DE PRIMEIRA COMPRA: BOASVINDAS10</div>
          <h1 className="hero-title">Sua saúde em boas mãos</h1>
          <p className="hero-subtitle">Medicamentos, dermocosméticos e bem-estar com entrega rápida e a atenção de farmacêuticas de verdade. Cuidamos de você em cada detalhe.</p>
          <div className="hero-cta flex gap-4">
            <button className="btn-primary hero-btn" onClick={() => setPage('catalog')}>
              Ver ofertas <Icon path={mdiArrowRight} size={0.8} />
            </button>
            <button className="btn-outline hero-btn">
              Falar com Farmacêutica <Icon path={mdiMessageReplyTextOutline} size={0.8} />
            </button>
          </div>
        </div>
        <div className="mascot-container">
          <img src={ASSETS.mascotHero} alt="Mascote" className="mascot-img" />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits px-80">
        <div className="benefit-item">
          <div className="benefit-icon"><Icon path={mdiTruckOutline} size={1} color="#26B394" /></div>
          <div>
            <h4 className="benefit-title">Frete grátis acima de R$150</h4>
            <p className="benefit-subtitle">Para todo o Brasil express</p>
          </div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon"><Icon path={mdiTagOutline} size={1} color="#26B394" /></div>
          <div>
            <h4 className="benefit-title">Até 70% de desconto</h4>
            <p className="benefit-subtitle">Em genéricos e selecionados</p>
          </div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon"><Icon path={mdiClockOutline} size={1} color="#26B394" /></div>
          <div>
            <h4 className="benefit-title">Entrega expressa rápida</h4>
            <p className="benefit-subtitle">Em até 4 horas na sua casa</p>
          </div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon"><Icon path={mdiLockOutline} size={1} color="#26B394" /></div>
          <div>
            <h4 className="benefit-title">Pagamento 100% seguro</h4>
            <p className="benefit-subtitle">Cartão, Pix ou Boleto</p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section px-80">
        <h2 className="section-title">Navegue por categorias</h2>
        <div className="categories-strip">
          {categories.map(cat => (
            <button key={cat.name} className={`category-pill ${cat.active ? 'active' : ''}`} onClick={() => setPage('catalog')}>
              <Icon path={cat.icon} size={0.8} /> {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section px-80">
        <div className="featured-header">
          <div>
            <h2 className="section-title">Ofertas em Destaque</h2>
            <p className="section-subtitle">Os melhores preços da semana selecionados especialmente para você</p>
          </div>
          <a className="link-cyan pointer" onClick={() => setPage('catalog')}>Ver todo o catálogo <Icon path={mdiArrowRight} size={0.7}/></a>
        </div>
        <div className="products-grid">
          {MOCK_PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials px-80">
        <div className="testimonials-header">
          <span className="badge-pink"><Icon path={mdiHeartOutline} size={0.7}/> Depoimentos</span>
          <h2 className="section-title">O carinho de quem compra na FARMARCIA</h2>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>“A entrega da FARMARCIA foi extremamente rápida! Em menos de 2 horas eu recebi os medicamentos em casa com todo o carinho e cuidado.”</p>
            <div className="user-info">
              <img src={ASSETS.avatar1} alt="Avatar" className="user-avatar" />
              <div>
                <h4>Juliana Mendes</h4>
                <span>Cliente desde 2024</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p>“Melhor preço em dermocosméticos e genéricos que eu já encontrei. O atendimento pelo WhatsApp também é impecável.”</p>
            <div className="user-info">
              <img src={ASSETS.avatar2} alt="Avatar" className="user-avatar" />
              <div>
                <h4>Carlos Alberto</h4>
                <span>Cliente VIP</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
