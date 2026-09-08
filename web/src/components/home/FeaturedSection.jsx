import { useEffect, useState } from 'react';
import Icon from '../Icon';
import { mdiArrowRight } from '@mdi/js';
import ProductCard from '../ProductCard';
import { ApiService } from '../../services/api';
import { useNavigation } from '../../contexts/NavigationContext';

export default function FeaturedSection() {
  const { navigate } = useNavigation();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    ApiService.getFeaturedProducts().then(setFeaturedProducts);
  }, []);

  return (
    <section className="featured-section px-80">
      <div className="featured-header">
        <div>
          <h2 className="section-title">Ofertas em Destaque</h2>
          <p className="section-subtitle">Os melhores preços da semana selecionados especialmente para você</p>
        </div>
        <a className="link-cyan pointer" onClick={() => navigate('catalog')}>Ver todo o catálogo <Icon path={mdiArrowRight} size={0.7}/></a>
      </div>
      <div className="products-grid">
        {featuredProducts.map((product, idx) => (
          <ProductCard key={idx} product={product} />
        ))}
      </div>
    </section>
  );
}
