import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Product } from "../../products/entities/product.entity";
import { Warehouse } from "../../warehouses/entities/warehouse.entity";

@Entity("inventory")
export class Inventory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productId!: number;

  @Column()
  warehouseId!: number;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @ManyToOne(() => Warehouse, { onDelete: "CASCADE" })
  @JoinColumn({ name: "warehouseId" })
  warehouse!: Warehouse;

  @Column({ default: 0 })
  quantity!: number;

  @Column({ default: 0 })
  reorderLevel!: number;

  @Column({ default: true })
  isActive!: boolean;
}

