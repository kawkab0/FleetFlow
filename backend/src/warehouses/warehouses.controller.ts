
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

import { WarehousesService } from './warehouses.service';
import { Warehouse } from './entities/warehouse.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('warehouses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehousesController {
  constructor(
    private readonly warehousesService: WarehousesService,
  ) {}

  @Get()
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findAll(): Promise<Warehouse[]> {
    return this.warehousesService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Warehouse | null> {
    return this.warehousesService.findOne(id);
  }

  @Post()
  @Roles('Admin', 'Fleet Manager')
  create(
    @Body() warehouse: Partial<Warehouse>,
  ): Promise<Warehouse> {
    return this.warehousesService.create(warehouse);
  }

  @Patch(':id')
  @Roles('Admin', 'Fleet Manager')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() warehouse: Partial<Warehouse>,
  ): Promise<Warehouse | null> {
    return this.warehousesService.update(id, warehouse);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.warehousesService.remove(id);
  }
}
