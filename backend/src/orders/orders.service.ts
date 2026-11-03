import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, Coupon, Banner, PageContent } from './order.entity';
import { Product, StockAlert } from '../products/product.entity';
import { User } from '../auth/user.entity';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Coupon)
    private couponRepo: Repository<Coupon>,
    @InjectRepository(Banner)
    private bannerRepo: Repository<Banner>,
    @InjectRepository(PageContent)
    private pageRepo: Repository<PageContent>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(StockAlert)
    private stockAlertRepo: Repository<StockAlert>,
    private cartService: CartService,
  ) {}

  private serializeOrder(order: Order) {
    return {
      ...order,
      items: JSON.parse(order.itemsJson || '[]'),
      address: JSON.parse(order.addressJson || '{}'),
      paymentDetails: order.paymentDetailsJson ? JSON.parse(order.paymentDetailsJson) : {},
      timeline: JSON.parse(order.timelineJson || '[]'),
    };
  }

  async createOrder(user: any, body: any) {
    const dbUser = await this.userRepo.findOne({ where: { id: Number(user.id) } });
    if (dbUser?.isBlocked) {
      throw new BadRequestException('Sua conta está bloqueada para novos pedidos.');
    }

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      throw new BadRequestException('O pedido precisa conter pelo menos 1 item.');
    }

    // Valida e subtrai estoque
    for (const item of items) {
      const prod = await this.productRepo.findOne({ where: { id: Number(item.id) } });
      if (!prod) {
        throw new BadRequestException(`Produto "${item.name}" não encontrado.`);
      }
      if (prod.stock < Number(item.qty)) {
        throw new BadRequestException(
          `Estoque insuficiente para "${prod.name}". Disponível: ${prod.stock} un.`,
        );
      }
    }

    for (const item of items) {
      const prod = await this.productRepo.findOne({ where: { id: Number(item.id) } });
      if (prod) {
        prod.stock = Math.max(0, prod.stock - Number(item.qty));
        await this.productRepo.save(prod);
      }
    }

    // Se aplicou cupom, incrementa uso
    if (body.couponCode) {
      const coupon = await this.couponRepo.findOne({
        where: { code: body.couponCode.toUpperCase() },
      });
      if (coupon) {
        coupon.usedCount += 1;
        await this.couponRepo.save(coupon);
      }
    }

    const now = new Date().toISOString();
    const orderNumber = `${Math.floor(100000000 + Math.random() * 900000000)}`;
    const trackingCode = `BR${Math.floor(100000000 + Math.random() * 900000000)}FM`;

    const initialTimeline = [
      {
        status: 'Aprovado',
        label: 'Pagamento Aprovado',
        description: 'Seu pagamento foi confirmado pela FARMARCIA.',
        timestamp: now,
        done: true,
      },
      {
        status: 'Separando em Estoque',
        label: 'Separando em Estoque',
        description: 'Nossa equipe farmacêutica está conferindo seus produtos.',
        timestamp: null,
        done: false,
      },
      {
        status: 'Em Transporte',
        label: 'Em Transporte',
        description: 'Pedido coletado pela transportadora expressa.',
        timestamp: null,
        done: false,
      },
      {
        status: 'Entregue',
        label: 'Entregue',
        description: 'Pedido entregue no endereço do destinatário.',
        timestamp: null,
        done: false,
      },
    ];

    const order = this.orderRepo.create({
      orderNumber,
      userId: Number(user.id),
      customerName: dbUser?.name || user.name || 'Cliente',
      customerEmail: dbUser?.email || user.email || '',
      itemsJson: JSON.stringify(items),
      addressJson: JSON.stringify(body.address || {}),
      paymentMethod: body.paymentMethod || 'pix',
      paymentDetailsJson: JSON.stringify(body.paymentDetails || {}),
      subtotal: Number(body.subtotal) || 0,
      discountValue: Number(body.discountValue) || 0,
      freightValue: Number(body.freightValue) || 0,
      shippingMethod: body.shippingMethod || 'Expressa',
      totalValue: Number(body.totalValue) || 0,
      couponCode: body.couponCode ? body.couponCode.toUpperCase() : '',
      status: 'Aprovado',
      trackingCode,
      timelineJson: JSON.stringify(initialTimeline),
      createdAt: now,
    });

    const saved = await this.orderRepo.save(order);
    await this.cartService.clearCart(user.id);

    return this.serializeOrder(saved);
  }

  async getMyOrders(userId: number) {
    const orders = await this.orderRepo.find({
      where: { userId: Number(userId) },
      order: { id: 'DESC' },
    });
    return orders.map((o) => this.serializeOrder(o));
  }

  async getAllOrders() {
    const orders = await this.orderRepo.find({ order: { id: 'DESC' } });
    return orders.map((o) => this.serializeOrder(o));
  }

  async updateOrderStatus(orderId: number, status: string) {
    const order = await this.orderRepo.findOne({ where: { id: Number(orderId) } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    const stepsOrder = [
      'Aprovado',
      'Separando em Estoque',
      'Em Transporte',
      'Entregue',
    ];
    const targetIdx = stepsOrder.indexOf(status);
    const now = new Date().toISOString();

    let timeline = JSON.parse(order.timelineJson || '[]');
    if (status === 'Cancelado') {
      // Devolve itens ao estoque se cancelar
      if (order.status !== 'Cancelado') {
        const items = JSON.parse(order.itemsJson || '[]');
        for (const it of items) {
          const prod = await this.productRepo.findOne({ where: { id: Number(it.id) } });
          if (prod) {
            prod.stock += Number(it.qty) || 1;
            await this.productRepo.save(prod);
          }
        }
      }
    } else if (targetIdx >= 0) {
      timeline = timeline.map((step: any, idx: number) => ({
        ...step,
        done: idx <= targetIdx,
        timestamp: idx <= targetIdx ? step.timestamp || now : null,
      }));
    }

    order.status = status;
    order.timelineJson = JSON.stringify(timeline);
    const saved = await this.orderRepo.save(order);
    return this.serializeOrder(saved);
  }

  async reorder(orderId: number, userId: number) {
    const order = await this.orderRepo.findOne({ where: { id: Number(orderId) } });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    const items = JSON.parse(order.itemsJson || '[]');
    for (const item of items) {
      try {
        await this.cartService.addToCart({ id: item.id }, userId, item.qty || 1);
      } catch {
        // Ignora se algum produto antigo estiver sem estoque
      }
    }
    return this.cartService.getCart(userId);
  }

  // Cupons Promocionais
  async getAllCoupons() {
    return this.couponRepo.find({ order: { id: 'DESC' } });
  }

  async createCoupon(body: any) {
    if (!body.code || !body.discountPercent) {
      throw new BadRequestException('Código e percentual de desconto são obrigatórios.');
    }
    const code = body.code.trim().toUpperCase();
    const existing = await this.couponRepo.findOne({ where: { code } });
    if (existing) {
      throw new BadRequestException('Já existe um cupom com este código.');
    }
    const coupon = this.couponRepo.create({
      code,
      discountPercent: Number(body.discountPercent),
      expiresAt:
        body.expiresAt ||
        new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      usageLimit: Number(body.usageLimit ?? 100),
      usedCount: 0,
      active: body.active !== undefined ? !!body.active : true,
    });
    await this.couponRepo.save(coupon);
    return this.getAllCoupons();
  }

  async deleteCoupon(id: number) {
    await this.couponRepo.delete({ id: Number(id) });
    return this.getAllCoupons();
  }

  async validateCoupon(codeInput: string) {
    if (!codeInput) throw new BadRequestException('Informe um código de cupom.');
    const code = codeInput.trim().toUpperCase();
    const coupon = await this.couponRepo.findOne({ where: { code } });

    if (!coupon || !coupon.active) {
      throw new BadRequestException('Cupom inválido ou inativo.');
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Este cupom atingiu o limite máximo de utilizações.');
    }
    const expDate = new Date(`${coupon.expiresAt}T23:59:59`);
    if (expDate.getTime() < Date.now()) {
      throw new BadRequestException('Este cupom já expirou.');
    }

    return {
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent / 100,
      discountLabel: `${coupon.discountPercent}% OFF`,
    };
  }

  // Cálculo de Frete (Simulação realista Correios / Melhor Envio + ViaCEP)
  async calculateShipping(cepInput: string, items: any[] = [], subtotal = 0) {
    const cleanCep = (cepInput || '').replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      throw new BadRequestException('Por favor, insira um CEP válido de 8 dígitos.');
    }

    const totalWeightKg =
      items.reduce(
        (acc, it) => acc + (Number(it.weightKg) || 0.25) * (Number(it.qty) || 1),
        0,
      ) || 0.5;

    const regionFactor = parseInt(cleanCep[0], 10) || 1;
    const isFreeEligible = Number(subtotal) > 150;

    const pacPrice = isFreeEligible
      ? 0
      : Number((12.9 + totalWeightKg * 3.5 + regionFactor * 0.9).toFixed(2));
    const sedexPrice = isFreeEligible
      ? 0
      : Number((18.9 + totalWeightKg * 5.2 + regionFactor * 1.3).toFixed(2));
    const expressaPrice = isFreeEligible ? 0 : 15.9;

    // Simula dados de endereço baseados na faixa de CEP caso ViaCEP não seja chamado no front
    const ufMap: Record<string, { cidade: string; estado: string; bairro: string; rua: string }> = {
      '0': { cidade: 'São Paulo', estado: 'SP', bairro: 'Jardins', rua: 'Av. Paulista' },
      '1': { cidade: 'Campinas', estado: 'SP', bairro: 'Cambuí', rua: 'Rua Coronel Quirino' },
      '2': { cidade: 'Rio de Janeiro', estado: 'RJ', bairro: 'Botafogo', rua: 'Rua Voluntários da Pátria' },
      '3': { cidade: 'Belo Horizonte', estado: 'MG', bairro: 'Savassi', rua: 'Av. do Contorno' },
      '4': { cidade: 'Salvador', estado: 'BA', bairro: 'Pituba', rua: 'Av. Paulo VI' },
      '5': { cidade: 'Recife', estado: 'PE', bairro: 'Boa Viagem', rua: 'Av. Boa Viagem' },
      '6': { cidade: 'Fortaleza', estado: 'CE', bairro: 'Aldeota', rua: 'Av. Santos Dumont' },
      '7': { cidade: 'Brasília', estado: 'DF', bairro: 'Asa Sul', rua: 'CLS 204 Bloco A' },
      '8': { cidade: 'Curitiba', estado: 'PR', bairro: 'Batel', rua: 'Av. do Batel' },
      '9': { cidade: 'Porto Alegre', estado: 'RS', bairro: 'Moinhos de Vento', rua: 'Rua Padre Chagas' },
    };
    const suggestedAddress = ufMap[cleanCep[0]] || ufMap['0'];

    return {
      cep: cleanCep,
      totalWeightKg: Number(totalWeightKg.toFixed(2)),
      isFreeShipping: isFreeEligible,
      suggestedAddress,
      options: [
        {
          id: 'expressa',
          name: 'FARMARCIA Expressa (Motoboy)',
          deadline: 'Até 4 horas',
          price: expressaPrice,
        },
        {
          id: 'sedex',
          name: 'Correios SEDEX',
          deadline: `${Math.max(1, Math.min(4, regionFactor))} dia(s) útil(eis)`,
          price: sedexPrice,
        },
        {
          id: 'pac',
          name: 'Correios PAC / Melhor Envio',
          deadline: `${Math.max(3, Math.min(8, regionFactor + 3))} dias úteis`,
          price: pacPrice,
        },
      ],
    };
  }

  // Gateway de Pagamento Sandbox (Stripe / Mercado Pago Simulator)
  async processPayment(body: any) {
    const method = body.paymentMethod || 'pix';
    const amount = Number(body.amount) || 0;

    if (method === 'card') {
      const cardNumber = (body.cardNumber || '').replace(/\D/g, '');
      if (cardNumber.length < 13) {
        throw new BadRequestException('Número do cartão inválido (mínimo 13 dígitos).');
      }
      if (!body.cardHolder || body.cardHolder.trim().length < 3) {
        throw new BadRequestException('Informe o nome impresso no cartão.');
      }
      if (!body.cardExpiry || !/^\d{2}\/\d{2}$/.test(body.cardExpiry)) {
        throw new BadRequestException('Validade do cartão inválida (use MM/AA).');
      }
      if (!body.cardCvv || String(body.cardCvv).length < 3) {
        throw new BadRequestException('CVV inválido.');
      }

      return {
        approved: true,
        gateway: 'MercadoPago/Stripe Sandbox',
        transactionId: `TXN_CARD_${Date.now()}`,
        method: 'card',
        installments: body.installments || 1,
        cardLast4: cardNumber.slice(-4),
        paidAt: new Date().toISOString(),
      };
    }

    if (method === 'boleto') {
      return {
        approved: true,
        gateway: 'MercadoPago Sandbox',
        transactionId: `TXN_BOL_${Date.now()}`,
        method: 'boleto',
        digitableLine: '34191.79001 01043.510047 91020.150008 8 967100000' + Math.round(amount * 100),
        paidAt: new Date().toISOString(),
      };
    }

    // PIX
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136farmarcia-pix-${Date.now()}520400005303986540${amount.toFixed(2)}5802BR5913FARMARCIA LTD6009SAO PAULO62070503***6304ABCD`;
    return {
      approved: true,
      gateway: 'MercadoPago PIX Instantâneo',
      transactionId: `TXN_PIX_${Date.now()}`,
      method: 'pix',
      pixCopyPaste: pixCode,
      paidAt: new Date().toISOString(),
    };
  }

  // Vitrine / Hero Banner
  async getBanner() {
    let banner = await this.bannerRepo.findOne({ where: {} });
    if (!banner) {
      banner = await this.bannerRepo.save(
        this.bannerRepo.create({
          badgeText: '🏷️ CUPOM DE PRIMEIRA COMPRA: BOASVINDAS10',
          title: 'Sua saúde em boas mãos',
          subtitle:
            'Medicamentos, dermocosméticos e bem-estar com entrega rápida e a atenção de farmacêuticas de verdade. Cuidamos de você em cada detalhe.',
          ctaText: 'Ver ofertas',
          ctaSecondaryText: 'Falar com Farmacêutica',
          whatsappNumber: '5511999999999',
          imageUrl: '/assets/logo_farmarcia.png',
        }),
      );
    }
    return banner;
  }

  async updateBanner(body: Partial<Banner>) {
    const banner = await this.getBanner();
    Object.assign(banner, body);
    return this.bannerRepo.save(banner);
  }

  // Páginas Institucionais (CMS)
  async getAllPages() {
    return this.pageRepo.find({ order: { id: 'ASC' } });
  }

  async getPageByTitleOrSlug(queryTitle: string) {
    const pages = await this.pageRepo.find();
    const normalized = (queryTitle || '').trim().toLowerCase();
    const found = pages.find(
      (p) =>
        p.title.toLowerCase() === normalized || p.slug.toLowerCase() === normalized,
    );
    if (found) return found;
    return {
      id: 0,
      slug: normalized,
      title: queryTitle || 'Página de Informação',
      content: `Bem-vindo à seção de ${queryTitle || 'Informação'} da FARMARCIA. Nosso time de farmacêuticas está sempre à disposição pelo televendas 0800 555 1234 e pelo WhatsApp para esclarecer qualquer dúvida com carinho e agilidade.`,
      updatedAt: new Date().toISOString(),
    };
  }

  async upsertPage(body: { id?: number; title: string; slug?: string; content: string }) {
    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-');

    let page = body.id
      ? await this.pageRepo.findOne({ where: { id: Number(body.id) } })
      : await this.pageRepo.findOne({ where: { slug } });

    if (page) {
      page.title = body.title || page.title;
      page.content = body.content;
      page.updatedAt = new Date().toISOString();
      await this.pageRepo.save(page);
    } else {
      page = this.pageRepo.create({
        slug,
        title: body.title,
        content: body.content,
        updatedAt: new Date().toISOString(),
      });
      await this.pageRepo.save(page);
    }
    return this.getAllPages();
  }

  // Dashboard Admin & Métricas + CRM
  async getAdminDashboardMetrics() {
    const orders = await this.getAllOrders();
    const products = await this.productRepo.find();
    const users = await this.userRepo.find();
    const stockAlerts = await this.stockAlertRepo.find();

    const validOrders = orders.filter((o) => o.status !== 'Cancelado');
    const monthlyRevenue = validOrders.reduce((acc, o) => acc + Number(o.totalValue || 0), 0);
    const averageTicket = validOrders.length > 0 ? monthlyRevenue / validOrders.length : 0;

    // Produtos mais vendidos
    const salesMap: Record<number, { id: number; name: string; brand: string; soldQty: number; revenue: number }> = {};
    for (const order of validOrders) {
      for (const item of order.items) {
        const id = Number(item.id);
        if (!salesMap[id]) {
          salesMap[id] = {
            id,
            name: item.name,
            brand: item.brand || '',
            soldQty: 0,
            revenue: 0,
          };
        }
        const q = Number(item.qty) || 1;
        salesMap[id].soldQty += q;
        salesMap[id].revenue += (Number(item.priceValue) || 0) * q;
      }
    }

    const topProducts = Object.values(salesMap)
      .sort((a, b) => b.soldQty - a.soldQty)
      .slice(0, 5);

    const statusCounts: Record<string, number> = {
      Aprovado: 0,
      'Separando em Estoque': 0,
      'Em Transporte': 0,
      Entregue: 0,
      Cancelado: 0,
    };
    for (const o of orders) {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }

    // CRM enriquecido com histórico financeiro de cada cliente
    const crmCustomers = users.map((u) => {
      const userOrders = validOrders.filter((o) => Number(o.userId) === Number(u.id));
      const totalSpent = userOrders.reduce((acc, o) => acc + Number(o.totalValue || 0), 0);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        cpf: u.cpf,
        phone: u.phone,
        role: u.role,
        isBlocked: !!u.isBlocked,
        ordersCount: userOrders.length,
        totalSpent,
        lastOrderDate: userOrders[0]?.createdAt || null,
      };
    });

    const outOfStockCount = products.filter((p) => p.stock <= 0).length;
    const lowStockProducts = products.filter((p) => p.stock <= 5);

    return {
      monthlyRevenue,
      averageTicket,
      totalOrders: orders.length,
      activeCustomers: users.filter((u) => u.role === 'CUSTOMER').length,
      outOfStockCount,
      pendingStockAlerts: stockAlerts.filter((a) => !a.notified).length,
      topProducts,
      statusCounts,
      lowStockProducts,
      crmCustomers,
    };
  }
}
