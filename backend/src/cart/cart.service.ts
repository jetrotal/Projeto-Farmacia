import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CartItem, Favorite } from './cart.entity';
import { Product } from '../products/product.entity';
import { User } from '../auth/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepo: Repository<CartItem>,
    @InjectRepository(Favorite)
    private favRepo: Repository<Favorite>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  private buildWhere(userId?: number) {
    return userId ? { userId: Number(userId) } : { userId: IsNull() };
  }

  async getCart(userId?: number) {
    const items = await this.cartRepo.find({
      where: this.buildWhere(userId),
      relations: ['product'],
    });
    return items
      .filter((item) => !!item.product)
      .map((item) => ({
        ...item.product,
        cartId: item.cartId,
        qty: item.qty,
        userId: item.userId,
        updatedAt: item.updatedAt,
      }));
  }

  async addToCart(productPayload: any, userId?: number, addQty = 1) {
    const product = await this.productRepo.findOne({
      where: { id: Number(productPayload.id) },
    });
    if (!product) {
      throw new BadRequestException('Produto não encontrado.');
    }
    if (product.stock <= 0) {
      throw new BadRequestException('Este produto está temporariamente esgotado.');
    }

    const whereClause = userId
      ? { userId: Number(userId), product: { id: product.id } }
      : { userId: IsNull(), product: { id: product.id } };

    let item = await this.cartRepo.findOne({
      where: whereClause,
      relations: ['product'],
    });

    const requestedQty = Number(addQty) || 1;
    if (item) {
      item.qty = Math.min(product.stock, item.qty + requestedQty);
      item.updatedAt = new Date().toISOString();
      item.abandonedNotified = false;
      await this.cartRepo.save(item);
    } else {
      const newItem = this.cartRepo.create({
        cartId: `cart_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId: userId ? Number(userId) : null,
        qty: Math.min(product.stock, requestedQty),
        updatedAt: new Date().toISOString(),
        abandonedNotified: false,
        product: { id: product.id } as Product,
      });
      await this.cartRepo.save(newItem);
    }

    return this.getCart(userId);
  }

  async updateQty(cartId: string, qty: number) {
    const item = await this.cartRepo.findOne({
      where: { cartId },
      relations: ['product'],
    });
    if (item) {
      const maxStock = item.product?.stock ?? 99;
      item.qty = Math.max(1, Math.min(maxStock, Number(qty)));
      item.updatedAt = new Date().toISOString();
      await this.cartRepo.save(item);
      return this.getCart(item.userId);
    }
    return this.getCart();
  }

  async removeFromCart(cartId: string, userId?: number) {
    const item = await this.cartRepo.findOne({ where: { cartId } });
    const targetUser = item?.userId ?? userId;
    await this.cartRepo.delete({ cartId });
    return this.getCart(targetUser);
  }

  async clearCart(userId?: number) {
    if (userId) {
      await this.cartRepo.delete({ userId: Number(userId) });
    } else {
      await this.cartRepo.delete({ userId: IsNull() });
    }
    return [];
  }

  async syncGuestCartToUser(userId: number) {
    const guestItems = await this.cartRepo.find({
      where: { userId: IsNull() },
      relations: ['product'],
    });
    for (const gItem of guestItems) {
      if (gItem.product) {
        await this.addToCart(gItem.product, userId, gItem.qty);
      }
      await this.cartRepo.delete({ id: gItem.id });
    }
    return this.getCart(userId);
  }

  async getAbandonedCarts() {
    const allItems = await this.cartRepo.find({ relations: ['product'] });
    const users = await this.userRepo.find();
    const userMap = new Map(users.map((u) => [u.id, u]));

    const grouped: Record<string, any> = {};
    for (const item of allItems) {
      if (!item.product) continue;
      const key = item.userId ? `user_${item.userId}` : 'guest';
      const u = item.userId ? userMap.get(item.userId) : null;
      if (!grouped[key]) {
        grouped[key] = {
          key,
          userId: item.userId,
          userName: u ? u.name : 'Visitante (Sessão)',
          userEmail: u ? u.email : 'visitante@sessao.local',
          updatedAt: item.updatedAt,
          abandonedNotified: item.abandonedNotified,
          items: [],
          total: 0,
        };
      }
      grouped[key].items.push({
        id: item.product.id,
        name: item.product.name,
        qty: item.qty,
        priceValue: item.product.priceValue,
      });
      grouped[key].total += item.product.priceValue * item.qty;
    }

    return Object.values(grouped);
  }

  async triggerAbandonedCartReminder(userId?: number) {
    const where = userId ? { userId: Number(userId) } : {};
    const items = await this.cartRepo.find({ where });
    for (const item of items) {
      item.abandonedNotified = true;
      await this.cartRepo.save(item);
    }
    return {
      success: true,
      couponOffer: 'VOLTA15',
      message:
        'E-mail de recuperação de carrinho abandonado enviado com o cupom VOLTA15 (15% OFF)!',
    };
  }

  // Favoritos persistidos no Banco de Dados atrelados ao usuário
  async getFavorites(userId: number) {
    if (!userId) return [];
    const favs = await this.favRepo.find({
      where: { userId: Number(userId) },
      relations: ['product'],
    });
    return favs.filter((f) => !!f.product).map((f) => f.product);
  }

  async toggleFavorite(userId: number, productId: number) {
    const existing = await this.favRepo.findOne({
      where: { userId: Number(userId), product: { id: Number(productId) } },
      relations: ['product'],
    });

    if (existing) {
      await this.favRepo.delete({ id: existing.id });
    } else {
      const product = await this.productRepo.findOne({ where: { id: Number(productId) } });
      if (product) {
        const fav = this.favRepo.create({
          userId: Number(userId),
          product: { id: product.id } as Product,
        });
        await this.favRepo.save(fav);
      }
    }

    return this.getFavorites(userId);
  }
}
