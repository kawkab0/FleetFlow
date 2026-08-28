import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PurchaseDetailsController } from "./purchase-details.controller";
import { PurchaseDetailsService } from "./purchase-details.service";
import { PurchaseDetail } from "./entities/purchase-detail.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseDetail])],
  controllers: [PurchaseDetailsController],
  providers: [PurchaseDetailsService],
  exports: [PurchaseDetailsService],
})
export class PurchaseDetailsModule {}
