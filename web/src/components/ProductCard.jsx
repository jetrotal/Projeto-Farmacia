import Icon from './Icon';
import { mdiHeartOutline, mdiHeart, mdiStar, mdiCartOutline } from '@mdi/js';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const isFav = isFavorite(product.id);

  return (
    <div className="product-card">
      <div className="card-header">
        <div className="discount-tag">{product.discount}</div>
        <button className="favorite-btn" onClick={() => toggleFavorite(product)}>
          <Icon path={isFav ? mdiHeart : mdiHeartOutline} size={0.7} color="#D93D7B" />
        </button>
      </div>
      
      <div className="product-img" style={{ backgroundImage: `url(${product.image})` }}></div>
      
      <div className="product-info">
        <span className="brand-text">{product.brand}</span>
        <h3 className="product-name">{product.name}</h3>
        
        <div className="stars-row">
          {[...Array(5)].map((_, i) => (
            <Icon key={i} path={mdiStar} size={0.6} color={i < product.rating ? "#F5C330" : "#D7E4E5"} />
          ))}
          <span className="reviews-count">({product.reviews})</span>
        </div>
      </div>

      <div className="price-block">
        <span className="original-price">{product.oldPrice}</span>
        <span className="sale-price">{product.price}</span>
        <span className="installment-plan">{product.installment}</span>
      </div>

      <button className="btn-primary add-to-cart" onClick={() => addToCart(product)}>
        <Icon path={mdiCartOutline} size={0.8} />
        Adicionar
      </button>
    </div>
  );
}
