import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  tripCode!: string;

  @Column({ length: 100 })
  origin!: string;

  @Column({ length: 100 })
  destination!: string;

  @Column({ length: 100 })
  vehicleCode!: string;

  @Column({ length: 100 })
  driverCode!: string;

  @Column({ type: 'date' })
  tripDate!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  distance!: number;

  @Column({ length: 50, default: 'Planned' })
  status!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  fuelUsed!: number;
}

