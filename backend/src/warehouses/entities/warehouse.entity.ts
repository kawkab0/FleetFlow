import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  name!: string;

  @Column({ length: 200, nullable: true })
  address!: string;

  @Column({ length: 100, nullable: true })
  city!: string;

  @Column({ length: 100, nullable: true })
  country!: string;

  @Column({ length: 100, nullable: true })
  manager!: string;

  @Column({ length: 30, nullable: true })
  phone!: string;

  @Column({ default: true })
  isActive!: boolean;
}
