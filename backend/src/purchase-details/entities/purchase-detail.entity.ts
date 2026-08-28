import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("purchase_details")
export class PurchaseDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  purchaseId!: number;

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
