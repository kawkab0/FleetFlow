import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { SalesOrderDetailsController } from "./sales-order-details.controller";
import { SalesOrderDetailsService } from "./sales-order-details.service";
import { SalesOrderDetail } from "./entities/sales-order-detail.entity";

import { AuditLogsModule } from "../audit-logs/audit-logs.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([SalesOrderDetail]),
    AuditLogsModule,
  ],
  controllers: [SalesOrderDetailsController],
  providers: [SalesOrderDetailsService],
  exports: [SalesOrderDetailsService],
})
export class SalesOrderDetailsModule {}
