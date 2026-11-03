import { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import {
  mdiCheckBold,
  mdiCreditCardOutline,
  mdiQrcodeScan,
  mdiBarcode,
  mdiMapMarkerOutline,
} from '@mdi/js';
import { useNavigation } from '../contexts/NavigationContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ApiService } from '../services/api';

export default function Checkout() {
  const { route, navigate } = useNavigation();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const subtotal = Number(
    route.params?.subtotal ??
      cartItems.reduce((acc, it) => acc + it.priceValue * it.qty, 0),
  );
  const discountValue = Number(route.params?.discountValue ?? 0);
  const freightValue = Number(route.params?.freightValue ?? (subtotal > 150 ? 0 : 15.9));
  const totalValue = Number(
    route.params?.totalValue ?? Math.max(0, subtotal - discountValue + freightValue),
  );
  const couponCode = route.params?.couponCode || '';
  const shippingMethod = route.params?.shippingMethod || 'FARMARCIA Expressa';

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveNewAddress, setSaveNewAddress] = useState(false);

  const [form, setForm] = useState({
    label: 'Casa',
    cep: route.params?.cep || '',
    rua: route.params?.rua || '',
    numero: '',
    complemento: '',
    bairro: route.params?.bairro || '',
    cidade: route.params?.cidade || 'São Paulo',
    estado: route.params?.estado || 'SP',
  });

  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [cardData, setCardData] = useState({
    cardNumber: '4532 1122 3344 5566',
    cardHolder: user?.name || 'CLIENTE FARMARCIA',
    cardExpiry: '12/29',
    cardCvv: '123',
    installments: 1,
  });

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('cart');
      return;
    }
    if (user?.id) {
      ApiService.getAddresses(user.id)
        .then((addrs) => {
          if (Array.isArray(addrs) && addrs.length > 0) {
            setSavedAddresses(addrs);
            const def = addrs.find((a) => a.isDefault) || addrs[0];
            setSelectedAddressId(def.id);
            setForm({
              label: def.label || 'Casa',
              cep: def.cep || '',
              rua: def.rua || '',
              numero: def.numero || '',
              complemento: def.complemento || '',
              bairro: def.bairro || '',
              cidade: def.cidade || 'São Paulo',
              estado: def.estado || 'SP',
            });
          }
        })
        .catch(() => {});
    }
  }, [user?.id]);

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setForm({
      label: addr.label,
      cep: addr.cep,
      rua: addr.rua,
      numero: addr.numero,
      complemento: addr.complemento || '',
      bairro: addr.bairro,
      cidade: addr.cidade || 'São Paulo',
      estado: addr.estado || 'SP',
    });
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!form.cep || form.cep.replace(/\D/g, '').length !== 8)
      newErrors.cep = 'CEP inválido (8 dígitos)';
    if (!form.rua) newErrors.rua = 'Rua é obrigatória';
    if (!form.numero) newErrors.numero = 'Número é obrigatório';
    if (!form.bairro) newErrors.bairro = 'Bairro é obrigatório';

    if (paymentMethod === 'card') {
      if (cardData.cardNumber.replace(/\D/g, '').length < 13)
        newErrors.cardNumber = 'Cartão inválido';
      if (!cardData.cardHolder) newErrors.cardHolder = 'Nome no cartão é obrigatório';
      if (!/^\d{2}\/\d{2}$/.test(cardData.cardExpiry))
        newErrors.cardExpiry = 'Use formato MM/AA';
      if (cardData.cardCvv.length < 3) newErrors.cardCvv = 'CVV inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Verifique os campos obrigatórios destacados.', 'error');
      return;
    }

    setProcessing(true);
    try {
      if (saveNewAddress && user?.id) {
        await ApiService.addAddress(user.id, form);
      }

      // 1. Processa o pagamento no Gateway Sandbox (PIX / Cartão / Boleto)
      const paymentResult = await ApiService.processPayment({
        paymentMethod,
        amount: totalValue,
        ...cardData,
      });

      // 2. Cria o Pedido Real no Banco de Dados e subtrai estoque
      const order = await ApiService.createOrder({
        items: cartItems,
        address: form,
        paymentMethod,
        paymentDetails: paymentResult,
        subtotal,
        discountValue,
        freightValue,
        shippingMethod,
        totalValue,
        couponCode,
      });

      await clearCart();
      showToast(`Pedido #${order.orderNumber} confirmado com sucesso!`, 'success');
      navigate('checkout-success', {
        orderNumber: order.orderNumber,
        trackingCode: order.trackingCode,
        paymentMethod,
        pixCopyPaste: paymentResult.pixCopyPaste || '',
        digitableLine: paymentResult.digitableLine || '',
      });
    } catch (err) {
      showToast(err.message || 'Erro ao finalizar pedido.', 'error');
    } finally {
      setProcessing(false);
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

            {savedAddresses.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--c-dark)',
                    display: 'block',
                    marginBottom: '10px',
                  }}
                >
                  Escolha um dos seus endereços salvos:
                </span>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`payment-card ${
                        selectedAddressId === addr.id ? 'selected' : ''
                      }`}
                      style={{
                        padding: '12px 16px',
                        flex: '1 1 220px',
                        textAlign: 'left',
                      }}
                    >
                      <Icon path={mdiMapMarkerOutline} size={0.9} color="#0A8399" />
                      <div>
                        <strong style={{ display: 'block', fontSize: '14px' }}>
                          {addr.label} ({addr.cep})
                        </strong>
                        <span style={{ fontSize: '12px', color: 'var(--c-gray)' }}>
                          {addr.rua}, {addr.numero} - {addr.bairro}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="step-content form-grid">
              <div className="row-inputs">
                <div className="input-group">
                  <label>Identificação (Ex: Casa, Trabalho)</label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="Casa / Trabalho"
                  />
                </div>
                <div className="input-group">
                  <label>CEP *</label>
                  <input
                    type="text"
                    maxLength="9"
                    value={form.cep}
                    onChange={(e) => setForm({ ...form, cep: e.target.value })}
                    className={errors.cep ? 'input-error' : ''}
                    placeholder="01310-100"
                  />
                  {errors.cep && <span className="error-text">{errors.cep}</span>}
                </div>
              </div>

              <div className="input-group">
                <label>Endereço (Rua/Avenida) *</label>
                <input
                  type="text"
                  value={form.rua}
                  onChange={(e) => setForm({ ...form, rua: e.target.value })}
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
                    onChange={(e) => setForm({ ...form, numero: e.target.value })}
                    className={errors.numero ? 'input-error' : ''}
                  />
                  {errors.numero && <span className="error-text">{errors.numero}</span>}
                </div>
                <div className="input-group">
                  <label>Bairro *</label>
                  <input
                    type="text"
                    value={form.bairro}
                    onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                    className={errors.bairro ? 'input-error' : ''}
                  />
                  {errors.bairro && <span className="error-text">{errors.bairro}</span>}
                </div>
              </div>

              <label className="custom-check">
                <input
                  type="checkbox"
                  checked={saveNewAddress}
                  onChange={(e) => setSaveNewAddress(e.target.checked)}
                />
                Salvar este endereço na minha conta para próximas compras
              </label>
            </div>
          </section>

          <section className="checkout-step">
            <div className="step-header">
              <div className="step-number">2</div>
              <h2>Forma de Pagamento (Gateway Seguro)</h2>
            </div>
            <div className="step-content payment-options">
              <label
                className={`payment-card ${paymentMethod === 'pix' ? 'selected' : ''}`}
              >
                <div className="pay-radio">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'pix'}
                    onChange={() => setPaymentMethod('pix')}
                  />
                  <Icon path={mdiQrcodeScan} size={1} />
                  <span>Pix Instantâneo (Gera QR Code e Copia e Cola)</span>
                </div>
              </label>

              <label
                className={`payment-card ${paymentMethod === 'card' ? 'selected' : ''}`}
              >
                <div className="pay-radio">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <Icon path={mdiCreditCardOutline} size={1} />
                  <span>Cartão de Crédito (Até 3x sem juros)</span>
                </div>
              </label>

              {paymentMethod === 'card' && (
                <div
                  className="form-grid"
                  style={{
                    padding: '16px',
                    background: '#F5F8F9',
                    borderRadius: '14px',
                    border: '1px solid var(--c-light)',
                  }}
                >
                  <div className="row-inputs">
                    <div className="input-group">
                      <label>Número do Cartão</label>
                      <input
                        type="text"
                        maxLength="19"
                        value={cardData.cardNumber}
                        onChange={(e) =>
                          setCardData({ ...cardData, cardNumber: e.target.value })
                        }
                        className={errors.cardNumber ? 'input-error' : ''}
                      />
                      {errors.cardNumber && (
                        <span className="error-text">{errors.cardNumber}</span>
                      )}
                    </div>
                    <div className="input-group">
                      <label>Nome Impresso no Cartão</label>
                      <input
                        type="text"
                        value={cardData.cardHolder}
                        onChange={(e) =>
                          setCardData({ ...cardData, cardHolder: e.target.value })
                        }
                        className={errors.cardHolder ? 'input-error' : ''}
                      />
                      {errors.cardHolder && (
                        <span className="error-text">{errors.cardHolder}</span>
                      )}
                    </div>
                  </div>
                  <div className="row-inputs">
                    <div className="input-group">
                      <label>Validade (MM/AA)</label>
                      <input
                        type="text"
                        maxLength="5"
                        value={cardData.cardExpiry}
                        onChange={(e) =>
                          setCardData({ ...cardData, cardExpiry: e.target.value })
                        }
                        className={errors.cardExpiry ? 'input-error' : ''}
                      />
                      {errors.cardExpiry && (
                        <span className="error-text">{errors.cardExpiry}</span>
                      )}
                    </div>
                    <div className="input-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        maxLength="4"
                        value={cardData.cardCvv}
                        onChange={(e) =>
                          setCardData({ ...cardData, cardCvv: e.target.value })
                        }
                        className={errors.cardCvv ? 'input-error' : ''}
                      />
                      {errors.cardCvv && (
                        <span className="error-text">{errors.cardCvv}</span>
                      )}
                    </div>
                    <div className="input-group">
                      <label>Parcelamento</label>
                      <select
                        className="qty-select"
                        style={{ height: '46px' }}
                        value={cardData.installments}
                        onChange={(e) =>
                          setCardData({
                            ...cardData,
                            installments: Number(e.target.value),
                          })
                        }
                      >
                        <option value={1}>
                          1x de R$ {totalValue.toFixed(2).replace('.', ',')} sem juros
                        </option>
                        <option value={2}>
                          2x de R$ {(totalValue / 2).toFixed(2).replace('.', ',')} sem juros
                        </option>
                        <option value={3}>
                          3x de R$ {(totalValue / 3).toFixed(2).replace('.', ',')} sem juros
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <label
                className={`payment-card ${paymentMethod === 'boleto' ? 'selected' : ''}`}
              >
                <div className="pay-radio">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'boleto'}
                    onChange={() => setPaymentMethod('boleto')}
                  />
                  <Icon path={mdiBarcode} size={1} />
                  <span>Boleto Bancário Registrado (Vencimento em 3 dias úteis)</span>
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
              <span>Desconto {couponCode ? `(${couponCode})` : ''}</span>
              <span>- R$ {discountValue.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Frete ({shippingMethod})</span>
            <span>
              {freightValue === 0
                ? 'Grátis'
                : `R$ ${freightValue.toFixed(2).replace('.', ',')}`}
            </span>
          </div>
          <div className="line-sep" style={{ margin: '16px 0' }}></div>
          <div className="summary-total">
            <span>Total a Pagar</span>
            <span>R$ {totalValue.toFixed(2).replace('.', ',')}</span>
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-2"
            style={{ padding: '16px' }}
            disabled={processing}
          >
            {processing ? 'Processando Pagamento...' : 'Confirmar Pagamento'}{' '}
            <Icon path={mdiCheckBold} size={0.8} />
          </button>
        </aside>
      </form>
    </div>
  );
}
