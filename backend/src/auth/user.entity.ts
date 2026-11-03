import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'CUSTOMER' })
  role: string;

  @Column({ default: '' })
  cpf: string;

  @Column({ default: '' })
  phone: string;

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true })
  resetTokenExpires: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;
}

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ default: 'Casa' })
  label: string;

  @Column()
  cep: string;

  @Column()
  rua: string;

  @Column()
  numero: string;

  @Column({ default: '' })
  complemento: string;

  @Column()
  bairro: string;

  @Column({ default: 'São Paulo' })
  cidade: string;

  @Column({ default: 'SP' })
  estado: string;

  @Column({ default: false })
  isDefault: boolean;
}
