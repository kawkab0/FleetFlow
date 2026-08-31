import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  driverCode!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ length: 50 })
  phone!: string;

  @Column({ length: 150 })
  licenseNumber!: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'Professional',
  })
  licenseType!: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'Active',
  })
  status!: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  hireDate!: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  assignedVehicle!: string | null;
}
