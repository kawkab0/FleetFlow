import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("sales_orders")
export class SalesOrder {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  customerId!: number;

  @Column({ type: "date" })
  orderDate!: string;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalAmount!: number;

  @Column({
    default: "Pending",
  })
  status!: string;

  @Column({ nullable: true })
  shippingAddress!: string;

  @Column({ nullable: true })
  notes!: string;
}
