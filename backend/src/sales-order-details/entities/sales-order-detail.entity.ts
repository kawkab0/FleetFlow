import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("sales_order_details")
export class SalesOrderDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  salesOrderId!: number;

  @Column()
  productId!: number;

  @Column()
  quantity!: number;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  unitPrice!: number;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  totalPrice!: number;
}
