import Icon from '../Icon';
import { mdiArrowRight, mdiMessageReplyTextOutline } from '@mdi/js';
import { ASSETS } from '../../constants/assets';
import { useNavigation } from '../../contexts/NavigationContext';

export default function HeroSection() {
  const { navigate } = useNavigation();

  const handleFarmaceuticaClick = () => {
    // Redireciona para o WhatsApp de forma realística (Mock da Feature)
    window.open('https://wa.me/5511999999999?text=Ol%C3%A1%2C%20preciso%20falar%20com%20uma%20farmac%C3%AAutica%20da%20FARMARCIA!', '_blank');
  };

  return (
    <section className="hero px-80">
      <div className="hero-content">
        <div className="badge-offer">🏷️ CUPOM DE PRIMEIRA COMPRA: BOASVINDAS10</div>
        <h1 className="hero-title">Sua saúde em boas mãos</h1>
        <p className="hero-subtitle">Medicamentos, dermocosméticos e bem-estar com entrega rápida e a atenção de farmacêuticas de verdade. Cuidamos de você em cada detalhe.</p>
        <div className="hero-cta flex gap-4">
          <button className="btn-primary hero-btn" onClick={() => navigate('catalog')}>
            Ver ofertas <Icon path={mdiArrowRight} size={0.8} />
          </button>
          <button className="btn-outline hero-btn" onClick={handleFarmaceuticaClick}>
            Falar com Farmacêutica <Icon path={mdiMessageReplyTextOutline} size={0.8} />
          </button>
        </div>
      </div>
      <div className="mascot-container">
        <img src={ASSETS.mascotHero} alt="Mascote" className="mascot-img" />
      </div>
    </section>
  );
}
