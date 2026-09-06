import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { SalesOrdersService } from './sales-orders.service';
import { SalesOrder } from './entities/sales-order.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('sales-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesOrdersController {
  constructor(
    private readonly salesOrdersService: SalesOrdersService,
  ) {}

  @Post()
  @Roles('Admin', 'Finance', 'Operations')
  create(
    @Body() salesOrderData: Partial<SalesOrder>,
  ): Promise<SalesOrder> {
    return this.salesOrdersService.create(salesOrderData);
  }

  @Get()
  @Roles('Admin', 'Finance', 'Operations')
  findAll(): Promise<SalesOrder[]> {
    return this.salesOrdersService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Finance', 'Operations')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SalesOrder> {
    return this.salesOrdersService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'Finance', 'Operations')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() salesOrderData: Partial<SalesOrder>,
  ): Promise<SalesOrder> {
    return this.salesOrdersService.update(id, salesOrderData);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.salesOrdersService.remove(id);
  }
}
