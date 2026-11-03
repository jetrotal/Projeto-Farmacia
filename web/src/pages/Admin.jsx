import { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import {
  mdiViewDashboardOutline,
  mdiPackageVariant,
  mdiShapeOutline,
  mdiClipboardListOutline,
  mdiTicketPercentOutline,
  mdiImageEditOutline,
  mdiAccountGroupOutline,
  mdiFileDocumentEditOutline,
  mdiPlus,
  mdiTrashCanOutline,
  mdiPencilOutline,
  mdiUpload,
  mdiEmailFastOutline,
} from '@mdi/js';
import { ApiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useNavigation } from '../contexts/NavigationContext';

export default function Admin() {
  const { showToast } = useToast();
  const { navigate } = useNavigation();

  const [activeSection, setActiveSection] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [banner, setBanner] = useState(null);
  const [pages, setPages] = useState([]);
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);

  // Forms
  const emptyProduct = {
    id: null,
    name: '',
    brand: 'La Roche-Posay',
    category: 'Dermocosméticos',
    description: '',
    priceValue: 49.9,
    oldPrice: 'R$ 69,90',
    discount: '-28% OFF',
    stock: 25,
    weightKg: 0.25,
    isFeatured: false,
    image: '/assets/logo_farmarcia.png',
  };
  const [productForm, setProductForm] = useState(emptyProduct);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercent: 20,
    expiresAt: '2027-12-31',
    usageLimit: 100,
  });
  const [selectedCmsPage, setSelectedCmsPage] = useState({
    id: null,
    title: 'Central de Ajuda',
    content: '',
  });

  const loadAllAdminData = async () => {
    try {
      const [
        mData,
        pData,
        cData,
        bData,
        oData,
        cpData,
        bnData,
        pgData,
        abData,
        saData,
      ] = await Promise.all([
        ApiService.getAdminMetrics(),
        ApiService.getCatalogProducts(),
        ApiService.getCategoriesFull(),
        ApiService.getBrandsFull(),
        ApiService.getAllOrders(),
        ApiService.getCoupons(),
        ApiService.getBanner(),
        ApiService.getPages(),
        ApiService.getAbandonedCarts(),
        ApiService.getStockAlerts(),
      ]);
      setMetrics(mData);
      setProducts(Array.isArray(pData) ? pData : []);
      setCategories(Array.isArray(cData) ? cData : []);
      setBrands(Array.isArray(bData) ? bData : []);
      setOrders(Array.isArray(oData) ? oData : []);
      setCoupons(Array.isArray(cpData) ? cpData : []);
      if (bnData) setBanner(bnData);
      if (Array.isArray(pgData) && pgData.length > 0) {
        setPages(pgData);
        if (!selectedCmsPage.content) setSelectedCmsPage(pgData[0]);
      }
      setAbandonedCarts(Array.isArray(abData) ? abData : []);
      setStockAlerts(Array.isArray(saData) ? saData : []);
    } catch (err) {
      showToast(err.message || 'Erro ao carregar dados administrativos.', 'error');
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Upload real de arquivo (converte para Base64 e envia ao endpoint POST /api/upload)
  const handleFileUpload = (e, onUploaded) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await ApiService.uploadImage(reader.result, file.name);
        onUploaded(res.url);
        showToast('Imagem enviada com sucesso!', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  // Produtos CRUD
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (productForm.id) {
        const res = await ApiService.updateProduct(productForm.id, productForm);
        if (res.notifiedAlerts > 0) {
          showToast(
            `Produto atualizado e ${res.notifiedAlerts} cliente(s) avisado(s) por e-mail da reposição!`,
            'success',
          );
        } else {
          showToast('Produto atualizado com sucesso!', 'success');
        }
      } else {
        await ApiService.createProduct(productForm);
        showToast('Novo produto cadastrado na loja!', 'success');
      }
      setProductForm(emptyProduct);
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleQuickStock = async (prod, delta) => {
    try {
      const newStock = Math.max(0, Number(prod.stock || 0) + delta);
      const res = await ApiService.updateProduct(prod.id, { stock: newStock });
      if (res.notifiedAlerts > 0) {
        showToast(
          `Estoque reposto (${newStock} un.)! ${res.notifiedAlerts} alerta(s) "Avise-me" disparado(s)!`,
          'success',
        );
      } else {
        showToast(`Estoque de "${prod.name}" atualizado para ${newStock} un.`, 'info');
      }
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await ApiService.deleteProduct(id);
      showToast('Produto excluído.', 'info');
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Categorias e Marcas CRUD
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await ApiService.createCategory({ name: newCategoryName, showOnHome: true });
      setNewCategoryName('');
      showToast('Categoria criada!', 'success');
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleCategoryHome = async (cat) => {
    try {
      await ApiService.updateCategory(cat.id, { showOnHome: !cat.showOnHome });
      showToast(`Visibilidade de "${cat.name}" na Home atualizada.`, 'info');
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    try {
      await ApiService.createBrand(newBrandName);
      setNewBrandName('');
      showToast('Marca cadastrada!', 'success');
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Pedidos Status
  const handleOrderStatusChange = async (orderId, status) => {
    try {
      await ApiService.updateOrderStatus(orderId, status);
      showToast(`Status do pedido atualizado para "${status}"!`, 'success');
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Cupons CRUD
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await ApiService.createCoupon(couponForm);
      setCouponForm({
        code: '',
        discountPercent: 15,
        expiresAt: '2027-12-31',
        usageLimit: 100,
      });
      showToast('Cupom promocional criado!', 'success');
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Banner Save
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      await ApiService.updateBanner(banner);
      showToast('Banner principal (Hero) atualizado na Home!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // CMS Save
  const handleSaveCmsPage = async (e) => {
    e.preventDefault();
    try {
      const updated = await ApiService.upsertPage(selectedCmsPage);
      setPages(updated);
      showToast(`Página "${selectedCmsPage.title}" publicada no CMS!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // CRM Block/Unblock
  const handleToggleBlockCustomer = async (customer) => {
    try {
      await ApiService.toggleBlockUser(customer.id, !customer.isBlocked);
      showToast(
        customer.isBlocked
          ? `Cliente ${customer.name} desbloqueado.`
          : `Cliente ${customer.name} bloqueado preventivamente.`,
        'info',
      );
      loadAllAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="brand-text" style={{ color: '#fff', fontSize: '18px' }}>
            GESTÃO FARMARCIA
          </span>
          <span style={{ fontSize: '11px', color: 'var(--c-light)' }}>
            Painel Administrativo • Dra. Márcia
          </span>
        </div>

        <nav className="admin-nav">
          <button
            type="button"
            className={`admin-nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <Icon path={mdiViewDashboardOutline} size={0.85} /> Dashboard & Métricas
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${activeSection === 'products' ? 'active' : ''}`}
            onClick={() => setActiveSection('products')}
          >
            <Icon path={mdiPackageVariant} size={0.85} /> Produtos & Estoque ({products.length})
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${activeSection === 'taxonomy' ? 'active' : ''}`}
            onClick={() => setActiveSection('taxonomy')}
          >
            <Icon path={mdiShapeOutline} size={0.85} /> Categorias & Marcas
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${activeSection === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveSection('orders')}
          >
            <Icon path={mdiClipboardListOutline} size={0.85} /> Gestão de Pedidos ({orders.length})
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${activeSection === 'coupons' ? 'active' : ''}`}
            onClick={() => setActiveSection('coupons')}
          >
            <Icon path={mdiTicketPercentOutline} size={0.85} /> Cupons Promocionais ({coupons.length})
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${activeSection === 'banner' ? 'active' : ''}`}
            onClick={() => setActiveSection('banner')}
          >
            <Icon path={mdiImageEditOutline} size={0.85} /> Vitrine & Hero Banner
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${activeSection === 'crm' ? 'active' : ''}`}
            onClick={() => setActiveSection('crm')}
          >
            <Icon path={mdiAccountGroupOutline} size={0.85} /> CRM Clientes & Carrinhos
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${activeSection === 'cms' ? 'active' : ''}`}
            onClick={() => setActiveSection('cms')}
          >
            <Icon path={mdiFileDocumentEditOutline} size={0.85} /> Páginas Institucionais (CMS)
          </button>
        </nav>
      </aside>

      <section className="admin-content">
        {/* 1. DASHBOARD & MÉTRICAS */}
        {activeSection === 'dashboard' && metrics && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h1 className="section-title">Dashboard & Indicadores</h1>
              <p className="section-subtitle">
                Visão geral em tempo real do faturamento, ticket médio, estoque e produtos mais
                vendidos.
              </p>
            </div>

            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <span>Faturamento Acumulado</span>
                <strong>
                  R$ {Number(metrics.monthlyRevenue || 0).toFixed(2).replace('.', ',')}
                </strong>
                <small>{metrics.totalOrders} pedido(s) registrados</small>
              </div>
              <div className="admin-kpi-card">
                <span>Ticket Médio</span>
                <strong>
                  R$ {Number(metrics.averageTicket || 0).toFixed(2).replace('.', ',')}
                </strong>
                <small>Valor médio por compra</small>
              </div>
              <div className="admin-kpi-card">
                <span>Clientes Cadastrados</span>
                <strong>{metrics.activeCustomers}</strong>
                <small>Contas ativas no CRM</small>
              </div>
              <div className="admin-kpi-card">
                <span>Produtos Esgotados</span>
                <strong style={{ color: metrics.outOfStockCount > 0 ? 'var(--c-pink)' : 'var(--c-green)' }}>
                  {metrics.outOfStockCount}
                </strong>
                <small>{metrics.pendingStockAlerts} alerta(s) &ldquo;Avise-me&rdquo; na fila</small>
              </div>
            </div>

            <div className="admin-charts-grid">
              <div className="admin-panel-box">
                <h3 className="summary-title">Produtos Mais Vendidos (Top 5)</h3>
                {(metrics.topProducts || []).length === 0 ? (
                  <p style={{ color: 'var(--c-gray)', fontSize: '13px' }}>
                    Nenhuma venda registrada ainda.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                    {metrics.topProducts.map((tp) => {
                      const maxQty = metrics.topProducts[0]?.soldQty || 1;
                      const pct = Math.min(100, Math.round((tp.soldQty / maxQty) * 100));
                      return (
                        <div key={tp.id}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '13px',
                              marginBottom: '4px',
                            }}
                          >
                            <strong>{tp.name}</strong>
                            <span>
                              {tp.soldQty} un. • R$ {tp.revenue.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                          <div className="chart-bar-bg">
                            <div className="chart-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="admin-panel-box">
                <h3 className="summary-title">Pedidos por Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                  {Object.entries(metrics.statusCounts || {}).map(([status, count]) => (
                    <div
                      key={status}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: '#F5F8F9',
                        borderRadius: '10px',
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>{status}</span>
                      <span className="status-pill">{count} pedido(s)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. CRUD DE PRODUTOS, ESTOQUE & UPLOAD */}
        {activeSection === 'products' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h1 className="section-title">Gestão de Produtos, Estoque e Imagens</h1>

            <div className="admin-panel-box">
              <h3 className="summary-title">
                {productForm.id ? `Editando Produto #${productForm.id}` : 'Cadastrar Novo Produto'}
              </h3>
              <form className="signup-form" onSubmit={handleSaveProduct}>
                <div className="row-inputs">
                  <div className="input-group">
                    <label>Nome do Produto *</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>Marca</label>
                    <select
                      className="qty-select"
                      style={{ height: '44px' }}
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Categoria</label>
                    <select
                      className="qty-select"
                      style={{ height: '44px' }}
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({ ...productForm, category: e.target.value })
                      }
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row-inputs">
                  <div className="input-group">
                    <label>Preço de Venda (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productForm.priceValue}
                      onChange={(e) =>
                        setProductForm({ ...productForm, priceValue: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Preço Antigo (Ex: R$ 89,90)</label>
                    <input
                      type="text"
                      value={productForm.oldPrice}
                      onChange={(e) =>
                        setProductForm({ ...productForm, oldPrice: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Selo Desconto (Ex: -25% OFF)</label>
                    <input
                      type="text"
                      value={productForm.discount}
                      onChange={(e) =>
                        setProductForm({ ...productForm, discount: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Quantidade em Estoque *</label>
                    <input
                      type="number"
                      required
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({ ...productForm, stock: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Descrição Detalhada</label>
                  <input
                    type="text"
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({ ...productForm, description: e.target.value })
                    }
                    placeholder="Indicações, princípios ativos e modo de uso..."
                  />
                </div>

                <div className="row-inputs" style={{ alignItems: 'center' }}>
                  <div className="input-group">
                    <label>Upload de Foto Real do Produto (ou URL)</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={productForm.image}
                        onChange={(e) =>
                          setProductForm({ ...productForm, image: e.target.value })
                        }
                      />
                      <label className="btn-outline pointer" style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        <Icon path={mdiUpload} size={0.75} /> Enviar Foto
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) =>
                            handleFileUpload(e, (url) =>
                              setProductForm((prev) => ({ ...prev, image: url })),
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                  <label className="custom-check" style={{ marginTop: '20px' }}>
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) =>
                        setProductForm({ ...productForm, isFeatured: e.target.checked })
                      }
                    />
                    Exibir em &ldquo;Ofertas em Destaque&rdquo; na Home
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn-primary">
                    <Icon path={mdiPlus} size={0.8} />{' '}
                    {productForm.id ? 'Salvar Alterações' : 'Cadastrar Produto'}
                  </button>
                  {productForm.id && (
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => setProductForm(emptyProduct)}
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-panel-box">
              <h3 className="summary-title">Catálogo & Controle de Estoque ({products.length})</h3>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Categoria / Marca</th>
                      <th>Preço</th>
                      <th>Estoque</th>
                      <th>Destaque</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                          <strong>{p.name}</strong>
                        </td>
                        <td>
                          {p.category} • <span style={{ color: 'var(--c-gray)' }}>{p.brand}</span>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--c-green)' }}>{p.price}</strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontWeight: 800,
                                color: p.stock <= 0 ? 'var(--c-pink)' : 'var(--c-dark)',
                              }}
                            >
                              {p.stock <= 0 ? 'ESGOTADO (0)' : `${p.stock} un.`}
                            </span>
                            <button
                              type="button"
                              className="coupon-btn"
                              style={{ padding: '2px 8px', fontSize: '11px' }}
                              onClick={() => handleQuickStock(p, 10)}
                              title="Repor +10 unidades"
                            >
                              +10
                            </button>
                            <button
                              type="button"
                              className="coupon-btn"
                              style={{ padding: '2px 8px', fontSize: '11px', background: 'var(--c-pink)' }}
                              onClick={() => handleQuickStock(p, -p.stock)}
                              title="Zerar estoque"
                            >
                              Zerar
                            </button>
                          </div>
                        </td>
                        <td>{p.isFeatured ? '★ Sim' : 'Não'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn-remove pointer"
                              onClick={() => setProductForm({ ...p })}
                              title="Editar"
                            >
                              <Icon path={mdiPencilOutline} size={0.8} color="#0A8399" />
                            </button>
                            <button
                              type="button"
                              className="btn-remove pointer"
                              onClick={() => handleDeleteProduct(p.id)}
                              title="Excluir"
                            >
                              <Icon path={mdiTrashCanOutline} size={0.8} color="#D93D7B" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {stockAlerts.length > 0 && (
              <div className="admin-panel-box">
                <h3 className="summary-title">
                  Solicitações &ldquo;Avise-me quando chegar&rdquo; ({stockAlerts.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  {stockAlerts.map((al) => (
                    <div
                      key={al.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: '#F5F8F9',
                        borderRadius: '10px',
                        fontSize: '13px',
                      }}
                    >
                      <span>
                        <strong>{al.productName}</strong> — Cliente: <code>{al.email}</code>
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          color: al.notified ? 'var(--c-green)' : 'var(--c-pink)',
                        }}
                      >
                        {al.notified
                          ? `E-mail enviado em ${new Date(al.notifiedAt).toLocaleTimeString('pt-BR')}`
                          : 'Aguardando reposição de estoque'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. CRUD DE CATEGORIAS E MARCAS */}
        {activeSection === 'taxonomy' && (
          <div className="admin-charts-grid">
            <div className="admin-panel-box">
              <h3 className="summary-title">Categorias ({categories.length})</h3>
              <form className="coupon-box" onSubmit={handleAddCategory}>
                <input
                  type="text"
                  required
                  placeholder="Nova categoria (ex: Ortopedia)"
                  className="coupon-input"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button type="submit" className="coupon-btn">
                  Adicionar
                </button>
              </form>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: '#F5F8F9',
                      borderRadius: '10px',
                    }}
                  >
                    <strong>{cat.name}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label className="custom-check" style={{ fontSize: '12px' }}>
                        <input
                          type="checkbox"
                          checked={cat.showOnHome !== false}
                          onChange={() => handleToggleCategoryHome(cat)}
                        />
                        Exibir na Home
                      </label>
                      <button
                        type="button"
                        className="btn-remove pointer"
                        onClick={async () => {
                          await ApiService.deleteCategory(cat.id);
                          loadAllAdminData();
                        }}
                      >
                        <Icon path={mdiTrashCanOutline} size={0.8} color="#D93D7B" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-panel-box">
              <h3 className="summary-title">Marcas ({brands.length})</h3>
              <form className="coupon-box" onSubmit={handleAddBrand}>
                <input
                  type="text"
                  required
                  placeholder="Nova marca (ex: Mantecorp)"
                  className="coupon-input"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                />
                <button type="submit" className="coupon-btn">
                  Adicionar
                </button>
              </form>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                {brands.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: '#F5F8F9',
                      borderRadius: '10px',
                    }}
                  >
                    <strong>{b.name}</strong>
                    <button
                      type="button"
                      className="btn-remove pointer"
                      onClick={async () => {
                        await ApiService.deleteBrand(b.id);
                        loadAllAdminData();
                      }}
                    >
                      <Icon path={mdiTrashCanOutline} size={0.8} color="#D93D7B" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. GESTÃO DE PEDIDOS */}
        {activeSection === 'orders' && (
          <div className="admin-panel-box">
            <h2 className="summary-title" style={{ fontSize: '22px', marginBottom: '16px' }}>
              Gestão de Pedidos e Status de Entrega ({orders.length})
            </h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nº Pedido</th>
                    <th>Cliente</th>
                    <th>Itens</th>
                    <th>Total</th>
                    <th>Status / Atualizar Rastreio</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <strong>#{o.orderNumber}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--c-gray)' }}>
                          {new Date(o.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td>
                        <strong>{o.customerName}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--c-gray)' }}>
                          {o.customerEmail}
                        </div>
                      </td>
                      <td>
                        {(o.items || []).map((it, idx) => (
                          <div key={idx} style={{ fontSize: '12px' }}>
                            {it.qty}x {it.name}
                          </div>
                        ))}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--c-green)' }}>
                          R$ {Number(o.totalValue || 0).toFixed(2).replace('.', ',')}
                        </strong>
                      </td>
                      <td>
                        <select
                          className="qty-select"
                          value={o.status}
                          onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                        >
                          <option value="Aprovado">Aprovado</option>
                          <option value="Separando em Estoque">Separando em Estoque</option>
                          <option value="Em Transporte">Em Transporte</option>
                          <option value="Entregue">Entregue</option>
                          <option value="Cancelado">Cancelado (Estornar Estoque)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. GESTÃO DE CUPONS PROMOCIONAIS */}
        {activeSection === 'coupons' && (
          <div className="admin-charts-grid">
            <div className="admin-panel-box">
              <h3 className="summary-title">Criar Cupom Promocional</h3>
              <form className="signup-form" onSubmit={handleCreateCoupon}>
                <div className="input-group">
                  <label>Código do Cupom (Ex: INVERNO25)</label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
                    }
                    placeholder="VERAO20"
                  />
                </div>
                <div className="row-inputs">
                  <div className="input-group">
                    <label>Desconto (%)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="90"
                      value={couponForm.discountPercent}
                      onChange={(e) =>
                        setCouponForm({ ...couponForm, discountPercent: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Limite de Usos</label>
                    <input
                      type="number"
                      required
                      value={couponForm.usageLimit}
                      onChange={(e) =>
                        setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Válido Até</label>
                  <input
                    type="date"
                    required
                    value={couponForm.expiresAt}
                    onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Criar Cupom
                </button>
              </form>
            </div>

            <div className="admin-panel-box">
              <h3 className="summary-title">Cupons Ativos ({coupons.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                {coupons.map((cp) => (
                  <div
                    key={cp.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px',
                      background: '#F5F8F9',
                      borderRadius: '12px',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--c-dark)', fontSize: '16px' }}>
                        {cp.code} ({cp.discountPercent}% OFF)
                      </strong>
                      <div style={{ fontSize: '12px', color: 'var(--c-gray)' }}>
                        Usos: {cp.usedCount}/{cp.usageLimit} • Expira em: {cp.expiresAt}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-remove pointer"
                      onClick={async () => {
                        await ApiService.deleteCoupon(cp.id);
                        loadAllAdminData();
                      }}
                    >
                      <Icon path={mdiTrashCanOutline} size={0.85} color="#D93D7B" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. GESTÃO DE VITRINE / BANNERS (HERO) */}
        {activeSection === 'banner' && banner && (
          <div className="admin-panel-box" style={{ maxWidth: '760px' }}>
            <h3 className="summary-title">Personalizar Banner Principal (Hero da Home)</h3>
            <form className="signup-form" onSubmit={handleSaveBanner}>
              <div className="input-group">
                <label>Selo Superior (Badge)</label>
                <input
                  type="text"
                  value={banner.badgeText}
                  onChange={(e) => setBanner({ ...banner, badgeText: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Título Principal (H1)</label>
                <input
                  type="text"
                  value={banner.title}
                  onChange={(e) => setBanner({ ...banner, title: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Subtítulo</label>
                <input
                  type="text"
                  value={banner.subtitle}
                  onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })}
                />
              </div>
              <div className="row-inputs">
                <div className="input-group">
                  <label>Texto Botão Principal</label>
                  <input
                    type="text"
                    value={banner.ctaText}
                    onChange={(e) => setBanner({ ...banner, ctaText: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>WhatsApp Farmacêutica</label>
                  <input
                    type="text"
                    value={banner.whatsappNumber}
                    onChange={(e) => setBanner({ ...banner, whatsappNumber: e.target.value })}
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Imagem do Mascote / Banner</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={banner.imageUrl}
                    onChange={(e) => setBanner({ ...banner, imageUrl: e.target.value })}
                  />
                  <label className="btn-outline pointer" style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    <Icon path={mdiUpload} size={0.75} /> Enviar Imagem
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) =>
                        handleFileUpload(e, (url) => setBanner((prev) => ({ ...prev, imageUrl: url })))
                      }
                    />
                  </label>
                </div>
              </div>
              <button type="submit" className="btn-primary">
                Publicar Alterações na Vitrine
              </button>
            </form>
          </div>
        )}

        {/* 7. CRM DE CLIENTES & CARRINHOS ABANDONADOS */}
        {activeSection === 'crm' && metrics && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="admin-panel-box">
              <h3 className="summary-title">
                CRM de Clientes e Histórico Financeiro ({(metrics.crmCustomers || []).length})
              </h3>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nome / E-mail</th>
                      <th>CPF / Telefone</th>
                      <th>Perfil</th>
                      <th>Pedidos</th>
                      <th>Total Gasto (LTV)</th>
                      <th>Status / Bloqueio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(metrics.crmCustomers || []).map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.name}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--c-gray)' }}>{c.email}</div>
                        </td>
                        <td>
                          {c.cpf || '—'} • {c.phone || '—'}
                        </td>
                        <td>
                          <span className="status-pill">{c.role}</span>
                        </td>
                        <td>{c.ordersCount} pedido(s)</td>
                        <td>
                          <strong style={{ color: 'var(--c-green)' }}>
                            R$ {Number(c.totalSpent || 0).toFixed(2).replace('.', ',')}
                          </strong>
                        </td>
                        <td>
                          {c.role === 'ADMIN' ? (
                            <span style={{ fontSize: '12px', color: 'var(--c-gray)' }}>
                              Protegido
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="coupon-btn"
                              style={{
                                padding: '6px 12px',
                                background: c.isBlocked ? 'var(--c-green)' : 'var(--c-pink)',
                              }}
                              onClick={() => handleToggleBlockCustomer(c)}
                            >
                              {c.isBlocked ? 'Desbloquear Conta' : 'Bloquear Usuário'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-panel-box">
              <h3 className="summary-title">
                Recuperação de Carrinhos Abandonados ({abandonedCarts.length})
              </h3>
              {abandonedCarts.length === 0 ? (
                <p style={{ color: 'var(--c-gray)', fontSize: '13px' }}>
                  Nenhum carrinho ativo/abandonado no momento.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                  {abandonedCarts.map((ac) => (
                    <div
                      key={ac.key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '14px',
                        background: '#F5F8F9',
                        borderRadius: '12px',
                      }}
                    >
                      <div>
                        <strong>
                          {ac.userName} ({ac.userEmail})
                        </strong>
                        <div style={{ fontSize: '12px', color: 'var(--c-gray)' }}>
                          {ac.items.length} produto(s) • Valor: R${' '}
                          {ac.total.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                        onClick={async () => {
                          const res = await ApiService.notifyAbandonedCart(ac.userId);
                          showToast(res.message, 'success');
                          loadAllAdminData();
                        }}
                      >
                        <Icon path={mdiEmailFastOutline} size={0.75} /> Disparar E-mail Cupom VOLTA15
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. PÁGINAS INSTITUCIONAIS (CMS) */}
        {activeSection === 'cms' && (
          <div className="admin-panel-box">
            <h3 className="summary-title">Editor de Páginas Institucionais (CMS)</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '12px 0 20px' }}>
              {pages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`category-pill ${selectedCmsPage.title === p.title ? 'active' : ''}`}
                  style={{ padding: '8px 16px', fontSize: '12px' }}
                  onClick={() => setSelectedCmsPage(p)}
                >
                  {p.title}
                </button>
              ))}
            </div>

            <form className="signup-form" onSubmit={handleSaveCmsPage}>
              <div className="input-group">
                <label>Título da Página</label>
                <input
                  type="text"
                  required
                  value={selectedCmsPage.title}
                  onChange={(e) =>
                    setSelectedCmsPage({ ...selectedCmsPage, title: e.target.value })
                  }
                />
              </div>
              <div className="input-group">
                <label>Conteúdo da Página</label>
                <textarea
                  rows={8}
                  required
                  className="cms-textarea"
                  value={selectedCmsPage.content}
                  onChange={(e) =>
                    setSelectedCmsPage({ ...selectedCmsPage, content: e.target.value })
                  }
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn-primary">
                  Salvar Página no Banco de Dados
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => navigate('info', { title: selectedCmsPage.title })}
                >
                  Visualizar Página no Site
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
