import { useState, useEffect } from 'react';
import Icon from '../Icon';
import { mdiArrowRight, mdiMessageReplyTextOutline } from '@mdi/js';
import { ASSETS } from '../../constants/assets';
import { useNavigation } from '../../contexts/NavigationContext';
import { ApiService } from '../../services/api';

export default function HeroSection() {
  const { navigate } = useNavigation();
  const [banner, setBanner] = useState({
    badgeText: '🏷️ CUPOM DE PRIMEIRA COMPRA: BOASVINDAS10',
    title: 'Sua saúde em boas mãos',
    subtitle:
      'Medicamentos, dermocosméticos e bem-estar com entrega rápida e a atenção de farmacêuticas de verdade. Cuidamos de você em cada detalhe.',
    ctaText: 'Ver ofertas',
    ctaSecondaryText: 'Falar com Farmacêutica',
    whatsappNumber: '5511999999999',
    imageUrl: ASSETS.mascotHero,
  });

  useEffect(() => {
    ApiService.getBanner()
      .then((data) => {
        if (data && data.title) setBanner(data);
      })
      .catch(() => {});
  }, []);

  const handleFarmaceuticaClick = () => {
    const num = banner.whatsappNumber || '5511999999999';
    window.open(
      `https://wa.me/${num}?text=Ol%C3%A1%2C%20preciso%20falar%20com%20uma%20farmac%C3%AAutica%20da%20FARMARCIA!`,
      '_blank',
    );
  };

  return (
    <section className="hero px-80">
      <div className="hero-content">
        <div className="badge-offer">{banner.badgeText}</div>
        <h1 className="hero-title">{banner.title}</h1>
        <p className="hero-subtitle">{banner.subtitle}</p>
        <div className="hero-cta flex gap-4">
          <button
            type="button"
            className="btn-primary hero-btn"
            onClick={() => navigate('catalog')}
          >
            {banner.ctaText || 'Ver ofertas'} <Icon path={mdiArrowRight} size={0.8} />
          </button>
          <button
            type="button"
            className="btn-outline hero-btn"
            onClick={handleFarmaceuticaClick}
          >
            {banner.ctaSecondaryText || 'Falar com Farmacêutica'}{' '}
            <Icon path={mdiMessageReplyTextOutline} size={0.8} />
          </button>
        </div>
      </div>
      <div className="mascot-container">
        <img
          src={banner.imageUrl || ASSETS.mascotHero}
          alt="Mascote FARMARCIA"
          className="mascot-img"
        />
      </div>
    </section>
  );
}
