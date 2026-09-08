import { useState } from 'react';
import Icon from '../components/Icon';
import { mdiTrashCanOutline, mdiArrowRight, mdiShieldCheckOutline } from '@mdi/js';
import { useCart } from '../contexts/CartContext';
import { useNavigation } from '../contexts/NavigationContext';

export default function Cart() {
  const { cartItems, removeFromCart, updateQty } = useCart();
  const { navigate } = useNavigation();
  
  const [couponInput, setCouponInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [cepInput, setCepInput] = useState('');
  const [freightEstimated, setFreightEstimated] = useState(false);

  const handleApplyCoupon = () => {
    if (!couponInput) return;
    if (couponInput.toUpperCase() === 'BOASVINDAS10') {
      setDiscountPercent(0.10); // 10%
    } else {
      alert('Cupom inválido ou expirado.');
      setDiscountPercent(0);
    }
  };

  const handleCalcCep = () => {
    if (cepInput.replace(/\D/g, '').length === 8) {
      setFreightEstimated(true);
    } else {
      alert('Por favor, insira um CEP válido de 8 dígitos.');
      setFreightEstimated(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.priceValue * item.qty), 0);
  const discountValue = subtotal * discountPercent;
  const isFreeShipping = (subtotal - discountValue) > 150;
  
  // O frete só é cobrado se foi estimado (mockado 15.90) e não possui frete grátis
  const freightValue = isFreeShipping ? 0 : 15.90;
  const totalValue = subtotal - discountValue + (freightEstimated ? freightValue : 0);

  const proceedToCheckout = () => {
    navigate('checkout', { 
      subtotal, 
      discountValue, 
      freightValue: freightEstimated ? freightValue : 0, 
      totalValue 
    });
  };

  return (
    <div className="page-cart-wrapper px-80">
      <h1 className="cart-title">Meu Carrinho</h1>
      
      <div className="cart-container">
        <div className="cart-items-panel">
          {cartItems.length === 0 ? (
            <p>Seu carrinho está vazio.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.cartId} className="cart-item-row">
                <div className="cart-item-info">
                  <div className="cart-item-img" style={{ backgroundImage: `url(${item.image})` }}></div>
                  <div className="cart-item-details">
                    <span className="brand-text">{item.brand}</span>
                    <h4 className="cart-item-name">{item.name}</h4>
                  </div>
                </div>
                
                <div className="cart-item-controls">
                  <select 
                    className="qty-select" 
                    value={item.qty}
                    onChange={(e) => updateQty(item.cartId, parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                  
                  <div className="cart-item-pricing">
                    <span className="cart-item-old">{item.oldPrice}</span>
                    <span className="cart-item-price">{item.price}</span>
                  </div>
                  
                  <button className="btn-remove pointer" onClick={() => removeFromCart(item.cartId)}>
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
            <span>Subtotal ({cartItems.length} itens)</span>
            <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>

          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>Possui cupom de desconto?</span>
            <div className="coupon-box">
              <input 
                type="text" 
                className="coupon-input" 
                placeholder="Ex: BOASVINDAS10" 
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
              />
              <button className="coupon-btn" onClick={handleApplyCoupon}>Aplicar</button>
            </div>
          </div>

          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>Calcular Frete</span>
            <div className="coupon-box">
              <input 
                type="text" 
                className="coupon-input" 
                placeholder="00000-000"
                maxLength="9"
                value={cepInput}
                onChange={(e) => setCepInput(e.target.value)}
              />
              <button className="coupon-btn" style={{ background: 'var(--c-gray)' }} onClick={handleCalcCep}>Calcular</button>
            </div>
          </div>
          
          {discountValue > 0 && (
            <div className="summary-row text-green">
              <span>Descontos</span>
              <span>- R$ {discountValue.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          
          <div className="summary-row">
            <span>Frete</span>
            <span className={isFreeShipping ? "text-green" : ""}>
              {!freightEstimated ? "A calcular" : (isFreeShipping ? 'Grátis' : `R$ ${freightValue.toFixed(2).replace('.', ',')}`)}
            </span>
          </div>
          
          <div className="line-sep" style={{ margin: '16px 0' }}></div>
          
          <div className="summary-total">
            <span>Total</span>
            <span>R$ {totalValue.toFixed(2).replace('.', ',')}</span>
          </div>
          
          <button 
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
