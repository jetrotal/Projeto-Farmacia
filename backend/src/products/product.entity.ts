import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  image: string;

  @Column({ default: '' })
  discount: string;

  @Column()
  brand: string;

  @Column()
  name: string;

  @Column('text', { default: '' })
  description: string;

  @Column('float', { default: 5 })
  rating: number;

  @Column('int', { default: 0 })
  reviews: number;

  @Column({ default: '' })
  oldPrice: string;

  @Column()
  price: string;

  @Column('float')
  priceValue: number;

  @Column({ default: '' })
  installment: string;

  @Column()
  category: string;

  @Column({ default: false })
  isFeatured: boolean;

  @Column('int', { default: 25 })
  stock: number;

  @Column('float', { default: 0.25 })
  weightKg: number;

  @Column({ default: '' })
  sku: string;
}

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: 'mdiPill' })
  icon: string;

  @Column({ default: true })
  showOnHome: boolean;
}

@Entity()
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  productId: number;

  @Column('int')
  userId: number;

  @Column()
  userName: string;

  @Column('int')
  rating: number;

  @Column('text')
  comment: string;

  @Column({ default: true })
  verifiedPurchase: boolean;

  @Column()
  createdAt: string;
}

@Entity()
export class StockAlert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  productId: number;

  @Column()
  productName: string;

  @Column()
  email: string;

  @Column('int', { nullable: true })
  userId: number;

  @Column({ default: false })
  notified: boolean;

  @Column({ nullable: true })
  notifiedAt: string;

  @Column()
  createdAt: string;
}
