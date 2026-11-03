import { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import {
  mdiAccountEditOutline,
  mdiPackageVariantClosed,
  mdiMapMarkerMultipleOutline,
  mdiRefresh,
  mdiTrashCanOutline,
  mdiCheckCircle,
  mdiShieldCrownOutline,
} from '@mdi/js';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useToast } from '../contexts/ToastContext';
import { ApiService } from '../services/api';

export default function Profile() {
  const { user, updateUserSession, isAdmin } = useAuth();
  const { reorderItems } = useCart();
  const { navigate, route } = useNavigation();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(route.params?.tab || 'orders');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    cpf: user?.cpf || '',
    phone: user?.phone || '',
    password: '',
  });

  const [addrForm, setAddrForm] = useState({
    label: 'Casa',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: 'São Paulo',
    estado: 'SP',
    isDefault: false,
  });

  useEffect(() => {
    if (!user?.id) return;
    ApiService.getMyOrders()
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => {});
    ApiService.getProfile(user.id)
      .then((data) => {
        setProfileForm({
          name: data.name || '',
          email: data.email || '',
          cpf: data.cpf || '',
          phone: data.phone || '',
          password: '',
        });
        setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
      })
      .catch(() => {});
  }, [user?.id]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await ApiService.updateProfile(user.id, profileForm);
      updateUserSession(updated);
      setProfileForm((prev) => ({ ...prev, password: '' }));
      showToast('Seus dados de perfil foram atualizados com sucesso!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const updated = await ApiService.addAddress(user.id, addrForm);
      setAddresses(updated);
      setAddrForm({
        label: 'Trabalho',
        cep: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: 'São Paulo',
        estado: 'SP',
        isDefault: false,
      });
      showToast('Novo endereço salvo na sua conta!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const updated = await ApiService.deleteAddress(user.id, addressId);
      setAddresses(updated);
      showToast('Endereço removido.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReorder = async (orderId) => {
    const ok = await reorderItems(orderId);
    if (ok) navigate('cart');
  };

  return (
    <div className="page-cart-wrapper px-80">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 className="cart-title" style={{ marginBottom: '4px' }}>
            Olá, {user?.name}
          </h1>
          <p className="section-subtitle">
            Gerencie seus pedidos, rastreio em tempo real, dados pessoais e endereços salvos.
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('admin')}
          >
            <Icon path={mdiShieldCrownOutline} size={0.85} /> Abrir Painel Administrativo
          </button>
        )}
      </div>

      <div className="profile-tabs">
        <button
          type="button"
          className={`category-pill ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Icon path={mdiPackageVariantClosed} size={0.8} /> Meus Pedidos & Rastreio (
          {orders.length})
        </button>
        <button
          type="button"
          className={`category-pill ${activeTab === 'addresses' ? 'active' : ''}`}
          onClick={() => setActiveTab('addresses')}
        >
          <Icon path={mdiMapMarkerMultipleOutline} size={0.8} /> Meus Endereços (
          {addresses.length})
        </button>
        <button
          type="button"
          className={`category-pill ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          <Icon path={mdiAccountEditOutline} size={0.8} /> Editar Perfil & Senha
        </button>
      </div>

      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
          {orders.length === 0 ? (
            <div className="cart-items-panel" style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ marginBottom: '16px', color: 'var(--c-gray)' }}>
                Você ainda não realizou nenhum pedido.
              </p>
              <button
                type="button"
                className="btn-primary"
                style={{ margin: '0 auto' }}
                onClick={() => navigate('catalog')}
              >
                Começar a Comprar
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <span className="brand-text">PEDIDO #{order.orderNumber}</span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--c-dark)' }}>
                      Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR')} •
                      Rastreio: {order.trackingCode}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="status-pill">{order.status}</span>
                    <button
                      type="button"
                      className="btn-outline"
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                      onClick={() => handleReorder(order.id)}
                    >
                      <Icon path={mdiRefresh} size={0.75} /> Comprar Novamente
                    </button>
                  </div>
                </div>

                {/* Timeline Visual de Rastreio: Aprovado -> Separando em Estoque -> Em Transporte -> Entregue */}
                <div className="order-timeline">
                  {(order.timeline || []).map((step, idx) => (
                    <div
                      key={idx}
                      className={`timeline-step ${step.done ? 'done' : ''}`}
                    >
                      <div className="timeline-dot">
                        <Icon
                          path={mdiCheckCircle}
                          size={0.85}
                          color={step.done ? '#26B394' : '#c5d8da'}
                        />
                      </div>
                      <div className="timeline-info">
                        <strong>{step.label}</strong>
                        <span>{step.description}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-items-list">
                  {(order.items || []).map((it, idx) => (
                    <div
                      key={idx}
                      className="order-item-mini pointer"
                      onClick={() => navigate('product-detail', { id: it.id })}
                    >
                      <img src={it.image} alt={it.name} />
                      <div>
                        <strong>
                          {it.qty}x {it.name}
                        </strong>
                        <span>{it.price} cada • Clique para avaliar</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <span>
                    Entrega em: <strong>{order.address?.label || 'Endereço'}</strong> -{' '}
                    {order.address?.rua}, {order.address?.numero} ({order.address?.cep})
                  </span>
                  <strong style={{ fontSize: '18px', color: 'var(--c-green)' }}>
                    Total: R$ {Number(order.totalValue || 0).toFixed(2).replace('.', ',')}
                  </strong>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="cart-container" style={{ marginTop: '24px' }}>
          <div className="cart-items-panel">
            <h3 className="summary-title" style={{ marginBottom: '16px' }}>
              Endereços Cadastrados
            </h3>
            {addresses.length === 0 ? (
              <p style={{ color: 'var(--c-gray)' }}>Nenhum endereço salvo ainda.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      borderRadius: '14px',
                      border: '1px solid var(--c-light)',
                      background: '#F5F8F9',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--c-dark)', fontSize: '15px' }}>
                        {addr.label}{' '}
                        {addr.isDefault && (
                          <span
                            style={{
                              fontSize: '11px',
                              background: 'var(--c-green)',
                              color: '#fff',
                              padding: '2px 8px',
                              borderRadius: '8px',
                              marginLeft: '6px',
                            }}
                          >
                            Padrão
                          </span>
                        )}
                      </strong>
                      <p style={{ fontSize: '13px', color: 'var(--c-gray)', marginTop: '4px' }}>
                        {addr.rua}, {addr.numero} {addr.complemento && `- ${addr.complemento}`} •{' '}
                        {addr.bairro}, {addr.cidade}/{addr.estado} • CEP: {addr.cep}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-remove pointer"
                      onClick={() => handleDeleteAddress(addr.id)}
                    >
                      <Icon path={mdiTrashCanOutline} size={0.9} color="#D93D7B" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="cart-summary-panel" style={{ position: 'static' }}>
            <h3 className="summary-title">Adicionar Novo Endereço</h3>
            <form className="signup-form" onSubmit={handleAddAddress}>
              <div className="row-inputs">
                <div className="input-group">
                  <label>Identificação (Casa, Trabalho)</label>
                  <input
                    type="text"
                    required
                    value={addrForm.label}
                    onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>CEP</label>
                  <input
                    type="text"
                    required
                    maxLength="9"
                    placeholder="01310-100"
                    value={addrForm.cep}
                    onChange={(e) => setAddrForm({ ...addrForm, cep: e.target.value })}
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Rua / Avenida</label>
                <input
                  type="text"
                  required
                  value={addrForm.rua}
                  onChange={(e) => setAddrForm({ ...addrForm, rua: e.target.value })}
                />
              </div>
              <div className="row-inputs">
                <div className="input-group">
                  <label>Número</label>
                  <input
                    type="text"
                    required
                    value={addrForm.numero}
                    onChange={(e) => setAddrForm({ ...addrForm, numero: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Bairro</label>
                  <input
                    type="text"
                    required
                    value={addrForm.bairro}
                    onChange={(e) => setAddrForm({ ...addrForm, bairro: e.target.value })}
                  />
                </div>
              </div>
              <label className="custom-check">
                <input
                  type="checkbox"
                  checked={addrForm.isDefault}
                  onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                />
                Definir como endereço principal
              </label>
              <button type="submit" className="btn-primary w-full">
                Salvar Endereço
              </button>
            </form>
          </aside>
        </div>
      )}

      {activeTab === 'edit' && (
        <div
          className="cart-items-panel"
          style={{ maxWidth: '680px', marginTop: '24px' }}
        >
          <h3 className="summary-title" style={{ marginBottom: '16px' }}>
            Alterar Dados da Conta
          </h3>
          <form className="signup-form" onSubmit={handleSaveProfile}>
            <div className="input-group">
              <label>Nome Completo</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>E-mail</label>
              <input
                type="email"
                required
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </div>
            <div className="row-inputs">
              <div className="input-group">
                <label>CPF</label>
                <input
                  type="text"
                  value={profileForm.cpf}
                  onChange={(e) => setProfileForm({ ...profileForm, cpf: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Telefone</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="input-group">
              <label>Nova Senha (deixe em branco para manter a atual)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={profileForm.password}
                onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary">
              Salvar Alterações
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
