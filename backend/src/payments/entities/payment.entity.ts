import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  salesOrderId!: number;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  amount!: number;

  @Column({
    type: "date",
  })
  paymentDate!: string;

  @Column({
    default: "Pending",
  })
  status!: string;

  @Column({
    default: "Cash",
  })
  paymentMethod!: string;

  @Column({ nullable: true })
  referenceNumber!: string;

  @Column({ nullable: true })
  notes!: string;
}
