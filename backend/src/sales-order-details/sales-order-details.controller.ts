import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";

import { SalesOrderDetailsService } from "./sales-order-details.service";
import { SalesOrderDetail } from "./entities/sales-order-detail.entity";

@Controller("sales-order-details")
export class SalesOrderDetailsController {
  constructor(
    private readonly salesOrderDetailsService: SalesOrderDetailsService,
  ) {}

  @Post()
  create(
    @Body() detailData: Partial<SalesOrderDetail>,
  ): Promise<SalesOrderDetail> {
    return this.salesOrderDetailsService.create(detailData);
  }

  @Get()
  findAll(): Promise<SalesOrderDetail[]> {
    return this.salesOrderDetailsService.findAll();
  }

  @Get(":id")
  findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<SalesOrderDetail> {
    return this.salesOrderDetailsService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() detailData: Partial<SalesOrderDetail>,
  ): Promise<SalesOrderDetail> {
    return this.salesOrderDetailsService.update(
      id,
      detailData,
    );
  }

  @Delete(":id")
  remove(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.salesOrderDetailsService.remove(id);
  }
}
