import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('maintenance')
export class Maintenance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  maintenanceCode!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  vehicleCode!: string;

  @Column({
    type: 'date',
  })
  maintenanceDate!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  maintenanceType!: string;

  @Column({
    type: 'text',
  })
  description!: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  mileage!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  cost!: number;

  @Column({
    type: 'varchar',
    length: 150,
  })
  serviceProvider!: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'Pending',
  })
  status!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes!: string | null;
}
