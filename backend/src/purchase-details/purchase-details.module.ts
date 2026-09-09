import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PurchaseDetailsController } from "./purchase-details.controller";
import { PurchaseDetailsService } from "./purchase-details.service";
import { PurchaseDetail } from "./entities/purchase-detail.entity";

import { AuditLogsModule } from "../audit-logs/audit-logs.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseDetail]),
    AuditLogsModule,
  ],
  controllers: [PurchaseDetailsController],
  providers: [PurchaseDetailsService],
  exports: [PurchaseDetailsService],
})
export class PurchaseDetailsModule {}
