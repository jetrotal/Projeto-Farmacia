import Icon from '../components/Icon';
import { mdiCheckBold, mdiArrowRight, mdiTruckDeliveryOutline } from '@mdi/js';
import { useNavigation } from '../contexts/NavigationContext';
import { useToast } from '../contexts/ToastContext';

export default function CheckoutSuccess() {
  const { navigate, route } = useNavigation();
  const { showToast } = useToast();

  const orderNumber =
    route.params?.orderNumber || Math.floor(100000000 + Math.random() * 900000000);
  const trackingCode = route.params?.trackingCode || 'BR984512301FM';
  const pixCopyPaste = route.params?.pixCopyPaste || '';
  const digitableLine = route.params?.digitableLine || '';

  const copyText = (txt, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt);
      showToast(`${label} copiado para a área de transferência!`, 'success');
    }
  };

  return (
    <div className="page-checkout-success">
      <div className="info-card" style={{ padding: '56px 40px', maxWidth: '640px' }}>
        <div className="success-icon-circle">
          <Icon path={mdiCheckBold} size={2} color="#26B394" />
        </div>
        <h1 className="info-title" style={{ marginBottom: '12px' }}>
          Pedido Confirmado!
        </h1>
        <p className="info-content" style={{ textAlign: 'center', marginBottom: '8px' }}>
          Obrigado por comprar com a FARMARCIA. Seu pedido já foi registrado no banco de dados e
          está sendo preparado com todo o carinho.
        </p>
        <p
          className="info-content"
          style={{ textAlign: 'center', fontWeight: '800', color: 'var(--c-dark)' }}
        >
          Número do Pedido: #{orderNumber} • Rastreio: {trackingCode}
        </p>

        {pixCopyPaste && (
          <div
            style={{
              margin: '20px 0',
              padding: '16px',
              background: '#EFFFFC',
              border: '1px solid var(--c-green)',
              borderRadius: '14px',
              textAlign: 'left',
            }}
          >
            <strong style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              PIX Copia e Cola (Aprovação Imediata):
            </strong>
            <code
              style={{
                display: 'block',
                fontSize: '11px',
                wordBreak: 'break-all',
                background: '#fff',
                padding: '8px',
                borderRadius: '8px',
                marginBottom: '8px',
              }}
            >
              {pixCopyPaste}
            </code>
            <button
              type="button"
              className="btn-outline"
              style={{ padding: '6px 14px', fontSize: '12px' }}
              onClick={() => copyText(pixCopyPaste, 'Código PIX')}
            >
              Copiar Código PIX
            </button>
          </div>
        )}

        {digitableLine && (
          <div
            style={{
              margin: '20px 0',
              padding: '16px',
              background: '#F5F8F9',
              border: '1px solid var(--c-light)',
              borderRadius: '14px',
              textAlign: 'left',
            }}
          >
            <strong style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              Linha Digitável do Boleto:
            </strong>
            <code style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>
              {digitableLine}
            </code>
            <button
              type="button"
              className="btn-outline"
              style={{ padding: '6px 14px', fontSize: '12px' }}
              onClick={() => copyText(digitableLine, 'Linha digitável')}
            >
              Copiar Boleto
            </button>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginTop: '28px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('profile', { tab: 'orders' })}
          >
            <Icon path={mdiTruckDeliveryOutline} size={0.8} /> Acompanhar Pedido
          </button>
          <button type="button" className="btn-outline" onClick={() => navigate('home')}>
            Continuar Comprando <Icon path={mdiArrowRight} size={0.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
