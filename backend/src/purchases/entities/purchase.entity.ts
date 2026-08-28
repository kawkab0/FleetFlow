import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("purchases")
export class Purchase {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  supplierId!: number;

  @Column()
  warehouseId!: number;

  @Column({ type: "date" })
  purchaseDate!: string;

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
  referenceNumber!: string;

  @Column({ nullable: true })
  notes!: string;
}
