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

import { VehiclesService } from './vehicles.service';
import { Vehicle } from './entities/vehicle.entity';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  findAll(): Promise<Vehicle[]> {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Vehicle | null> {
    return this.vehiclesService.findOne(id);
  }

  @Post()
  create(@Body() vehicle: Partial<Vehicle>): Promise<Vehicle> {
    return this.vehiclesService.create(vehicle);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() vehicle: Partial<Vehicle>,
  ): Promise<Vehicle | null> {
    return this.vehiclesService.update(id, vehicle);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.vehiclesService.remove(id);
  }
}
