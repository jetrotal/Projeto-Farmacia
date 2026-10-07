import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepo: Repository<CartItem>,
  ) {}

  async getCart() {
    const items = await this.cartRepo.find({ relations: ['product'] });
    // Planifica o objeto retornado de acordo com a exigência do React
    return items.map(item => ({
      ...item.product,
      cartId: item.cartId,
      qty: item.qty
    }));
  }

  async addToCart(product: any) {
    let item = await this.cartRepo.findOne({ 
      where: { product: { id: product.id } },
      relations: ['product']
    });

    if (item) {
      item.qty += 1;
      await this.cartRepo.save(item);
    } else {
      const newItem = this.cartRepo.create({
        cartId: `cart_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        qty: 1,
        product: { id: product.id }
      });
      await this.cartRepo.save(newItem);
    }
    
    return this.getCart();
  }

  async updateQty(cartId: string, qty: number) {
    await this.cartRepo.update({ cartId }, { qty });
    return this.getCart();
  }

  async removeFromCart(cartId: string) {
    await this.cartRepo.delete({ cartId });
    return this.getCart();
  }

  async clearCart() {
    await this.cartRepo.clear();
    return [];
  }
}
