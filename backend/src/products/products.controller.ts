import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get('featured')
  getFeatured() {
    return this.productsService.findFeatured();
  }

  @Get('categories')
  getCategories() {
    return this.productsService.findCategories();
  }

  @Get('brands')
  getBrands() {
    return this.productsService.findBrands();
  }

  @Get()
  getCatalog(@Query() query: any) {
    return this.productsService.findCatalog(query);
  }
}
