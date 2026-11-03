import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';

@Controller()
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('orders')
  createOrder(@Body() body: any, @Req() req: any) {
    return this.ordersService.createOrder(req.user, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/my')
  getMyOrders(@Req() req: any) {
    return this.ordersService.getMyOrders(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/reorder')
  reorder(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.reorder(Number(id), req.user.id);
  }

  @UseGuards(AdminGuard)
  @Get('orders')
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @UseGuards(AdminGuard)
  @Patch('orders/:id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateOrderStatus(Number(id), status);
  }

  // Cupons
  @Get('coupons')
  getCoupons() {
    return this.ordersService.getAllCoupons();
  }

  @Post('coupons/validate')
  validateCoupon(@Body('code') code: string) {
    return this.ordersService.validateCoupon(code);
  }

  @UseGuards(AdminGuard)
  @Post('coupons')
  createCoupon(@Body() body: any) {
    return this.ordersService.createCoupon(body);
  }

  @UseGuards(AdminGuard)
  @Delete('coupons/:id')
  deleteCoupon(@Param('id') id: string) {
    return this.ordersService.deleteCoupon(Number(id));
  }

  // Frete e Pagamento
  @Post('shipping/calculate')
  calculateShipping(@Body() body: any) {
    return this.ordersService.calculateShipping(body.cep, body.items, body.subtotal);
  }

  @Post('payments/process')
  processPayment(@Body() body: any) {
    return this.ordersService.processPayment(body);
  }

  // Vitrine / Hero Banner
  @Get('banners')
  getBanner() {
    return this.ordersService.getBanner();
  }

  @UseGuards(AdminGuard)
  @Put('banners')
  updateBanner(@Body() body: any) {
    return this.ordersService.updateBanner(body);
  }

  // Páginas Institucionais (CMS)
  @Get('pages')
  getAllPages(@Query('title') title?: string) {
    if (title) {
      return this.ordersService.getPageByTitleOrSlug(title);
    }
    return this.ordersService.getAllPages();
  }

  @Get('pages/:slug')
  getPage(@Param('slug') slug: string) {
    return this.ordersService.getPageByTitleOrSlug(slug);
  }

  @UseGuards(AdminGuard)
  @Post('pages')
  upsertPage(@Body() body: any) {
    return this.ordersService.upsertPage(body);
  }

  // Upload de Imagem (Multer / Base64 DataURL)
  @UseGuards(AdminGuard)
  @Post('upload')
  uploadImage(@Body() body: { imageBase64?: string; fileName?: string }) {
    if (!body.imageBase64) {
      return { url: '/assets/logo_farmarcia.png' };
    }
    return {
      success: true,
      fileName: body.fileName || `upload_${Date.now()}.png`,
      url: body.imageBase64,
    };
  }

  // Dashboard & Métricas Admin
  @UseGuards(AdminGuard)
  @Get('admin/metrics')
  getMetrics() {
    return this.ordersService.getAdminDashboardMetrics();
  }
}
