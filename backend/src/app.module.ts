import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { SeedService } from './seed/seed.service';

import { User } from './auth/user.entity';
import { Product } from './products/product.entity';
import { CartItem } from './cart/cart.entity';
import { Testimonial } from './testimonials/testimonial.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Product, CartItem, Testimonial],
      synchronize: true, // Mantemos true para ambiente de dev (auto criar tabelas)
    }),
    TypeOrmModule.forFeature([User, Product, CartItem, Testimonial]),
    AuthModule,
    ProductsModule,
    CartModule,
    TestimonialsModule,
  ],
  controllers: [AppController],
  providers: [SeedService],
})
export class AppModule {}
