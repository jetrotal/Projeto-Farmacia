import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderNumber: string;

  @Column('int')
  userId: number;

  @Column()
  customerName: string;

  @Column()
  customerEmail: string;

  @Column('text')
  itemsJson: string;

  @Column('text')
  addressJson: string;

  @Column()
  paymentMethod: string;

  @Column({ default: '' })
  paymentDetailsJson: string;

  @Column('float')
  subtotal: number;

  @Column('float', { default: 0 })
  discountValue: number;

  @Column('float', { default: 0 })
  freightValue: number;

  @Column({ default: 'Expressa' })
  shippingMethod: string;

  @Column('float')
  totalValue: number;

  @Column({ default: '' })
  couponCode: string;

  // Status: 'Aprovado' | 'Separando em Estoque' | 'Em Transporte' | 'Entregue' | 'Cancelado'
  @Column({ default: 'Aprovado' })
  status: string;

  @Column()
  trackingCode: string;

  @Column('text')
  timelineJson: string;

  @Column()
  createdAt: string;
}

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column('float')
  discountPercent: number;

  @Column()
  expiresAt: string;

  @Column('int', { default: 100 })
  usageLimit: number;

  @Column('int', { default: 0 })
  usedCount: number;

  @Column({ default: true })
  active: boolean;
}

@Entity()
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  badgeText: string;

  @Column()
  title: string;

  @Column('text')
  subtitle: string;

  @Column()
  ctaText: string;

  @Column()
  ctaSecondaryText: string;

  @Column()
  whatsappNumber: string;

  @Column('text')
  imageUrl: string;
}

@Entity()
export class PageContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column()
  updatedAt: string;
}
