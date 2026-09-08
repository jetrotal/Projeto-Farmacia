import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { useFavorites } from '../contexts/FavoritesContext';
import { useNavigation } from '../contexts/NavigationContext';

export default function Favorites() {
  const { favorites } = useFavorites();
  const { navigate } = useNavigation();

  return (
    <div className="page-catalog">
      <Breadcrumbs items={[
        { label: 'Início', page: 'home' },
        { label: 'Meus Favoritos', page: 'favorites' }
      ]} />

      <div className="catalog-title-bar px-80">
        <div>
          <h1 className="section-title">Lista de Desejos</h1>
          <p className="section-subtitle">Você tem {favorites.length} produto(s) favoritado(s)</p>
        </div>
      </div>

      <div className="main-grid-container px-80" style={{ display: 'block' }}>
        {favorites.length === 0 ? (
          <p>Você ainda não tem nenhum produto salvo nos favoritos. <a className="link-cyan pointer" style={{display: 'inline-block'}} onClick={() => navigate('catalog')}>Explorar catálogo</a></p>
        ) : (
          <div className="products-grid-catalog" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
