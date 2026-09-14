import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

@Entity("notifications")
@Unique(["sourceKey"])
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column("text")
  message!: string;

  @Column({
    type: "varchar",
    default: "info",
  })
  type!: string;

  @Column({
    type: "varchar",
    default: "medium",
  })
  priority!: string;

  @Column({
    type: "boolean",
    default: false,
  })
  isRead!: boolean;

  @Column({
    type: "varchar",
    nullable: true,
  })
  link!: string | null;

  @Column({
    type: "integer",
    nullable: true,
  })
  userId!: number | null;

  @Column({
    type: "varchar",
    nullable: true,
  })
  sourceKey!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
