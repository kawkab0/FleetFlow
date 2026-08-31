import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ length: 100, nullable: true })
  driver!: string;
}