import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, Category, Brand, Review, StockAlert } from './product.entity';
import { Order } from '../orders/order.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Brand)
    private brandRepo: Repository<Brand>,
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(StockAlert)
    private stockAlertRepo: Repository<StockAlert>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  private formatBRL(val: number): string {
    return `R$ ${Number(val).toFixed(2).replace('.', ',')}`;
  }

  async findFeatured() {
    return this.productRepo.find({ where: { isFeatured: true }, take: 8 });
  }

  async findCategories(onlyHome = false) {
    const where = onlyHome ? { showOnHome: true } : {};
    const cats = await this.categoryRepo.find({ where, order: { id: 'ASC' } });
    return cats.map((c) => c.name);
  }

  async findCategoriesFull() {
    return this.categoryRepo.find({ order: { id: 'ASC' } });
  }

  async createCategory(data: { name: string; icon?: string; showOnHome?: boolean }) {
    if (!data.name?.trim()) throw new BadRequestException('Nome da categoria é obrigatório');
    const existing = await this.categoryRepo.findOne({ where: { name: data.name.trim() } });
    if (existing) throw new BadRequestException('Categoria já existe');
    const cat = this.categoryRepo.create({
      name: data.name.trim(),
      icon: data.icon || 'mdiPill',
      showOnHome: data.showOnHome !== undefined ? !!data.showOnHome : true,
    });
    await this.categoryRepo.save(cat);
    return this.findCategoriesFull();
  }

  async updateCategory(id: number, data: Partial<Category>) {
    const cat = await this.categoryRepo.findOne({ where: { id: Number(id) } });
    if (!cat) throw new NotFoundException('Categoria não encontrada');
    Object.assign(cat, data);
    await this.categoryRepo.save(cat);
    return this.findCategoriesFull();
  }

  async deleteCategory(id: number) {
    await this.categoryRepo.delete({ id: Number(id) });
    return this.findCategoriesFull();
  }

  async findBrands() {
    const brands = await this.brandRepo.find({ order: { name: 'ASC' } });
    return brands.map((b) => b.name);
  }

  async findBrandsFull() {
    return this.brandRepo.find({ order: { name: 'ASC' } });
  }

  async createBrand(name: string) {
    if (!name?.trim()) throw new BadRequestException('Nome da marca é obrigatório');
    const existing = await this.brandRepo.findOne({ where: { name: name.trim() } });
    if (existing) throw new BadRequestException('Marca já cadastrada');
    await this.brandRepo.save(this.brandRepo.create({ name: name.trim() }));
    return this.findBrandsFull();
  }

  async deleteBrand(id: number) {
    await this.brandRepo.delete({ id: Number(id) });
    return this.findBrandsFull();
  }

  async findCatalog(query: any) {
    const qb = this.productRepo.createQueryBuilder('product');

    if (query.categories) {
      const cats = Array.isArray(query.categories) ? query.categories : [query.categories];
      qb.andWhere('product.category IN (:...cats)', { cats });
    }

    if (query.brands) {
      const brands = Array.isArray(query.brands) ? query.brands : [query.brands];
      qb.andWhere('product.brand IN (:...brands)', { brands });
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(product.name) LIKE :search OR LOWER(product.brand) LIKE :search OR LOWER(product.category) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    if (query.onlyInStock === 'true') {
      qb.andWhere('product.stock > 0');
    }

    if (query.sortBy) {
      switch (query.sortBy) {
        case 'price-asc':
          qb.orderBy('product.priceValue', 'ASC');
          break;
        case 'price-desc':
          qb.orderBy('product.priceValue', 'DESC');
          break;
        case 'rating':
          qb.orderBy('product.rating', 'DESC');
          break;
        default:
          qb.orderBy('product.id', 'ASC');
          break;
      }
    } else {
      qb.orderBy('product.id', 'ASC');
    }

    return qb.getMany();
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({ where: { id: Number(id) } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    const reviewsList = await this.reviewRepo.find({
      where: { productId: Number(id) },
      order: { id: 'DESC' },
    });
    return { ...product, reviewsList };
  }

  async createProduct(body: any) {
    const priceValue = Number(body.priceValue) || 0;
    const oldPriceValue = Number(body.oldPriceValue) || priceValue * 1.2;
    const discountPct =
      oldPriceValue > priceValue
        ? Math.round(((oldPriceValue - priceValue) / oldPriceValue) * 100)
        : 0;

    const installmentsCount = priceValue >= 100 ? 3 : priceValue >= 50 ? 2 : 1;
    const installmentVal = priceValue / installmentsCount;

    const product = this.productRepo.create({
      name: body.name,
      brand: body.brand || 'Genérico',
      category: body.category || 'Medicamentos',
      description:
        body.description ||
        'Produto dermatologicamente e farmaceuticamente testado com garantia de procedência FARMARCIA.',
      priceValue,
      price: body.price || this.formatBRL(priceValue),
      oldPrice: body.oldPrice || (discountPct > 0 ? this.formatBRL(oldPriceValue) : ''),
      discount: body.discount ?? (discountPct > 0 ? `-${discountPct}% OFF` : 'OFERTA'),
      installment:
        body.installment || `${installmentsCount}x de ${this.formatBRL(installmentVal)}`,
      image: body.image || '/assets/logo_farmarcia.png',
      rating: Number(body.rating ?? 5),
      reviews: Number(body.reviews ?? 0),
      isFeatured: !!body.isFeatured,
      stock: Number(body.stock ?? 20),
      weightKg: Number(body.weightKg ?? 0.25),
      sku: body.sku || `FRM-${Date.now().toString().slice(-5)}`,
    });

    return this.productRepo.save(product);
  }

  async updateProduct(id: number, body: any) {
    const product = await this.productRepo.findOne({ where: { id: Number(id) } });
    if (!product) throw new NotFoundException('Produto não encontrado');

    const previousStock = product.stock;

    if (body.name !== undefined) product.name = body.name;
    if (body.brand !== undefined) product.brand = body.brand;
    if (body.category !== undefined) product.category = body.category;
    if (body.description !== undefined) product.description = body.description;
    if (body.image !== undefined) product.image = body.image;
    if (body.isFeatured !== undefined) product.isFeatured = !!body.isFeatured;
    if (body.stock !== undefined) product.stock = Math.max(0, Number(body.stock));
    if (body.weightKg !== undefined) product.weightKg = Number(body.weightKg);
    if (body.discount !== undefined) product.discount = body.discount;
    if (body.oldPrice !== undefined) product.oldPrice = body.oldPrice;

    if (body.priceValue !== undefined) {
      const pv = Number(body.priceValue);
      product.priceValue = pv;
      product.price = body.price || this.formatBRL(pv);
      const installmentsCount = pv >= 100 ? 3 : pv >= 50 ? 2 : 1;
      product.installment =
        body.installment || `${installmentsCount}x de ${this.formatBRL(pv / installmentsCount)}`;
    }

    const saved = await this.productRepo.save(product);

    // Se o produto estava esgotado (0) e foi reposto (> 0), dispara os alertas de disponibilidade!
    let notifiedAlerts = 0;
    if (previousStock <= 0 && saved.stock > 0) {
      const pendingAlerts = await this.stockAlertRepo.find({
        where: { productId: saved.id, notified: false },
      });
      for (const alert of pendingAlerts) {
        alert.notified = true;
        alert.notifiedAt = new Date().toISOString();
        await this.stockAlertRepo.save(alert);
        notifiedAlerts++;
      }
    }

    return { ...saved, notifiedAlerts };
  }

  async deleteProduct(id: number) {
    await this.productRepo.delete({ id: Number(id) });
    return { success: true };
  }

  async getProductReviews(productId: number) {
    return this.reviewRepo.find({
      where: { productId: Number(productId) },
      order: { id: 'DESC' },
    });
  }

  async addProductReview(
    productId: number,
    user: { id: number; name: string; role: string },
    body: { rating: number; comment: string },
  ) {
    const product = await this.productRepo.findOne({ where: { id: Number(productId) } });
    if (!product) throw new NotFoundException('Produto não encontrado');

    // Verifica se o usuário realmente comprou o produto
    const userOrders = await this.orderRepo.find({ where: { userId: Number(user.id) } });
    const hasPurchased = userOrders.some((order) => {
      try {
        const items = JSON.parse(order.itemsJson || '[]');
        return (
          order.status !== 'Cancelado' &&
          items.some((it: any) => Number(it.id) === Number(productId))
        );
      } catch {
        return false;
      }
    });

    if (!hasPurchased && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas clientes que compraram este produto podem enviar uma avaliação verificada.',
      );
    }

    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
    const review = this.reviewRepo.create({
      productId: Number(productId),
      userId: Number(user.id),
      userName: user.name,
      rating,
      comment: body.comment || 'Excelente produto!',
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
    });

    await this.reviewRepo.save(review);

    const allReviews = await this.reviewRepo.find({ where: { productId: Number(productId) } });
    const avg =
      allReviews.reduce((acc, r) => acc + Number(r.rating), 0) / (allReviews.length || 1);
    product.rating = Math.round(avg);
    product.reviews = allReviews.length;
    await this.productRepo.save(product);

    return {
      review,
      productRating: product.rating,
      productReviewsCount: product.reviews,
      reviewsList: allReviews,
    };
  }

  async registerStockAlert(productId: number, email: string, userId?: number) {
    const product = await this.productRepo.findOne({ where: { id: Number(productId) } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Informe um e-mail válido para receber o alerta.');
    }

    const existing = await this.stockAlertRepo.findOne({
      where: { productId: Number(productId), email, notified: false },
    });
    if (existing) {
      return {
        success: true,
        message: 'Seu e-mail já está na fila de aviso para quando este produto voltar ao estoque!',
      };
    }

    const alert = this.stockAlertRepo.create({
      productId: Number(productId),
      productName: product.name,
      email,
      userId: userId ? Number(userId) : null,
      notified: false,
      createdAt: new Date().toISOString(),
    });
    await this.stockAlertRepo.save(alert);

    return {
      success: true,
      message: `Pronto! Avisaremos no e-mail ${email} assim que "${product.name}" chegar ao estoque.`,
    };
  }

  async getStockAlerts() {
    return this.stockAlertRepo.find({ order: { id: 'DESC' } });
  }
}
