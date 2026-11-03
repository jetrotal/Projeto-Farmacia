import { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import {
  mdiTrashCanOutline,
  mdiArrowRight,
  mdiShieldCheckOutline,
  mdiTruckFastOutline,
} from '@mdi/js';
import { useCart } from '../contexts/CartContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useToast } from '../contexts/ToastContext';
import { ApiService } from '../services/api';

export default function Cart() {
  const { cartItems, removeFromCart, updateQty } = useCart();
  const { navigate, route } = useNavigation();
  const { showToast } = useToast();

  const [couponInput, setCouponInput] = useState(route.params?.coupon || '');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  const [cepInput, setCepInput] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [suggestedAddress, setSuggestedAddress] = useState(null);

  const subtotal = cartItems.reduce((acc, item) => acc + item.priceValue * item.qty, 0);

  useEffect(() => {
    if (route.params?.coupon) {
      handleApplyCoupon(route.params.coupon);
    }
  }, [route.params?.coupon]);

  const handleApplyCoupon = async (codeOverride) => {
    const code = (codeOverride ?? couponInput).trim();
    if (!code) return;
    try {
      const res = await ApiService.validateCoupon(code);
      setDiscountPercent(res.discountPercent);
      setAppliedCoupon(res.code);
      showToast(`Cupom ${res.code} (${res.discountLabel}) aplicado com sucesso!`, 'success');
    } catch (err) {
      setDiscountPercent(0);
      setAppliedCoupon('');
      showToast(err.message || 'Cupom inválido ou expirado.', 'error');
    }
  };

  const handleCalcCep = async () => {
    try {
      const res = await ApiService.calculateShipping(cepInput, cartItems, subtotal);
      setShippingOptions(res.options || []);
      if (res.options?.length > 0) {
        setSelectedShipping(res.options[0]);
      }
      setSuggestedAddress(res.suggestedAddress || null);
      showToast(
        res.isFreeShipping
          ? 'Parabéns! Você ganhou Frete Grátis nesta compra!'
          : `Opções de frete calculadas para o CEP ${res.cep} (${res.totalWeightKg}kg).`,
        'success',
      );
    } catch (err) {
      setShippingOptions([]);
      setSelectedShipping(null);
      showToast(err.message, 'error');
    }
  };

  const discountValue = subtotal * discountPercent;
  const isFreeShipping = subtotal - discountValue > 150;
  const freightValue = selectedShipping
    ? isFreeShipping
      ? 0
      : selectedShipping.price
    : 0;
  const totalValue = Math.max(0, subtotal - discountValue + freightValue);

  const proceedToCheckout = () => {
    navigate('checkout', {
      subtotal: subtotal.toFixed(2),
      discountValue: discountValue.toFixed(2),
      freightValue: (selectedShipping ? freightValue : 15.9).toFixed(2),
      shippingMethod: selectedShipping?.name || 'FARMARCIA Expressa',
      totalValue: (selectedShipping
        ? totalValue
        : subtotal - discountValue + (isFreeShipping ? 0 : 15.9)
      ).toFixed(2),
      couponCode: appliedCoupon,
      cep: cepInput,
      rua: suggestedAddress?.rua || '',
      bairro: suggestedAddress?.bairro || '',
      cidade: suggestedAddress?.cidade || '',
      estado: suggestedAddress?.estado || '',
    });
  };

  return (
    <div className="page-cart-wrapper px-80">
      <h1 className="cart-title">Meu Carrinho</h1>

      <div className="cart-container">
        <div className="cart-items-panel">
          {cartItems.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center' }}>
              <p style={{ marginBottom: '16px', color: 'var(--c-gray)' }}>
                Seu carrinho está vazio.
              </p>
              <button
                type="button"
                className="btn-primary"
                style={{ margin: '0 auto' }}
                onClick={() => navigate('catalog')}
              >
                Explorar Produtos
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.cartId} className="cart-item-row">
                <div
                  className="cart-item-info pointer"
                  onClick={() => navigate('product-detail', { id: item.id })}
                >
                  <div
                    className="cart-item-img"
                    style={{ backgroundImage: `url(${item.image})` }}
                  ></div>
                  <div className="cart-item-details">
                    <span className="brand-text">{item.brand}</span>
                    <h4 className="cart-item-name">{item.name}</h4>
                  </div>
                </div>

                <div className="cart-item-controls">
                  <select
                    className="qty-select"
                    value={item.qty}
                    onChange={(e) => updateQty(item.cartId, parseInt(e.target.value, 10))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>

                  <div className="cart-item-pricing">
                    <span className="cart-item-old">{item.oldPrice}</span>
                    <span className="cart-item-price">{item.price}</span>
                  </div>

                  <button
                    type="button"
                    className="btn-remove pointer"
                    onClick={() => removeFromCart(item.cartId)}
                  >
                    <Icon path={mdiTrashCanOutline} size={1} color="#6C788A" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="cart-summary-panel">
          <h3 className="summary-title">Resumo do pedido</h3>

          <div className="summary-row">
            <span>Subtotal ({cartItems.reduce((a, b) => a + b.qty, 0)} itens)</span>
            <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>

          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>
              Possui cupom de desconto? (BOASVINDAS10, VERAO20)
            </span>
            <div className="coupon-box">
              <input
                type="text"
                className="coupon-input"
                placeholder="Ex: BOASVINDAS10"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
              />
              <button
                type="button"
                className="coupon-btn"
                onClick={() => handleApplyCoupon()}
              >
                Aplicar
              </button>
            </div>
          </div>

          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>
              Calcular Frete e Prazo (Correios / Expressa)
            </span>
            <div className="coupon-box">
              <input
                type="text"
                className="coupon-input"
                placeholder="01310-100"
                maxLength="9"
                value={cepInput}
                onChange={(e) => setCepInput(e.target.value)}
              />
              <button
                type="button"
                className="coupon-btn"
                style={{ background: 'var(--c-gray)' }}
                onClick={handleCalcCep}
              >
                Calcular
              </button>
            </div>

            {shippingOptions.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginTop: '8px',
                }}
              >
                {shippingOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className="pointer"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border:
                        selectedShipping?.id === opt.id
                          ? '2px solid var(--c-green)'
                          : '1px solid var(--c-light)',
                      background: selectedShipping?.id === opt.id ? '#EFFFFC' : '#F5F8F9',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        name="shippingOpt"
                        checked={selectedShipping?.id === opt.id}
                        onChange={() => setSelectedShipping(opt)}
                      />
                      <div>
                        <strong style={{ display: 'block', color: 'var(--c-dark)' }}>
                          {opt.name}
                        </strong>
                        <span style={{ color: 'var(--c-gray)' }}>{opt.deadline}</span>
                      </div>
                    </div>
                    <strong style={{ color: 'var(--c-green)' }}>
                      {opt.price === 0
                        ? 'Grátis'
                        : `R$ ${opt.price.toFixed(2).replace('.', ',')}`}
                    </strong>
                  </label>
                ))}
              </div>
            )}
          </div>

          {discountValue > 0 && (
            <div className="summary-row text-green">
              <span>Desconto ({appliedCoupon})</span>
              <span>- R$ {discountValue.toFixed(2).replace('.', ',')}</span>
            </div>
          )}

          <div className="summary-row">
            <span>Frete</span>
            <span className={isFreeShipping ? 'text-green' : ''}>
              {!selectedShipping
                ? isFreeShipping
                  ? 'Grátis'
                  : 'A calcular'
                : isFreeShipping || freightValue === 0
                  ? 'Grátis'
                  : `R$ ${freightValue.toFixed(2).replace('.', ',')}`}
            </span>
          </div>

          <div className="line-sep" style={{ margin: '16px 0' }}></div>

          <div className="summary-total">
            <span>Total</span>
            <span>R$ {totalValue.toFixed(2).replace('.', ',')}</span>
          </div>

          <button
            type="button"
            className="btn-primary w-full mt-2"
            style={{ padding: '16px' }}
            onClick={proceedToCheckout}
            disabled={cartItems.length === 0}
          >
            Continuar para Entrega <Icon path={mdiArrowRight} size={0.8} />
          </button>

          <div className="safe-checkout mt-2">
            <Icon path={mdiShieldCheckOutline} size={0.8} color="#26B394" />
            <span>Compra Segura - Criptografia SSL 256 bits</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
