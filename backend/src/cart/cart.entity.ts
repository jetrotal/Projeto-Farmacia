import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from '../products/product.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cartId: string;

  @Column('int', { nullable: true })
  userId: number;

  @Column('int')
  qty: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: string;

  @Column({ default: false })
  abandonedNotified: boolean;

  @ManyToOne(() => Product, { eager: true, onDelete: 'CASCADE' })
  product: Product;
}

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  userId: number;

  @ManyToOne(() => Product, { eager: true, onDelete: 'CASCADE' })
  product: Product;
}
