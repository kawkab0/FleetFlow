import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  expenseCode!: string;

  @Column({ length: 100 })
  vehicleCode!: string;

  @Column({ length: 100 })
  driverCode!: string;

  // Always use YYYY-MM-DD
  @Column({ type: 'date' })
  expenseDate!: string;

  @Column({ length: 100 })
  category!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ length: 150 })
  vendor!: string;

  @Column({ length: 50 })
  paymentMethod!: string;

  @Column({ length: 50, default: 'Paid' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;
}

