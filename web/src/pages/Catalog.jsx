import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import Icon from '../components/Icon';
import { mdiFilterVariant } from '@mdi/js';
import { ApiService } from '../services/api';
import { useNavigation } from '../contexts/NavigationContext';

export default function Catalog() {
  const { route } = useNavigation();
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [dbBrands, setDbBrands] = useState([]);
  
  const initialCategory = route.params?.category || '';
  const search = route.params?.search || '';
  
  const [selectedCategories, setSelectedCategories] = useState(initialCategory ? [initialCategory] : []);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState('sales');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    ApiService.getCategories().then(setDbCategories);
    ApiService.getBrands().then(setDbBrands);
  }, []);

  useEffect(() => {
    if (route.params?.category) {
      setSelectedCategories([route.params.category]);
    } else {
      setSelectedCategories([]);
    }
  }, [route.params?.category]);

  // Agora reage também à mudança de Ordenação e Marcas
  useEffect(() => {
    ApiService.getCatalogProducts({ 
      categories: selectedCategories, 
      brands: selectedBrands,
      search: search,
      sortBy: sortBy
    }).then(setCatalogProducts);
  }, [selectedCategories, selectedBrands, search, sortBy]);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  return (
    <div className="page-catalog">
      <Breadcrumbs items={[
        { label: 'Início', page: 'home' },
        { label: 'Todos os Departamentos', page: 'departments' },
        { label: `Catálogo ${search ? `> Busca: "${search}"` : ''}`, page: 'catalog' }
      ]} />

      <div className="catalog-title-bar px-80">
        <div>
          <h1 className="section-title">Catálogo de Produtos</h1>
          <p className="section-subtitle">Exibindo {catalogProducts.length} produtos encontrados</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: 'max-content' }} className="catalog-actions-mobile">
          <button className="btn-outline desktop-hidden" style={{ padding: '10px 16px' }} onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Icon path={mdiFilterVariant} size={0.8} /> Filtros
          </button>
          
          <select 
            className="sort-dropdown" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="sales">Ordenar por: Mais Vendidos</option>
            <option value="price-asc">Menor Preço</option>
            <option value="price-desc">Maior Preço</option>
            <option value="rating">Melhor Avaliação</option>
          </select>
        </div>
      </div>

      <div className="main-grid-container px-80">
        <aside className={`filter-sidebar ${isFilterOpen ? 'open' : ''}`}>
          <h3 className="filter-title">Filtros</h3>
          
          <div className="filter-group">
            <h4 className="filter-group-title">Categorias</h4>
            {dbCategories.map(cat => (
              <label key={cat} className="custom-check">
                <input 
                  type="checkbox" 
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                /> {cat}
              </label>
            ))}
          </div>
          
          <div className="line-sep"></div>

          <div className="filter-group">
            <h4 className="filter-group-title">Marca</h4>
            {dbBrands.map(brand => (
              <label key={brand} className="custom-check">
                <input 
                  type="checkbox" 
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                /> {brand}
              </label>
            ))}
          </div>
        </aside>

        <div className="right-grid-area">
          {catalogProducts.length === 0 ? (
            <p>Nenhum produto encontrado para estes filtros.</p>
          ) : (
            <div className="products-grid-catalog">
              {catalogProducts.map((product, idx) => (
                <ProductCard key={idx} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
