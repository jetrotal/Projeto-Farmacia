import { useEffect, useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Icon from '../components/Icon';
import {
  mdiStar,
  mdiCartOutline,
  mdiHeartOutline,
  mdiHeart,
  mdiBellRingOutline,
  mdiCheckDecagram,
  mdiShareVariantOutline,
} from '@mdi/js';
import { ApiService } from '../services/api';
import { useNavigation } from '../contexts/NavigationContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function ProductDetail() {
  const { route, navigate, updateSeoMeta } = useNavigation();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const productId = route.params?.id || 1;
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [alertEmail, setAlertEmail] = useState(user?.email || '');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadProduct = () => {
    ApiService.getProductById(productId)
      .then((data) => {
        setProduct(data);
        // Atualiza SEO Dinâmico e OpenGraph para compartilhamento no WhatsApp
        updateSeoMeta({
          title: `${data.name} - ${data.price} | FARMARCIA`,
          description: data.description || `Compre ${data.name} (${data.brand}) por ${data.price} na FARMARCIA.`,
          image: data.image,
        });
      })
      .catch(() => {
        showToast('Produto não encontrado.', 'error');
        navigate('catalog');
      });
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  if (!product) {
    return (
      <div className="page-catalog px-80" style={{ paddingTop: '60px' }}>
        <p>Carregando detalhes do produto...</p>
      </div>
    );
  }

  const isFav = isFavorite(product.id);
  const isOutOfStock = Number(product.stock ?? 0) <= 0;
  const reviewsList = product.reviewsList || [];

  const handleStockAlert = async (e) => {
    e.preventDefault();
    try {
      const res = await ApiService.registerStockAlert(product.id, alertEmail);
      showToast(res.message, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Faça login para avaliar este produto.', 'info');
      navigate('login', { redirectTo: 'product-detail' });
      return;
    }
    setSubmittingReview(true);
    try {
      await ApiService.addProductReview(product.id, reviewForm);
      showToast('Sua avaliação verificada foi publicada com sucesso!', 'success');
      setReviewForm({ rating: 5, comment: '' });
      loadProduct();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShareWhatsApp = () => {
    const shareText = `Confira *${product.name}* (${product.brand}) por apenas *${product.price}* na FARMARCIA! ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="page-catalog">
      <Breadcrumbs
        items={[
          { label: 'Início', page: 'home' },
          { label: product.category, page: 'catalog', params: { category: product.category } },
          { label: product.name, page: 'product-detail', params: { id: product.id } },
        ]}
      />

      <div className="px-80">
        <div className="product-detail-card">
          <div className="product-detail-img-box">
            <img src={product.image} alt={product.name} className="product-detail-img" />
          </div>

          <div className="product-detail-info">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="brand-text" style={{ fontSize: '13px' }}>
                {product.brand} • SKU: {product.sku || `FRM-${product.id}`}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="favorite-btn"
                  onClick={handleShareWhatsApp}
                  title="Compartilhar no WhatsApp"
                >
                  <Icon path={mdiShareVariantOutline} size={0.75} color="#0E3D55" />
                </button>
                <button
                  type="button"
                  className="favorite-btn"
                  onClick={() => toggleFavorite(product)}
                >
                  <Icon path={isFav ? mdiHeart : mdiHeartOutline} size={0.75} color="#D93D7B" />
                </button>
              </div>
            </div>

            <h1 className="section-title" style={{ marginBottom: '4px' }}>
              {product.name}
            </h1>

            <div className="stars-row" style={{ marginBottom: '12px' }}>
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  path={mdiStar}
                  size={0.8}
                  color={i < Math.round(product.rating || 5) ? '#F5C330' : '#D7E4E5'}
                />
              ))}
              <span className="reviews-count" style={{ fontSize: '13px' }}>
                ({product.reviews || reviewsList.length} avaliações)
              </span>
              <span
                style={{
                  marginLeft: '12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: isOutOfStock ? '#ffeaef' : '#e0f2f1',
                  color: isOutOfStock ? 'var(--c-pink)' : 'var(--c-green)',
                }}
              >
                {isOutOfStock ? 'Produto Esgotado' : `${product.stock} unidades em estoque`}
              </span>
            </div>

            <p style={{ color: 'var(--c-gray)', lineHeight: 1.6, marginBottom: '16px' }}>
              {product.description ||
                'Produto original com garantia de procedência e armazenamento climatizado FARMARCIA.'}
            </p>

            <div className="price-block" style={{ marginBottom: '20px' }}>
              {product.oldPrice && (
                <span className="original-price" style={{ fontSize: '14px' }}>
                  De: {product.oldPrice}
                </span>
              )}
              <span className="sale-price" style={{ fontSize: '32px' }}>
                {product.price}
              </span>
              <span className="installment-plan" style={{ fontSize: '13px' }}>
                ou em até {product.installment} sem juros
              </span>
            </div>

            {isOutOfStock ? (
              <form
                onSubmit={handleStockAlert}
                style={{
                  background: '#fff8fa',
                  border: '1px solid var(--c-pink)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <strong style={{ color: 'var(--c-dark)', fontSize: '14px' }}>
                  Este produto está temporariamente fora de estoque.
                </strong>
                <p style={{ fontSize: '13px', color: 'var(--c-gray)' }}>
                  Deixe seu e-mail e enviaremos um aviso automático assim que a Dra. Márcia repuser
                  o estoque:
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    className="coupon-input"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                  />
                  <button type="submit" className="btn-primary">
                    <Icon path={mdiBellRingOutline} size={0.8} /> Avise-me quando chegar
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <select
                  className="qty-select"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} un.
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ flex: 1, padding: '16px' }}
                  onClick={() => addToCart(product, qty)}
                >
                  <Icon path={mdiCartOutline} size={0.9} /> Adicionar ao Carrinho
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Seção de Avaliações e Comentários Verificados */}
        <div className="reviews-section">
          <div className="reviews-list-col">
            <h2 className="section-title" style={{ fontSize: '22px' }}>
              Avaliações de Clientes ({reviewsList.length})
            </h2>
            {reviewsList.length === 0 ? (
              <p style={{ color: 'var(--c-gray)', marginTop: '12px' }}>
                Ainda não há avaliações para este produto. Seja o primeiro comprador a avaliar!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="review-item-card">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong>{rev.userName}</strong>
                        {rev.verifiedPurchase && (
                          <span className="verified-badge">
                            <Icon path={mdiCheckDecagram} size={0.65} color="#26B394" /> Compra
                            Verificada
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--c-gray)' }}>
                        {new Date(rev.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="stars-row" style={{ margin: '6px 0' }}>
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          path={mdiStar}
                          size={0.65}
                          color={i < rev.rating ? '#F5C330' : '#D7E4E5'}
                        />
                      ))}
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--c-dark)' }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="review-form-col">
            <h3 className="summary-title">Avaliar este produto</h3>
            <p style={{ fontSize: '13px', color: 'var(--c-gray)', marginBottom: '16px' }}>
              Apenas clientes que compraram este item na FARMARCIA podem enviar uma avaliação.
            </p>
            <form onSubmit={handleReviewSubmit} className="signup-form">
              <div className="input-group">
                <label>Sua Nota (1 a 5 estrelas)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`category-pill ${reviewForm.rating === star ? 'active' : ''}`}
                      style={{ padding: '8px 14px' }}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label>Seu Comentário</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Conte como foi sua experiência com o produto e a entrega..."
                  className="cms-textarea"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={submittingReview}>
                {submittingReview ? 'Enviando...' : 'Publicar Avaliação Verificada'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
