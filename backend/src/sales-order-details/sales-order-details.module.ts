import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { SalesOrderDetailsController } from "./sales-order-details.controller";
import { SalesOrderDetailsService } from "./sales-order-details.service";
import { SalesOrderDetail } from "./entities/sales-order-detail.entity";

@Module({
  imports: [TypeOrmModule.forFeature([SalesOrderDetail])],
  controllers: [SalesOrderDetailsController],
  providers: [SalesOrderDetailsService],
  exports: [SalesOrderDetailsService],
})
export class SalesOrderDetailsModule {}
