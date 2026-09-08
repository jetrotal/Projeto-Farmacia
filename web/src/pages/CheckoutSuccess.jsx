import { useEffect } from 'react';
import Icon from '../components/Icon';
import { mdiCheckBold, mdiArrowRight } from '@mdi/js';
import { useNavigation } from '../contexts/NavigationContext';
import { useCart } from '../contexts/CartContext';

export default function CheckoutSuccess() {
  const { navigate } = useNavigation();
  const { clearCart } = useCart();
  const orderNumber = Math.floor(Math.random() * 1000000000);

  // Assim que entra na página de sucesso, esvaziamos o carrinho local e da API.
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="page-checkout-success">
      <div className="info-card" style={{ padding: '80px 40px', maxWidth: '600px' }}>
        <div className="success-icon-circle">
          <Icon path={mdiCheckBold} size={2} color="#26B394" />
        </div>
        <h1 className="info-title" style={{ marginBottom: '16px' }}>Pedido Confirmado!</h1>
        <p className="info-content" style={{ textAlign: 'center', marginBottom: '8px' }}>
          Obrigado por comprar com a FARMARCIA. Cuidamos do seu pedido com muito carinho.
        </p>
        <p className="info-content" style={{ textAlign: 'center', fontWeight: '700', marginBottom: '32px' }}>
          Número do Pedido: #{orderNumber}
        </p>
        
        <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => navigate('home')}>
          Continuar Comprando <Icon path={mdiArrowRight} size={0.8} />
        </button>
      </div>
    </div>
  );
}
