import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { SeedService } from './seed/seed.service';

import { User, Address } from './auth/user.entity';
import { Product, Category, Brand, Review, StockAlert } from './products/product.entity';
import { CartItem, Favorite } from './cart/cart.entity';
import { Order, Coupon, Banner, PageContent } from './orders/order.entity';
import { Testimonial } from './testimonials/testimonial.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [
        User,
        Address,
        Product,
        Category,
        Brand,
        Review,
        StockAlert,
        CartItem,
        Favorite,
        Order,
        Coupon,
        Banner,
        PageContent,
        Testimonial,
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      User,
      Address,
      Product,
      Category,
      Brand,
      Review,
      StockAlert,
      CartItem,
      Favorite,
      Order,
      Coupon,
      Banner,
      PageContent,
      Testimonial,
    ]),
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    TestimonialsModule,
  ],
  controllers: [AppController],
  providers: [SeedService],
})
export class AppModule {}
