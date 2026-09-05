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

import { VehiclesService } from './vehicles.service';
import { Vehicle } from './entities/vehicle.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findAll(): Promise<Vehicle[]> {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Vehicle | null> {
    return this.vehiclesService.findOne(id);
  }

  @Post()
  @Roles('Admin', 'Fleet Manager')
  create(@Body() vehicle: Partial<Vehicle>): Promise<Vehicle> {
    return this.vehiclesService.create(vehicle);
  }

  @Patch(':id')
  @Roles('Admin', 'Fleet Manager')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() vehicle: Partial<Vehicle>,
  ): Promise<Vehicle | null> {
    return this.vehiclesService.update(id, vehicle);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.vehiclesService.remove(id);
  }
}
