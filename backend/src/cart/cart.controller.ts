import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard, AdminGuard, extractUserFromRequest } from '../auth/jwt-auth.guard';

@Controller()
export class CartController {
  constructor(private cartService: CartService) {}

  @Get('cart')
  getCart(@Req() req: any) {
    const user = extractUserFromRequest(req);
    return this.cartService.getCart(user?.id);
  }

  @Post('cart')
  addToCart(@Body() body: any, @Req() req: any) {
    const user = extractUserFromRequest(req);
    return this.cartService.addToCart(body, user?.id, body.qty || 1);
  }

  @Post('cart/sync')
  @UseGuards(JwtAuthGuard)
  syncCart(@Req() req: any) {
    return this.cartService.syncGuestCartToUser(req.user.id);
  }

  @Patch('cart/:id')
  updateQty(@Param('id') cartId: string, @Body('qty') qty: number) {
    return this.cartService.updateQty(cartId, qty);
  }

  @Delete('cart/:id')
  removeFromCart(@Param('id') cartId: string, @Req() req: any) {
    const user = extractUserFromRequest(req);
    return this.cartService.removeFromCart(cartId, user?.id);
  }

  @Delete('cart')
  clearCart(@Req() req: any) {
    const user = extractUserFromRequest(req);
    return this.cartService.clearCart(user?.id);
  }

  @UseGuards(AdminGuard)
  @Get('admin/abandoned-carts')
  getAbandonedCarts() {
    return this.cartService.getAbandonedCarts();
  }

  @UseGuards(AdminGuard)
  @Post('admin/abandoned-carts/notify')
  notifyAbandonedCart(@Body('userId') userId?: number) {
    return this.cartService.triggerAbandonedCartReminder(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  getFavorites(@Req() req: any) {
    return this.cartService.getFavorites(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorites/:productId')
  toggleFavorite(@Param('productId') productId: string, @Req() req: any) {
    return this.cartService.toggleFavorite(req.user.id, Number(productId));
  }
}
