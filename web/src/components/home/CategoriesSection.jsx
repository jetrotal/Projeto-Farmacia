import { useEffect, useState } from 'react';
import Icon from '../Icon';
import { mdiPill, mdiStarFourPointsOutline, mdiApple, mdiWaterOutline, mdiBabyCarriage, mdiHeartOutline } from '@mdi/js';
import { ApiService } from '../../services/api';
import { useNavigation } from '../../contexts/NavigationContext';

const CATEGORY_ICONS = {
  'Medicamentos': mdiPill,
  'Dermocosméticos': mdiStarFourPointsOutline,
  'Vitaminas': mdiApple,
  'Higiene Pessoal': mdiWaterOutline,
  'Bebê': mdiBabyCarriage,
  'Bem-estar': mdiHeartOutline,
};

export default function CategoriesSection() {
  const { navigate } = useNavigation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    ApiService.getCategories().then(setCategories);
  }, []);

  return (
    <section className="categories-section px-80">
      <h2 className="section-title">Navegue por categorias</h2>
      <div className="categories-strip">
        {categories.map(cat => (
          <button key={cat} className="category-pill" onClick={() => navigate('catalog', { category: cat })}>
            <Icon path={CATEGORY_ICONS[cat] || mdiHeartOutline} size={0.8} /> {cat}
          </button>
        ))}
      </div>
    </section>
  );
}
