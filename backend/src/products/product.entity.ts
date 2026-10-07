import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  image: string;

  @Column()
  discount: string;

  @Column()
  brand: string;

  @Column()
  name: string;

  @Column('int')
  rating: number;

  @Column('int')
  reviews: number;

  @Column()
  oldPrice: string;

  @Column()
  price: string;

  @Column('float')
  priceValue: number;

  @Column()
  installment: string;

  @Column()
  category: string;

  @Column({ default: false })
  isFeatured: boolean;
}
