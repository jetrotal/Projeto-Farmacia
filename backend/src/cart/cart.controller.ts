import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart() {
    return this.cartService.getCart();
  }

  @Post()
  addToCart(@Body() product: any) {
    return this.cartService.addToCart(product);
  }

  @Patch(':id')
  updateQty(@Param('id') cartId: string, @Body('qty') qty: number) {
    return this.cartService.updateQty(cartId, qty);
  }

  @Delete(':id')
  removeFromCart(@Param('id') cartId: string) {
    return this.cartService.removeFromCart(cartId);
  }

  @Delete()
  clearCart() {
    return this.cartService.clearCart();
  }
}
