import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard, AdminGuard, extractUserFromRequest } from '../auth/jwt-auth.guard';

@Controller()
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get('products/featured')
  getFeatured() {
    return this.productsService.findFeatured();
  }

  @Get('products/categories')
  getCategories(@Query('home') home?: string) {
    return this.productsService.findCategories(home === 'true');
  }

  @Get('categories')
  getCategoriesFull() {
    return this.productsService.findCategoriesFull();
  }

  @UseGuards(AdminGuard)
  @Post('categories')
  createCategory(@Body() body: any) {
    return this.productsService.createCategory(body);
  }

  @UseGuards(AdminGuard)
  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: any) {
    return this.productsService.updateCategory(Number(id), body);
  }

  @UseGuards(AdminGuard)
  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.productsService.deleteCategory(Number(id));
  }

  @Get('products/brands')
  getBrands() {
    return this.productsService.findBrands();
  }

  @Get('brands')
  getBrandsFull() {
    return this.productsService.findBrandsFull();
  }

  @UseGuards(AdminGuard)
  @Post('brands')
  createBrand(@Body('name') name: string) {
    return this.productsService.createBrand(name);
  }

  @UseGuards(AdminGuard)
  @Delete('brands/:id')
  deleteBrand(@Param('id') id: string) {
    return this.productsService.deleteBrand(Number(id));
  }

  @Get('products')
  getCatalog(@Query() query: any) {
    return this.productsService.findCatalog(query);
  }

  @Get('products/:id')
  getProductById(@Param('id') id: string) {
    return this.productsService.findOne(Number(id));
  }

  @UseGuards(AdminGuard)
  @Post('products')
  createProduct(@Body() body: any) {
    return this.productsService.createProduct(body);
  }

  @UseGuards(AdminGuard)
  @Put('products/:id')
  updateProduct(@Param('id') id: string, @Body() body: any) {
    return this.productsService.updateProduct(Number(id), body);
  }

  @UseGuards(AdminGuard)
  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(Number(id));
  }

  @Get('products/:id/reviews')
  getReviews(@Param('id') id: string) {
    return this.productsService.getProductReviews(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('products/:id/reviews')
  addReview(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.productsService.addProductReview(Number(id), req.user, body);
  }

  @Post('products/:id/stock-alert')
  registerStockAlert(@Param('id') id: string, @Body('email') email: string, @Req() req: any) {
    const user = extractUserFromRequest(req);
    return this.productsService.registerStockAlert(Number(id), email, user?.id);
  }

  @UseGuards(AdminGuard)
  @Get('admin/stock-alerts')
  getStockAlerts() {
    return this.productsService.getStockAlerts();
  }
}
