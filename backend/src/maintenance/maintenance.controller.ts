import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { MaintenanceService } from './maintenance.service';
import { Maintenance } from './entities/maintenance.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

@Controller('maintenance')
export class MaintenanceController {
  constructor(
    private readonly maintenanceService: MaintenanceService,
  ) {}

  @Get()
  findAll(): Promise<Maintenance[]> {
    return this.maintenanceService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Maintenance | null> {
    return this.maintenanceService.findOne(id);
  }

  @Post()
  create(
    @Body() maintenance: CreateMaintenanceDto,
  ): Promise<Maintenance> {
    return this.maintenanceService.create(maintenance);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() maintenance: UpdateMaintenanceDto,
  ): Promise<Maintenance | null> {
    return this.maintenanceService.update(id, maintenance);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.maintenanceService.remove(id);
  }
}
