import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Driver } from '../../drivers/entities/driver.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50, unique: true })
  vehicleCode!: string;

  @Column({ length: 50 })
  registrationNumber!: string;

  @Column({ length: 50 })
  type!: string;

  @Column({ length: 100 })
  model!: string;

  @Column({ length: 50, default: 'Available' })
  status!: string;

  @Column({ type: 'int', default: 0 })
  mileage!: number;

  @ManyToOne(() => Driver, {
    nullable: true,
  })
  @JoinColumn({ name: 'driverId' })
  driver!: Driver | null;
}
