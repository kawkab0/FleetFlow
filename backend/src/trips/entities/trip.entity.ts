import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn()
  id!: number;

  // =========================
  // TRIP IDENTIFICATION
  // =========================

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  tripCode!: string;

  // =========================
  // ROUTE
  // =========================

  @Column({
    type: 'varchar',
    length: 150,
  })
  origin!: string;

  @Column({
    type: 'varchar',
    length: 150,
  })
  destination!: string;

  // =========================
  // ASSIGNMENTS
  // =========================

  @Column({
    type: 'varchar',
    length: 100,
  })
  vehicleCode!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  driverCode!: string;

  // =========================
  // TRIP DATE
  // =========================

  @Column({
    type: 'date',
  })
  tripDate!: string;

  // =========================
  // DISTANCE
  // =========================

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  distance!: number;

  // =========================
  // FUEL
  // =========================

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  fuelUsed!: number;

  // =========================
  // REVENUE
  // =========================

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  revenue!: number;

  // =========================
  // CARGO
  // =========================

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  cargo!: string | null;

  // =========================
  // STATUS
  // =========================

  @Column({
    type: 'varchar',
    length: 50,
    default: 'Planned',
  })
  status!: string;

  // =========================
  // NOTES
  // =========================

  @Column({
    type: 'text',
    nullable: true,
  })
  notes!: string | null;
}
