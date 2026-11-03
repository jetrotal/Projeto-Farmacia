import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, Category, Brand, Review } from '../products/product.entity';
import { User, Address } from '../auth/user.entity';
import { hashPassword } from '../auth/auth.service';
import { Testimonial } from '../testimonials/testimonial.entity';
import { Order, Coupon, Banner, PageContent } from '../orders/order.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
    @InjectRepository(Testimonial) private testimonialRepo: Repository<Testimonial>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Coupon) private couponRepo: Repository<Coupon>,
    @InjectRepository(Banner) private bannerRepo: Repository<Banner>,
    @InjectRepository(PageContent) private pageRepo: Repository<PageContent>,
  ) {}

  async onModuleInit() {
    const count = await this.productRepo.count();
    if (count > 0) return;

    // 1. Semeando Usuários com senhas criptografadas (scrypt + salt)
    const savedUsers = await this.userRepo.save([
      {
        name: 'Dra. Márcia Souza (Admin)',
        email: 'admin@farmarcia.com.br',
        password: hashPassword('Farmarcia@Admin2026'),
        role: 'ADMIN',
        cpf: '111.222.333-44',
        phone: '(11) 99999-0001',
        isBlocked: false,
      },
      {
        name: 'Cliente Farmarcia',
        email: 'cliente@farmarcia.com.br',
        password: hashPassword('Cliente@2026'),
        role: 'CUSTOMER',
        cpf: '222.333.444-55',
        phone: '(11) 98888-7777',
        isBlocked: false,
      },
      {
        name: 'Juliana Mendes',
        email: 'juliana@email.com.br',
        password: hashPassword('Juliana@2026'),
        role: 'CUSTOMER',
        cpf: '333.444.555-66',
        phone: '(11) 97777-6666',
        isBlocked: false,
      },
    ]);

    const customer = savedUsers[1];

    // 2. Endereços Múltiplos do Cliente ("Casa", "Trabalho")
    await this.addressRepo.save([
      {
        userId: customer.id,
        label: 'Casa',
        cep: '01310-100',
        rua: 'Av. Paulista',
        numero: '1578',
        complemento: 'Apto 82',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        isDefault: true,
      },
      {
        userId: customer.id,
        label: 'Trabalho',
        cep: '04538-133',
        rua: 'Av. Brigadeiro Faria Lima',
        numero: '3477',
        complemento: '12º Andar',
        bairro: 'Itaim Bibi',
        cidade: 'São Paulo',
        estado: 'SP',
        isDefault: false,
      },
    ]);

    // 3. Categorias no Banco de Dados
    await this.categoryRepo.save([
      { name: 'Medicamentos', icon: 'mdiPill', showOnHome: true },
      { name: 'Dermocosméticos', icon: 'mdiStarFourPointsOutline', showOnHome: true },
      { name: 'Vitaminas', icon: 'mdiApple', showOnHome: true },
      { name: 'Higiene Pessoal', icon: 'mdiWaterOutline', showOnHome: true },
      { name: 'Bebê', icon: 'mdiBabyCarriage', showOnHome: true },
      { name: 'Bem-estar', icon: 'mdiHeartOutline', showOnHome: true },
    ]);

    // 4. Marcas no Banco de Dados
    await this.brandRepo.save([
      { name: 'La Roche-Posay' },
      { name: 'EMS Genéricos' },
      { name: 'CeraVe' },
      { name: 'Huggies' },
      { name: 'Bayer' },
      { name: 'Neosaldina' },
      { name: 'Protex' },
      { name: 'Vichy' },
    ]);

    // 5. Fotos reais de estúdio dos produtos
    const INITIAL_PRODUCTS = [
      {
        image: '/assets/products/anthelios-fps60.png',
        discount: '-20% OFF',
        brand: 'La Roche-Posay',
        name: 'Anthelios FPS 60 Protetor Solar Facial 40g',
        description:
          'Protetor solar facial com altíssima proteção UVA/UVB, toque seco antioleosidade e resistência à água. Indicado para peles oleosas e sensíveis.',
        rating: 5,
        reviews: 42,
        oldPrice: 'R$ 89,90',
        price: 'R$ 71,90',
        priceValue: 71.9,
        installment: '2x de R$ 35,95',
        category: 'Dermocosméticos',
        stock: 30,
        weightKg: 0.15,
        sku: 'LRP-ANT60',
      },
      {
        image: '/assets/products/dipirona-500mg.png',
        discount: '-65% OFF',
        brand: 'EMS Genéricos',
        name: 'Dipirona Monoidratada 500mg 10 comprimidos',
        description:
          'Analgésico e antitérmico indicado para alívio rápido de dores de cabeça, dores musculares e estados febris. Medicamento genérico de confiança.',
        rating: 5,
        reviews: 128,
        oldPrice: 'R$ 10,90',
        price: 'R$ 3,80',
        priceValue: 3.8,
        installment: '1x de R$ 3,80',
        category: 'Medicamentos',
        stock: 85,
        weightKg: 0.05,
        sku: 'EMS-DIP500',
      },
      {
        image: '/assets/products/redoxon-vitamina-c.png',
        discount: '-25% OFF',
        brand: 'Bayer',
        name: 'Redoxon Vitamina C 1g Laranja 10 Efervescentes',
        description:
          'Suplemento vitamínico efervescente com 1g de Vitamina C pura que auxilia no funcionamento do sistema imune com delicioso sabor laranja.',
        rating: 4,
        reviews: 15,
        oldPrice: 'R$ 32,90',
        price: 'R$ 24,60',
        priceValue: 24.6,
        installment: '1x de R$ 24,60',
        category: 'Vitaminas',
        stock: 40,
        weightKg: 0.18,
        sku: 'BAY-RED1G',
      },
      {
        image: '/assets/products/fralda-huggies-supreme.png',
        discount: '-18% OFF',
        brand: 'Huggies',
        name: 'Fralda Huggies Supreme Care M 36 Unidades',
        description:
          'Máxima proteção e maciez para a pele do bebê com canais de absorção Xtra-Flex que distribuem o fluxo rapidamente.',
        rating: 5,
        reviews: 310,
        oldPrice: 'R$ 89,90',
        price: 'R$ 73,70',
        priceValue: 73.7,
        installment: '2x de R$ 36,85',
        category: 'Bebê',
        stock: 22,
        weightKg: 0.85,
        sku: 'HUG-SUPM',
      },
      {
        image: '/assets/products/cerave-locao-200ml.png',
        discount: '-10% OFF',
        brand: 'CeraVe',
        name: 'Loção Hidratante Corporal CeraVe 200ml',
        description:
          'Desenvolvida com dermatologistas, combina 3 ceramidas essenciais e ácido hialurônico com tecnologia MVE de hidratação por 24 horas.',
        rating: 5,
        reviews: 89,
        oldPrice: 'R$ 55,00',
        price: 'R$ 49,50',
        priceValue: 49.5,
        installment: '1x de R$ 49,50',
        category: 'Dermocosméticos',
        stock: 18,
        weightKg: 0.25,
        sku: 'CRV-LOC200',
      },
      {
        image: '/assets/products/neosaldina-30-drageas.png',
        discount: '-15% OFF',
        brand: 'Neosaldina',
        name: 'Neosaldina 30 Drágeas Analgésico',
        description:
          'Atua no alívio de diferentes tipos de dor de cabeça e enxaqueca com início de ação a partir de 15 minutos.',
        rating: 4,
        reviews: 210,
        oldPrice: 'R$ 25,00',
        price: 'R$ 21,25',
        priceValue: 21.25,
        installment: '1x de R$ 21,25',
        category: 'Medicamentos',
        stock: 50,
        weightKg: 0.08,
        sku: 'NEO-30DRG',
      },
      {
        image: '/assets/products/protex-sabonete-liquido.png',
        discount: '-5% OFF',
        brand: 'Protex',
        name: 'Sabonete Líquido Antibacteriano Protex 250ml',
        description:
          'Elimina 99,9% das bactérias naturalmente com óleo de linhaça, fortalecendo a barreira natural de proteção da pele.',
        rating: 4,
        reviews: 45,
        oldPrice: 'R$ 15,00',
        price: 'R$ 14,25',
        priceValue: 14.25,
        installment: '1x de R$ 14,25',
        category: 'Higiene Pessoal',
        stock: 35,
        weightKg: 0.3,
        sku: 'PRT-SAB250',
      },
      {
        image: '/assets/products/vichy-mineral-89.png',
        discount: '-30% OFF',
        brand: 'Vichy',
        name: 'Vichy Minéral 89 Sérum Fortalecedor 50ml',
        description:
          'Concentrado fortalecedor e preenchedor com Ácido Hialurônico e 89% de Água Vulcânica Mineralizante de Vichy.',
        rating: 5,
        reviews: 520,
        oldPrice: 'R$ 199,90',
        price: 'R$ 139,90',
        priceValue: 139.9,
        installment: '3x de R$ 46,63',
        category: 'Dermocosméticos',
        stock: 0,
        weightKg: 0.22,
        sku: 'VIC-MIN89',
      },
    ];

    const savedProducts: Product[] = [];
    let id = 1;
    for (const p of INITIAL_PRODUCTS) {
      const product = this.productRepo.create({ ...p, isFeatured: id <= 4 });
      const sp = await this.productRepo.save(product);
      savedProducts.push(sp);
      id++;
    }

    // 6. Avaliações Verificadas Iniciais
    await this.reviewRepo.save([
      {
        productId: savedProducts[0].id,
        userId: customer.id,
        userName: customer.name,
        rating: 5,
        comment: 'Protetor maravilhoso! Deixa a pele bem sequinha o dia todo e chegou em 2 horas.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        productId: savedProducts[1].id,
        userId: customer.id,
        userName: customer.name,
        rating: 5,
        comment: 'Excelente preço no genérico da EMS e validade longa.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ]);

    // 7. Pedido Inicial para o Cliente
    const pastDate = new Date(Date.now() - 86400000 * 2).toISOString();
    await this.orderRepo.save([
      {
        orderNumber: '984512301',
        userId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        itemsJson: JSON.stringify([
          { ...savedProducts[0], qty: 1 },
          { ...savedProducts[1], qty: 2 },
        ]),
        addressJson: JSON.stringify({
          label: 'Casa',
          cep: '01310-100',
          rua: 'Av. Paulista',
          numero: '1578',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP',
        }),
        paymentMethod: 'pix',
        paymentDetailsJson: JSON.stringify({ gateway: 'MercadoPago PIX Instantâneo' }),
        subtotal: 79.5,
        discountValue: 7.95,
        freightValue: 15.9,
        shippingMethod: 'Expressa',
        totalValue: 87.45,
        couponCode: 'BOASVINDAS10',
        status: 'Em Transporte',
        trackingCode: 'BR482910394FM',
        timelineJson: JSON.stringify([
          {
            status: 'Aprovado',
            label: 'Pagamento Aprovado',
            description: 'Seu pagamento via PIX foi confirmado.',
            timestamp: pastDate,
            done: true,
          },
          {
            status: 'Separando em Estoque',
            label: 'Separando em Estoque',
            description: 'Produtos conferidos pela Dra. Márcia Souza.',
            timestamp: pastDate,
            done: true,
          },
          {
            status: 'Em Transporte',
            label: 'Em Transporte',
            description: 'Entregador a caminho do seu endereço.',
            timestamp: new Date().toISOString(),
            done: true,
          },
          {
            status: 'Entregue',
            label: 'Entregue',
            description: 'Pedido entregue no endereço do destinatário.',
            timestamp: null,
            done: false,
          },
        ]),
        createdAt: pastDate,
      },
    ]);

    // 8. Cupons Promocionais Reais
    await this.couponRepo.save([
      {
        code: 'BOASVINDAS10',
        discountPercent: 10,
        expiresAt: '2027-12-31',
        usageLimit: 500,
        usedCount: 12,
        active: true,
      },
      {
        code: 'VERAO20',
        discountPercent: 20,
        expiresAt: '2027-12-31',
        usageLimit: 100,
        usedCount: 5,
        active: true,
      },
      {
        code: 'VOLTA15',
        discountPercent: 15,
        expiresAt: '2027-12-31',
        usageLimit: 200,
        usedCount: 2,
        active: true,
      },
    ]);

    // 9. Banner Principal Editável (Hero)
    await this.bannerRepo.save({
      badgeText: '🏷️ CUPOM DE PRIMEIRA COMPRA: BOASVINDAS10',
      title: 'Sua saúde em boas mãos',
      subtitle:
        'Medicamentos, dermocosméticos e bem-estar com entrega rápida e a atenção de farmacêuticas de verdade. Cuidamos de você em cada detalhe.',
      ctaText: 'Ver ofertas',
      ctaSecondaryText: 'Falar com Farmacêutica',
      whatsappNumber: '5511999999999',
      imageUrl: '/assets/logo_farmarcia.png',
    });

    // 10. Páginas Institucionais (CMS)
    const now = new Date().toISOString();
    await this.pageRepo.save([
      {
        slug: 'central-de-ajuda',
        title: 'Central de Ajuda',
        content:
          'Bem-vindo à Central de Ajuda da FARMARCIA!\n\nNosso atendimento farmacêutico funciona todos os dias das 07h às 23h pelo Televendas 0800 555 1234 e pelo WhatsApp.\n\n• Dúvidas sobre medicamentos e posologia: fale diretamente com a Dra. Márcia Souza (CRF-SP 98765).\n• Rastreamento de pedidos: acesse "Minha Conta > Meus Pedidos" para acompanhar em tempo real cada etapa da entrega.\n• Cupons ativos: utilize BOASVINDAS10 (10% OFF) ou VERAO20 (20% OFF) no seu carrinho!',
        updatedAt: now,
      },
      {
        slug: 'como-comprar',
        title: 'Como Comprar',
        content:
          'Comprar na FARMARCIA é simples, rápido e 100% seguro:\n\n1. Busque seus produtos na barra de pesquisa inteligente (com autocomplete) ou navegue pelos Departamentos.\n2. Adicione os itens ao seu Carrinho (sincronizado automaticamente com sua conta).\n3. Calcule o frete com seu CEP (opções Expressa em até 4h, SEDEX ou PAC) e aplique seu cupom promocional.\n4. Escolha entre seus endereços salvos ("Casa", "Trabalho") e finalize com PIX, Cartão em até 3x sem juros ou Boleto.',
        updatedAt: now,
      },
      {
        slug: 'entregas-e-prazos',
        title: 'Entregas e Prazos',
        content:
          'Trabalhamos com três modalidades de entrega para atender sua urgência:\n\n• FARMARCIA Expressa (até 4 horas): entrega ultra-rápida por motoboy com embalagem térmica controlada.\n• Correios SEDEX: entrega expressa nacional entre 1 e 4 dias úteis.\n• Correios PAC / Melhor Envio: opção econômica para todo o Brasil.\n\nCompras acima de R$ 150,00 contam com FRETE GRÁTIS automático!',
        updatedAt: now,
      },
      {
        slug: 'trocas-e-devolucoes',
        title: 'Trocas e Devoluções',
        content:
          'Sua satisfação e segurança vêm em primeiro lugar:\n\n• Direito de Arrependimento: até 7 dias corridos após o recebimento para produtos lacrados.\n• Avarias no transporte: caso a embalagem apresente qualquer violação, recuse no ato ou solicite substituição imediata sem custo.\n• Nota Técnica ANVISA: medicamentos controlados ou termolábeis seguem normas sanitárias específicas.',
        updatedAt: now,
      },
      {
        slug: 'trabalhe-conosco',
        title: 'Trabalhe Conosco',
        content:
          'Quer fazer parte da farmácia que mais cresce com atendimento humanizado?\n\nTemos vagas abertas para Farmacêuticos(as) Clínicos, Atendentes, Desenvolvedores Fullstack e Parceiros Logísticos.\n\nEnvie seu currículo para talentos@farmarcia.com.br informando a vaga desejada no assunto.',
        updatedAt: now,
      },
    ]);

    // 11. Depoimentos com fotos reais dos clientes
    await this.testimonialRepo.save([
      {
        text: 'A entrega da FARMARCIA foi extremamente rápida! Em menos de 2 horas eu recebi os medicamentos em casa com todo o carinho e cuidado.',
        name: 'Juliana Mendes',
        subtitle: 'Cliente desde 2024',
        avatar: '/assets/avatars/juliana.png',
      },
      {
        text: 'Melhor preço em dermocosméticos e genéricos que eu já encontrei. O atendimento pelo WhatsApp também é impecável.',
        name: 'Carlos Alberto',
        subtitle: 'Cliente VIP',
        avatar: '/assets/avatars/carlos.png',
      },
    ]);
  }
}
