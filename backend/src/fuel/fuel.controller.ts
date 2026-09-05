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

import { FuelService } from './fuel.service';
import { Fuel } from './entities/fuel.entity';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('fuel')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Get()
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findAll(): Promise<Fuel[]> {
    return this.fuelService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Fuel | null> {
    return this.fuelService.findOne(id);
  }

  @Post()
  @Roles('Admin', 'Fleet Manager', 'Operations')
  create(@Body() fuel: CreateFuelDto): Promise<Fuel> {
    return this.fuelService.create(fuel);
  }

  @Patch(':id')
  @Roles('Admin', 'Fleet Manager', 'Operations')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() fuel: UpdateFuelDto,
  ): Promise<Fuel | null> {
    return this.fuelService.update(id, fuel);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.fuelService.remove(id);
  }
}
