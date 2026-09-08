import { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import { mdiPill, mdiStarFourPointsOutline, mdiApple, mdiWaterOutline, mdiBabyCarriage, mdiHeartOutline, mdiArrowRight } from '@mdi/js';
import Breadcrumbs from '../components/Breadcrumbs';
import { ApiService } from '../services/api';
import { useNavigation } from '../contexts/NavigationContext';

// Mapeamento visual das categorias (ícones ficam no front-end, o nome vem do DB)
const CATEGORY_ICONS = {
  'Medicamentos': mdiPill,
  'Dermocosméticos': mdiStarFourPointsOutline,
  'Vitaminas': mdiApple,
  'Higiene Pessoal': mdiWaterOutline,
  'Bebê': mdiBabyCarriage,
  'Bem-estar': mdiHeartOutline,
};

export default function Departments() {
  const { navigate } = useNavigation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    ApiService.getCategories().then(setCategories);
  }, []);

  return (
    <div className="page-catalog">
      <Breadcrumbs items={[
        { label: 'Início', page: 'home' },
        { label: 'Todos os Departamentos', page: 'departments' }
      ]} />

      <div className="catalog-title-bar px-80">
        <div>
          <h1 className="section-title">Departamentos</h1>
          <p className="section-subtitle">Navegue pelas categorias e encontre o que você precisa.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('catalog')}>
          Ver Catálogo Completo <Icon path={mdiArrowRight} size={0.8} />
        </button>
      </div>

      <div className="main-grid-container px-80">
        <div className="departments-grid w-full">
          {categories.map(cat => (
            <div 
              key={cat} 
              className="department-card pointer"
              onClick={() => navigate('catalog', { category: cat })}
            >
              <div className="department-icon">
                <Icon path={CATEGORY_ICONS[cat] || mdiHeartOutline} size={1.5} color="#0A8399" />
              </div>
              <h3>{cat}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
