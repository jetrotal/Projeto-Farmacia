import { useState } from 'react';
import Icon from './Icon';
import {
  mdiHeartOutline,
  mdiHeart,
  mdiStar,
  mdiCartOutline,
  mdiBellRingOutline,
} from '@mdi/js';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ApiService } from '../services/api';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { navigate } = useNavigation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [showAlertInput, setShowAlertInput] = useState(false);
  const [alertEmail, setAlertEmail] = useState(user?.email || '');

  const isFav = isFavorite(product.id);
  const isOutOfStock = Number(product.stock ?? 20) <= 0;

  const handleStockAlert = async (e) => {
    e.stopPropagation();
    const targetEmail = alertEmail || user?.email;
    if (!targetEmail || !targetEmail.includes('@')) {
      setShowAlertInput(true);
      showToast('Informe seu e-mail abaixo para avisarmos quando chegar!', 'info');
      return;
    }
    try {
      const res = await ApiService.registerStockAlert(product.id, targetEmail);
      showToast(res.message, 'success');
      setShowAlertInput(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="product-card">
      <div className="card-header">
        <div className={`discount-tag ${isOutOfStock ? 'tag-out' : ''}`}>
          {isOutOfStock ? 'ESGOTADO' : product.discount || 'OFERTA'}
        </div>
        <button
          type="button"
          className="favorite-btn"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product);
          }}
          title="Salvar nos Favoritos"
        >
          <Icon path={isFav ? mdiHeart : mdiHeartOutline} size={0.7} color="#D93D7B" />
        </button>
      </div>

      <div
        className="product-img pointer"
        style={{
          backgroundImage: `url(${product.image})`,
          opacity: isOutOfStock ? 0.6 : 1,
        }}
        onClick={() => navigate('product-detail', { id: product.id })}
      />

      <div
        className="product-info pointer"
        onClick={() => navigate('product-detail', { id: product.id })}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="brand-text">{product.brand}</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: isOutOfStock ? 'var(--c-pink)' : 'var(--c-green)',
            }}
          >
            {isOutOfStock ? 'Sem estoque' : `${product.stock ?? 20} un.`}
          </span>
        </div>
        <h3 className="product-name">{product.name}</h3>

        <div className="stars-row">
          {[...Array(5)].map((_, i) => (
            <Icon
              key={i}
              path={mdiStar}
              size={0.6}
              color={i < Math.round(product.rating || 5) ? '#F5C330' : '#D7E4E5'}
            />
          ))}
          <span className="reviews-count">({product.reviews || 0})</span>
        </div>
      </div>

      <div className="price-block">
        <span className="original-price">{product.oldPrice}</span>
        <span className="sale-price">{product.price}</span>
        <span className="installment-plan">{product.installment}</span>
      </div>

      {isOutOfStock ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {showAlertInput && (
            <input
              type="email"
              placeholder="Seu e-mail para aviso..."
              className="coupon-input"
              style={{ fontSize: '12px', padding: '8px 10px' }}
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <button
            type="button"
            className="btn-outline w-full"
            style={{
              padding: '10px 12px',
              fontSize: '13px',
              borderRadius: '12px',
              justifyContent: 'center',
            }}
            onClick={handleStockAlert}
          >
            <Icon path={mdiBellRingOutline} size={0.75} />
            Avise-me quando chegar
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn-primary add-to-cart"
          onClick={() => addToCart(product)}
        >
          <Icon path={mdiCartOutline} size={0.8} />
          Adicionar
        </button>
      )}
    </div>
  );
}
