import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from '../products/product.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cartId: string;

  @Column()
  qty: number;

  @ManyToOne(() => Product, { eager: true })
  product: Product;
}
