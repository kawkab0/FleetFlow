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

import { FuelService } from './fuel.service';
import { Fuel } from './entities/fuel.entity';

@Controller('fuel')
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Get()
  findAll(): Promise<Fuel[]> {
    return this.fuelService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Fuel | null> {
    return this.fuelService.findOne(id);
  }

  @Post()
  create(@Body() fuel: Partial<Fuel>): Promise<Fuel> {
    return this.fuelService.create(fuel);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() fuel: Partial<Fuel>,
  ): Promise<Fuel | null> {
    return this.fuelService.update(id, fuel);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.fuelService.remove(id);
  }
}
