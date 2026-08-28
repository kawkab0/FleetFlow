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

import { SalesOrdersService } from "./sales-orders.service";
import { SalesOrder } from "./entities/sales-order.entity";

@Controller("sales-orders")
export class SalesOrdersController {
  constructor(
    private readonly salesOrdersService: SalesOrdersService,
  ) {}

  @Post()
  create(
    @Body() salesOrderData: Partial<SalesOrder>,
  ): Promise<SalesOrder> {
    return this.salesOrdersService.create(salesOrderData);
  }

  @Get()
  findAll(): Promise<SalesOrder[]> {
    return this.salesOrdersService.findAll();
  }

  @Get(":id")
  findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<SalesOrder> {
    return this.salesOrdersService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() salesOrderData: Partial<SalesOrder>,
  ): Promise<SalesOrder> {
    return this.salesOrdersService.update(id, salesOrderData);
  }

  @Delete(":id")
  remove(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.salesOrdersService.remove(id);
  }
}
