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

import { MaintenanceService } from './maintenance.service';
import { Maintenance } from './entities/maintenance.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceController {
  constructor(
    private readonly maintenanceService: MaintenanceService,
  ) {}

  @Get()
  @Roles('Admin', 'Fleet Manager')
  findAll(): Promise<Maintenance[]> {
    return this.maintenanceService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Fleet Manager')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Maintenance | null> {
    return this.maintenanceService.findOne(id);
  }

  @Post()
  @Roles('Admin', 'Fleet Manager')
  create(
    @Body() maintenance: CreateMaintenanceDto,
  ): Promise<Maintenance> {
    return this.maintenanceService.create(maintenance);
  }

  @Patch(':id')
  @Roles('Admin', 'Fleet Manager')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() maintenance: UpdateMaintenanceDto,
  ): Promise<Maintenance | null> {
    return this.maintenanceService.update(id, maintenance);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.maintenanceService.remove(id);
  }
}
