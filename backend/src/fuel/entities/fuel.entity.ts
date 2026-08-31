import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('fuel')
export class Fuel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  fuelCode!: string;

  @Column({ length: 100 })
  vehicleCode!: string;

  @Column({ length: 100 })
  driverCode!: string;

  @Column({ type: 'date' })
  fuelDate!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  liters!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cost!: number;

  @Column({ length: 150 })
  fuelStation!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  odometer!: number;

  @Column({ length: 50 })
  paymentMethod!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;
}

