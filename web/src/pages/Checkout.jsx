import { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import { mdiCheckBold, mdiCreditCardOutline, mdiQrcodeScan } from '@mdi/js';
import { useNavigation } from '../contexts/NavigationContext';
import { useCart } from '../contexts/CartContext';

export default function Checkout() {
  const { route, navigate } = useNavigation();
  const { cartItems } = useCart();

  // Recebe os totais do carrinho. Se entrou direto sem carrinho, zera e redireciona.
  const { subtotal = 0, discountValue = 0, freightValue = 15.9, totalValue = 0 } = route.params || {};

  useEffect(() => {
    if (cartItems.length === 0) navigate('cart');
  }, [cartItems]);

  const [form, setForm] = useState({ cep: '', rua: '', numero: '', bairro: '' });
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('pix');

  const validate = () => {
    const newErrors = {};
    if (!form.cep || form.cep.replace(/\D/g, '').length !== 8) newErrors.cep = "CEP inválido";
    if (!form.rua) newErrors.rua = "Rua é obrigatória";
    if (!form.numero) newErrors.numero = "Número é obrigatório";
    if (!form.bairro) newErrors.bairro = "Bairro é obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (validate()) {
      navigate('checkout-success');
    }
  };

  return (
    <div className="page-checkout-wrapper px-80">
      <h1 className="cart-title">Finalizar Compra</h1>

      <form className="checkout-container" onSubmit={handleCheckout}>
        <div className="checkout-main-panel">
          
          <section className="checkout-step">
            <div className="step-header">
              <div className="step-number">1</div>
              <h2>Endereço de Entrega</h2>
            </div>
            <div className="step-content form-grid">
              <div className="input-group">
                <label>CEP *</label>
                <input 
                  type="text" 
                  maxLength="9" 
                  value={form.cep} 
                  onChange={e => setForm({...form, cep: e.target.value})} 
                  className={errors.cep ? 'input-error' : ''}
                />
                {errors.cep && <span className="error-text">{errors.cep}</span>}
              </div>
              
              <div className="input-group">
                <label>Endereço (Rua/Avenida) *</label>
                <input 
                  type="text" 
                  value={form.rua} 
                  onChange={e => setForm({...form, rua: e.target.value})}
                  className={errors.rua ? 'input-error' : ''}
                />
                {errors.rua && <span className="error-text">{errors.rua}</span>}
              </div>

              <div className="row-inputs">
                <div className="input-group">
                  <label>Número *</label>
                  <input 
                    type="text" 
                    value={form.numero} 
                    onChange={e => setForm({...form, numero: e.target.value})}
                    className={errors.numero ? 'input-error' : ''}
                  />
                  {errors.numero && <span className="error-text">{errors.numero}</span>}
                </div>
                <div className="input-group">
                  <label>Bairro *</label>
                  <input 
                    type="text" 
                    value={form.bairro} 
                    onChange={e => setForm({...form, bairro: e.target.value})}
                    className={errors.bairro ? 'input-error' : ''}
                  />
                  {errors.bairro && <span className="error-text">{errors.bairro}</span>}
                </div>
              </div>
            </div>
          </section>

          <section className="checkout-step">
            <div className="step-header">
              <div className="step-number">2</div>
              <h2>Forma de Pagamento</h2>
            </div>
            <div className="step-content payment-options">
              
              <label className={`payment-card ${paymentMethod === 'pix' ? 'selected' : ''}`}>
                <div className="pay-radio">
                  <input type="radio" name="payment" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')}/>
                  <Icon path={mdiQrcodeScan} size={1} />
                  <span>Pix (Aprovação imediata)</span>
                </div>
              </label>

              <label className={`payment-card ${paymentMethod === 'card' ? 'selected' : ''}`}>
                <div className="pay-radio">
                  <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')}/>
                  <Icon path={mdiCreditCardOutline} size={1} />
                  <span>Cartão de Crédito (Até 3x sem juros)</span>
                </div>
              </label>

            </div>
          </section>

        </div>

        <aside className="checkout-sidebar">
          <h3 className="summary-title">Resumo do pedido</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>
          {discountValue > 0 && (
            <div className="summary-row text-green">
              <span>Desconto</span>
              <span>- R$ {discountValue.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Frete</span>
            <span>{freightValue === 0 ? 'Grátis' : `R$ ${freightValue.toFixed(2).replace('.', ',')}`}</span>
          </div>
          <div className="line-sep" style={{ margin: '16px 0' }}></div>
          <div className="summary-total">
            <span>Total a Pagar</span>
            <span>R$ {totalValue.toFixed(2).replace('.', ',')}</span>
          </div>
          
          <button type="submit" className="btn-primary w-full mt-2" style={{ padding: '16px' }}>
            Confirmar Pagamento <Icon path={mdiCheckBold} size={0.8} />
          </button>
        </aside>
      </form>
    </div>
  );
}
