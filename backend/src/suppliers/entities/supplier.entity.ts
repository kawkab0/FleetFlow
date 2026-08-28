import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  name!: string;

  @Column({ length: 150, nullable: true })
  contactPerson!: string;

  @Column({ length: 100, nullable: true })
  email!: string;

  @Column({ length: 30, nullable: true })
  phone!: string;

  @Column({ length: 200, nullable: true })
  address!: string;

  @Column({ default: true })
  isActive!: boolean;
}
