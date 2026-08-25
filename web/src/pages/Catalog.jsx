import Icon from '@mdi/react';
import { mdiChevronRight, mdiChevronDown, mdiChevronLeft } from '@mdi/js';
import ProductCard from '../components/ProductCard';
import { MOCK_PRODUCTS } from '../constants/assets';

export default function Catalog() {
  // Duplicando produtos só para encher o grid do mockup
  const catalogProducts = [...MOCK_PRODUCTS, ...MOCK_PRODUCTS];

  return (
    <div className="page-catalog">
      <div className="breadcrumbs-section px-80">
        <div className="breadcrumbs">
          <span>Início</span> <Icon path={mdiChevronRight} size={0.6}/> 
          <span>Todos os Departamentos</span> <Icon path={mdiChevronRight} size={0.6}/> 
          <span className="active">Ofertas e Medicamentos</span>
        </div>
      </div>

      <div className="catalog-title-bar px-80">
        <div>
          <h1 className="section-title">Catálogo de Produtos</h1>
          <p className="section-subtitle">Exibindo 8 de 320 produtos encontrados</p>
        </div>
        <div className="sort-dropdown">
          <span>Ordenar por: Mais Vendidos</span>
          <Icon path={mdiChevronDown} size={0.8} />
        </div>
      </div>

      <div className="main-grid-container px-80">
        {/* Sidebar Filters */}
        <aside className="filter-sidebar">
          <h3 className="filter-title">Filtros</h3>
          
          <div className="filter-group">
            <h4 className="filter-group-title">Categorias</h4>
            <label className="custom-check"><input type="checkbox" defaultChecked /> Medicamentos</label>
            <label className="custom-check"><input type="checkbox" /> Dermocosméticos</label>
            <label className="custom-check"><input type="checkbox" /> Bem-estar</label>
            <label className="custom-check"><input type="checkbox" /> Infantil</label>
            <label className="custom-check"><input type="checkbox" /> Higiene</label>
          </div>
          
          <div className="line-sep"></div>

          <div className="filter-group">
            <h4 className="filter-group-title">Faixa de Preço</h4>
            <div className="slider-mockup">
              <div className="slider-track">
                <div className="slider-fill"></div>
                <div className="slider-thumb left"></div>
                <div className="slider-thumb right"></div>
              </div>
              <div className="slider-labels">
                <span>R$ 10</span>
                <span>R$ 200</span>
              </div>
            </div>
          </div>

          <div className="line-sep"></div>

          <div className="filter-group">
            <h4 className="filter-group-title">Marca</h4>
            <label className="custom-check"><input type="checkbox" /> La Roche-Posay</label>
            <label className="custom-check"><input type="checkbox" /> EMS Genéricos</label>
            <label className="custom-check"><input type="checkbox" /> CeraVe</label>
            <label className="custom-check"><input type="checkbox" /> Huggies</label>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="right-grid-area">
          <div className="products-grid-catalog">
            {catalogProducts.map((product, idx) => (
              <ProductCard key={idx} product={product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button className="page-btn"><Icon path={mdiChevronLeft} size={0.8} /></button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">4</button>
            <button className="page-btn"><Icon path={mdiChevronRight} size={0.8} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
