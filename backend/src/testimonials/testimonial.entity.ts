import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Testimonial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  name: string;

  @Column()
  subtitle: string;

  @Column()
  avatar: string;
}
