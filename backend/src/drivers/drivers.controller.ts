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

import { DriversService } from './drivers.service';
import { Driver } from './entities/driver.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findAll(): Promise<Driver[]> {
    return this.driversService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Fleet Manager', 'Operations')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Driver | null> {
    return this.driversService.findOne(id);
  }

  @Post()
  @Roles('Admin', 'Fleet Manager')
  create(@Body() driver: Partial<Driver>): Promise<Driver> {
    return this.driversService.create(driver);
  }

  @Patch(':id')
  @Roles('Admin', 'Fleet Manager')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() driver: Partial<Driver>,
  ): Promise<Driver | null> {
    return this.driversService.update(id, driver);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.driversService.remove(id);
  }
}
